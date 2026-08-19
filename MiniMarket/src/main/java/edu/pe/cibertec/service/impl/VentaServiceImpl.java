package edu.pe.cibertec.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.pe.cibertec.dto.CrearVentaRequest;
import edu.pe.cibertec.dto.DetalleVentaRequest;
import edu.pe.cibertec.entity.Cajero;
import edu.pe.cibertec.entity.Cliente;
import edu.pe.cibertec.entity.DetalleVenta;
import edu.pe.cibertec.entity.Empleado;
import edu.pe.cibertec.entity.Producto;
import edu.pe.cibertec.entity.Venta;
import edu.pe.cibertec.repository.DetalleVentaRepository;
import edu.pe.cibertec.repository.VentaRepository;
import edu.pe.cibertec.service.ClienteService;
import edu.pe.cibertec.service.EmpleadoService;
import edu.pe.cibertec.service.ProductoService;
import edu.pe.cibertec.service.VentaService;

@Service
public class VentaServiceImpl implements VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private DetalleVentaRepository detalleRepository;

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private EmpleadoService empleadoService;

    @Autowired
    private ProductoService productoService;
    
    @Autowired
    private DetalleVentaRepository detalleVentaRepository;

    @Override
    @Transactional
    public Venta crearVenta(CrearVentaRequest request) {
        // 1. VALIDAR CLIENTE
        Cliente cliente = clienteService.buscarPorId(request.getClienteId());
        if (cliente == null) {
            throw new RuntimeException("El cliente no existe.");
        }

        // 2. VALIDAR CAJERO
        Empleado empleado = empleadoService.buscarPorId(request.getCajeroId());
        if (empleado == null) {
            throw new RuntimeException("El cajero no existe.");
        }

        // 3. VALIDAR QUE SEA CAJERO
        if (!(empleado instanceof Cajero)) {
            throw new RuntimeException("El empleado seleccionado no es un cajero.");
        }
        Cajero cajero = (Cajero) empleado;

        // 4. VALIDAR QUE EL CAJERO ESTÉ ACTIVO
        if (!Boolean.TRUE.equals(cajero.getEstado())) {
            throw new RuntimeException("El cajero se encuentra inactivo.");
        }

        // 5. VALIDAR QUE EXISTAN PRODUCTOS
        if (request.getProductos() == null || request.getProductos().isEmpty()) {
            throw new RuntimeException("La venta debe contener al menos un producto.");
        }

        // 6. CALCULAR EL TOTAL Y VALIDAR STOCK
        BigDecimal total = BigDecimal.ZERO;
        for (DetalleVentaRequest item : request.getProductos()) {
            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new RuntimeException("La cantidad debe ser mayor a cero.");
            }
            Producto producto = productoService.buscarPorId(item.getProductoId());
            if (producto == null) {
                throw new RuntimeException("El producto con ID " + item.getProductoId() + " no existe.");
            }
            if (!Boolean.TRUE.equals(producto.getEstado())) {
                throw new RuntimeException("El producto " + producto.getNombre() + " se encuentra inactivo.");
            }
            if (producto.getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto " + producto.getNombre()
                        + ". Stock actual: " + producto.getStock()
                        + ", solicitado: " + item.getCantidad());
            }
            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()));
            total = total.add(subtotal);
        }

        // 7. CREAR VENTA
        Venta venta = new Venta();
        venta.setCliente(cliente);
        venta.setCajero(cajero);
        venta.setEstado("FINALIZADA");
        venta.setTotal(total);

        // 8. GUARDAR VENTA
        venta = ventaRepository.save(venta);

        // 9. CREAR DETALLES Y DESCONTAR STOCK
        for (DetalleVentaRequest item : request.getProductos()) {
            Producto producto = productoService.buscarPorId(item.getProductoId());
            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()));

            DetalleVenta detalle = new DetalleVenta();
            detalle.setVenta(venta);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecio(producto.getPrecio());
            detalle.setSubtotal(subtotal);
            detalleRepository.save(detalle);

            // Descontar stock
            producto.setStock(producto.getStock() - item.getCantidad());
            productoService.guardar(producto);
        }

        // 10. DEVOLVER VENTA
        return venta;
    }

    @Override
    public List<Venta> listar() {
        return ventaRepository.findAll();
    }

    @Override
    public Venta buscarPorId(Long id) {
        return ventaRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public Venta actualizarEstado(Long id, String nuevoEstado) {
        Venta venta = ventaRepository.findById(id).orElse(null);
        if (venta == null) {
            throw new RuntimeException("La venta no existe.");
        }
        String estadoActual = venta.getEstado();
        nuevoEstado = nuevoEstado.toUpperCase();

        if (!nuevoEstado.equals("PENDIENTE") && !nuevoEstado.equals("EN_PROCESO")
                && !nuevoEstado.equals("FINALIZADA") && !nuevoEstado.equals("CANCELADA")) {
            throw new RuntimeException("Estado no válido.");
        }

        if (estadoActual.equals("PENDIENTE") && !nuevoEstado.equals("EN_PROCESO") && !nuevoEstado.equals("CANCELADA")) {
            throw new RuntimeException("Una venta pendiente solo puede pasar a EN_PROCESO o CANCELADA.");
        }
        if (estadoActual.equals("EN_PROCESO") && !nuevoEstado.equals("FINALIZADA")) {
            throw new RuntimeException("Una venta en proceso solo puede pasar a FINALIZADA.");
        }
        if (estadoActual.equals("FINALIZADA")) {
            throw new RuntimeException("Una venta finalizada no puede cambiar de estado.");
        }
        if (estadoActual.equals("CANCELADA")) {
            throw new RuntimeException("Una venta cancelada no puede cambiar de estado.");
        }

        venta.setEstado(nuevoEstado);
        return ventaRepository.save(venta);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Venta venta = ventaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("La venta con ID " + id + " no existe."));
        
        if (!"FINALIZADA".equals(venta.getEstado()) && !"PENDIENTE".equals(venta.getEstado())) {
            throw new RuntimeException("Solo se pueden anular ventas en estado FINALIZADA o PENDIENTE.");
        }
        
        // 🔥 DEVOLVER STOCK - CORREGIDO
        List<DetalleVenta> detalles = detalleVentaRepository.findByVentaId(id);
        for (DetalleVenta detalle : detalles) {
            Producto producto = detalle.getProducto();
            producto.setStock(producto.getStock() + detalle.getCantidad());
            productoService.guardar(producto);
        }
        
        venta.setEstado("CANCELADA");
        ventaRepository.save(venta);
    }
}

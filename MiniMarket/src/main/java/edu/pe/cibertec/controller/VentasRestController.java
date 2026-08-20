package edu.pe.cibertec.controller;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import edu.pe.cibertec.dto.ConfirmarPagoRequest;
import edu.pe.cibertec.dto.CrearVentaRequest;
import edu.pe.cibertec.dto.VentaWebDTO;
import edu.pe.cibertec.entity.Cajero;
import edu.pe.cibertec.entity.Cliente;
import edu.pe.cibertec.entity.Usuario;
import edu.pe.cibertec.entity.Venta;
import edu.pe.cibertec.repository.ClienteRepository;
import edu.pe.cibertec.repository.UsuarioRepository;
import edu.pe.cibertec.repository.VentaRepository;
import edu.pe.cibertec.service.EmpleadoService;
import edu.pe.cibertec.service.VentaService;

@RestController
@RequestMapping("/api/ventas")
public class VentasRestController {

    @Autowired
    private VentaService ventaService;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmpleadoService empleadoService;

    @GetMapping("/cliente/{dni}")
    public ResponseEntity<?> ventasPorDni(@PathVariable String dni) {
        Cliente cliente = clienteRepository.findByDni(dni);
        if (cliente == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(ventaRepository.findByClienteId(cliente.getId()));
    }

    @PostMapping("/web")
    @Transactional
    public ResponseEntity<?> registrarVentaWeb(@RequestBody VentaWebDTO dto) {
        try {
            Cliente cliente = clienteRepository.findByDni(dto.getDni());
            if (cliente == null) {
                Cliente nuevo = new Cliente();
                nuevo.setDni(dto.getDni());
                nuevo.setNombres(dto.getNombres());
                nuevo.setApellidos(dto.getApellidos());
                nuevo.setEstado(true);
                nuevo.setFechaRegistro(LocalDate.now());
                cliente = clienteRepository.save(nuevo);
            }

            if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
                Usuario usuario = usuarioRepository.findByUsername(dto.getUsername());
                if (usuario != null && usuario.getCliente() == null) {
                    usuario.setCliente(cliente);
                    usuarioRepository.save(usuario);
                }
            }

            List<Cajero> cajerosActivos = empleadoService.listarCajerosActivos();
            if (cajerosActivos.isEmpty()) {
                return ResponseEntity.badRequest().body("No hay cajeros activos para registrar la venta.");
            }
            CrearVentaRequest request = new CrearVentaRequest();
            request.setClienteId(cliente.getId());
            request.setCajeroId(cajerosActivos.get(0).getId());
            request.setProductos(dto.getProductos());

            Venta venta = ventaService.crearVenta(request);
            return ResponseEntity.ok(venta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error en venta web: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Venta> crearVenta(@RequestBody CrearVentaRequest request) {
        Venta venta = ventaService.crearVenta(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(venta);
    }

    @GetMapping
    public ResponseEntity<List<Venta>> listarVentas() {
        return ResponseEntity.ok(ventaService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarVenta(@PathVariable Long id) {
        Venta venta = ventaService.buscarPorId(id);
        if (venta == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("La venta con ID " + id + " no existe.");
        }
        return ResponseEntity.ok(venta);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable Long id, @RequestParam String estado) {
        try {
            Venta venta = ventaService.actualizarEstado(id, estado);
            return ResponseEntity.ok(venta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/pagar")
    public ResponseEntity<?> confirmarPago(@PathVariable Long id,
                                           @RequestBody ConfirmarPagoRequest pago) {
        try {
            Venta venta = ventaService.confirmarPago(id, pago.getMetodoPago(), pago.getMontoRecibido());
            return ResponseEntity.ok(venta);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("mensaje", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarVenta(@PathVariable Long id) {
        try {
            ventaService.eliminar(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Venta cancelada correctamente.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

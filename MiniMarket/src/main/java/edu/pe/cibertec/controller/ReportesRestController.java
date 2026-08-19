package edu.pe.cibertec.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import edu.pe.cibertec.repository.ProductoRepository;
import edu.pe.cibertec.repository.VentaRepository;

/**
 * API REST para reportes del MiniMarket.
 *
 * Expone estadísticas que el frontend Angular puede consumir
 * para mostrar dashboards y reportes.
 */
@RestController
@RequestMapping("/api/reportes")
public class ReportesRestController {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // GET /api/reportes/resumen
    // Devuelve: totalVentas, cantidadVentas, cantidadProductos, stockBajo
    @GetMapping("/resumen")
    public Map<String, Object> resumen() {
        Map<String, Object> resumen = new HashMap<>();
        BigDecimal total = ventaRepository.totalVentasFinalizadas();
        long cantidadVentas = ventaRepository.countByEstado("FINALIZADA");
        long cantidadProductos = productoRepository.count();
        List<?> stockBajo = productoRepository.findByStockLessThanEqual(5);
        LocalDate hoy = LocalDate.now();
        List<?> vencidos = productoRepository.findProductosVencidos(hoy);
        List<?> porVencer = productoRepository.findProductosPorVencer(hoy, hoy.plusDays(7));

        resumen.put("totalVentasFinalizadas", total);
        resumen.put("cantidadVentas", cantidadVentas);
        resumen.put("cantidadProductos", cantidadProductos);
        resumen.put("cantidadStockBajo", stockBajo.size());
        resumen.put("cantidadVencidos", vencidos.size());
        resumen.put("cantidadPorVencer", porVencer.size());
        return resumen;
    }

    // GET /api/reportes/ventas-por-estado
    @GetMapping("/ventas-por-estado")
    public List<Object[]> ventasPorEstado() {
        return ventaRepository.contarPorEstado();
    }

    // GET /api/reportes/top-clientes
    @GetMapping("/top-clientes")
    public List<Object[]> topClientes() {
        return ventaRepository.topClientes();
    }

    // GET /api/reportes/top-productos
    @GetMapping("/top-productos")
    public List<Object[]> topProductos() {
        return productoRepository.topProductosVendidos();
    }

    // GET /api/reportes/stock-bajo
    @GetMapping("/stock-bajo")
    public List<?> stockBajo() {
        return productoRepository.findByStockLessThanEqual(5);
    }

    // GET /api/reportes/productos-vencidos
    // Productos con fecha de vencimiento anterior a hoy
    @GetMapping("/productos-vencidos")
    public List<?> productosVencidos() {
        return productoRepository.findProductosVencidos(LocalDate.now());
    }

    // GET /api/reportes/productos-por-vencer
    // Productos que vencen entre hoy y dentro de 7 días (configurable con ?dias=N)
    @GetMapping("/productos-por-vencer")
    public List<?> productosPorVencer(@RequestParam(defaultValue = "7") int dias) {
        LocalDate hoy = LocalDate.now();
        return productoRepository.findProductosPorVencer(hoy, hoy.plusDays(dias));
    }
}

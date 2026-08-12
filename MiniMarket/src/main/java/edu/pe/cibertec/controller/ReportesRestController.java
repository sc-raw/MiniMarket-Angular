package edu.pe.cibertec.controller;

import java.math.BigDecimal;
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
        long cantidadVentas = ventaRepository.count();
        long cantidadProductos = productoRepository.count();
        List<?> stockBajo = productoRepository.findByStockLessThanEqual(5);

        resumen.put("totalVentasFinalizadas", total);
        resumen.put("cantidadVentas", cantidadVentas);
        resumen.put("cantidadProductos", cantidadProductos);
        resumen.put("cantidadStockBajo", stockBajo.size());
        return resumen;
    }

    // GET /api/reportes/ventas-por-estado
    // Devuelve: [{estado: "PENDIENTE", cantidad: 5}, ...]
    @GetMapping("/ventas-por-estado")
    public List<Object[]> ventasPorEstado() {
        return ventaRepository.contarPorEstado();
    }

    // GET /api/reportes/top-clientes
    // Devuelve top 5 clientes con más compras
    @GetMapping("/top-clientes")
    public List<Object[]> topClientes() {
        return ventaRepository.topClientes();
    }

    // GET /api/reportes/top-productos
    // Devuelve top 5 productos más vendidos
    @GetMapping("/top-productos")
    public List<Object[]> topProductos() {
        return productoRepository.topProductosVendidos();
    }

    // GET /api/reportes/stock-bajo
    // Devuelve productos con stock <= 5
    @GetMapping("/stock-bajo")
    public List<?> stockBajo() {
        return productoRepository.findByStockLessThanEqual(5);
    }
}

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

import edu.pe.cibertec.dto.CrearVentaRequest;
import edu.pe.cibertec.dto.VentaWebDTO;
import edu.pe.cibertec.entity.Cliente;
import edu.pe.cibertec.entity.Venta;
import edu.pe.cibertec.repository.ClienteRepository;
import edu.pe.cibertec.repository.VentaRepository;
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

    // ---------- VENTAS POR DNI (historial del cliente) ----------
    @GetMapping("/cliente/{dni}")
    public ResponseEntity<?> ventasPorDni(@PathVariable String dni) {
        Cliente cliente = clienteRepository.findByDni(dni);
        if (cliente == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(ventaRepository.findByClienteId(cliente.getId()));
    }

    // ---------- NUEVO ENDPOINT PARA VENTAS WEB ----------
    @PostMapping("/web")
    @Transactional
    public ResponseEntity<?> registrarVentaWeb(@RequestBody VentaWebDTO dto) {
        try {
            // 1. Buscar o crear al cliente por DNI
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

            // 2. Crear la venta asignada a un cajero por defecto (ej. ID 1, el admin)
            CrearVentaRequest request = new CrearVentaRequest();
            request.setClienteId(cliente.getId());
            request.setCajeroId(1L); // Asumimos que el cajero/admin con ID 1 existe
            request.setProductos(dto.getProductos());

            Venta venta = ventaService.crearVenta(request);
            return ResponseEntity.ok(venta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error en venta web: " + e.getMessage());
        }
    }

    // ---------- ENDPOINTS EXISTENTES ----------
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
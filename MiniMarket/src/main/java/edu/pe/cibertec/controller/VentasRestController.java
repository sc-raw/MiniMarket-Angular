package edu.pe.cibertec.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.pe.cibertec.dto.CrearVentaRequest;
import edu.pe.cibertec.entity.Venta;
import edu.pe.cibertec.service.VentaService;

@RestController
@RequestMapping("/api/ventas")
public class VentasRestController {

    @Autowired
    private VentaService ventaService;

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
    public ResponseEntity<?> eliminarVenta(@PathVariable Long id) {
        try {
            ventaService.eliminar(id);
            return ResponseEntity.ok("Venta cancelada correctamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

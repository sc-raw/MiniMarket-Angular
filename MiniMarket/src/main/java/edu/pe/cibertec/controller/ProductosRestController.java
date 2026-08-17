package edu.pe.cibertec.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.pe.cibertec.entity.Producto;
import edu.pe.cibertec.service.ProductoService;

@RestController
@RequestMapping("/api/productos")
public class ProductosRestController {

    @Autowired
    private ProductoService productoService;

    @GetMapping
    public List<Producto> listar() {
        return productoService.listarActivos();
    }

    @GetMapping("/todos")
    public List<Producto> listarTodos() {
        return productoService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> buscar(@PathVariable Integer id) {
        Producto p = productoService.buscarPorId(id);
        return p != null ? ResponseEntity.ok(p) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Producto> guardar(@RequestBody Producto producto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.guardar(producto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Integer id, @RequestBody Producto producto) {
        producto.setIdProducto(id);
        return ResponseEntity.ok(productoService.guardar(producto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/productos/{id}/stock?stock=N
    // Actualiza SOLO el stock del producto (para reponedores)
    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> actualizarStock(@PathVariable Integer id,
                                             @RequestParam Integer stock) {
        try {
            Producto actualizado = productoService.actualizarStock(id, stock);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

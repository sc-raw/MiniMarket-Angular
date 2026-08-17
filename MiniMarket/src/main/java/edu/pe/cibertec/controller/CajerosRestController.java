package edu.pe.cibertec.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.pe.cibertec.entity.Cajero;
import edu.pe.cibertec.entity.Empleado;
import edu.pe.cibertec.service.EmpleadoService;

@RestController
@RequestMapping("/api/cajeros")
public class CajerosRestController {

    @Autowired
    private EmpleadoService empleadoService;

    @GetMapping
    public List<Cajero> listar() {
        return empleadoService.listarCajerosActivos();
    }
    
    @GetMapping("/todos")
    public List<Cajero> listarTodos() {
        return empleadoService.listarTodosCajeros();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable("id") Long id) {
        Empleado emp = empleadoService.buscarPorId(id);
        if (emp == null || !(emp instanceof Cajero)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cajero no encontrado.");
        }
        return ResponseEntity.ok(emp);
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Cajero cajero) {
        if (cajero.getDni() == null || cajero.getDni().isBlank()) {
            return ResponseEntity.badRequest().body("El DNI es obligatorio.");
        }
        if (cajero.getNombres() == null || cajero.getNombres().isBlank()) {
            return ResponseEntity.badRequest().body("Los nombres son obligatorios.");
        }
        if (cajero.getApellidos() == null || cajero.getApellidos().isBlank()) {
            return ResponseEntity.badRequest().body("Los apellidos son obligatorios.");
        }
        if (cajero.getTurno() == null || cajero.getTurno().isBlank()) {
            return ResponseEntity.badRequest().body("El turno es obligatorio.");
        }
        if (cajero.getSalario() == null) {
            return ResponseEntity.badRequest().body("El salario es obligatorio.");
        }
        if (cajero.getEstado() == null) {
            cajero.setEstado(true);
        }
        Cajero guardado = (Cajero) empleadoService.guardar(cajero);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable("id") Long id, @RequestBody Cajero datos) {
        Empleado emp = empleadoService.buscarPorId(id);
        if (emp == null || !(emp instanceof Cajero cajero)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cajero no encontrado.");
        }
        cajero.setDni(datos.getDni());
        cajero.setNombres(datos.getNombres());
        cajero.setApellidos(datos.getApellidos());
        cajero.setDireccion(datos.getDireccion());
        cajero.setTelefono(datos.getTelefono());
        cajero.setCorreo(datos.getCorreo());
        cajero.setSalario(datos.getSalario());
        cajero.setTurno(datos.getTurno());
        if (datos.getEstado() != null) {
            cajero.setEstado(datos.getEstado());
        }
        if (datos.getFechaIngreso() != null) {
            cajero.setFechaIngreso(datos.getFechaIngreso());
        }
        return ResponseEntity.ok(empleadoService.guardar(cajero));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable("id") Long id) {
        Empleado emp = empleadoService.buscarPorId(id);
        if (emp == null || !(emp instanceof Cajero cajero)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cajero no encontrado.");
        }
        cajero.setEstado(false); // baja lógica
        empleadoService.guardar(cajero);
        return ResponseEntity.ok("Cajero desactivado correctamente.");
    }
}
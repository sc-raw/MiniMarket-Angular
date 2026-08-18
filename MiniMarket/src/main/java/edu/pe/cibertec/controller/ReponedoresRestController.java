package edu.pe.cibertec.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import edu.pe.cibertec.dto.ReponedorUsuarioDTO;
import edu.pe.cibertec.entity.Empleado;
import edu.pe.cibertec.entity.Reponedor;
import edu.pe.cibertec.entity.Usuario;
import edu.pe.cibertec.repository.ReponedorRepository;
import edu.pe.cibertec.repository.UsuarioRepository;
import edu.pe.cibertec.service.EmpleadoService;

/**
 * API REST para gestionar Reponedores.
 * Igual que CajerosRestController pero para empleados de tipo Reponedor.
 */
@RestController
@RequestMapping("/api/reponedores")
public class ReponedoresRestController {

    @Autowired
    private EmpleadoService empleadoService;

    @Autowired
    private ReponedorRepository reponedorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ---------- ENDPOINT NUEVO ----------
    @PostMapping("/crear-con-usuario")
    @Transactional
    public ResponseEntity<?> crearReponedorConUsuario(@RequestBody ReponedorUsuarioDTO dto) {
        try {
            // 1. Guardamos el reponedor
            Reponedor nuevoReponedor = dto.getReponedor();
            reponedorRepository.save(nuevoReponedor);

            // 2. Creamos y guardamos el usuario
            Usuario u = new Usuario();
            u.setUsername(dto.getUsername());
            u.setPassword(passwordEncoder.encode(dto.getPassword()));
            u.setRol("REPONEDOR");
            u.setEstado(true);
            usuarioRepository.save(u);

            return ResponseEntity.ok("Reponedor y Usuario creados con éxito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Reponedor> listar() {
        return empleadoService.listarReponedoresActivos();
    }

    @GetMapping("/todos")
    public List<Reponedor> listarTodos() {
        return empleadoService.listarTodosReponedores();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable("id") Long id) {
        Empleado emp = empleadoService.buscarPorId(id);
        if (emp == null || !(emp instanceof Reponedor)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reponedor no encontrado.");
        }
        return ResponseEntity.ok(emp);
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Reponedor reponedor) {
        if (reponedor.getDni() == null || reponedor.getDni().isBlank()) {
            return ResponseEntity.badRequest().body("El DNI es obligatorio.");
        }
        if (reponedor.getNombres() == null || reponedor.getNombres().isBlank()) {
            return ResponseEntity.badRequest().body("Los nombres son obligatorios.");
        }
        if (reponedor.getApellidos() == null || reponedor.getApellidos().isBlank()) {
            return ResponseEntity.badRequest().body("Los apellidos son obligatorios.");
        }
        if (reponedor.getArea() == null || reponedor.getArea().isBlank()) {
            return ResponseEntity.badRequest().body("El área es obligatoria.");
        }
        if (reponedor.getSalario() == null) {
            return ResponseEntity.badRequest().body("El salario es obligatorio.");
        }
        if (reponedor.getEstado() == null) {
            reponedor.setEstado(true);
        }
        Reponedor guardado = (Reponedor) empleadoService.guardar(reponedor);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable("id") Long id, @RequestBody Reponedor datos) {
        Empleado emp = empleadoService.buscarPorId(id);
        if (emp == null || !(emp instanceof Reponedor reponedor)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reponedor no encontrado.");
        }
        reponedor.setDni(datos.getDni());
        reponedor.setNombres(datos.getNombres());
        reponedor.setApellidos(datos.getApellidos());
        reponedor.setDireccion(datos.getDireccion());
        reponedor.setTelefono(datos.getTelefono());
        reponedor.setCorreo(datos.getCorreo());
        reponedor.setSalario(datos.getSalario());
        reponedor.setArea(datos.getArea());
        if (datos.getEstado() != null) {
            reponedor.setEstado(datos.getEstado());
        }
        if (datos.getFechaIngreso() != null) {
            reponedor.setFechaIngreso(datos.getFechaIngreso());
        }
        return ResponseEntity.ok(empleadoService.guardar(reponedor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable("id") Long id) {
        Empleado emp = empleadoService.buscarPorId(id);
        if (emp == null || !(emp instanceof Reponedor reponedor)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reponedor no encontrado.");
        }
        reponedor.setEstado(false); // baja lógica
        empleadoService.guardar(reponedor);
        return ResponseEntity.ok("Reponedor desactivado correctamente.");
    }
}

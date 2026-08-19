package edu.pe.cibertec.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import edu.pe.cibertec.dto.LoginRequest;
import edu.pe.cibertec.dto.LoginResponse;
import edu.pe.cibertec.dto.RegistroRequest;
import edu.pe.cibertec.entity.Cliente;
import edu.pe.cibertec.entity.Usuario;
import edu.pe.cibertec.repository.ClienteRepository;
import edu.pe.cibertec.repository.UsuarioRepository;

/**
 * API REST para autenticación.
 *
 * Permite que Angular haga login enviando username/password en JSON.
 * Devuelve el rol del usuario para que el frontend pueda mostrar/ocultar
 * módulos según el rol.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ClienteRepository clienteRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registrarCliente(@RequestBody RegistroRequest request) {
        try {
            // Si el usuario ya existe
            if (usuarioRepository.findByUsername(request.getUsername()) != null) {
                return ResponseEntity.badRequest().body("El usuario ya existe");
            }

            // Si el DNI ya pertenece a otro cliente
            if (request.getDni() != null && !request.getDni().isBlank()
                    && clienteRepository.findByDni(request.getDni()) != null) {
                return ResponseEntity.badRequest().body("Ya existe un cliente con ese DNI");
            }

            // Crear la Cliente (si trae datos personales)
            Cliente cliente = null;
            if (request.getDni() != null && !request.getDni().isBlank()) {
                Cliente nuevoCliente = new Cliente();
                nuevoCliente.setDni(request.getDni());
                nuevoCliente.setNombres(request.getNombres());
                nuevoCliente.setApellidos(request.getApellidos());
                nuevoCliente.setEstado(true);
                cliente = clienteRepository.save(nuevoCliente);
            }

            // Crear el usuario con rol CLIENTE y vincular su Cliente
            Usuario nuevo = new Usuario();
            nuevo.setUsername(request.getUsername());
            nuevo.setPassword(passwordEncoder.encode(request.getPassword()));
            nuevo.setRol("CLIENTE");
            nuevo.setEstado(true);
            nuevo.setCliente(cliente);
            usuarioRepository.save(nuevo);

            return ResponseEntity.ok("Cliente registrado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al registrar: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    @Transactional
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            if (authentication.isAuthenticated()) {
                Usuario usuario = usuarioRepository.findByUsername(request.getUsername());

                // ===== Vincular el usuario con su persona (cajero o reponedor) =====
                Long   empleadoId = null;
                String nombre     = null;
                String apellidos  = null;
                if (usuario.getCajero() != null) {
                    empleadoId = usuario.getCajero().getId();
                    nombre     = usuario.getCajero().getNombres();
                    apellidos  = usuario.getCajero().getApellidos();
                } else if (usuario.getReponedor() != null) {
                    empleadoId = usuario.getReponedor().getId();
                    nombre     = usuario.getReponedor().getNombres();
                    apellidos  = usuario.getReponedor().getApellidos();
                }

                // ===== Vincular el CLIENTE (si es rol CLIENTE y ya tiene una Cliente) =====
                Long clienteId = null;
                String dniCli = null;
                if (usuario.getCliente() != null) {
                    clienteId = usuario.getCliente().getId();
                    nombre    = usuario.getCliente().getNombres();
                    apellidos = usuario.getCliente().getApellidos();
                    dniCli    = usuario.getCliente().getDni();
                }

                return ResponseEntity.ok(new LoginResponse(
                    true, "Login exitoso", usuario.getUsername(), usuario.getRol(),
                    empleadoId, nombre, apellidos, clienteId, dniCli
                ));
            }
            return ResponseEntity.status(401).body(
                new LoginResponse(false, "Credenciales inválidas", null, null)
            );
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(
                new LoginResponse(false, "Usuario o contraseña incorrectos", null, null)
            );
        }
    }
}

package edu.pe.cibertec.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import edu.pe.cibertec.dto.LoginRequest;
import edu.pe.cibertec.dto.LoginResponse;
import edu.pe.cibertec.entity.Usuario;
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

    @PostMapping("/register")
    public ResponseEntity<?> registrarCliente(@RequestBody Usuario usuario) {
        try {
            // Si el usuario ya existe
            if (usuarioRepository.findByUsername(usuario.getUsername()) != null) {
                return ResponseEntity.badRequest().body("El usuario ya existe");
            }

            // Crear el usuario con rol CLIENTE
            Usuario nuevo = new Usuario();
            nuevo.setUsername(usuario.getUsername());
            nuevo.setPassword(passwordEncoder.encode(usuario.getPassword()));
            nuevo.setRol("CLIENTE");
            nuevo.setEstado(true);
            usuarioRepository.save(nuevo);

            return ResponseEntity.ok("Cliente registrado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al registrar: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            if (authentication.isAuthenticated()) {
                Usuario usuario = usuarioRepository.findByUsername(request.getUsername());
                return ResponseEntity.ok(new LoginResponse(
                    true, "Login exitoso", usuario.getUsername(), usuario.getRol()
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

package edu.pe.cibertec.security;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import edu.pe.cibertec.entity.Usuario;
import edu.pe.cibertec.repository.UsuarioRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() > 0) {
            return;
        }
        crearUsuario("admin", "admin123", "ADMIN");
        crearUsuario("cajero", "cajero123", "CAJERO");
        crearUsuario("reponedor", "reponedor123", "REPONEDOR");

        System.out.println(">>> Usuarios por defecto creados:");
        System.out.println(">>>     admin / admin123           (ADMIN)");
        System.out.println(">>>     cajero / cajero123          (CAJERO)");
        System.out.println(">>>     reponedor / reponedor123    (REPONEDOR)");
    }

    private void crearUsuario(String username, String password, String rol) {
        Usuario u = new Usuario();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(password));
        u.setRol(rol);
        u.setEstado(true);
        usuarioRepository.save(u);
    }
}

package edu.pe.cibertec.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import edu.pe.cibertec.entity.Usuario;
import edu.pe.cibertec.repository.UsuarioRepository;
import edu.pe.cibertec.service.UsuarioService;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Usuario guardar(Usuario usuario) {
        if (usuario.getId() == null) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        } else {
            Usuario existente = repository.findById(usuario.getId()).orElse(null);
            if (existente != null) {
                if (usuario.getPassword() == null || usuario.getPassword().isBlank()) {
                    usuario.setPassword(existente.getPassword());
                } else {
                    usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
                }
            }
        }
        return repository.save(usuario);
    }

    @Override
    public List<Usuario> listar() {
        return repository.findAll();
    }

    @Override
    public Usuario buscarPorId(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}

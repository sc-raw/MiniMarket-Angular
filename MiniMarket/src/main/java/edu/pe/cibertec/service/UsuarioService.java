package edu.pe.cibertec.service;

import java.util.List;

import edu.pe.cibertec.entity.Usuario;

public interface UsuarioService {

    Usuario guardar(Usuario usuario);
    List<Usuario> listar();
    Usuario buscarPorId(Long id);
    void eliminar(Long id);
}

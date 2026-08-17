package edu.pe.cibertec.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.pe.cibertec.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Usuario findByUsername(String username);

}

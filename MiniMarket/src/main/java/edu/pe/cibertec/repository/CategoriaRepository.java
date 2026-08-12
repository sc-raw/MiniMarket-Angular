package edu.pe.cibertec.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.pe.cibertec.entity.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    Categoria findByNombre(String nombre);

    List<Categoria> findByNombreContaining(String texto);
}

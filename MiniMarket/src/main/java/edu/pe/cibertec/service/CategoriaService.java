package edu.pe.cibertec.service;

import java.util.List;

import edu.pe.cibertec.entity.Categoria;

public interface CategoriaService {

    Categoria guardar(Categoria categoria);
    List<Categoria> listar();
    Categoria buscarPorId(Integer id);
    void eliminar(Integer id);
    Categoria buscarPorNombre(String nombre);
    List<Categoria> buscarPorNombreConteniendo(String texto);
}

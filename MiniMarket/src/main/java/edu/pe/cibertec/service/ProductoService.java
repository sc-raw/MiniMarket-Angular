package edu.pe.cibertec.service;

import java.util.List;

import edu.pe.cibertec.entity.Producto;

public interface ProductoService {

    Producto guardar(Producto producto);
    List<Producto> listar();
    Producto buscarPorId(Integer id);
    void eliminar(Integer id);
    Producto buscarPorCodigo(String codigo);
    List<Producto> buscarPorCategoria(Integer idCategoria);
    List<Producto> buscarPorNombreConteniendo(String texto);
    List<Producto> listarActivos();

    Producto actualizarStock(Integer id, Integer nuevoStock);
}

package edu.pe.cibertec.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.pe.cibertec.entity.Producto;
import edu.pe.cibertec.repository.ProductoRepository;
import edu.pe.cibertec.service.ProductoService;

@Service
public class ProductoServiceImpl implements ProductoService {

    @Autowired
    private ProductoRepository repository;

    @Override
    public Producto guardar(Producto producto) {
        return repository.save(producto);
    }

    @Override
    public List<Producto> listar() {
        return repository.findAll();
    }

    @Override
    public Producto buscarPorId(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public void eliminar(Integer id) {
        repository.deleteById(id);
    }

    @Override
    public Producto buscarPorCodigo(String codigo) {
        return repository.findByCodigo(codigo);
    }

    @Override
    public List<Producto> buscarPorCategoria(Integer idCategoria) {
        return repository.findByCategoria_IdCategoria(idCategoria);
    }

    @Override
    public List<Producto> buscarPorNombreConteniendo(String texto) {
        return repository.findByNombreContaining(texto);
    }

    @Override
    public List<Producto> listarActivos() {
        return repository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getEstado()))
                .collect(Collectors.toList());
    }
}

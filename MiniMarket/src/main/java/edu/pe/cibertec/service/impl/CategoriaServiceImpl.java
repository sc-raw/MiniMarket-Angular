package edu.pe.cibertec.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.pe.cibertec.entity.Categoria;
import edu.pe.cibertec.repository.CategoriaRepository;
import edu.pe.cibertec.service.CategoriaService;

@Service
public class CategoriaServiceImpl implements CategoriaService {

    @Autowired
    private CategoriaRepository repository;

    @Override
    public Categoria guardar(Categoria categoria) {
        return repository.save(categoria);
    }

    @Override
    public List<Categoria> listar() {
        return repository.findAll();
    }

    @Override
    public Categoria buscarPorId(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public void eliminar(Integer id) {
        repository.deleteById(id);
    }

    @Override
    public Categoria buscarPorNombre(String nombre) {
        return repository.findByNombre(nombre);
    }

    @Override
    public List<Categoria> buscarPorNombreConteniendo(String texto) {
        return repository.findByNombreContaining(texto);
    }
}

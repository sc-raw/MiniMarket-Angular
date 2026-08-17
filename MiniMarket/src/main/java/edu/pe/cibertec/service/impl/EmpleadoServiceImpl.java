package edu.pe.cibertec.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.pe.cibertec.entity.Cajero;
import edu.pe.cibertec.entity.Empleado;
import edu.pe.cibertec.entity.Reponedor;
import edu.pe.cibertec.repository.EmpleadoRepository;
import edu.pe.cibertec.service.EmpleadoService;

@Service
public class EmpleadoServiceImpl implements EmpleadoService {

    @Autowired
    private EmpleadoRepository repository;

    @Override
    public Empleado guardar(Empleado empleado) {
        return repository.save(empleado);
    }

    @Override
    public List<Empleado> listar() {
        return repository.findAll();
    }

    @Override
    public Empleado buscarPorId(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<Empleado> buscarPorApellido(String apellidos) {
        return repository.findByApellidos(apellidos);
    }

    @Override
    public List<Empleado> buscarPorApellidoConteniendo(String texto) {
        return repository.findByApellidosContaining(texto);
    }

    @Override
    public List<Cajero> listarCajerosActivos() {
        return repository.findCajerosActivos();
    }

    @Override
    public List<Cajero> listarTodosCajeros() {
        return repository.findAllCajeros();
    }

    @Override
    public List<Reponedor> listarReponedoresActivos() {
        return repository.findReponedoresActivos();
    }

    @Override
    public List<Reponedor> listarTodosReponedores() {
        return repository.findAllReponedores();
    }
}

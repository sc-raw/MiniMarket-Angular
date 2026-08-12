package edu.pe.cibertec.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import edu.pe.cibertec.entity.Cliente;
import edu.pe.cibertec.repository.ClienteRepository;
import edu.pe.cibertec.service.ClienteService;

@Service
public class ClienteServiceImpl implements ClienteService {

    @Autowired
    private ClienteRepository repository;

    @Override
    public List<Cliente> listar() {
        return repository.findAll();
    }

    @Override
    public Cliente buscarPorId(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Cliente buscarPorDni(String dni) {
        return repository.findByDni(dni);
    }

    @Override
    public Cliente buscarPorCorreo(String correo) {
        return repository.findByCorreo(correo);
    }

    @Override
    public List<Cliente> buscarPorApellidos(String apellidos) {
        return repository.findByApellidos(apellidos);
    }

    @Override
    public List<Cliente> buscarPorApellidosConteniendo(String texto) {
        return repository.findByApellidosContaining(texto);
    }

    @Override
    public List<Cliente> buscarPorNombresIniciando(String texto) {
        return repository.findByNombresStartingWith(texto);
    }

    @Override
    public List<Cliente> listarTodosJPQL() {
        return repository.listarTodosJPQL();
    }

    @Override
    public List<Cliente> buscarPorApellidoJPQL(String apellido) {
        return repository.buscarPorApellidoJPQL(apellido);
    }

    @Override
    public List<Cliente> buscarPorApellidoYEstado(String apellido, Boolean estado) {
        return repository.buscarPorApellidoYEstado(apellido, estado);
    }

    @Override
    public List<Cliente> listarOrdenadoPorApellidos() {
        return repository.findAll(Sort.by("apellidos"));
    }

    @Override
    public List<Cliente> listarOrdenadoPorNombresDesc() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "nombres"));
    }

    @Override
    public Page<Cliente> listarPaginado(int pagina, int tamanio) {
        Pageable pageable = PageRequest.of(pagina, tamanio);
        return repository.findAll(pageable);
    }

    @Override
    public Cliente guardar(Cliente cliente) {
        return repository.save(cliente);
    }

    @Override
    public Cliente actualizar(Long id, Cliente clienteActualizado) {
        Cliente cliente = repository.findById(id).orElse(null);
        if (cliente != null) {
            cliente.setDni(clienteActualizado.getDni());
            cliente.setNombres(clienteActualizado.getNombres());
            cliente.setApellidos(clienteActualizado.getApellidos());
            cliente.setDireccion(clienteActualizado.getDireccion());
            cliente.setTelefono(clienteActualizado.getTelefono());
            cliente.setCorreo(clienteActualizado.getCorreo());
            cliente.setEstado(clienteActualizado.getEstado());
            cliente.setFechaRegistro(clienteActualizado.getFechaRegistro());
            repository.save(cliente);
        }
        return cliente;
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}

package edu.pe.cibertec.service;

import java.util.List;

import org.springframework.data.domain.Page;

import edu.pe.cibertec.entity.Cliente;

public interface ClienteService {

    List<Cliente> listar();
    Cliente buscarPorId(Long id);
    Cliente buscarPorDni(String dni);
    Cliente buscarPorCorreo(String correo);
    List<Cliente> buscarPorApellidos(String apellidos);
    List<Cliente> buscarPorApellidosConteniendo(String texto);
    List<Cliente> buscarPorNombresIniciando(String texto);

    List<Cliente> listarTodosJPQL();
    List<Cliente> buscarPorApellidoJPQL(String apellido);
    List<Cliente> buscarPorApellidoYEstado(String apellido, Boolean estado);

    List<Cliente> listarOrdenadoPorApellidos();
    List<Cliente> listarOrdenadoPorNombresDesc();

    Page<Cliente> listarPaginado(int pagina, int tamanio);

    Cliente guardar(Cliente cliente);
    Cliente actualizar(Long id, Cliente cliente);
    void eliminar(Long id);
}

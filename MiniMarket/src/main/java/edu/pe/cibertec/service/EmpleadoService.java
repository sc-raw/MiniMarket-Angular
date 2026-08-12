package edu.pe.cibertec.service;

import java.util.List;

import edu.pe.cibertec.entity.Cajero;
import edu.pe.cibertec.entity.Empleado;

public interface EmpleadoService {

    Empleado guardar(Empleado empleado);
    List<Empleado> listar();
    Empleado buscarPorId(Long id);
    void eliminar(Long id);

    List<Empleado> buscarPorApellido(String apellido);
    List<Empleado> buscarPorApellidoConteniendo(String texto);

    List<Cajero> listarCajerosActivos();
}

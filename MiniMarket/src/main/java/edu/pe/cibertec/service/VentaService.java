package edu.pe.cibertec.service;

import java.util.List;

import edu.pe.cibertec.dto.CrearVentaRequest;
import edu.pe.cibertec.entity.Venta;

public interface VentaService {

    Venta crearVenta(CrearVentaRequest request);
    List<Venta> listar();
    Venta buscarPorId(Long id);
    Venta actualizarEstado(Long id, String nuevoEstado);
    void eliminar(Long id);
}

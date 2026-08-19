package edu.pe.cibertec.service;

import java.math.BigDecimal;
import java.util.List;

import edu.pe.cibertec.dto.CrearVentaRequest;
import edu.pe.cibertec.entity.Venta;

public interface VentaService {

    Venta crearVenta(CrearVentaRequest request);
    List<Venta> listar();
    Venta buscarPorId(Long id);
    Venta actualizarEstado(Long id, String nuevoEstado);
    Venta confirmarPago(Long id, String metodoPago, BigDecimal montoRecibido);
    void eliminar(Long id);
}

package edu.pe.cibertec.whatsapp;

import java.util.List;

import edu.pe.cibertec.entity.PedidoWhatsApp;
import edu.pe.cibertec.entity.Venta;

public interface WhatsAppService {

    void procesarMensajeEntrante(String numeroRemitente, String nombreRemitente, String mensaje);


    void enviarMensaje(String numeroDestino, String mensaje);

    List<PedidoWhatsApp> listarPendientes();

    List<PedidoWhatsApp> listarPorTipo(String tipo);

    List<PedidoWhatsApp> listarTodos();

    PedidoWhatsApp atender(Long id, String respuesta);

    PedidoWhatsApp marcarEnProceso(Long id);

    PedidoWhatsApp vincularVenta(Long pedidoId, Long ventaId);


    PedidoWhatsApp enviarMensajeOperador(Long pedidoId, String texto);

    long contarPorEstado(String estado);

    Venta convertirAVenta(Long pedidoId, Long clienteId, Long cajeroId,
                          java.util.List<edu.pe.cibertec.dto.DetalleVentaRequest> productos);
}

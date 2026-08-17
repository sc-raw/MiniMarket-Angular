package edu.pe.cibertec.whatsapp;

import java.util.List;

import edu.pe.cibertec.entity.PedidoWhatsApp;

public interface WhatsAppService {

    /**
     * Procesa un mensaje entrante de WhatsApp.
     * Implementa el flujo del bot:
     *   1. Primer mensaje → guarda como NUEVO, responde menú
     *   2. "1" → marca como PEDIDO, pide detalles
     *   3. "2" → marca como CONSULTA, queda pendiente
     *   4. Mensaje posterior → actualiza el pedido pendiente
     */
    void procesarMensajeEntrante(String numeroRemitente, String nombreRemitente, String mensaje);

    /**
     * Envía un mensaje de texto a un número de WhatsApp vía Meta Business API.
     */
    void enviarMensaje(String numeroDestino, String mensaje);

    /** Lista todos los pedidos/consultas pendientes (no atendidos). */
    List<PedidoWhatsApp> listarPendientes();

    /** Lista todos los pedidos por tipo. */
    List<PedidoWhatsApp> listarPorTipo(String tipo);

    /** Lista todos. */
    List<PedidoWhatsApp> listarTodos();

    /** Marca un pedido como atendido con una respuesta. */
    PedidoWhatsApp atender(Long id, String respuesta);

    /** Marca un pedido como en proceso (atención al cliente lo está revisando). */
    PedidoWhatsApp marcarEnProceso(Long id);

    /** Vincula un pedido con una venta creada. */
    PedidoWhatsApp vincularVenta(Long pedidoId, Long ventaId);
}

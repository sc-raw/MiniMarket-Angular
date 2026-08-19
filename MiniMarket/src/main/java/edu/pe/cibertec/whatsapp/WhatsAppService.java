package edu.pe.cibertec.whatsapp;

import java.util.List;

import edu.pe.cibertec.entity.PedidoWhatsApp;
import edu.pe.cibertec.entity.Venta;

public interface WhatsAppService {

    /**
     * Procesa un mensaje entrante de WhatsApp.
     * Implementa el flujo del bot:
     *   1. Primer mensaje → guarda como NUEVO, responde menú
     *   2. "1" → marca como PEDIDO, pide detalles
     *   3. "2" → marca como CONSULTA, queda pendiente
     *   4. Mensaje posterior → actualiza el pedido pendiente
     *   5. Si está EN_PROCESO → también acumula el mensaje (fix bug)
     */
    void procesarMensajeEntrante(String numeroRemitente, String nombreRemitente, String mensaje);

    /**
     * Envía un mensaje de texto a un número de WhatsApp vía Meta Business API.
     * Usa ObjectMapper para construir el JSON de forma segura.
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

    // ===== Nuevos métodos para la atención al cliente =====

    /** Envía un mensaje libre del operador al cliente (no cierra el pedido). */
    PedidoWhatsApp enviarMensajeOperador(Long pedidoId, String texto);

    /** Cuenta pedidos por estado (para badge en navbar). */
    long contarPorEstado(String estado);

    /**
     * Convierte un pedido WhatsApp en una Venta PENDIENTE.
     * El cajero deberá cobrarla desde /ventas después.
     * @return la Venta creada
     */
    Venta convertirAVenta(Long pedidoId, Long clienteId, Long cajeroId,
                          java.util.List<edu.pe.cibertec.dto.DetalleVentaRequest> productos);
}

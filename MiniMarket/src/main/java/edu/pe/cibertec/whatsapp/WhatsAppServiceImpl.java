package edu.pe.cibertec.whatsapp;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import edu.pe.cibertec.entity.PedidoWhatsApp;
import edu.pe.cibertec.repository.PedidoWhatsAppRepository;

@Service
public class WhatsAppServiceImpl implements WhatsAppService {

    private final PedidoWhatsAppRepository pedidoRepository;

    // Configuración de Meta Business API (reemplazar en application.properties)
    @Value("${whatsapp.api-url:https://graph.facebook.com/v18.0}")
    private String apiUrl;

    @Value("${whatsapp.token:TOKEN_PLACEHOLDER}")
    private String token;

    @Value("${whatsapp.phone-number-id:PHONE_NUMBER_ID_PLACEHOLDER}")
    private String phoneNumberId;

    @Value("${whatsapp.verify-token:VERIFY_TOKEN_PLACEHOLDER}")
    private String verifyToken;

    public WhatsAppServiceImpl(PedidoWhatsAppRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    /**
     * Procesa un mensaje entrante del webhook de Meta.
     *
     * Flujo del bot:
     *   1. Si no hay pedidos recientes del número → crear NUEVO, responder menú
     *   2. Si hay pedido NUEVO y mensaje="1" → tipo="PEDIDO", estado="PENDIENTE", pedir productos
     *   3. Si hay pedido NUEVO y mensaje="2" → tipo="CONSULTA", estado="PENDIENTE"
     *   4. Si hay pedido PENDIENTE → actualizar con el mensaje del cliente
     */
    @Override
    public void procesarMensajeEntrante(String numeroRemitente, String nombreRemitente, String mensaje) {
        System.out.println(">>> WhatsApp entrante de " + numeroRemitente + ": " + mensaje);

        // Buscar el último pedido de este número
        List<PedidoWhatsApp> historial = pedidoRepository
                .findByNumeroRemitenteOrderByFechaRegistroDesc(numeroRemitente);

        if (historial.isEmpty()) {
            // PRIMER MENSAJE: crear pedido NUEVO y responder menú
            PedidoWhatsApp pedido = new PedidoWhatsApp();
            pedido.setNumeroRemitente(numeroRemitente);
            pedido.setNombreRemitente(nombreRemitente);
            pedido.setMensaje(mensaje);
            pedido.setTipo(null);
            pedido.setEstado("NUEVO");
            pedidoRepository.save(pedido);

            enviarMensaje(numeroRemitente,
                    "¡Hola! 👋 Bienvenido a MiniMarket.\n\n" +
                    "¿Qué deseas hacer?\n\n" +
                    "1️⃣ Hacer un pedido\n" +
                    "2️⃣ Tengo una duda\n\n" +
                    "Responde con el número 1 o 2.");
            return;
        }

        PedidoWhatsApp ultimo = historial.get(0);

        // Si el último ya fue atendido, crear uno nuevo
        if ("ATENDIDO".equals(ultimo.getEstado())) {
            PedidoWhatsApp nuevo = new PedidoWhatsApp();
            nuevo.setNumeroRemitente(numeroRemitente);
            nuevo.setNombreRemitente(nombreRemitente);
            nuevo.setMensaje(mensaje);
            nuevo.setEstado("NUEVO");
            pedidoRepository.save(nuevo);

            enviarMensaje(numeroRemitente,
                    "¡Hola! 👋 Bienvenido a MiniMarket.\n\n" +
                    "¿Qué deseas hacer?\n\n" +
                    "1️⃣ Hacer un pedido\n" +
                    "2️⃣ Tengo una duda\n\n" +
                    "Responde con el número 1 o 2.");
            return;
        }

        // Si está NUEVO, interpretar la respuesta del menú
        if ("NUEVO".equals(ultimo.getEstado())) {
            String respuesta = mensaje.trim();
            if ("1".equals(respuesta)) {
                ultimo.setTipo("PEDIDO");
                ultimo.setEstado("PENDIENTE");
                // Guardar el mensaje original como contexto
                pedidoRepository.save(ultimo);
                enviarMensaje(numeroRemitente,
                        "¡Genial! 📦 Para procesar tu pedido necesitamos:\n\n" +
                        "• Tu nombre completo\n" +
                        "• Tu DNI\n" +
                        "• Productos y cantidades\n\n" +
                        "Ejemplo: Juan Pérez, 12345678, 2 leches Gloria 1L, 1 Coca Cola 1.5L\n\n" +
                        "Un ejecutivo de Atención al Cliente revisará tu pedido pronto. 🙌");
            } else if ("2".equals(respuesta)) {
                ultimo.setTipo("CONSULTA");
                ultimo.setEstado("PENDIENTE");
                pedidoRepository.save(ultimo);
                enviarMensaje(numeroRemitente,
                        "Entendido. 📝 Cuéntanos tu duda y un ejecutivo te responderá pronto.");
            } else {
                enviarMensaje(numeroRemitente,
                        "Por favor responde con 1 (pedido) o 2 (duda). 🙏");
            }
            return;
        }

        // Si está PENDIENTE, el cliente está enviando más detalles
        if ("PENDIENTE".equals(ultimo.getEstado())) {
            ultimo.setMensaje(ultimo.getMensaje() + " | " + mensaje);
            pedidoRepository.save(ultimo);
            enviarMensaje(numeroRemitente,
                    "✅ Mensaje recibido. Un ejecutivo de Atención al Cliente te responderá pronto. " +
                    "Gracias por tu paciencia. 🙌");
        }
    }

    /**
     * Envía un mensaje de texto a un número de WhatsApp usando la API de Meta.
     */
    @Override
    public void enviarMensaje(String numeroDestino, String mensaje) {
        if ("TOKEN_PLACEHOLDER".equals(token)) {
            System.out.println(">>> [WHATSAPP NO CONFIGURADO] Mensaje para " + numeroDestino + ": " + mensaje);
            return;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            String url = apiUrl + "/" + phoneNumberId + "/messages";
            String body = "{\"messaging_product\":\"whatsapp\",\"to\":\"" + numeroDestino +
                    "\",\"type\":\"text\",\"text\":{\"body\":\"" + mensaje.replace("\"", "\\\"")
                    .replace("\n", "\\n") + "\"}}";

            HttpEntity<String> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            System.out.println(">>> WhatsApp enviado a " + numeroDestino + ": " + response.getStatusCode());
        } catch (Exception e) {
            System.err.println(">>> Error enviando WhatsApp: " + e.getMessage());
        }
    }

    @Override
    public List<PedidoWhatsApp> listarPendientes() {
        return pedidoRepository.findByEstadoOrderByFechaRegistroDesc("PENDIENTE");
    }

    @Override
    public List<PedidoWhatsApp> listarPorTipo(String tipo) {
        return pedidoRepository.findByTipoAndEstadoOrderByFechaRegistroDesc(tipo, "PENDIENTE");
    }

    @Override
    public List<PedidoWhatsApp> listarTodos() {
        return pedidoRepository.findAll();
    }

    @Override
    public PedidoWhatsApp atender(Long id, String respuesta) {
        PedidoWhatsApp pedido = pedidoRepository.findById(id).orElse(null);
        if (pedido == null) return null;
        pedido.setRespuesta(respuesta);
        pedido.setEstado("ATENDIDO");
        pedido.setFechaAtencion(LocalDateTime.now());
        pedidoRepository.save(pedido);
        // Enviar la respuesta al cliente por WhatsApp
        enviarMensaje(pedido.getNumeroRemitente(), respuesta);
        return pedido;
    }

    @Override
    public PedidoWhatsApp marcarEnProceso(Long id) {
        PedidoWhatsApp pedido = pedidoRepository.findById(id).orElse(null);
        if (pedido == null) return null;
        pedido.setEstado("EN_PROCESO");
        return pedidoRepository.save(pedido);
    }

    @Override
    public PedidoWhatsApp vincularVenta(Long pedidoId, Long ventaId) {
        PedidoWhatsApp pedido = pedidoRepository.findById(pedidoId).orElse(null);
        if (pedido == null) return null;
        pedido.setVentaId(ventaId);
        return pedidoRepository.save(pedido);
    }
}

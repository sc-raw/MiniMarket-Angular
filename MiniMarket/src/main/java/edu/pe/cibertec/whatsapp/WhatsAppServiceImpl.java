package edu.pe.cibertec.whatsapp;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import edu.pe.cibertec.dto.CrearVentaRequest;
import edu.pe.cibertec.dto.DetalleVentaRequest;
import edu.pe.cibertec.entity.PedidoWhatsApp;
import edu.pe.cibertec.entity.Venta;
import edu.pe.cibertec.repository.PedidoWhatsAppRepository;
import edu.pe.cibertec.service.VentaService;

@Service
public class WhatsAppServiceImpl implements WhatsAppService {

    private final PedidoWhatsAppRepository pedidoRepository;
    private final VentaService ventaService;
    private final ObjectMapper objectMapper;

    @Value("${whatsapp.api-url:https://graph.facebook.com/v18.0}")
    private String apiUrl;

    @Value("${whatsapp.token:TOKEN_PLACEHOLDER}")
    private String token;

    @Value("${whatsapp.phone-number-id:PHONE_NUMBER_ID_PLACEHOLDER}")
    private String phoneNumberId;

    @Value("${whatsapp.verify-token:VERIFY_TOKEN_PLACEHOLDER}")
    private String verifyToken;

    public WhatsAppServiceImpl(PedidoWhatsAppRepository pedidoRepository,
                               VentaService ventaService,
                               ObjectMapper objectMapper) {
        this.pedidoRepository = pedidoRepository;
        this.ventaService = ventaService;
        this.objectMapper = objectMapper;
    }

    private static final String MENU_BIENVENIDA =
            "¡Hola! 👋 Bienvenido a MiniMarket.\n\n" +
            "¿Qué deseas hacer?\n\n" +
            "1️⃣ Hacer un pedido\n" +
            "2️⃣ Tengo una duda\n\n" +
            "Responde con el número 1 o 2.";

    /**
     * Procesa un mensaje entrante del webhook de Meta.
     */
    @Override
    @Transactional
    public void procesarMensajeEntrante(String numeroRemitente, String nombreRemitente, String mensaje) {
        System.out.println(">>> WhatsApp entrante de " + numeroRemitente + ": " + mensaje);

        List<PedidoWhatsApp> historial = pedidoRepository
                .findByNumeroRemitenteOrderByFechaRegistroDesc(numeroRemitente);

        // PRIMER MENSAJE o último ATENDIDO → crear NUEVO y responder menú
        if (historial.isEmpty() || "ATENDIDO".equals(historial.get(0).getEstado())) {
            PedidoWhatsApp pedido = new PedidoWhatsApp();
            pedido.setNumeroRemitente(numeroRemitente);
            pedido.setNombreRemitente(nombreRemitente);
            pedido.setMensaje(mensaje);
            pedido.setTipo(null);
            pedido.setEstado("NUEVO");
            pedidoRepository.save(pedido);
            enviarMensaje(numeroRemitente, MENU_BIENVENIDA);
            return;
        }

        PedidoWhatsApp ultimo = historial.get(0);

        // Si está NUEVO, interpretar la respuesta del menú
        if ("NUEVO".equals(ultimo.getEstado())) {
            String respuesta = mensaje.trim();
            if ("1".equals(respuesta)) {
                ultimo.setTipo("PEDIDO");
                ultimo.setEstado("PENDIENTE");
                ultimo.setMensaje(ultimo.getMensaje() + " | " + mensaje);
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
                ultimo.setMensaje(ultimo.getMensaje() + " | " + mensaje);
                pedidoRepository.save(ultimo);
                enviarMensaje(numeroRemitente,
                        "Entendido. 📝 Cuéntanos tu duda y un ejecutivo te responderá pronto.");
            } else {
                enviarMensaje(numeroRemitente,
                        "Por favor responde con 1 (pedido) o 2 (duda). 🙏");
            }
            return;
        }

        // Si está PENDIENTE → el cliente envía más detalles
        if ("PENDIENTE".equals(ultimo.getEstado())) {
            ultimo.setMensaje(ultimo.getMensaje() + " | " + mensaje);
            pedidoRepository.save(ultimo);
            enviarMensaje(numeroRemitente,
                    "✅ Mensaje recibido. Un ejecutivo de Atención al Cliente te responderá pronto. " +
                    "Gracias por tu paciencia. 🙌");
            return;
        }

        // 🔥 FIX BUG: si está EN_PROCESO (operador lo está revisando) y el cliente manda
        // otro mensaje → NO SE PIERDE, se acumula y se le avisa al cliente.
        if ("EN_PROCESO".equals(ultimo.getEstado())) {
            ultimo.setMensaje(ultimo.getMensaje() + " | " + mensaje);
            pedidoRepository.save(ultimo);
            enviarMensaje(numeroRemitente,
                    "✅ Mensaje recibido. Un ejecutivo ya está revisando tu caso, " +
                    "te responderá en breve. 🙏");
        }
    }

    /**
     * Envía un mensaje de texto a un número de WhatsApp usando la API de Meta.
     * 🔥 FIX: usa ObjectMapper para construir el JSON de forma segura (no más strings concatenados).
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

            // 🔥 Construir body con Map y serializar con ObjectMapper (escapa comillas, emojis, etc.)
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("body", mensaje);

            Map<String, Object> body = new HashMap<>();
            body.put("messaging_product", "whatsapp");
            body.put("to", numeroDestino);
            body.put("type", "text");
            body.put("text", textPart);

            String jsonBody = objectMapper.writeValueAsString(body);

            HttpEntity<String> request = new HttpEntity<>(jsonBody, headers);
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
        // Acumular la respuesta al mensaje para que se vea en el chat
        pedido.setRespuesta(respuesta);
        pedido.setEstado("ATENDIDO");
        pedido.setFechaAtencion(LocalDateTime.now());
        pedidoRepository.save(pedido);
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

    // ===== Nuevos métodos =====

    @Override
    @Transactional
    public PedidoWhatsApp enviarMensajeOperador(Long pedidoId, String texto) {
        PedidoWhatsApp pedido = pedidoRepository.findById(pedidoId).orElse(null);
        if (pedido == null) return null;
        // Acumular la respuesta del operador al "mensaje" para que aparezca en el chat
        // La separación con " | [OPERADOR]: " permite distinguir en el frontend
        String actual = pedido.getMensaje() == null ? "" : pedido.getMensaje();
        // Limitar a 500 chars (columna)
        String nuevo = actual + " | [OPERADOR]: " + texto;
        if (nuevo.length() > 480) {
            nuevo = nuevo.substring(nuevo.length() - 480);
        }
        pedido.setMensaje(nuevo);
        pedidoRepository.save(pedido);
        // Enviar el mensaje al cliente por WhatsApp
        enviarMensaje(pedido.getNumeroRemitente(), texto);
        return pedido;
    }

    @Override
    public long contarPorEstado(String estado) {
        return pedidoRepository.countByEstado(estado);
    }

    /**
     * Convierte un pedido WhatsApp en una Venta PENDIENTE.
     * El operador ya validó cliente + productos desde el frontend.
     * El cajero deberá cobrarla después desde /ventas.
     */
    @Override
    @Transactional
    public Venta convertirAVenta(Long pedidoId, Long clienteId, Long cajeroId,
                                  List<DetalleVentaRequest> productos) {
        // 1. Crear la venta PENDIENTE
        CrearVentaRequest request = new CrearVentaRequest();
        request.setClienteId(clienteId);
        request.setCajeroId(cajeroId);
        request.setProductos(productos);
        Venta venta = ventaService.crearVenta(request);

        // 2. Vincular el pedido con la venta creada
        vincularVenta(pedidoId, venta.getId());

        // 3. Marcar el pedido como ATENDIDO con mensaje informativo
        String respuesta = "✅ Tu pedido fue registrado. Boleta #" + venta.getId() +
                ". Total: S/." + venta.getTotal() +
                ". Acércate a caja para confirmar tu pago. 🙌";
        atender(pedidoId, respuesta);

        return venta;
    }
}

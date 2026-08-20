package edu.pe.cibertec.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.pe.cibertec.dto.DetalleVentaRequest;
import edu.pe.cibertec.entity.PedidoWhatsApp;
import edu.pe.cibertec.entity.Venta;
import edu.pe.cibertec.whatsapp.WhatsAppService;


@RestController
@RequestMapping("/api/whatsapp")
public class WhatsAppRestController {

    @Autowired
    private WhatsAppService whatsappService;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Value("${whatsapp.verify-token:VERIFY_TOKEN_PLACEHOLDER}")
    private String verifyToken;


    @GetMapping(value = "/webhook", produces = "text/plain")
    public ResponseEntity<String> verificarWebhook(
            @RequestParam(name = "hub.mode", required = false) String mode,
            @RequestParam(name = "hub.verify_token", required = false) String token,
            @RequestParam(name = "hub.challenge", required = false) String challenge) {

        System.out.println(">>> Intento de verificación Webhook recibido:");
        System.out.println("    hub.mode: " + mode);
        System.out.println("    hub.verify_token: " + token);

        String tokenEsperado = (verifyToken != null && !verifyToken.contains("PLACEHOLDER"))
                ? verifyToken
                : "minimarket_verify_token_2026";

        if ("subscribe".equals(mode) && tokenEsperado.equals(token)) {
            System.out.println(">>> Webhook verificado correctamente.");
            return ResponseEntity.ok(challenge);
        }

        System.err.println(">>> Fallo en la verificación del Webhook: Token no coincide.");
        return ResponseEntity.status(403).body("Verificación fallida");
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> recibirMensaje(@RequestBody String payload) {
        System.out.println(">>> PETICIÓN RECIBIDA EN WEBHOOK (RAW): " + payload);
        System.out.flush();

        try {
            com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(payload);
            com.fasterxml.jackson.databind.JsonNode entry = root.path("entry");

            if (entry.isArray() && !entry.isEmpty()) {
                com.fasterxml.jackson.databind.JsonNode changes = entry.get(0).path("changes");
                if (changes.isArray() && !changes.isEmpty()) {
                    com.fasterxml.jackson.databind.JsonNode value = changes.get(0).path("value");
                    com.fasterxml.jackson.databind.JsonNode messages = value.path("messages");

                    if (messages.isArray() && !messages.isEmpty()) {
                        com.fasterxml.jackson.databind.JsonNode messageObj = messages.get(0);
                        String numeroRemitente = messageObj.path("from").asText(null);

                        String mensaje = null;
                        if (messageObj.has("text")) {
                            mensaje = messageObj.path("text").path("body").asText(null);
                        } else if (messageObj.has("button")) {
                            mensaje = messageObj.path("button").path("text").asText(null);
                        } else if (messageObj.has("interactive")) {
                            mensaje = messageObj.path("interactive").path("button_reply").path("title").asText(null);
                        }

                        String nombreRemitente = "Cliente WhatsApp";
                        com.fasterxml.jackson.databind.JsonNode contacts = value.path("contacts");
                        if (contacts.isArray() && !contacts.isEmpty()) {
                            nombreRemitente = contacts.get(0).path("profile").path("name").asText("Cliente WhatsApp");
                        }

                        if (numeroRemitente != null && mensaje != null) {
                            System.out.println(">>> PROCESANDO MENSAJE DE: " + numeroRemitente
                                    + " (" + nombreRemitente + "): " + mensaje);
                            whatsappService.procesarMensajeEntrante(numeroRemitente, nombreRemitente, mensaje);
                        } else {
                            System.out.println(">>> MENSAJE IGNORADO: numeroRemitente="
                                    + numeroRemitente + ", mensaje=" + mensaje);
                        }
                    } else if (value.has("statuses")) {
                        System.out.println(">>> Evento de estado de mensaje (sent/delivered/read). Ignorando.");
                    } else {
                        System.out.println(">>> Evento de Webhook sin array de mensajes válido.");
                    }
                }
            }
            return ResponseEntity.ok("EVENT_RECEIVED");
        } catch (Exception e) {
            System.err.println(">>> Error procesando webhook: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok("EVENT_RECEIVED");
        }
    }


    @GetMapping("/pedidos")
    public List<PedidoWhatsApp> listarTodos() {
        return whatsappService.listarTodos();
    }

    @GetMapping("/pedidos/pendientes")
    public List<PedidoWhatsApp> listarPendientes() {
        return whatsappService.listarPendientes();
    }

    @GetMapping("/pedidos/tipo/{tipo}")
    public List<PedidoWhatsApp> listarPorTipo(@PathVariable String tipo) {
        return whatsappService.listarPorTipo(tipo);
    }

    @GetMapping("/pedidos/count")
    public ResponseEntity<Map<String, Long>> contarPorEstado(
            @RequestParam(name = "estado", defaultValue = "PENDIENTE") String estado) {
        long count = whatsappService.contarPorEstado(estado);
        Map<String, Long> result = new HashMap<>();
        result.put("count", count);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/pedidos/{id}/en-proceso")
    public ResponseEntity<?> marcarEnProceso(@PathVariable Long id) {
        PedidoWhatsApp p = whatsappService.marcarEnProceso(id);
        return p != null ? ResponseEntity.ok(p) : ResponseEntity.notFound().build();
    }

    @PutMapping("/pedidos/{id}/atender")
    public ResponseEntity<?> atender(@PathVariable Long id, @RequestParam String respuesta) {
        PedidoWhatsApp p = whatsappService.atender(id, respuesta);
        return p != null ? ResponseEntity.ok(p) : ResponseEntity.notFound().build();
    }

    @PostMapping("/pedidos/{id}/enviar")
    public ResponseEntity<?> enviarMensaje(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String texto = body.get("texto");
        if (texto == null || texto.isBlank()) {
            Map<String, String> err = new HashMap<>();
            err.put("mensaje", "El texto no puede estar vacío");
            return ResponseEntity.badRequest().body(err);
        }
        PedidoWhatsApp p = whatsappService.enviarMensajeOperador(id, texto);
        return p != null ? ResponseEntity.ok(p) : ResponseEntity.notFound().build();
    }

    @PostMapping("/pedidos/{id}/convertir-venta")
    public ResponseEntity<?> convertirAVenta(@PathVariable Long id, @RequestBody ConvertirVentaRequest req) {
        try {
            Venta venta = whatsappService.convertirAVenta(id, req.getClienteId(),
                    req.getCajeroId(), req.getProductos());
            Map<String, Object> result = new HashMap<>();
            result.put("mensaje", "Venta creada");
            result.put("ventaId", venta.getId());
            result.put("total", venta.getTotal());
            result.put("estado", venta.getEstado());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, String> err = new HashMap<>();
            err.put("mensaje", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    public static class ConvertirVentaRequest {
        private Long clienteId;
        private Long cajeroId;
        private List<DetalleVentaRequest> productos;

        public Long getClienteId() { return clienteId; }
        public void setClienteId(Long clienteId) { this.clienteId = clienteId; }
        public Long getCajeroId() { return cajeroId; }
        public void setCajeroId(Long cajeroId) { this.cajeroId = cajeroId; }
        public List<DetalleVentaRequest> getProductos() { return productos; }
        public void setProductos(List<DetalleVentaRequest> productos) { this.productos = productos; }
    }
}

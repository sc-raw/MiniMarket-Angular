package edu.pe.cibertec.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Representa un mensaje entrante de WhatsApp desde un cliente.
 *
 * Flujo del bot:
 *   1. Cliente escribe cualquier cosa → se crea con estado "NUEVO" y tipo null
 *   2. Bot responde: "¿Quieres hacer un pedido (1) o tienes una duda (2)?"
 *   3. Cliente responde 1 → tipo="PEDIDO", estado="PENDIENTE", bot pide productos
 *   4. Cliente responde 2 → tipo="CONSULTA", estado="PENDIENTE"
 *   5. Atención al cliente revisa y responde → estado="ATENDIDO"
 */
@Entity
@Table(name = "pedido_whatsapp")
@Getter
@Setter
@NoArgsConstructor
public class PedidoWhatsApp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Número de teléfono del cliente (formato: 51999888777)
    @Column(length = 20, nullable = false)
    private String numeroRemitente;

    // Nombre del cliente si está disponible en el perfil de WhatsApp
    @Column(length = 100)
    private String nombreRemitente;

    // Tipo: "PEDIDO" o "CONSULTA" (null al inicio mientras el bot pregunta)
    @Column(length = 20)
    private String tipo;

    // Mensaje que envió el cliente
    @Column(length = 500, nullable = false)
    private String mensaje;

    // Estado: NUEVO, PENDIENTE, EN_PROCESO, ATENDIDO
    @Column(length = 20, nullable = false)
    private String estado = "NUEVO";

    // Respuesta que envió atención al cliente
    @Column(length = 500)
    private String respuesta;

    @Column(nullable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    @Column
    private LocalDateTime fechaAtencion;

    // ID de la venta creada a partir de este pedido (opcional)
    @Column
    private Long ventaId;
}

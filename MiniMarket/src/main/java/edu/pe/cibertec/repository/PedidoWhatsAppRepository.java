package edu.pe.cibertec.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.pe.cibertec.entity.PedidoWhatsApp;

public interface PedidoWhatsAppRepository extends JpaRepository<PedidoWhatsApp, Long> {

    // Buscar todos los pedidos de un número específico
    List<PedidoWhatsApp> findByNumeroRemitenteOrderByFechaRegistroDesc(String numeroRemitente);

    // Buscar por estado (NUEVO, PENDIENTE, EN_PROCESO, ATENDIDO)
    List<PedidoWhatsApp> findByEstadoOrderByFechaRegistroDesc(String estado);

    // Buscar por tipo (PEDIDO, CONSULTA)
    List<PedidoWhatsApp> findByTipoAndEstadoOrderByFechaRegistroDesc(String tipo, String estado);

    // Contar pedidos pendientes
    long countByEstado(String estado);
}

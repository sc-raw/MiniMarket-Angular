package edu.pe.cibertec.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import edu.pe.cibertec.entity.Venta;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    
    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE v.estado = 'FINALIZADA'")
    BigDecimal totalVentasFinalizadas();

    @Query("SELECT v.estado, COUNT(v) FROM Venta v GROUP BY v.estado")
    List<Object[]> contarPorEstado();

    long countByEstado(String estado);

    @Query("SELECT v FROM Venta v WHERE v.fechaRegistro BETWEEN :inicio AND :fin ORDER BY v.fechaRegistro DESC")
    List<Venta> ventasEntreFechas(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    @Query("SELECT v.cliente.nombres, v.cliente.apellidos, COUNT(v) FROM Venta v WHERE v.estado = 'FINALIZADA' GROUP BY v.cliente.id ORDER BY COUNT(v) DESC")
    List<Object[]> topClientes();

    List<Venta> findByClienteIdOrderByFechaRegistroDesc(Long clienteId);
    
    List<Venta> findByClienteId(Long clienteId);
    
    
}

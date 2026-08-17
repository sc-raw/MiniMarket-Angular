package edu.pe.cibertec.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import edu.pe.cibertec.entity.Venta;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    // Total de ventas finalizadas
    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE v.estado = 'FINALIZADA'")
    BigDecimal totalVentasFinalizadas();

    // Conteo de ventas por estado
    @Query("SELECT v.estado, COUNT(v) FROM Venta v GROUP BY v.estado")
    List<Object[]> contarPorEstado();

    // Ventas entre dos fechas
    @Query("SELECT v FROM Venta v WHERE v.fechaRegistro BETWEEN :inicio AND :fin ORDER BY v.fechaRegistro DESC")
    List<Venta> ventasEntreFechas(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    // Conteo de ventas por cliente (top 5)
    @Query("SELECT v.cliente.nombres, v.cliente.apellidos, COUNT(v) FROM Venta v WHERE v.estado = 'FINALIZADA' GROUP BY v.cliente.id ORDER BY COUNT(v) DESC")
    List<Object[]> topClientes();
}

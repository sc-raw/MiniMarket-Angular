package edu.pe.cibertec.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.pe.cibertec.entity.DetalleVenta;
import edu.pe.cibertec.entity.Venta;

public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {

    List<DetalleVenta> findByVenta(Venta venta);
}

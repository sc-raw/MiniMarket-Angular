package edu.pe.cibertec.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import edu.pe.cibertec.entity.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    Producto findByCodigo(String codigo);

    List<Producto> findByCategoria_IdCategoria(Integer idCategoria);

    List<Producto> findByNombreContaining(String texto);

    // Productos con stock bajo (menos de un umbral)
    List<Producto> findByStockLessThanEqual(Integer stock);

    // Top productos más vendidos (por cantidad)
    @Query("SELECT d.producto.nombre, SUM(d.cantidad) FROM DetalleVenta d GROUP BY d.producto.id ORDER BY SUM(d.cantidad) DESC")
    List<Object[]> topProductosVendidos();

    // Productos ya vencidos (fechaVencimiento < hoy)
    @Query("SELECT p FROM Producto p WHERE p.fechaVencimiento IS NOT NULL AND p.fechaVencimiento < :hoy ORDER BY p.fechaVencimiento ASC")
    List<Producto> findProductosVencidos(LocalDate hoy);

    // Productos próximos a vencer (entre hoy y hoy + N días)
    @Query("SELECT p FROM Producto p WHERE p.fechaVencimiento IS NOT NULL AND p.fechaVencimiento BETWEEN :hoy AND :limite ORDER BY p.fechaVencimiento ASC")
    List<Producto> findProductosPorVencer(LocalDate hoy, LocalDate limite);
}

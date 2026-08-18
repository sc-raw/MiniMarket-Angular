package edu.pe.cibertec.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import edu.pe.cibertec.entity.Cajero;

public interface CajeroRepository extends JpaRepository<Cajero, Long> {
}
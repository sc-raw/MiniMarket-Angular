package edu.pe.cibertec.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import edu.pe.cibertec.entity.Cajero;
import edu.pe.cibertec.entity.Empleado;

public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    Empleado findByDni(String dni);

    List<Empleado> findByApellidos(String apellidos);

    List<Empleado> findByApellidosContaining(String texto);

    @Query("SELECT c FROM Cajero c WHERE c.estado = true")
    List<Cajero> findCajerosActivos();
    
    @Query("SELECT c FROM Cajero c")
    List<Cajero> findAllCajeros();
}

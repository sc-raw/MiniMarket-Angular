package edu.pe.cibertec.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cajero")
@Getter
@Setter
@NoArgsConstructor
public class Cajero extends Empleado {

    @Column(length = 20, nullable = false)
    private String turno; // MAÑANA, TARDE, NOCHE
}

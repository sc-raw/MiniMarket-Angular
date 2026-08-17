package edu.pe.cibertec.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reponedor")
@Getter
@Setter
@NoArgsConstructor
public class Reponedor extends Empleado {

    @Column(length = 50, nullable = false)
    private String area; // ALMACEN, FRUTAS, LACTEOS, ABARROTES
}

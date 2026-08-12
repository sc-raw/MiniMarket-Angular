package edu.pe.cibertec.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "persona")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 8, nullable = false, unique = true)
    private String dni;

    @Column(length = 60, nullable = false)
    private String nombres;

    @Column(length = 60, nullable = false)
    private String apellidos;

    @Column(length = 100)
    private String direccion;

    @Column(length = 9)
    private String telefono;

    @Column(length = 80)
    private String correo;

    @Column(nullable = false)
    private Boolean estado = true;
}

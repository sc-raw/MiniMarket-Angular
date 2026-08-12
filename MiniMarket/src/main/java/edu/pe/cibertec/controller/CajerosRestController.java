package edu.pe.cibertec.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.pe.cibertec.entity.Cajero;
import edu.pe.cibertec.service.EmpleadoService;

@RestController
@RequestMapping("/api/cajeros")
public class CajerosRestController {

    @Autowired
    private EmpleadoService empleadoService;

    @GetMapping
    public List<Cajero> listar() {
        return empleadoService.listarCajerosActivos();
    }
}

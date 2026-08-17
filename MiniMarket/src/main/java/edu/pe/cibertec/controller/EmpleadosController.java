package edu.pe.cibertec.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import edu.pe.cibertec.entity.Cajero;
import edu.pe.cibertec.entity.Empleado;
import edu.pe.cibertec.entity.Reponedor;
import edu.pe.cibertec.service.EmpleadoService;

@Controller
@RequestMapping("/empleados")
public class EmpleadosController {

    @Autowired
    private EmpleadoService empleadoService;

    @GetMapping
    public String listar(@RequestParam(required = false) String texto, Model model) {
        if (texto == null || texto.isBlank()) {
            model.addAttribute("empleados", empleadoService.listar());
        } else {
            model.addAttribute("empleados", empleadoService.buscarPorApellidoConteniendo(texto));
        }
        model.addAttribute("texto", texto);
        return "empleados/lista";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("empleado", new Empleado());
        return "empleados/formulario";
    }

    private void copiarDatos(Empleado origen, Empleado destino) {
        destino.setId(origen.getId());
        destino.setDni(origen.getDni());
        destino.setNombres(origen.getNombres());
        destino.setApellidos(origen.getApellidos());
        destino.setDireccion(origen.getDireccion());
        destino.setTelefono(origen.getTelefono());
        destino.setCorreo(origen.getCorreo());
        destino.setEstado(origen.getEstado());
        destino.setFechaIngreso(origen.getFechaIngreso());
        destino.setSalario(origen.getSalario());
    }

    @PostMapping("/guardar")
    public String guardar(@ModelAttribute Empleado empleado, @RequestParam String tipo,
                          @RequestParam(required = false) String turno,
                          @RequestParam(required = false) String area,
                          RedirectAttributes flash) {
        Empleado entidad;
        if (empleado.getId() == null) {
            if ("CAJERO".equals(tipo)) {
                entidad = new Cajero();
                copiarDatos(empleado, entidad);
                ((Cajero) entidad).setTurno(turno);
            } else {
                entidad = new Reponedor();
                copiarDatos(empleado, entidad);
                ((Reponedor) entidad).setArea(area);
            }
        } else {
            entidad = empleadoService.buscarPorId(empleado.getId());
            if (entidad == null) {
                flash.addFlashAttribute("error", "Empleado no encontrado.");
                return "redirect:/empleados";
            }
            copiarDatos(empleado, entidad);
            if (entidad instanceof Cajero cajero) cajero.setTurno(turno);
            if (entidad instanceof Reponedor reponedor) reponedor.setArea(area);
        }
        empleadoService.guardar(entidad);
        flash.addFlashAttribute("mensaje", empleado.getId() == null
                ? "Empleado registrado correctamente."
                : "Empleado actualizado correctamente.");
        return "redirect:/empleados";
    }

    @GetMapping("/editar/{id}")
    public String editar(@PathVariable Long id, Model model) {
        Empleado empleado = empleadoService.buscarPorId(id);
        model.addAttribute("empleado", empleado);
        if (empleado instanceof Cajero cajero) {
            model.addAttribute("tipo", "CAJERO");
            model.addAttribute("turno", cajero.getTurno());
        } else if (empleado instanceof Reponedor reponedor) {
            model.addAttribute("tipo", "REPONEDOR");
            model.addAttribute("area", reponedor.getArea());
        }
        return "empleados/formulario";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Long id, RedirectAttributes flash) {
        empleadoService.eliminar(id);
        flash.addFlashAttribute("mensaje", "Empleado eliminado correctamente.");
        return "redirect:/empleados";
    }
}

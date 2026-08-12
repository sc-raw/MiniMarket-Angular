package edu.pe.cibertec.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import edu.pe.cibertec.entity.Cliente;
import edu.pe.cibertec.service.ClienteService;

@Controller
@RequestMapping("/clientes")
public class ClientesController {

    @Autowired
    private ClienteService clienteService;

    @GetMapping
    public String listar(@RequestParam(required = false) String texto, Model model) {
        if (texto == null || texto.isBlank()) {
            model.addAttribute("clientes", clienteService.listar());
        } else {
            model.addAttribute("clientes", clienteService.buscarPorNombresIniciando(texto));
        }
        model.addAttribute("texto", texto);
        return "clientes/lista";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("cliente", new Cliente());
        return "clientes/formulario";
    }

    @PostMapping("/guardar")
    public String guardar(@ModelAttribute Cliente cliente, RedirectAttributes flash) {
        clienteService.guardar(cliente);
        flash.addFlashAttribute("mensaje", "Cliente registrado correctamente.");
        return "redirect:/clientes";
    }

    @GetMapping("/editar/{id}")
    public String editar(@PathVariable Long id, Model model) {
        model.addAttribute("cliente", clienteService.buscarPorId(id));
        return "clientes/formulario";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Long id, RedirectAttributes flash) {
        clienteService.eliminar(id);
        flash.addFlashAttribute("mensaje", "Cliente eliminado correctamente.");
        return "redirect:/clientes";
    }
}

package edu.pe.cibertec.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import edu.pe.cibertec.entity.Categoria;
import edu.pe.cibertec.service.CategoriaService;

@Controller
@RequestMapping("/categorias")
public class CategoriasController {

    @Autowired
    private CategoriaService service;

    @GetMapping
    public String listar(@RequestParam(required = false) String texto, Model model) {
        if (texto != null && !texto.isBlank()) {
            model.addAttribute("categorias", service.buscarPorNombreConteniendo(texto));
        } else {
            model.addAttribute("categorias", service.listar());
        }
        model.addAttribute("texto", texto);
        return "categorias/lista";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("categoria", new Categoria());
        return "categorias/formulario";
    }

    @PostMapping("/guardar")
    public String guardar(@ModelAttribute Categoria categoria, RedirectAttributes flash) {
        service.guardar(categoria);
        flash.addFlashAttribute("mensaje", "Categoría registrada correctamente.");
        return "redirect:/categorias";
    }

    @GetMapping("/editar/{id}")
    public String editar(@PathVariable Integer id, Model model) {
        model.addAttribute("categoria", service.buscarPorId(id));
        return "categorias/formulario";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Integer id, RedirectAttributes flash) {
        service.eliminar(id);
        flash.addFlashAttribute("mensaje", "Categoría eliminada correctamente.");
        return "redirect:/categorias";
    }
}

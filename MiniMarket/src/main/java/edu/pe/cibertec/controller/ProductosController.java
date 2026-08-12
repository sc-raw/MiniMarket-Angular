package edu.pe.cibertec.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import edu.pe.cibertec.entity.Producto;
import edu.pe.cibertec.service.CategoriaService;
import edu.pe.cibertec.service.ProductoService;

@Controller
@RequestMapping("/productos")
public class ProductosController {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private CategoriaService categoriaService;

    @GetMapping
    public String listar(@RequestParam(required = false) String texto, Model model) {
        if (texto == null || texto.isBlank()) {
            model.addAttribute("productos", productoService.listar());
        } else {
            model.addAttribute("productos", productoService.buscarPorNombreConteniendo(texto));
        }
        model.addAttribute("texto", texto);
        return "productos/lista";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("producto", new Producto());
        model.addAttribute("categorias", categoriaService.listar());
        return "productos/formulario";
    }

    @PostMapping("/guardar")
    public String guardar(@ModelAttribute Producto producto, RedirectAttributes flash) {
        productoService.guardar(producto);
        flash.addFlashAttribute("mensaje", "Producto registrado correctamente.");
        return "redirect:/productos";
    }

    @GetMapping("/editar/{id}")
    public String editar(@PathVariable Integer id, Model model) {
        model.addAttribute("producto", productoService.buscarPorId(id));
        model.addAttribute("categorias", categoriaService.listar());
        return "productos/formulario";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Integer id, RedirectAttributes flash) {
        productoService.eliminar(id);
        flash.addFlashAttribute("mensaje", "Producto eliminado correctamente.");
        return "redirect:/productos";
    }
}

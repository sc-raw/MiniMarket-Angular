package edu.pe.cibertec.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import edu.pe.cibertec.dto.CrearVentaRequest;
import edu.pe.cibertec.entity.DetalleVenta;
import edu.pe.cibertec.entity.Venta;
import edu.pe.cibertec.repository.DetalleVentaRepository;
import edu.pe.cibertec.service.ClienteService;
import edu.pe.cibertec.service.EmpleadoService;
import edu.pe.cibertec.service.ProductoService;
import edu.pe.cibertec.service.VentaService;

@Controller
@RequestMapping("/ventas")
public class VentasController {

    @Autowired
    private VentaService ventaService;

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private EmpleadoService empleadoService;

    @Autowired
    private ProductoService productoService;

    @Autowired
    private DetalleVentaRepository detalleVentaRepository;

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("ventas", ventaService.listar());
        return "ventas/lista";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("clientes", clienteService.listar());
        model.addAttribute("cajeros", empleadoService.listarCajerosActivos());
        model.addAttribute("productos", productoService.listarActivos());
        return "ventas/formulario";
    }

    @PostMapping("/guardar")
    public String guardar(@ModelAttribute CrearVentaRequest request,
                          RedirectAttributes flash) {
        try {
            Venta venta = ventaService.crearVenta(request);
            flash.addFlashAttribute("mensaje",
                    "Venta #" + venta.getId() + " registrada correctamente.");
        } catch (Exception e) {
            flash.addFlashAttribute("error", "Error al registrar la venta: " + e.getMessage());
        }
        return "redirect:/ventas";
    }

    @GetMapping("/detalle/{id}")
    public String detalle(@PathVariable Long id, Model model) {
        Venta venta = ventaService.buscarPorId(id);
        if (venta == null) return "redirect:/ventas";
        List<DetalleVenta> detalles = detalleVentaRepository.findByVenta(venta);
        model.addAttribute("venta", venta);
        model.addAttribute("detalles", detalles);
        return "ventas/detalle";
    }

    @GetMapping("/estado/{id}/{estado}")
    public String cambiarEstado(@PathVariable Long id, @PathVariable String estado,
                                RedirectAttributes flash) {
        ventaService.actualizarEstado(id, estado.toUpperCase());
        flash.addFlashAttribute("mensaje", "Estado actualizado a: " + estado);
        return "redirect:/ventas";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Long id, RedirectAttributes flash) {
        ventaService.eliminar(id);
        flash.addFlashAttribute("mensaje", "Venta cancelada correctamente.");
        return "redirect:/ventas";
    }
}

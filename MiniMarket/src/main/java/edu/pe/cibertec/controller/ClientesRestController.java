package edu.pe.cibertec.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.pe.cibertec.entity.Cliente;
import edu.pe.cibertec.entity.Venta;
import edu.pe.cibertec.repository.VentaRepository;
import edu.pe.cibertec.service.ClienteService;

@RestController
@RequestMapping("/api/clientes")
public class ClientesRestController {

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private VentaRepository ventaRepository;

    @GetMapping
    public List<Cliente> listar() {
        return clienteService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscar(@PathVariable Long id) {
        Cliente c = clienteService.buscarPorId(id);
        return c != null ? ResponseEntity.ok(c) : ResponseEntity.notFound().build();
    }

    // 🔥 Devuelve las últimas 5 ventas del cliente (para mostrar su "cuenta")
    @GetMapping("/{id}/ultimas-ventas")
    public ResponseEntity<List<Venta>> ultimasVentas(@PathVariable Long id) {
        if (clienteService.buscarPorId(id) == null) {
            return ResponseEntity.notFound().build();
        }
        List<Venta> todas = ventaRepository.findByClienteIdOrderByFechaRegistroDesc(id);
        // limit to 5
        return ResponseEntity.ok(todas.subList(0, Math.min(5, todas.size())));
    }

    // 🔥 Todos los pedidos del cliente (para "Mis Pedidos")
    @GetMapping("/{id}/pedidos")
    public ResponseEntity<List<Venta>> pedidosCliente(@PathVariable Long id) {
        if (clienteService.buscarPorId(id) == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ventaRepository.findByClienteIdOrderByFechaRegistroDesc(id));
    }

    @PostMapping
    public ResponseEntity<Cliente> guardar(@RequestBody Cliente cliente) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.guardar(cliente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizar(@PathVariable Long id, @RequestBody Cliente cliente) {
        Cliente actualizado = clienteService.actualizar(id, cliente);
        return actualizado != null ? ResponseEntity.ok(actualizado) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        clienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

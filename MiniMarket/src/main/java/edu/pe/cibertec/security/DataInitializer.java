package edu.pe.cibertec.security;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import edu.pe.cibertec.entity.Categoria;
import edu.pe.cibertec.entity.Producto;
import edu.pe.cibertec.entity.Usuario;
import edu.pe.cibertec.repository.CategoriaRepository;
import edu.pe.cibertec.repository.ProductoRepository;
import edu.pe.cibertec.repository.UsuarioRepository;

/**
 * Inicializador de datos.
 *
 * Se ejecuta UNA sola vez al arrancar la aplicación, solo si no hay usuarios.
 * Crea:
 *   - 3 usuarios (admin, cajero, reponedor)
 *   - 5 categorías
 *   - 12 productos (algunos con fecha de vencimiento: vencidos y próximos a vencer)
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder,
                           CategoriaRepository categoriaRepository,
                           ProductoRepository productoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() > 0) {
            return;
        }

        crearUsuarios();
        crearCategoriasYProductos();

        System.out.println(">>> Datos de ejemplo creados correctamente.");
    }

    private void crearUsuarios() {
        crearUsuario("admin", "admin123", "ADMIN");
        crearUsuario("cajero", "cajero123", "CAJERO");
        crearUsuario("reponedor", "reponedor123", "REPONEDOR");
        crearUsuario("atencion1", "atencion123", "ATENCION_CLIENTE");
        crearUsuario("atencion2", "atencion456", "ATENCION_CLIENTE");
        System.out.println(">>>     admin / admin123           (ADMIN)");
        System.out.println(">>>     cajero / cajero123          (CAJERO)");
        System.out.println(">>>     reponedor / reponedor123    (REPONEDOR)");
        System.out.println(">>>     atencion1 / atencion123    (ATENCION_CLIENTE)");
        System.out.println(">>>     atencion2 / atencion456    (ATENCION_CLIENTE)");
    }

    private void crearUsuario(String username, String password, String rol) {
        Usuario u = new Usuario();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(password));
        u.setRol(rol);
        u.setEstado(true);
        usuarioRepository.save(u);
    }

    private void crearCategoriasYProductos() {
        LocalDate hoy = LocalDate.now();

        // Categorías
        Categoria lacteos = new Categoria(); lacteos.setNombre("Lácteos"); categoriaRepository.save(lacteos);
        Categoria bebidas = new Categoria(); bebidas.setNombre("Bebidas"); categoriaRepository.save(bebidas);
        Categoria abarrotes = new Categoria(); abarrotes.setNombre("Abarrotes"); categoriaRepository.save(abarrotes);
        Categoria limpieza = new Categoria(); limpieza.setNombre("Limpieza"); categoriaRepository.save(limpieza);
        Categoria snacks = new Categoria(); snacks.setNombre("Snacks"); categoriaRepository.save(snacks);

        // Productos con fechas de vencimiento variadas:
        //   null      = no perecedero (no aparece en reportes de vencimiento)
        //   pasada    = VENCIDO (rojo en reportes)
        //   <=7 días  = PRÓXIMO A VENCER (amarillo en reportes)
        //   >7 días   = OK (no aparece en reportes)

        crearProducto("P001", "Leche Gloria 1L", "Leche entera pasteurizada",
                new BigDecimal("4.50"), 50, lacteos, hoy.plusDays(3));    // próximo a vencer
        crearProducto("P002", "Queso Andino 500g", "Queso fresco",
                new BigDecimal("18.00"), 20, lacteos, hoy.plusDays(20));  // OK
        crearProducto("P003", "Yogurt Laive 1L", "Yogurt de fresa",
                new BigDecimal("8.50"), 30, lacteos, hoy.minusDays(2));  // VENCIDO
        crearProducto("P004", "Coca Cola 1.5L", "Gaseosa",
                new BigDecimal("7.00"), 40, bebidas, null);               // no perecedero
        crearProducto("P005", "Agua Ciel 1L", "Agua sin gas",
                new BigDecimal("2.50"), 60, bebidas, null);
        crearProducto("P006", "Jugo Don Vitor 1L", "Jugo de naranja",
                new BigDecimal("9.00"), 25, bebidas, hoy.plusDays(5));   // próximo a vencer
        crearProducto("P007", "Arroz Costeño 5kg", "Arroz blanco",
                new BigDecimal("25.00"), 35, abarrotes, null);
        crearProducto("P008", "Azúcar Rubia 1kg", "Azúcar integral",
                new BigDecimal("5.50"), 45, abarrotes, null);
        crearProducto("P009", "Aceite Primor 1L", "Aceite vegetal",
                new BigDecimal("12.00"), 3, abarrotes, hoy.minusDays(5)); // VENCIDO + stock bajo
        crearProducto("P010", "Detergente Bolívar 1kg", "Ropa sucia",
                new BigDecimal("11.50"), 28, limpieza, null);
        crearProducto("P011", "Papel Higiénico Elite 4x", "Doble hoja",
                new BigDecimal("8.00"), 4, limpieza, null);               // stock bajo
        crearProducto("P012", "Papas Fritas Lay's 150g", "Clásicas",
                new BigDecimal("6.50"), 50, snacks, hoy.plusDays(45));   // OK
    }

    private void crearProducto(String codigo, String nombre, String descripcion,
                               BigDecimal precio, Integer stock, Categoria categoria,
                               LocalDate fechaVencimiento) {
        Producto p = new Producto();
        p.setCodigo(codigo);
        p.setNombre(nombre);
        p.setDescripcion(descripcion);
        p.setPrecio(precio);
        p.setStock(stock);
        p.setEstado(true);
        p.setFechaVencimiento(fechaVencimiento);
        p.setCategoria(categoria);
        productoRepository.save(p);
    }
}

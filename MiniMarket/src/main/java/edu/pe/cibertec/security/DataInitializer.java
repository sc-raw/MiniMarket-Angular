package edu.pe.cibertec.security;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import edu.pe.cibertec.entity.Cajero;
import edu.pe.cibertec.entity.Categoria;
import edu.pe.cibertec.entity.Producto;
import edu.pe.cibertec.entity.Reponedor;
import edu.pe.cibertec.entity.Usuario;
import edu.pe.cibertec.repository.CajeroRepository;
import edu.pe.cibertec.repository.CategoriaRepository;
import edu.pe.cibertec.repository.ProductoRepository;
import edu.pe.cibertec.repository.ReponedorRepository;
import edu.pe.cibertec.repository.UsuarioRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final CajeroRepository cajeroRepository;
    private final ReponedorRepository reponedorRepository;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder,
                           CategoriaRepository categoriaRepository,
                           ProductoRepository productoRepository,
                           CajeroRepository cajeroRepository,
                           ReponedorRepository reponedorRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
        this.cajeroRepository = cajeroRepository;
        this.reponedorRepository = reponedorRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        
        // 1. Si no hay usuarios, crea los usuarios y empleados base
        if (usuarioRepository.count() == 0) {
            crearUsuariosYEmpleados();
        }

        // 2. Si no hay categorías, crea las categorías y productos base
        if (categoriaRepository.count() == 0) {
            crearCategoriasYProductos();
        }

        System.out.println(">>> Verificación de base de datos completada.");
    }

    private void crearUsuariosYEmpleados() {
        crearUsuario("admin", "admin123", "ADMIN", null, null);

        Cajero c1 = new Cajero();
        c1.setDni("12345678");
        c1.setNombres("Juan Carlos");
        c1.setApellidos("Perez Garcia");
        c1.setTelefono("987654321");
        c1.setCorreo("juan.perez@gmail.com");
        c1.setDireccion("Av. Lima 123");
        c1.setEstado(true);
        c1.setFechaIngreso(LocalDate.now());
        c1.setSalario(new BigDecimal("1500.00"));
        c1.setTurno("MAÑANA");
        cajeroRepository.save(c1);
        crearUsuario("cajero", "cajero123", "CAJERO", c1, null);

        Cajero c2 = new Cajero();
        c2.setDni("87654321");
        c2.setNombres("Maria Fernanda");
        c2.setApellidos("Lopez Diaz");
        c2.setTelefono("987123456");
        c2.setCorreo("maria.lopez@gmail.com");
        c2.setDireccion("Jr. Cusco 456");
        c2.setEstado(true);
        c2.setFechaIngreso(LocalDate.now());
        c2.setSalario(new BigDecimal("1500.00"));
        c2.setTurno("TARDE");
        cajeroRepository.save(c2);
        crearUsuario("cajero2", "cajero456", "CAJERO", c2, null);

        Reponedor r1 = new Reponedor();
        r1.setDni("11223344");
        r1.setNombres("Pedro Luis");
        r1.setApellidos("Suarez Gomez");
        r1.setTelefono("965432198");
        r1.setCorreo("pedro.suarez@gmail.com");
        r1.setDireccion("Av. Brasil 789");
        r1.setEstado(true);
        r1.setFechaIngreso(LocalDate.now());
        r1.setSalario(new BigDecimal("1200.00"));
        r1.setArea("ALMACEN");
        reponedorRepository.save(r1);
        crearUsuario("reponedor", "reponedor123", "REPONEDOR", null, r1);

        crearUsuario("atencion1", "atencion123", "ATENCION_CLIENTE", null, null);
        crearUsuario("atencion2", "atencion456", "ATENCION_CLIENTE", null, null);

        System.out.println(">>>     admin / admin123           (ADMIN)");
        System.out.println(">>>     cajero / cajero123         (CAJERO - Juan Carlos Perez Garcia)");
        System.out.println(">>>     cajero2 / cajero456        (CAJERO - Maria Fernanda Lopez Diaz)");
        System.out.println(">>>     reponedor / reponedor123   (REPONEDOR - Pedro Luis Suarez Gomez)");
        System.out.println(">>>     atencion1 / atencion123    (ATENCION_CLIENTE)");
        System.out.println(">>>     atencion2 / atencion456    (ATENCION_CLIENTE)");
    }

    private void crearUsuario(String username, String password, String rol,
                              Cajero cajero, Reponedor reponedor) {
        Usuario u = new Usuario();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(password));
        u.setRol(rol);
        u.setEstado(true);
        u.setCajero(cajero);           // 🔥 vinculacion
        u.setReponedor(reponedor);     // 🔥 vinculacion
        usuarioRepository.save(u);
    }

    private void crearCategoriasYProductos() {
        LocalDate hoy = LocalDate.now();

        Categoria lacteos = new Categoria(); lacteos.setNombre("Lácteos"); categoriaRepository.save(lacteos);
        Categoria bebidas = new Categoria(); bebidas.setNombre("Bebidas"); categoriaRepository.save(bebidas);
        Categoria abarrotes = new Categoria(); abarrotes.setNombre("Abarrotes"); categoriaRepository.save(abarrotes);
        Categoria limpieza = new Categoria(); limpieza.setNombre("Limpieza"); categoriaRepository.save(limpieza);
        Categoria snacks = new Categoria(); snacks.setNombre("Snacks"); categoriaRepository.save(snacks);

        crearProducto("P001", "Leche Gloria 1L", "Leche entera pasteurizada",
                new BigDecimal("4.50"), 50, lacteos, hoy.plusDays(3));    
        crearProducto("P002", "Queso Andino 500g", "Queso fresco",
                new BigDecimal("18.00"), 20, lacteos, hoy.plusDays(20));  
        crearProducto("P003", "Yogurt Laive 1L", "Yogurt de fresa",
                new BigDecimal("8.50"), 30, lacteos, hoy.minusDays(2));  
        crearProducto("P004", "Coca Cola 1.5L", "Gaseosa",
                new BigDecimal("7.00"), 40, bebidas, hoy.plusDays(20));               
        crearProducto("P005", "Agua Ciel 1L", "Agua sin gas",
                new BigDecimal("2.50"), 4, bebidas, hoy.minusDays(5));
        crearProducto("P006", "Jugo Don Vitor 1L", "Jugo de naranja",
                new BigDecimal("9.00"), 25, bebidas, hoy.plusDays(5));   
        crearProducto("P007", "Arroz Costeño 5kg", "Arroz blanco",
                new BigDecimal("25.00"), 3, abarrotes, hoy.plusDays(50));
        crearProducto("P008", "Azúcar Rubia 1kg", "Azúcar integral",
                new BigDecimal("5.50"), 45, abarrotes, hoy.plusDays(80));
        crearProducto("P009", "Aceite Primor 1L", "Aceite vegetal",
                new BigDecimal("12.00"), 3, abarrotes, hoy.minusDays(5)); 
        crearProducto("P010", "Detergente Bolívar 1kg", "Ropa sucia",
                new BigDecimal("11.50"), 28, limpieza, hoy.plusDays(120));
        crearProducto("P011", "Papel Higiénico Elite 4x", "Doble hoja",
                new BigDecimal("8.00"), 4, limpieza, hoy.minusDays(2));               
        crearProducto("P012", "Papas Fritas Lay's 150g", "Clásicas",
                new BigDecimal("6.50"), 50, snacks, hoy.plusDays(45));   
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
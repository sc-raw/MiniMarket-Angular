package edu.pe.cibertec.exception;

import java.beans.PropertyEditorSupport;

import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.InitBinder;

import edu.pe.cibertec.entity.Categoria;
import edu.pe.cibertec.entity.Cliente;
import edu.pe.cibertec.service.CategoriaService;
import edu.pe.cibertec.service.ClienteService;

@ControllerAdvice
public class GlobalBinderConfig {

    private final ClienteService clienteService;
    private final CategoriaService categoriaService;

    public GlobalBinderConfig(ClienteService clienteService, CategoriaService categoriaService) {
        this.clienteService = clienteService;
        this.categoriaService = categoriaService;
    }

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.registerCustomEditor(Cliente.class, new PropertyEditorSupport() {
            @Override
            public void setAsText(String text) {
                if (text == null || text.isBlank()) {
                    setValue(null);
                    return;
                }
                setValue(clienteService.buscarPorId(Long.valueOf(text)));
            }
        });

        binder.registerCustomEditor(Categoria.class, new PropertyEditorSupport() {
            @Override
            public void setAsText(String text) {
                if (text == null || text.isBlank()) {
                    setValue(null);
                    return;
                }
                setValue(categoriaService.buscarPorId(Integer.valueOf(text)));
            }
        });
    }
}

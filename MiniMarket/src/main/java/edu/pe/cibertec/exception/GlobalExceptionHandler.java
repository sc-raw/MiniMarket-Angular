package edu.pe.cibertec.exception;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoHandlerFoundException.class)
    public String error404() {
        return "error/404";
    }

    @ExceptionHandler(AccessDeniedException.class)
    public String errorAccesoDenegado() {
        return "error/acceso-denegado";
    }

    @ExceptionHandler(Exception.class)
    public String error500(Exception ex, Model model) {
        ex.printStackTrace();
        model.addAttribute("error", ex.getMessage());
        return "error/500";
    }
}

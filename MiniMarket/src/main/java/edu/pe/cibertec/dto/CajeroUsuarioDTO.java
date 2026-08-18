package edu.pe.cibertec.dto;

import edu.pe.cibertec.entity.Cajero;
import lombok.Data;

@Data
public class CajeroUsuarioDTO {
    private Cajero cajero;
    private String username;
    private String password;
}
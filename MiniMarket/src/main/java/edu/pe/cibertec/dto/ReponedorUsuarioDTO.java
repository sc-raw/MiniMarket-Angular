package edu.pe.cibertec.dto;

import edu.pe.cibertec.entity.Reponedor;
import lombok.Data;

@Data
public class ReponedorUsuarioDTO {
    private Reponedor reponedor;
    private String username;
    private String password;
}
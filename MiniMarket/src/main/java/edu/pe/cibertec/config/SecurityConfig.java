package edu.pe.cibertec.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import edu.pe.cibertec.security.CustomUserDetailsService;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) ->
                response.sendRedirect("/acceso-denegado");
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authenticationProvider(authenticationProvider())
        .csrf(csrf -> csrf.disable()) 
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/login", "/css/**", "/js/**", "/img/**", "/webjars/**",
                             "/error", "/acceso-denegado").permitAll()

            .requestMatchers("/api/whatsapp/**").permitAll()
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/**").permitAll()

            .requestMatchers("/").authenticated()
            .requestMatchers("/clientes/**").hasAnyRole("ADMIN", "CAJERO", "ATENCION_CLIENTE")
            .requestMatchers("/productos/**").hasAnyRole("ADMIN", "CAJERO", "REPONEDOR", "ATENCION_CLIENTE")
            .requestMatchers("/categorias/**").hasRole("ADMIN")
            .requestMatchers("/empleados/**").hasRole("ADMIN")
            .requestMatchers("/usuarios/**").hasRole("ADMIN")
            .requestMatchers("/ventas/**").hasAnyRole("ADMIN", "CAJERO")
            .anyRequest().authenticated())
        .formLogin(login -> login
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/", true)
                .failureUrl("/login?error=true")
                .permitAll())
        .logout(logout -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                .logoutSuccessUrl("/login?logout")
                .permitAll())
        .exceptionHandling(ex -> ex
                .accessDeniedHandler(accessDeniedHandler()));

        return http.build();
    }
}
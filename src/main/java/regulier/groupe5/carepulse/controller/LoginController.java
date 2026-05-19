package regulier.groupe5.carepulse.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;

import regulier.groupe5.carepulse.entity.Login;
import regulier.groupe5.carepulse.entity.Role;
import regulier.groupe5.carepulse.service.LoginService;

@RestController
@RequestMapping("/api/login")
public class LoginController {

    @Autowired
    private LoginService loginService;

    // simple login endpoint; credentials are checked by the injected service

    /**
     * Try logging with username and password
     * @param Login login credentials
     * @return (Code OK, login username) or if failure (Code Not found, error message)
     */
    
    @PostMapping
    public ResponseEntity<?> login(@RequestBody @NonNull Login login, HttpServletRequest request) {
        try {

            // Produire un login Administrateur?

            // Login utilisateur
            boolean ok = loginService.checkLoginCredentials(login);
            if (ok) {
                
                // Contenir les roles disponible pour cet utilisateur
                // Ici, on est PATIENT
                List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + Role.PATIENT.name()));

                // Ajouter pour ce user le role
                Authentication authentication = new UsernamePasswordAuthenticationToken(login.getUsername(), null, authorities);
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                
                context.setAuthentication(authentication);
                
                // Ajouter le contexte de sécurité
                HttpSession session = request.getSession(true);
                session.setAttribute("SPRING_SECURITY_CONTEXT", context);
                // 10 minutes d'inactivé max
                session.setMaxInactiveInterval(10 * 60);                

                SecurityContextHolder.setContext(context);

                return ResponseEntity.ok(Map.of("message", "Connexion réussite"));
            } else {
                // invalid credentials
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Informations invalides"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}

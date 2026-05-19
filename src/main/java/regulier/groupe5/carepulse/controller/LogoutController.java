package regulier.groupe5.carepulse.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/logout")
public class LogoutController {


    /**
     * Endpoint pour se déconnecter; invalide la session actuelle
     * @param request 
     * @param auth Vérifie si on est authentifié, sinon rejette l'accès (fournis par Spring security)
     * @return Message de logout réussi
     */
    @PostMapping
        public ResponseEntity<?> logout(Authentication auth, HttpServletRequest request) {
        request.getSession(true).invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("response", "Logout successful"));
    }

}

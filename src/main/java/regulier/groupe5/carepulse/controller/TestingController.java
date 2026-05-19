package regulier.groupe5.carepulse.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/test")
public class TestingController {


    @GetMapping("/chemin")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("Test réussi");
    }

    @GetMapping("/whoami")
    public  ResponseEntity<?> whoami(Authentication auth) {
        // devrait retourner le username et le role inscrit dans le token si identifié.
        return ResponseEntity.ok(Map.of("username", auth.getName(),
                                        "role", auth.getAuthorities().stream().findFirst().get().getAuthority()));
    
    }
    

}

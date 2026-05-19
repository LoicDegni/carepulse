package regulier.groupe5.carepulse.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import regulier.groupe5.carepulse.entity.Doctor;
import regulier.groupe5.carepulse.entity.Role;
import regulier.groupe5.carepulse.service.DoctorLoginService;
import regulier.groupe5.carepulse.service.DoctorService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor/login")
public class DoctorLoginController {

    @Autowired
    private DoctorLoginService doctorLoginService;

    @Autowired
    private DoctorService doctorService;

    /**
     * Try logging in as a doctor with id and pinCode
     * @param payload Map containing "id" and "pinCode"
     * @return Response with success or unauthorized status
     */
    @PostMapping
    public ResponseEntity<?> login(@RequestBody @NonNull Map<String, String> payload, HttpServletRequest request) {
        try {
            String idStr = payload.get("id");
            String pinCode = payload.get("pinCode");

            if (idStr == null || pinCode == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Missing id or pinCode"));
            }

            Long id = Long.parseLong(idStr);
            boolean ok = doctorLoginService.checkLoginCredentials(id, pinCode);
            
            if (ok) {

                List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_" + Role.DOCTOR.name())
                );

                Authentication authentication = new UsernamePasswordAuthenticationToken(id.toString(), null, authorities);
                
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                

                HttpSession session = request.getSession(true);
                session.setAttribute("SPRING_SECURITY_CONTEXT", context);
                session.setMaxInactiveInterval(15 * 60);

                SecurityContextHolder.setContext(context);


                Doctor doctor = doctorService.findById(id);
                Map<String, Object> response = new HashMap<>();
                response.put("id", doctor.getId());
                response.put("name", doctor.getName());
                response.put("specialty", doctor.getSpecialty());
                response.put("imageUrl", doctor.getImageUrl());
                response.put("message", "Doctor login successful");

                return ResponseEntity.ok(response);
                
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid ID or PIN"));
            }
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "ID must be a numeric value"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
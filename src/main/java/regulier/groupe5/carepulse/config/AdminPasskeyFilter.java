package regulier.groupe5.carepulse.config;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

/**
 * Filter that protects administrative API paths by validating a simple
 * passkey sent in the header {@code X-Admin-Passkey}. If the request URI
 * begins with {@code /api/admin/} the header must match the configured
 * value or a 401 response is returned. Public paths are unaffected.
 */
@Component
public class AdminPasskeyFilter extends OncePerRequestFilter {

    @Value("${app.admin.passkey:111111}")
    private String passkey;

    @Override
        protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        if (path.startsWith("/api/admin/")) {
            String header = request.getHeader("X-Admin-Passkey");
            if (header == null || !header.equals(passkey)) {
                response.sendError(HttpStatus.UNAUTHORIZED.value(), "Invalid admin passkey");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}

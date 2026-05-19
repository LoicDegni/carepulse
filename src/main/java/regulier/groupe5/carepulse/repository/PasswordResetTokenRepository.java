package regulier.groupe5.carepulse.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import regulier.groupe5.carepulse.entity.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
}

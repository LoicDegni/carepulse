package regulier.groupe5.carepulse.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import regulier.groupe5.carepulse.entity.PasswordResetToken;
import regulier.groupe5.carepulse.entity.Patient;
import regulier.groupe5.carepulse.repository.PasswordResetTokenRepository;
import regulier.groupe5.carepulse.repository.PatientRepository;

@Service
public class PasswordResetService {

    private static final int EXPIRATION_MINUTES = 15;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    public void processForgotPassword(String email) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with email " + email));

        String tokenValue = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(tokenValue);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES));
        resetToken.setPatient(patient);

        tokenRepository.save(resetToken);

        String link = "http://localhost:3000/reset-password?token=" + tokenValue;
        String subject = "Password Reset Request";
        String body = "Bonjour " + patient.getName() + ",\n\n" +
                "You requested a password reset. Please click the link below to reset your password:" +
                "\n" + link + "\n\n" +
                "This link will expire in " + EXPIRATION_MINUTES + " minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Cordialement,\nCarepulse";

        emailService.sendSimpleEmail(patient.getEmail(), subject, body);
    }

    public void updatePassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid password reset token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Token has expired");
        }

        Patient patient = resetToken.getPatient();
        if (patient == null) {
            tokenRepository.delete(resetToken);
            throw new IllegalStateException("Token not associated with a patient");
        }

        // Use BCryptPasswordEncoder for secure password storage in production
        patient.setPwd(newPassword);
        patientRepository.save(patient);

        tokenRepository.delete(resetToken);
    }
}

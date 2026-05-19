package regulier.groupe5.carepulse.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import regulier.groupe5.carepulse.entity.Patient;

public interface PatientRepository extends JpaRepository<Patient, String> {
    Optional<Patient> findByUsername(String username);

    Optional<Patient> getPatientByMedicalCardNumber(String medicalCardNumber);

    Optional<Patient> findByEmail(String email);
}

package regulier.groupe5.carepulse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import regulier.groupe5.carepulse.entity.Doctor;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for {@link Doctor} entities.
 */
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    /**
     * Find doctors by specialty.
     */
    List<Doctor> findBySpecialty(String specialty);

    /**
     * Search doctors by name (case insensitive).
     */
    List<Doctor> findByNameContainingIgnoreCase(String name);

    /**
     * Find a doctor by ID and PIN code.
     * 用于登录验证 doctorId + pinCode
     */
    Optional<Doctor> findByIdAndPinCode(Long id, String pinCode);

    /**
     * Get a list of all distinct specialties indicated in the doctors.
     */
    @Query("SELECT DISTINCT d.specialty FROM Doctor d")
    List<String> findAllSpecialties();
}
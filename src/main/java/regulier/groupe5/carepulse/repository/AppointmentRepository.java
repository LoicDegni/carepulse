package regulier.groupe5.carepulse.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import regulier.groupe5.carepulse.entity.Appointment;
import regulier.groupe5.carepulse.entity.AppointmentStatus;
import org.springframework.data.domain.Pageable;

/**
 * Spring Data JPA repository for {@link Appointment} entities. Default CRUD
 * methods are available; additional query methods can be added here.
 */
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // find appointments scheduled in the given interval
    List<Appointment> findByDateBetweenAndStatus(LocalDateTime start, LocalDateTime end, AppointmentStatus status);

    List<Appointment> findByDoctorIdAndDateBetweenAndStatus(
        Long doctorId,
        LocalDateTime start,
        LocalDateTime end,
        AppointmentStatus status
    );
    /**
     * Find appointments for a patient
     * @param medicalCardNumber identifier for the patient
     * @return list of patient's appointments
     */
    List<Appointment> findByPatientMedicalCardNumber(String medicalCardNumber);
    
    /**
     * Find if an appointment exists for a doctor at a certain date/time
     * Status of the appointment must be checked. If the appointments found are canceled, 
     * then the space is available.
     * @param doctorId identifier for the doctor
     * @param date date and time of the appointment
     * @param status status of the appointment (CANCELLED means the space is available)
     * @return true if already occupied, false otherwise
     */
    boolean existsByDoctor_IdAndDateAndStatusNot(
        Long doctorId,
        LocalDateTime dateTime,
        AppointmentStatus status
    );

    /**
     * Find appointments for a doctor with a certain status between two dates
     * @param doctorId identifier for the doctor
     * @param status status of the appointment (e.g. SCHEDULED)
     * @param start start date and time of the search range
     * @param end end date and time of the search range
     * @return list of appointments matching the criteria
     */
    List<Appointment> findByDoctorIdAndStatusAndDateBetween(
        Long doctorId, 
        AppointmentStatus status, 
        LocalDateTime start, 
        LocalDateTime end
    );

    /**
     * Find appointments before a certain date with a specific status
     * @param dateTime
     * @param status
     * @return
     */
    List<Appointment> findByDateBeforeAndStatus(LocalDateTime dateTime, AppointmentStatus status);


    /**
     * Find appointments for a patient ordered by date descending, with pagination support
     * @param medicalCardNumber identifier for the patient
     * @param pageable pagination information (page number, size, sorting)
     * @return list of patient's appointments ordered by date descending
     */
    List<Appointment> findByPatientMedicalCardNumberOrderByDateDesc(String medicalCardNumber, Pageable pageable);


    /**
     * Find appointments for a patient by name, ordered by date descending
     * @param name name of the patient (partial match allowed)
     * @return list of appointments for patients whose name matches the given string, ordered by date descending
     */
    @Query("SELECT a FROM Appointment a WHERE a.patient.name LIKE %:name% ORDER BY a.date DESC")
    List<Appointment> findByPatientName(@Param("name") String name);

    /**
     * Find all appointments for a patient ordered by date descending
     * @param medicalCardNumber identifier for the patient
     * @return list of all patient's appointments ordered by date descending
     */
    List<Appointment> findByPatientMedicalCardNumberOrderByDateDesc(String medicalCardNumber);


}

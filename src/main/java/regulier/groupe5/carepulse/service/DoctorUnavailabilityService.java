package regulier.groupe5.carepulse.service;

import regulier.groupe5.carepulse.entity.Doctor;
import regulier.groupe5.carepulse.entity.DoctorUnavailability;
import regulier.groupe5.carepulse.repository.DoctorRepository;
import regulier.groupe5.carepulse.repository.DoctorUnavailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DoctorUnavailabilityService {

    @Autowired
    private DoctorUnavailabilityRepository unavailabilityRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * Create a new unavailability for a doctor. Validates that the doctor exists and that the new unavailability does not overlap with existing ones.
     */
    public DoctorUnavailability create(Long doctorId, DoctorUnavailability unavailability) {
        if (doctorId == null) {
            throw new IllegalArgumentException("Doctor ID must not be null");
        }
        
        if (unavailability.getEndTime().isBefore(unavailability.getStartTime()) ||
            unavailability.getEndTime().isEqual(unavailability.getStartTime())) {
            throw new IllegalArgumentException("La date de fin doit être après la date de début.");
        }


        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable avec l'ID: " + doctorId));

        List<DoctorUnavailability> overlapping = unavailabilityRepository.findOverlapping(
                doctorId, unavailability.getStartTime(), unavailability.getEndTime());

        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Cette plage horaire chevauche une indisponibilité existante.");
        }

        unavailability.setDoctor(doctor);
        return unavailabilityRepository.save(unavailability);
    }

    public List<DoctorUnavailability> getByDoctor_Id(Long doctorId) {
        if (doctorId == null) return List.of();
        return unavailabilityRepository.findByDoctor_Id(doctorId);
    }

    public List<DoctorUnavailability> getUpcomingByDoctor_Id(Long doctorId) {
        if (doctorId == null) return List.of();
        return unavailabilityRepository.findByDoctor_IdAndEndTimeAfter(doctorId, LocalDateTime.now());
    }

    /**
     * Check if a doctor is available at a specific date and time. Returns a map with availability status and message.
     */
    public Map<String, Object> checkAvailability(Long doctorId, LocalDateTime dateTime) {
        Map<String, Object> result = new HashMap<>();
        
        if (doctorId == null || dateTime == null) {
            result.put("available", false);
            result.put("message", "Invalid parameters provided.");
            return result;
        }

        boolean isUnavailable = unavailabilityRepository.isUnavailable(doctorId, dateTime);
        if (isUnavailable) {
            result.put("available", false);
            result.put("message", "Le médecin n'est pas disponible sur ce créneau.");
        } else {
            result.put("available", true);
            result.put("message", "Le médecin est disponible.");
        }
        return result;
    }

    public void delete(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID must not be null");
        }
        
        if (!unavailabilityRepository.existsById(id)) {
            throw new RuntimeException("Indisponibilité introuvable avec l'ID: " + id);
        }
        unavailabilityRepository.deleteById(id);
    }

    public DoctorUnavailability update(Long id, DoctorUnavailability updatedData) {
        if (id == null) {
            throw new IllegalArgumentException("ID must not be null");
        }

        DoctorUnavailability existing = unavailabilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Indisponibilité introuvable avec l'ID: " + id));

        if (updatedData.getEndTime().isBefore(updatedData.getStartTime())) {
            throw new IllegalArgumentException("La date de fin doit être après la date de début.");
        }

        existing.setStartTime(updatedData.getStartTime());
        existing.setEndTime(updatedData.getEndTime());
        existing.setType(updatedData.getType());
        existing.setReason(updatedData.getReason());

        return unavailabilityRepository.save(existing);
    }
}
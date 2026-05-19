package regulier.groupe5.carepulse.controller;

import regulier.groupe5.carepulse.entity.DoctorUnavailability;
import regulier.groupe5.carepulse.service.DoctorUnavailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors/{doctorId}/unavailabilities")
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorUnavailabilityController {

    @Autowired
    private DoctorUnavailabilityService service;

    /**
     * POST /api/doctors/{doctorId}/unavailabilities
     * Create a new unavailability for the doctor. The request body should contain startDateTime, endDateTime, and reason. Returns the created unavailability with its generated ID.
     */
    @PostMapping
    public ResponseEntity<?> create(@PathVariable Long doctorId,
                                    @RequestBody DoctorUnavailability unavailability) {
        try {
            DoctorUnavailability response = service.create(doctorId, unavailability);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/doctors/{doctorId}/unavailabilities
     * ?upcoming=true
     */
    @GetMapping
    public ResponseEntity<List<DoctorUnavailability>> getAll(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "false") boolean upcoming) {

        List<DoctorUnavailability> result = upcoming
                ? service.getUpcomingByDoctor_Id(doctorId)
                : service.getByDoctor_Id(doctorId);

        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/doctors/{doctorId}/unavailabilities/check?dateTime=2026-04-01T10:00:00
     * Check if the doctor is available at the given dateTime. Returns a map with availability status and conflicting appointments if any.
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @PathVariable Long doctorId,
            @RequestParam LocalDateTime dateTime) {

        Map<String, Object> check = service.checkAvailability(doctorId, dateTime);
        return ResponseEntity.ok(check);
    }

    /**
     * PUT /api/doctors/{doctorId}/unavailabilities/{id}
     * Update an existing unavailability.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long doctorId,
                                    @PathVariable Long id,
                                    @RequestBody DoctorUnavailability unavailability) {
        try {
            DoctorUnavailability response = service.update(id, unavailability);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/doctors/{doctorId}/unavailabilities/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long doctorId,
                                    @PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok(Map.of("message", "Indisponibilité supprimée avec succès."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
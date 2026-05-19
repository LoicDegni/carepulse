package regulier.groupe5.carepulse.controller;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import regulier.groupe5.carepulse.entity.Appointment;
import regulier.groupe5.carepulse.service.AppointmentService;

/**
 * REST controller exposing application endpoints related to appointments.
 * Admin mappings are prefixed with {@code /api/admin/appointments}.
 * Public mappings are prefixed with {@code /api/appointments}.
 */
@RestController
public class AppointmentController {

    @Autowired
    private AppointmentService service;

    /**
     * GET /api/admin/appointments
     * Returns the complete list of appointments. The service ensures
     * the list is sorted by date (newest first).
     * This endpoint is intended for the admin dashboard.
     */
    @GetMapping("/api/admin/appointments")
    public List<Appointment> getAllAppointments() {
        return service.findAll();
    }

    /**
     * POST /api/appointments
     * Creates a new appointment and sends SMS notification to the patient.
     * The appointment status is automatically set to CONFIRMED.
     */
    @PostMapping("/api/appointments")
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) {
        try {
            Appointment created = service.createAppointment(appointment);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * PATCH /api/admin/appointments/{id}/status
     * Accepts a JSON body containing a status property (SCHEDULED or CANCELLED).
     * Updates the appointment's status and returns the modified entity.
     */
    @PatchMapping("/api/admin/appointments/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable @NonNull Long id,
                                          @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().body("status field is required");
        }

        if (!List.of("SCHEDULED", "CANCELLED").contains(status)) {
            return ResponseEntity.badRequest().body("Invalid status: " + status);
        }

        try {
            Appointment updated = service.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Endpoint: GET /api/admin/appointments/doctor/{doctorId}?date=today
     * Returns today's scheduled appointments for the specified doctor.
     * The date query parameter is required and must be set to "today" to trigger the correct behavior.
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getDoctorAppointmentsToday(
            @PathVariable Long doctorId,
            @RequestParam(required = false) String date) {

        if (date != null && date.equals("today")) {
            List<Appointment> appointments =
                    service.getTodayAppointmentsForDoctor(doctorId);

            return ResponseEntity.ok(appointments);
        }

        return ResponseEntity.badRequest().build();
    }

    /**
     * PATCH /api/admin/appointments/{id}/consultation 
     */
    @PatchMapping("/{id}/consultation")
    public ResponseEntity<?> completeConsultation(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        String medicalNotes = payload.get("medicalNotes");
        String prescription = payload.get("prescription");

        if (medicalNotes == null || medicalNotes.isBlank()) {
            return ResponseEntity.badRequest().body("Medical notes are required to complete consultation");
        }

        try {
            Appointment updatedAppointment = service.completeConsultation(
                id,
                medicalNotes,
                prescription
            );
            return ResponseEntity.ok(updatedAppointment);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Endpoint to bulk cancel appointments for a doctor on specific dates.
     * @param doctorId identifier of the doctor whose appointments are to be canceled
     * @param payload  JSON object containing:
     *                 - dates: list of date strings (e.g. ["2024-07-01", "2024-07-02"])
     *                 - reason: string explaining the reason for cancellation (optional)
     * @return HTTP 200 with success message if cancellations were successful, or appropriate error response for invalid input
     */
    @PostMapping("/doctor/{doctorId}/bulk-cancel")
    public ResponseEntity<?> bulkCancel(
            @PathVariable Long doctorId,
            @RequestBody Map<String, Object> payload) {
        
        try {
            Object datesObj = payload.get("dates");
            String reason = (String) payload.get("reason");

            if (!(datesObj instanceof List) || reason == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Dates (List) and reason (String) are required"));
            }

            @SuppressWarnings("unchecked")
            List<String> dateStrings = (List<String>) datesObj;

            List<LocalDate> dates = dateStrings.stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .map(LocalDate::parse)
                    .collect(Collectors.toList());

            service.cancelAppointmentsForDates(doctorId, dates, reason);

            return ResponseEntity.ok(Map.of("message", "Cancelled successfully"));
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. Use YYYY-MM-DD"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
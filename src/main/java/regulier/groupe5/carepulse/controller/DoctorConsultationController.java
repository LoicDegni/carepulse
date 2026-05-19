package regulier.groupe5.carepulse.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import regulier.groupe5.carepulse.entity.Appointment;
import regulier.groupe5.carepulse.service.AppointmentService;

public class DoctorConsultationController {
    @Autowired
    private AppointmentService appointmentService;

    /**
     * Search for appointments by patient name.
     * @param name the name of the patient to search for
     * @return a list of appointments matching the search criteria
     */
    @GetMapping("/search")
    public ResponseEntity<List<Appointment>> search(@RequestParam String name) {
        return ResponseEntity.ok(appointmentService.searchAppointmentsByPatientName(name));
    }

    /**
     * Get details of a specific appointment by its ID.
     * @param id the ID of the appointment to retrieve details for
     * @return the details of the specified appointment
     */
    @GetMapping("/details/{id}")
    public ResponseEntity<Appointment> getDetails(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentDetails(id));
    }

}

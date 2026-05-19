package regulier.groupe5.carepulse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import regulier.groupe5.carepulse.entity.Appointment;
import regulier.groupe5.carepulse.service.AppointmentService;

@RestController
@RequestMapping("/api/patient/history")
public class PatientHistoryController {

    @Autowired
    private AppointmentService appointmentService;

    /**
     * Obtain detailed information about a specific appointment for a patient.
     * @param id Appointment ID (from the URL path)
     * @param medicalCardNumber Medical card number of the patient (from query parameter)
     * @return Detailed information about the appointment
     */
    @GetMapping("/details/{id}")
    public ResponseEntity<Appointment> getAppointmentDetails(
            @PathVariable Long id,
            @RequestParam String medicalCardNumber) {
        
        Appointment details = appointmentService.getPatientAppointmentDetails(id, medicalCardNumber);
        return ResponseEntity.ok(details);
    }
}

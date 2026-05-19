package regulier.groupe5.carepulse.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;

import regulier.groupe5.carepulse.service.AppointmentService;
import regulier.groupe5.carepulse.service.DoctorUnavailabilityService;
import regulier.groupe5.carepulse.service.PatientService;
import regulier.groupe5.carepulse.entity.Appointment;
import regulier.groupe5.carepulse.entity.Patient;




@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService service;

    @Autowired
    AppointmentService appointmentService;

     @Autowired
    DoctorUnavailabilityService doctorUnavailService;

    @GetMapping
    public List<Patient> getAll() {
        return service.findAll();
    }

    /**
     * Route to get the current user (auth)
     * @param auth the current user
     * @param payload json object containing the doctor id, date and time of appointment
     * @return Response indicating if appointment is created or refused
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentPatient(Authentication auth) {
    
        if (auth == null) {
            throw new RuntimeException("Session invalide");
        }
        return service.getPatientByUsername(auth.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Route to get a patient by their medical card number. Responds with OK status (200) and the Patient in 
     * a string in the body (json...) or with Not_found status (404)
     * @param medicalNumber
     * @return HttpResponse OK with patient in body if found, else HttpResponse NOT_FOUND
     */
    @GetMapping("/{medicalCardNumber}")
    public ResponseEntity<Patient> getPatientByMedicalCardNumber(@PathVariable @NonNull String medicalCardNumber) {
        return service.getPatientByMedicalCardNumber(medicalCardNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Route to create a new Patient. (POST)
     * @param patient New Patient
     * @return HttpResponse 201 with new patient in body if new, else HttpResponse 409 if patient already exists
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody @NonNull Patient patient) {
        try {
            service.save(patient);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Register successful"));
            
            //Patient saved = service.save(patient);
            //return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            // Patient already exists with certain informations (username, medicalCardNumber, etc.)
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Route to get all appointments of the current user (auth), a patient
     * @param auth the current user
     * @return Response ok with the list of appointments in the body if auth is valid
     */
    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointments(Authentication auth) {
        
        // Authentication devrait blocquer l'accès si on n'a pas d'authentification

        if (auth == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Invalid token"));
        }
        List<Appointment> appointments = appointmentService.findPatientAppointments(service.getPatientByUsername(auth.getName()).get().getMedicalCardNumber()); //chercher par le user (récup son matricule)
        return ResponseEntity.ok(appointments);
    }

    /**
     * Route to add a new appointment for the current user (auth), a patient
     * @param auth the current user
     * @param payload json object containing the doctor id, date and time of appointment
     * @return Response indicating if appointment is created or refused
     */
    @PostMapping("/appointment")
    public ResponseEntity<?> addAppointment(Authentication auth, @RequestBody Map<String, ?> payload) {
        
        // Authentication devrait blocquer l'accès si on n'a pas d'authentification

        // payload : json object contenant le id d'un docteur, la date et l'heure de rendez-vous
        // Pour vérifier : créer un objet de type Appointment et inscrire le patient (matricule à chercher) et docteur
        // Avant de sauvegarder cette objet, vérifier dans la BD s'il y a un rendez-vous à cet
        // heure usant le même docteur! (devrait avoir été produit?)
        if (auth == null) {
            throw new RuntimeException("Session invalide");
        }

        try {
            String medicalCardNumber = service.getPatientByUsername(auth.getName()).get().getMedicalCardNumber();
            LocalDateTime dateTime = LocalDateTime.of(LocalDate.parse(payload.get("date").toString()), LocalTime.parse(payload.get("time").toString()));
            Long doctorId = Long.parseLong(payload.get("doctorId").toString());

            Map<String, ?> available = doctorUnavailService.checkAvailability(doctorId, dateTime);

            if ((boolean) available.get("available")) {
                appointmentService.save(dateTime, doctorId, medicalCardNumber);
                return ResponseEntity.status(HttpStatus.CREATED).body("");
            } else {
                throw new RuntimeException(available.get("message").toString());
            }

            
            
        } catch (Exception e) {
            // Appointment already exists for this doctor at this date/time
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Nouveau rendez-vous refusé: " + e.getMessage()));
        }
    }


}

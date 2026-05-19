package regulier.groupe5.carepulse.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import regulier.groupe5.carepulse.entity.Doctor;
import regulier.groupe5.carepulse.service.DoctorService;

/**
 * REST Controller exposing CRUD endpoints for doctors.
 * Style consistent with PatientController: no DTOs, direct entity usage.
 */
@RestController
@RequestMapping("/api/doctors")
@CrossOrigin // allow frontend requests from React
public class DoctorController {

    @Autowired
    private DoctorService service;

    /** Get all doctors */
    @GetMapping
    public List<Doctor> getAllDoctors() {
        return service.findAll();
    }

    /** Get doctor by ID */
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable @NonNull Long id) {
        try {
            Doctor doctor = service.findById(id);
            return ResponseEntity.ok(doctor);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body(null);
        }
    }

    /**
     * Get doctors by specialty.
     * 
     * @param specialty Specialty to filter doctors by (e.g., "Cardiology", "Pediatrics")
     * @return List of doctors matching the given specialty. If no doctors are found, returns an empty list.
     */
    @GetMapping("/specialty/{specialty}")
    public List<Doctor> getBySpecialty(@PathVariable @NonNull String specialty) {
        return service.findBySpecialty(specialty);
    }
    
    /**
     * Get all specialties of doctors
     */
    @GetMapping("/specialties")
    public ResponseEntity<?> getAllSpecialties() {
        
        return ResponseEntity.status(HttpStatus.OK)
                                 .body(Map.of("specialties", service.findAllSpecialties()));
    }

    /**
     * Search doctors by name (partial match, case-insensitive).
     * 
     * @param name Name to search for (case-insensitive partial match)
     * @return List of doctors whose names contain the search term. If no doctors are found, returns an empty list.
     */
    @GetMapping("/search")
    public List<Doctor> searchByName(@RequestParam @NonNull String name) {
        return service.searchByName(name);
    }

   /**
    * Create a new doctor. Expects a Doctor object in the request body. If a doctor with the same ID already exists, returns a 409 Conflict status.
    * 
    * @param doctor Doctor object to create (must include name, specialty, and optionally imageUrl). The ID will be auto-generated.
    * @return ResponseEntity with status 201 Created and the created doctor in the body if successful, or status 409 Conflict with an error message if a doctor with the same ID already exists.
    */
    @PostMapping
    public ResponseEntity<?> createDoctor(@RequestBody @NonNull Doctor doctor) {
        try {
            Doctor created = service.create(doctor);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                                 .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update doctor information.
     * 
     * @param id ID of the doctor to update
     * @param doctor Updated doctor object (must include name, specialty, and optionally imageUrl)
     * @return ResponseEntity with status 200 OK and the updated doctor in the body if successful, or status 404 Not Found with an error message if the doctor is not found.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable @NonNull Long id,
                                          @RequestBody @NonNull Doctor doctor) {
        try {
            Doctor updated = service.update(id, doctor);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete doctor by ID.
     * 
     * @param id ID of the doctor to delete
     * @return ResponseEntity with status 200 OK and a success message if successful, or status 404 Not Found with an error message if the doctor is not found.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable @NonNull Long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok(Map.of("response", "Doctor deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body(Map.of("error", e.getMessage()));
        }
    }
}
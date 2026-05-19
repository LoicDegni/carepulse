package regulier.groupe5.carepulse.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import regulier.groupe5.carepulse.entity.Patient;
import regulier.groupe5.carepulse.repository.PatientRepository;

// import org.springframework.lang.NonNull; // removed unused import

import org.springframework.lang.NonNull;

@Service
public class PatientService {

    @Autowired
    private PatientRepository repository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get all patients
     * @return List of Patients
     */
    public List<Patient> findAll() {
        return repository.findAll();
    }


    /**
     * Find a Patient by his medical card number
     * @param medicalNumber
     * @return Optional Patient
     */
    public Optional<Patient> getPatientByMedicalCardNumber(@NonNull String medicalCardNumber) {
        return repository.findById(medicalCardNumber);
    }

    /**
     * Find a Patient by his username
     * @param username
     * @return Optional Patient (empty if no patient have been found)
     */
    public Optional<Patient> getPatientByUsername(@NonNull String username) {
        return repository.findByUsername(username);
    }

    /**
     * Create new Patient.
     * @param patient
     * @return the newly created Patient
     */
    public Patient save(@NonNull Patient patient) {
        String medicalCardNumber = patient.getMedicalCardNumber();
        if(medicalCardNumber != null && getPatientByMedicalCardNumber(medicalCardNumber).isPresent())
            throw new RuntimeException("Carte medicale déjà utilisé");
        String username = patient.getUsername();
        if(username != null && getPatientByUsername(username).isPresent())
            throw new RuntimeException("Username déjà utilisé");

        String hashedPwd = passwordEncoder.encode(patient.getPwd());
        patient.setPwd(hashedPwd);

        return repository.save(patient);
    }

}

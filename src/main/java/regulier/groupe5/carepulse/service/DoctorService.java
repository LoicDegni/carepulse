package regulier.groupe5.carepulse.service;

import java.util.List;
import java.util.Objects;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import regulier.groupe5.carepulse.entity.Doctor;
import regulier.groupe5.carepulse.repository.DoctorRepository;

/**
 * Service layer handling business logic related to doctors.
 * Responsible for doctor retrieval, search, creation, update, deletion, and login.
 */
@Service
public class DoctorService {

    @Autowired
    private DoctorRepository repository;

    /**
     * Retrieve all doctors.
     */
    @NonNull
    public List<Doctor> findAll() {
        return Objects.requireNonNull(repository.findAll());
    }

    /**
     * Find doctors by ID
     * 
     * @param id doctor id
     * @return the doctor with the specified ID
     */
    @NonNull
    public Doctor findById(@NonNull Long id) {
        Doctor doctor = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id " + id));
        return Objects.requireNonNull(doctor);
    }


    /**
     * Find doctors by specialty.
     * 
     * @param specialty the specialty to filter by
     * @return a list of doctors with the specified specialty
     */
    @NonNull
    public List<Doctor> findBySpecialty(@NonNull String specialty) {
        return Objects.requireNonNull(repository.findBySpecialty(specialty));
    }

    /**
     * Get a list of all the distinct specialties from doctors
     * @return a list of specialties (strings)
     */
    public List<String> findAllSpecialties() {
        return repository.findAllSpecialties();
    }

    /**
     * Search doctors by name (case insensitive).
     * 
     * @param name the name to search for
     * @return a list of doctors whose names contain the search term
     */
    @NonNull
    public List<Doctor> searchByName(@NonNull String name) {
        return Objects.requireNonNull(repository.findByNameContainingIgnoreCase(name));
    }

    /**
     * Authenticate doctor using id and pinCode.
     * 
     * @param id the doctor's ID
     * @param pinCode the doctor's PIN code
     * @return the authenticated doctor
     */
    @NonNull
    public Doctor login(@NonNull Long id, @NonNull String pinCode) {
        Doctor doctor = repository.findByIdAndPinCode(id, pinCode)
                .orElseThrow(() -> new IllegalArgumentException("Invalid doctor ID or PIN"));
        return Objects.requireNonNull(doctor);
    }

    /**
     * Create a new doctor.
     * 
     * @param doctor the doctor to create
     * @return the created doctor
     */
    @NonNull
    public Doctor create(@NonNull Doctor doctor) {
        Objects.requireNonNull(doctor);
        return repository.save(doctor);
    }

    /**
     * Update doctor information.
     * 
     * @param id the ID of the doctor to update
     * @param updatedDoctor the doctor object containing updated information
     * @return the updated doctor
     */
    @NonNull
    public Doctor update(@NonNull Long id, @NonNull Doctor updatedDoctor) {
        Objects.requireNonNull(updatedDoctor);

        Doctor existing = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id " + id));

        existing.setName(updatedDoctor.getName());
        existing.setSpecialty(updatedDoctor.getSpecialty());
        existing.setImageUrl(updatedDoctor.getImageUrl());
        existing.setPinCode(updatedDoctor.getPinCode());

        return repository.save(existing);
    }

    /**
     * Delete doctor by id.
     * @param id the ID of the doctor to delete
     */
    public void delete(@NonNull Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Doctor not found with id " + id);
        }
        repository.deleteById(id);
    }
}
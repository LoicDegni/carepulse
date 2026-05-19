package regulier.groupe5.carepulse.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;

import regulier.groupe5.carepulse.entity.Doctor;
import regulier.groupe5.carepulse.repository.DoctorRepository;

/**
 * Service dedicated to doctor authentication using id and pinCode.
 * Returns boolean similar to patient login.
 */
@Service
public class DoctorLoginService {

    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * Check if doctor login credentials are valid.
     * 
     * @param id doctor ID
     * @param pinCode plain PIN code
     * @return true if valid, false otherwise
     */
    public boolean checkLoginCredentials(@NonNull Long id, @NonNull String pinCode) {

        if (id == null || pinCode == null) return false;

        Optional<Doctor> doctorOpt = doctorRepository.findById(id);

        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            return pinCode.equals(doctor.getPinCode());
        }

        return false;
    }
}
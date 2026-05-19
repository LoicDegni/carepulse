package regulier.groupe5.carepulse.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import regulier.groupe5.carepulse.entity.Login;
import regulier.groupe5.carepulse.entity.Patient;

import org.springframework.lang.NonNull;

@Service
public class LoginService {

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private PatientService patientService;


    /**
     * Check if the login credentials are valid.
     * @param login login credentials
     * @return true if valid, else false
     */
    public Boolean checkLoginCredentials(@NonNull Login login) {
        String username = login.getUsername();
        if (username == null) {
            return false;
        }
        Optional<Patient> result = patientService.getPatientByUsername(username);

        if (result.isPresent()) {
            if (passwordEncoder.matches(login.getPwd(), result.get().getPwd())) {
                return true;
            }
        }

        return false;
    }

}

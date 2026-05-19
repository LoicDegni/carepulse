package regulier.groupe5.carepulse.entity;


import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

@Entity
public class Patient {

    @Id
    @NotBlank
    @Column(name = "medical_card_number")
    private String medicalCardNumber;

    @NotBlank
    private String username;

    @NotBlank
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) // password should not be serialized in responses
    private String pwd;

    // salt has been removed; password encoder handles salting automatically

    @NotBlank
    private String surname;

    @NotBlank
    private String name;

    // date of birth must be in the past
    @NotNull
    @Past(message = "dateOfBirth must be a past date")
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Email
    @NotBlank
    private String email;

    // phone number 3 digits space 3 digits dash 4 digits
    @NotBlank
    //@Pattern(regexp = "\\d{3} \\d{3}-\\d{4}", message = "tel must match ### ###-####")
    private String tel;

    @NotBlank
    private String address;

    @Column(name = "medical_infos")
    private String medicalInfos;

    @Column(name = "emergency_contact")
    private String emergencyContact;

    // avoid infinite JSON recursion: appointments fetched via Appointment entity
    // and ignored here
    
    // @OneToMany(mappedBy = "patient")
    // @JsonIgnoreProperties("patient")
    // private List<Appointment> appointments;

    // ===== Constructors =====

    public Patient() {
    }

    
    public Patient(String medicalCardNumber) {
        this.medicalCardNumber = medicalCardNumber;
    }

    // getters / setters
    public String getMedicalCardNumber() { return medicalCardNumber; }
    public void setMedicalCardNumber(String medicalCardNumber) { this.medicalCardNumber = medicalCardNumber; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPwd() { return pwd; }
    public void setPwd(String pwd) { this.pwd = pwd; }
    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTel() { return tel; }
    public void setTel(String tel) { this.tel = tel; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getMedicalInfos() { return medicalInfos; }
    public void setMedicalInfos(String medicalInfos) { this.medicalInfos = medicalInfos; }
    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }
}

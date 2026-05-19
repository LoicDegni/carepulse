package regulier.groupe5.carepulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_unavailability")
public class DoctorUnavailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Use ManyToOne to link to Doctor, but ignore it in JSON to prevent recursion issues.
      * We will handle doctorId separately for JSON input/output.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Doctor doctor;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private UnavailabilityType type;

    @Column(length = 255)
    private String reason;

    public enum UnavailabilityType {
        VACATION,
        MEETING,
        PERSONAL,
        TRAINING,
        OTHER
    }

    // --- Constructors ---

    public DoctorUnavailability() {}

    public DoctorUnavailability(Doctor doctor, LocalDateTime startTime, LocalDateTime endTime,
                                UnavailabilityType type, String reason) {
        this.doctor = doctor;
        this.startTime = startTime;
        this.endTime = endTime;
        this.type = type;
        this.reason = reason;
    }

    /**
     * To simplify JSON handling, we expose doctorId as a separate property. This allows us to
     */
    @JsonProperty("doctorId")
    public Long getDoctorId() {
        return (doctor != null) ? doctor.getId() : null;
    }

    @JsonProperty("doctorId")
    public void setDoctorId(Long doctorId) {
        this.doctor = new Doctor();
        this.doctor.setId(doctorId);
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public UnavailabilityType getType() { return type; }
    public void setType(UnavailabilityType type) { this.type = type; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
package regulier.groupe5.carepulse.entity;

/**
 * Enumeration of possible appointment statuses used throughout the system.
 */
public enum AppointmentStatus {
    ABSENT,         // Absence of the doctor
    SCHEDULED,      // Appointment is scheduled but not yet confirmed
    CANCELLED,      // Appointment was cancelled by the patient
    COMPLETED,      // Appointment has been completed
    NOSHOW          // Patient did not show up for the appointment
}

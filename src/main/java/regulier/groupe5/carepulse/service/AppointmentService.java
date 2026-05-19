package regulier.groupe5.carepulse.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.lang.NonNull;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;


import regulier.groupe5.carepulse.entity.Appointment;
import regulier.groupe5.carepulse.entity.AppointmentStatus;
import regulier.groupe5.carepulse.entity.Doctor;
import regulier.groupe5.carepulse.entity.DoctorUnavailability;
import regulier.groupe5.carepulse.entity.Patient;
import regulier.groupe5.carepulse.repository.AppointmentRepository;
import regulier.groupe5.carepulse.repository.DoctorRepository;
import regulier.groupe5.carepulse.repository.DoctorUnavailabilityRepository;

/**
 * Service layer handling business logic for appointments.
 * Delegates persistence operations to {@link AppointmentRepository}.
 */
@SuppressWarnings("unused")
@Service
public class AppointmentService {

    private final AppointmentRepository repository;
    private final TwilioSmsService twilioSmsService;
    private final EmailService emailService;

    public AppointmentService(AppointmentRepository repository,
                              TwilioSmsService twilioSmsService,
                              EmailService emailService) {
        this.repository = repository;
        this.twilioSmsService = twilioSmsService;
        this.emailService = emailService;
    }
    //@Autowired
    //private AppointmentRepository repository;
    @Autowired
    private DoctorUnavailabilityRepository unavailabilityRepository;
    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * Retrieve all appointments from the database.
     * Results are sorted by the appointment date in descending order
     * (newest first) so that the most recent entries appear at the top.
     *
     * @return ordered list of {@link Appointment} entities
     */
    public List<Appointment> findAll() {
        // sort by date property descending (newest first)
        return repository.findAll(Sort.by(Sort.Direction.DESC, "date"));
    }

/**
     * Create a new appointment and send SMS notification to the patient.
     *
     * @param appointment the appointment to create
     * @return the created {@link Appointment} entity
     * @throws IllegalArgumentException if the patient has no phone number
     */
    public Appointment createAppointment(Appointment appointment) {
        if (appointment.getPatient() == null) {
            throw new IllegalArgumentException("Appointment must have an associated patient");
        }

        if (appointment.getPatient().getTel() == null || appointment.getPatient().getTel().isEmpty()) {
            throw new IllegalArgumentException("Patient phone number is required for SMS notification");
        }

        if (appointment.getPatient().getEmail() == null || appointment.getPatient().getEmail().isEmpty()) {
            throw new IllegalArgumentException("Patient email is required for confirmation email");
        }

        appointment.setStatus(AppointmentStatus.SCHEDULED);
        Appointment savedAppointment = repository.save(appointment);

        // Send SMS notification
        String smsMessage = "Your appointment has been confirmed for " + savedAppointment.getDate() + ".";
        twilioSmsService.sendSms(savedAppointment.getPatient().getTel(), smsMessage);

        // Send email notification
        String emailSubject = "Appointment confirmed";
        String emailBody = "Your appointment has been confirmed for " + savedAppointment.getDate() + ".";
        emailService.sendSimpleEmail(savedAppointment.getPatient().getEmail(), emailSubject, emailBody);

        return savedAppointment;
    }

    /**
     * Get all appointments for a patient by its medical card number
     * @param medicalCardNumber patient's medical card number
     * @return list of appointments
     */
    public List<Appointment> findPatientAppointments(String medicalCardNumber) {
        return repository.findByPatientMedicalCardNumber(medicalCardNumber);
    }

    /**
     * Update the status of an existing appointment.
     *
     * @param id identifier of the appointment to update
     * @param newStatus string value of the {@link AppointmentStatus} enum
     * @return the updated {@link Appointment} entity
     * @throws EntityNotFoundException if no appointment exists with the given id
     * @throws IllegalArgumentException if the newStatus value is not a valid enum constant
     */
        public Appointment updateStatus(@NonNull Long id, String newStatus) {
            Appointment appt = repository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id " + id));
            appt.setStatus(AppointmentStatus.valueOf(newStatus));
            return repository.save(appt);
        }
    

    /**
     * Get today's scheduled appointments for a specific doctor.
     */
    public List<Appointment> getTodayAppointmentsForDoctor(Long doctorId) {

        LocalDate today = LocalDate.now();

        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        return repository.findByDoctorIdAndDateBetweenAndStatus(
                doctorId,
                startOfDay,
                endOfDay,
                AppointmentStatus.SCHEDULED
        );
    }

    /**
     * Complete a consultation by setting medical notes, prescription, and updating status to COMPLETED.
     * @param appointmentId identifier of the appointment to complete
     * @param medicalNotes notes taken by the doctor during the consultation
     * @param prescription medication prescribed by the doctor during the consultation
     * @return the updated appointment entity with status set to COMPLETED
     */
    public Appointment completeConsultation(Long appointmentId,
                                            String medicalNotes,
                                            String prescription) {
        
        if (appointmentId == null) {
            throw new IllegalArgumentException("Appointment ID must not be null");
        }

        Appointment appointment = repository.findById(appointmentId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Appointment not found with id " + appointmentId)
                );

        appointment.setMedicalNotes(medicalNotes);
        appointment.setPrescription(prescription);
        appointment.setStatus(AppointmentStatus.COMPLETED);

        return repository.save(appointment);
    }

    /**
     * Cancel an existing appointment by a doctor by setting its status to ABSENT.
     * @doctorId the ID of the doctor whose appointments are to be cancelled
     * @dates the list of dates for which to cancel appointments
     * @reason the reason for cancellation to include in the notification
     */
    @Transactional
    public void cancelAppointmentsForDates(Long doctorId, List<LocalDate> dates, String reason) {
        if (doctorId == null) throw new IllegalArgumentException("Doctor ID is required");
        
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        for (LocalDate date : dates) {
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(LocalTime.MAX);

            List<Appointment> toCancel = repository.findByDoctorIdAndStatusAndDateBetween(
                    doctorId, AppointmentStatus.SCHEDULED, start, end);

            for (Appointment app : toCancel) {
                app.setStatus(AppointmentStatus.ABSENT);
                app.setCancellationReason(reason);
                repository.save(app);
                sendNotifications(app, reason);
            }

            DoctorUnavailability unavailability = new DoctorUnavailability(
                doctor, 
                start, 
                end, 
                DoctorUnavailability.UnavailabilityType.OTHER,
                "Auto-generated from bulk cancellation: " + reason
            );
            unavailabilityRepository.save(unavailability);
        }
    }

    /**
     * Send notifications to the patient about the cancellation of their appointment.
     * @param app the appointment that was cancelled
     * @param reason the reason for cancellation to include in the notification
     */
    private void sendNotifications(Appointment app, String reason) {
        System.out.println("SMS sent to " + app.getPatient().getTel() + ": Your appointment on " + app.getDate() + " is cancelled. Reason: " + reason);
        System.out.println("Email sent to patient: Appointment marked as ABSENT due to doctor unavailability.");
    }


    /**
     * Scheduled task to process expired appointments. This method should be run periodically (e.g., every hour) to check for appointments that have passed their scheduled time but are still marked as SCHEDULED. Such appointments will be updated to NOSHOW to indicate that the patient did not show up.
     */
    @Transactional
    public void processExpiredAppointments() {
        LocalDateTime now = LocalDateTime.now();

        List<Appointment> expiredAppointments = repository.findByDateBeforeAndStatus(
                now, AppointmentStatus.SCHEDULED);

        for (Appointment app : expiredAppointments) {
            app.setStatus(AppointmentStatus.NOSHOW);
            System.out.println("DEBUG: Appointment ID " + app.getId() + " marked as NOSHOW (Patient didn't show up)");
            repository.save(app);
        }
    }

    /**
     * To validate if a patient is eligible to book a new appointment. If the patient has 3 consecutive No-Shows, they are banned from online booking.
     * @param medicalCardNumber identifier for the patient
     * @return list of appointments for the patient
     */
    private void validatePatientEligibility(String medicalCardNumber) {
        // Obtain the last 3 appointments for the patient, ordered by date descending
        List<Appointment> lastThree = repository.findByPatientMedicalCardNumberOrderByDateDesc(
                medicalCardNumber, PageRequest.of(0, 3));

        if (lastThree.size() < 3) {
            return;
        }

        boolean allNoShow = lastThree.stream()
                .allMatch(app -> app.getStatus() == AppointmentStatus.NOSHOW);

        if (allNoShow) {
            throw new RuntimeException("Due to three consecutive missed appointments, your online booking privileges have been temporarily suspended. Please contact the hospital administration to restore access.");
        }
    }

    /**
     * Add a new appointment for a patient with a doctor at a specific date and time.
     * Must first check if the doctor is available at the given date/time. (no other appointments are schduled/confirmed)
     * @param dateTime Date and time of appointment
     * @param doctorId Doctor to consult
     * @param medicalCardNumber Patient that wants the appointment
     */
    public void save(LocalDateTime dateTime, Long doctorId, String medicalCardNumber) {
        // Validate patient eligibility before checking doctor availability
        validatePatientEligibility(medicalCardNumber);

        // Check if the doctor already has an appointment at the given date/time that is not cancelled
        boolean exists = repository.existsByDoctor_IdAndDateAndStatusNot(
            (long) doctorId,
            dateTime,
            AppointmentStatus.CANCELLED
        );

        if (exists) {
            throw new RuntimeException("Ce docteur possède déjà un rendez-vous à ce moment");
        }

        // If the doctor is available, create and save the new appointment
        Appointment appointment = new Appointment();
        appointment.setDate(dateTime);
        appointment.setDoctor(new Doctor((long) doctorId));
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setPatient(new Patient(medicalCardNumber));
        repository.save(appointment);   
    }

    /**
     * Search for appointments by patient name. This method allows searching for appointments based on a partial match of the patient's name. The results are ordered by appointment date in descending order, so that the most recent appointments appear first.
     * @param name the name (or partial name) of the patient to search for
     * @return a list of appointments for patients whose name matches the given string, ordered by date descending
     */
    public List<Appointment> searchAppointmentsByPatientName(String name) {
        return repository.findByPatientName(name);
    }

    /**
     * Get detailed information about a specific appointment by its ID. This method retrieves the appointment entity from the database and returns it. If no appointment is found with the given ID, an EntityNotFoundException is thrown.
     * @param id the identifier of the appointment to retrieve
     * @return the appointment entity with the specified ID
     * @throws EntityNotFoundException if no appointment exists with the given ID
     */
    public Appointment getAppointmentDetails(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("This appointment does not exist ID: " + id));
    }


    /**
     * Get detailed information about a specific appointment for a patient by its ID and the patient's medical card number. This method retrieves the appointment entity from the database and checks if it belongs to the patient making the request. If the appointment does not exist or does not belong to the patient, an exception is thrown.
     * @param appointmentId the identifier of the appointment to retrieve
     * @param medicalCardNumber the medical card number of the patient requesting the details
     * @return the appointment entity with the specified ID
     * @throws EntityNotFoundException if no appointment exists with the given ID
     * @throws RuntimeException if the appointment does not belong to the patient
     */
    public Appointment getPatientAppointmentDetails(Long appointmentId, String medicalCardNumber) {
        Appointment app = repository.findById(appointmentId)
                                    .orElseThrow(() -> new EntityNotFoundException("This appointment does not exist ID: " + appointmentId));

        // Security check: Ensure the appointment belongs to the patient making the request
        if (!app.getPatient().getMedicalCardNumber().equals(medicalCardNumber)) {
            throw new RuntimeException("Access Denied: You cannot view this appointment.");
        }
        return app;
    }
    
}

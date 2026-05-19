package regulier.groupe5.carepulse.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import regulier.groupe5.carepulse.entity.Appointment;
import regulier.groupe5.carepulse.entity.AppointmentStatus;
import regulier.groupe5.carepulse.repository.AppointmentRepository;

@Service
public class AppointmentReminderService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentReminderService.class);

    private final AppointmentRepository appointmentRepository;
    private final TwilioSmsService twilioSmsService;
    private final EmailService emailService;

    public AppointmentReminderService(AppointmentRepository appointmentRepository,
                                      TwilioSmsService twilioSmsService,
                                      EmailService emailService) {
        this.appointmentRepository = appointmentRepository;
        this.twilioSmsService = twilioSmsService;
        this.emailService = emailService;
    }

    @Scheduled(cron = "0 0 8 * * ?")
    public void sendDailyReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startWindow = now.plusHours(24);
        LocalDateTime endWindow = now.plusHours(48);

        List<Appointment> upcoming = appointmentRepository.findByDateBetweenAndStatus(startWindow, endWindow, AppointmentStatus.SCHEDULED);

        log.info("Found {} scheduled appointments in the 48h window for reminders", upcoming.size());

        for (Appointment appointment : upcoming) {
            try {
                if (appointment.getPatient() == null) {
                    log.warn("Appointment {} has no patient assigned, skipping", appointment.getId());
                    continue;
                }

                String message = String.format("Reminder: Your appointment is in 48 hours and scheduled on %s.", appointment.getDate());

                if (appointment.getPatient().getTel() != null && !appointment.getPatient().getTel().isBlank()) {
                    twilioSmsService.sendSms(appointment.getPatient().getTel(), message);
                } else {
                    log.info("Skipping SMS for appointment {} because patient phone is missing", appointment.getId());
                }

                if (appointment.getPatient().getEmail() != null && !appointment.getPatient().getEmail().isBlank()) {
                    String subject = "Rappel de rendez-vous";
                    String body = "Bonjour,\n\nYour appointment is in 48 hours and scheduled on " + appointment.getDate() + ".\n\nCordialement,\nCarepulse";
                    emailService.sendSimpleEmail(appointment.getPatient().getEmail(), subject, body);
                } else {
                    log.info("Skipping email for appointment {} because patient email is missing", appointment.getId());
                }

            } catch (Exception ex) {
                log.error("Failed to send reminder for appointment {}: {}", appointment.getId(), ex.getMessage(), ex);
            }
        }
    }
}

# CarePulse

A full-stack medical appointment management platform. Patients can book appointments, doctors manage their schedule and consultations, and admins oversee everything through a dashboard.

Built as a university project (Université du Québec à Montréal) with a Java/Spring Boot back-end and a Next.js front-end.

---

## Tech Stack

**Back-end**
- Java 21 + Spring Boot 3.4
- Spring Security (RBAC — 3 roles: Admin, Doctor, Patient)
- Spring Data JPA + MySQL
- Twilio (SMS notifications)
- Spring Mail (email notifications)
- Maven

**Front-end**
- Next.js 15 (TypeScript)
- Tailwind CSS
- shadcn/ui

---

## Features

**Patients**
- Register and log in with a medical card number
- Book appointments with available doctors
- View appointment history and status
- Receive SMS + email confirmations automatically

**Doctors**
- Log in with a PIN code
- View today's scheduled appointments
- Complete consultations (add medical notes and prescriptions)
- Mark unavailability — bulk cancels affected appointments and notifies patients

**Admin**
- Dashboard with all appointments
- Approve, cancel, or manage appointments
- Access protected by a passkey filter (separate from standard auth)

**Automated**
- Daily cron job at 8am sends 48h reminders to patients (SMS + email)
- Expired appointments auto-flagged as `NOSHOW`
- Patients with 3 consecutive no-shows are suspended from online booking

---

## Appointment Lifecycle

```
SCHEDULED → COMPLETED   (doctor completed the consultation)
          → CANCELLED    (cancelled by patient or admin)
          → ABSENT       (doctor was unavailable)
          → NOSHOW       (patient didn't show up — auto-detected)
```

---

## Project Structure

```
carepulse/
├── src/main/java/regulier/groupe5/carepulse/
│   ├── config/         # Spring Security config, admin passkey filter
│   ├── controller/     # REST controllers (appointments, patients, doctors...)
│   ├── entity/         # JPA entities (Appointment, Patient, Doctor...)
│   ├── repository/     # Spring Data JPA repositories
│   └── service/        # Business logic, email/SMS, scheduled tasks
├── front-end/          # Next.js app
│   ├── app/            # Pages (admin, patient portal, doctor portal...)
│   └── components/     # Shared UI components and forms
└── init_db_v3.sql      # Database initialization script
```

---

## Getting Started

### Prerequisites

- Java 21
- Maven
- MySQL 8+
- Node.js 18+
- A Twilio account (for SMS) — optional, app works without it
- A Mailtrap or SMTP account (for email) — optional

### 1. Database

```sql
mysql -u root -p < init_db_v3.sql
```

Or create the database manually and let Hibernate handle the schema (`ddl-auto=update`).

### 2. Back-end

Set environment variables before running (or add them to `application.properties` locally — don't commit credentials):

```bash
export TWILIO_ACCOUNT_SID=your_sid
export TWILIO_AUTH_TOKEN=your_token
export TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
export MAIL_USERNAME=your_email
export MAIL_PASSWORD=your_password
```

Then:

```bash
./mvnw spring-boot:run
```

API runs on `http://localhost:8080`.

### 3. Front-end

```bash
cd front-end
npm install
npm run dev
```

App runs on `http://localhost:3000`.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/appointments` | All appointments (admin) |
| POST | `/api/appointments` | Create appointment + notify patient |
| PATCH | `/api/admin/appointments/{id}/status` | Update status (SCHEDULED / CANCELLED) |
| PATCH | `/{id}/consultation` | Complete consultation with notes |
| POST | `/doctor/{doctorId}/bulk-cancel` | Bulk cancel by dates |
| GET | `/doctor/{doctorId}?date=today` | Today's appointments for a doctor |

Full route security is handled by Spring Security — each role only accesses its own routes.

---

## Notes

- Passwords are hashed with BCrypt. Lombok was intentionally removed from the project — all getters/setters are written manually to keep the code transparent for a course context.
- The admin passkey filter is a custom `OncePerRequestFilter` that runs before the standard auth chain.
- CORS is configured for `localhost:3000` only — update `SecurityConfig` for deployment.

---

## Authors

Built by a team of 5 students (Group 5) — INF2050 / UQAM, 2025.

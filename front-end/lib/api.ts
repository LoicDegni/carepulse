// api.ts
const BASE_URL = "http://localhost:8080";
const ADMIN_PASSKEY = "111111";

export type PatientPayload = {
  medicalCardNumber: string;
  username: string;
  pwd: string;                  // obligatoire, map du password
  surname: string;
  name: string;                 // map du lastName
  dateOfBirth: string;
  email: string;
  tel: string;                  // map du phone
  address: string;
  medicalInfos?: string;
  emergencyContact?: string;
};

export type Appointment = {
  id: number;
  date: string;
  reason: string;
  status: "SCHEDULED" | "PENDING" | "CANCELLED";
  doctorId: number;
  note?: string;
};

export async function getPatient(){
  const res = await fetch(`${BASE_URL}/api/patients/me`, {
    credentials: "include"
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des patients");
  return res.json();
}

export async function getPatientByMedicalCardNumber(medicalCardNumber: string): Promise<PatientPayload> {
  const res = await fetch(`${BASE_URL}/api/patients/${medicalCardNumber}`);
  if (!res.ok) throw new Error("Patient non trouvé");
  return res.json();
}

export async function createPatient(data: PatientPayload): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  console.log('res.status: %d', res.status)

  if (res.status === 409) {
    const message = await res.json();
    throw new Error(message.message || "Patient existe déjà");
  }

  if (!res.ok) throw new Error("Erreur lors de la création du patient");
}

export const getAppointmentDetails = async (appointmentId: number) => {
  const res = await fetch(
    `http://localhost:8080/api/patient/history/details/${appointmentId}`,
    {
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("Erreur récupération détails");
  }

  return res.json();
};

export async function updatePatientAppointmentStatus(
  id: string,
  status: "SCHEDULED" | "CANCELLED"
) {
  const res = await fetch(`${BASE_URL}/api/patients/appointments/${id}/status`, {
      body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Erreur lors de la mise à jour du statut");
  return res.json();
}

export const getPatientAppointmentDetails = async (
  appointmentId: number,
  medicalCardNumber: string
) => {
  const res = await fetch(
    `http://localhost:8080/api/patient/history/details/${appointmentId}?medicalCardNumber=${medicalCardNumber}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("Impossible de récupérer les détails du rendez-vous");
  }

  return res.json();
};

export async function getPatientAppointments() {
  const res = await fetch(`${BASE_URL}/api/patients/appointments`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des rendez-vous");
  return res.json();
}

const adminHeaders = {
  "Content-Type": "application/json",
  "X-Admin-Passkey": ADMIN_PASSKEY,
};

export async function getAppointments() {
  const res = await fetch(`${BASE_URL}/api/admin/appointments`, {
      headers: adminHeaders,
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des rendez-vous");
  return res.json();
}

export async function updateAppointmentStatus(
  id: string,
  status: "SCHEDULED" | "CANCELLED"
) {
  const res = await fetch(`${BASE_URL}/api/admin/appointments/${id}/status`, {
      method: "PATCH",
      headers: adminHeaders,
      body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Erreur lors de la mise à jour du statut");
  return res.json();
}


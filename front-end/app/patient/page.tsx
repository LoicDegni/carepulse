"use client"
import Link from "next/link";
import { Fragment } from "react";
import { useEffect, useState } from "react"
import { LogOut, Calendar1, User } from "lucide-react";
import { getPatientAppointments, updatePatientAppointmentStatus, getPatient, getPatientAppointmentDetails, getLoginState } from "@/lib/api"
import { useRouter } from "next/navigation"

type Doctor = {
    id: number;
    name: string;
    specialty: string;
  };
  
  type Appointment = {
    id: string;
    date: string;
    reason: string;
    status: "ABSENT" | "SCHEDULED" | "CANCELLED" | "COMPLETED" | "NOSHOW"
    note?: string;
  
    doctor: Doctor;
  };

type Patient = {
    medicalCardNumber: string;
    username: string;
    surname: string;
    name: string;
    dateOfBirth: string;
    email: string;
};

export const getCurrentPatient = async () => {
    const res = await fetch("http://localhost:8080/api/patients/me", {
        credentials: "include"
    });

    if (!res.ok) {
        throw new Error("Impossible de récupérer le patient");
    }

    const patient = await res.json();

    return patient;
};

const PatientPage = () => {
    const [authChecked, setAuthChecked] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [patient, setPatient] = useState<Patient | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const router = useRouter()

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
    
                const data = await getPatient();
                setPatient(data);
    
                await fetchAppointments();
    
            } catch (e) {
                setError("Vous devez être connecté");
                router.push("/");
            } finally {
                setAuthChecked(true);
                setLoading(false);
            }
        };
    
        init();
    }, []);
    
    const fetchAppointments = async () => {
        try {
            const data = await getPatientAppointments();
            setAppointments(data);
            console.log(data)
        } catch (err: any) {
            if (err.message.includes("403")) {
                setError("Vous devez être connecté");
            } else {
                setError("Impossible de charger les rendez-vous");
            }
        }
    };

    const upcomingAppointments = appointments.filter(
    (appt) => new Date(appt.date) >= new Date()
    );

    if (loading) {
        return (
            <div className="text-white text-center">
                Chargement...
            </div>
        )
    }
    return (
    <main className="flex flex-col items-center space-y-6 min-h-full">
        {/* Header de page (titre seulement) */}
        <section className="w-full space-y-4 border-b pb-4">
            <h1 className="header text-white">Tableau de bord</h1>
        </section>

        <section className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-6 p-4 min-h-[250px]">
  
        <div className="bg-dark-200 h-full rounded-xl p-6 shadow-md flex items-center gap-6">
            <div className="p-10 rounded-full bg-dark-300">
                <User className="h-20 w-20 text-green-500" />
            </div>

            <div className="flex flex-col">
                <p className="text-white font-semibold text-lg">{patient?.surname} {patient?.name}</p>
                <p className="text-gray-400 text-sm">{patient?.dateOfBirth}</p>
            </div>
        </div>

        <div className=" rounded-xl p-6 shadow-md flex items-center justify-center">
            <Link href="/appointmentHistory">
                <button className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl text-lg font-semibold transition">
                    <Calendar1 className="w-6 h-6" />
                    Prendre un rendez-vous
                </button>
            </Link>
        </div>
        </section>
        {/* Push vers le bas */}
        <div className="flex-1 w-full"></div>
        <div className="flex-1 w-full"></div>
        

      {/* Section bottom */}
    <section className="w-full p-4 ">
    <h2 className="text-center text-lg font-semibold text-white mb-4">
        Prochain rendez-vous
    </h2>
        <div className="w-full bg-dark-200 rounded-xl p-4 shadow-md">
            <table className="w-full text-sm text-white">
                                <thead className="bg-dark-400 text-dark-700">
                                <tr>
                                    <th className="px-4 py-3 text-left">Médecin</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">Raison</th>
                                    <th className="px-4 py-3 text-left">Statut</th>
                                </tr>
                                </thead>
                                    <tbody>
                                    {upcomingAppointments.map((appt) => (
    <Fragment key={appt.id}>
        <tr
            key={appt.id}
            onClick={() =>
                setExpandedId(expandedId === appt.id ? null : appt.id)
            }
            className="border-t border-dark-400 hover:bg-dark-400 cursor-pointer transition-colors"
        >
            <td className="px-4 py-3">{appt.doctor.name}</td>
            <td className="px-4 py-3">
                {new Date(appt.date).toLocaleString("fr-CA")}
            </td>
            <td className="px-4 py-3">{appt.reason}</td>
            <td className="px-4 py-3">
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appt.status === "SCHEDULED"
                    ? "bg-green-500/20 text-green-400"
                    : appt.status === "COMPLETED"
                    ? "bg-blue-500/20 text-blue-400"
                    : appt.status === "CANCELLED"
                    ? "bg-red-500/20 text-red-400"
                    : appt.status === "NOSHOW"
                    ? "bg-orange-500/20 text-orange-400"
                    : appt.status === "ABSENT"
                    ? "bg-gray-500/20 text-gray-300"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
            >
            {appt.status}
            </span>
            </td>
        </tr>

        {/* ROW DÉTAILS (EXPAND) */}
        {expandedId === appt.id && (
            <tr className="bg-dark-300">
                <td colSpan={4} className="px-6 py-4 text-white">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-400 text-sm">Médecin</p>
                            <p className="text-white">{appt.doctor.name}</p>
                        </div>

                        <div>
                            <p className="text-gray-400 text-sm">Spécialité</p>
                            <p className="text-white">{appt.doctor.specialty}</p>
                        </div>

                        <div>
                            <p className="text-gray-400 text-sm">Raison</p>
                            <p className="text-white">{appt.reason}</p>
                        </div>

                        <div>
                            <p className="text-gray-400 text-sm">Statut</p>
                            <p className="text-white">{appt.status}</p>
                        </div>

                        {appt.note && (
                            <div className="col-span-2">
                                <p className="text-gray-400 text-sm">Note</p>
                                <p className="text-white">{appt.note}</p>
                            </div>
                        )}
                    </div>
                </td>
            </tr>
        )}
    </Fragment>
))}
                                    </tbody>
                            </table>
        </div>
    </section>
   
    </main>
    )
}

  
export default PatientPage
  
"use client"
import { useEffect, useState } from "react"
import { Fragment } from "react";
import { LogOut, Calendar1, User } from "lucide-react";
import { getPatientAppointments, updatePatientAppointmentStatus, getPatient } from "@/lib/api"
import Link from "next/link";
import { useRouter } from "next/navigation"

export default function appointmentHistory() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null)
    const [authChecked, setAuthChecked] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

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

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                await fetchAppointments();
    
            } catch (e) {
                setError("Vous devez être connecté");
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
        } catch (err: any) {
            if (err.message.includes("403")) {
                router.push("/");
                setError("Vous devez être connecté");
            } else {
                setError("Impossible de charger les rendez-vous");
            }
        }
    };

    const pastAppointments = appointments.filter(
        (appt) => new Date(appt.date) < new Date()
    );
    console.log(pastAppointments.length)

    const upcomingAppointments = appointments.filter(
    (appt) => new Date(appt.date) >= new Date()
    );

    return (
        <main className="flex flex-col items-center space-y-6 min-h-full">
            {/* Header de page (titre seulement) */}
            <section className="w-full space-y-4 border-b pb-4">
                <h1 className="header text-white">Rendez-vous</h1>
            </section>

            <section className="flex justify-center w-full pt-4"> 
                <div className=" rounded-xl p-6 shadow-md flex items-center justify-center">
                    <Link href="/appointment">
                        <button className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl text-lg font-semibold transition">
                            <Calendar1 className="w-6 h-6" />
                            Prendre un rendez-vous
                        </button>
                    </Link>
                </div>
            </section>

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
                                                {upcomingAppointments.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="text-center py-10 text-dark-600">
                                                            Aucun rendez-vous
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    upcomingAppointments.map((appt) => ( 
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
                                                    ))
                                                )}
                                                </tbody>
                                        </table>
                    </div>
                </section>

                <section className="w-full p-4 ">
                    <h2 className="text-center text-lg font-semibold text-white mb-4">
                        Historique des rendez-vous
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
                                                {pastAppointments.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="text-center py-10 text-dark-600">
                                                            Aucun rendez-vous
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    pastAppointments.map((appt) => (
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
                                                    ))
                                                )}
                                                </tbody>
                                        </table>
                    </div>
                </section>
        </main>
    )
}
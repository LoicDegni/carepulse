"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarCheck, Ban } from "lucide-react"

import StatCard from "@/components/StatCard"
import Navbar from "@/components/Navbar"
import { getAppointments, updateAppointmentStatus } from "@/lib/api"

type Patient = {
    medicalCardNumber: string
    username: string | null
    surname: string
    name: string
    dateOfBirth: string
    email: string
    tel: string
    address: string | null
    medicalInfos: string | null
    emergencyContact: string | null
}

type Doctor = {
    id: number
    name: string
    specialty: string
    imageUrl: string
}

type Appointment = {
    id: string
    date: string
    status: "SCHEDULED" | "CANCELLED"
    reason: string
    note: string | null
    medicalNotes: string | null
    prescription: string | null
    patient: Patient
    doctor: Doctor
}

type StatusFilter = "ALL" | "SCHEDULED" | "CANCELLED"

const statusLabels: Record<StatusFilter, string> = {
    ALL: "Tous",
    SCHEDULED: "Confirmés",
    CANCELLED: "Annulés",
}

const AdminDashboard = () => {
    const router = useRouter()
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL")
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (typeof window !== "undefined") {
            const accessKey = sessionStorage.getItem("adminAccessKey")
            if (!accessKey) {
                router.push("/admin")
            } else {
                setIsAuthorized(true)
                fetchAppointments()
            }
        }
    }, [router])

    const fetchAppointments = async () => {
        try {
            setLoading(true)
            const data = await getAppointments()
            setAppointments(data)
        } catch (err) {
            setError("Impossible de charger les rendez-vous")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (id: string, status: "SCHEDULED" | "CANCELLED") => {
        try {
            await updateAppointmentStatus(id, status)
            await fetchAppointments()
        } catch (err) {
            console.error(err)
        }
    }

    const scheduledCount = appointments.filter((a) => a.status === "SCHEDULED").length
    const cancelledCount = appointments.filter((a) => a.status === "CANCELLED").length

    const filteredAppointments = appointments.filter((appt) => {
        const matchesFilter = activeFilter === "ALL" || appt.status === activeFilter

        if (!searchQuery.trim()) return matchesFilter

        const query = searchQuery.toLowerCase()
        const patientName = `${appt.patient.surname} ${appt.patient.name}`.toLowerCase()
        const doctorName = appt.doctor.name.toLowerCase()
        const matchesSearch =
            patientName.includes(query) ||
            doctorName.includes(query) ||
            appt.patient.medicalCardNumber.toLowerCase().includes(query) ||
            appt.reason.toLowerCase().includes(query)

        return matchesFilter && matchesSearch
    })

    if (!isAuthorized) return null

    return (
        <div className="flex flex-col min-h-screen bg-dark-300">
            <Navbar userRole="admin" />
            <div className="mx-auto w-full max-w-7xl flex-1 flex flex-col space-y-14 px-6 py-8">
                <section className="w-full space-y-4">
                    <h1 className="text-32-bold text-white">Bienvenue !</h1>
                    <p className="text-dark-700">Gérez les rendez-vous et suivez l&apos;activité de la clinique.</p>
                </section>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <StatCard type="appointments" count={scheduledCount} label="Rendez-vous confirmés" icon={CalendarCheck} />
                    <StatCard type="cancelled" count={cancelledCount} label="Annulés" icon={Ban} />
                </section>

                <section className="w-full space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-2">
                            {(Object.keys(statusLabels) as StatusFilter[]).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setActiveFilter(status)}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                        activeFilter === status
                                            ? "bg-green-600 text-white"
                                            : "bg-dark-400 text-dark-700 hover:bg-dark-500"
                                    }`}
                                >
                                    {statusLabels[status]}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher par nom, médecin, carte médicale..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="rounded-lg border border-dark-400 bg-dark-400 px-4 py-2 text-sm text-white placeholder-dark-700 outline-none focus:border-green-500 sm:w-80"
                        />
                    </div>

                    {loading ? (
                        <p className="text-dark-600 text-center py-10">Chargement...</p>
                    ) : error ? (
                        <p className="text-red-500 text-center py-10">{error}</p>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-dark-400">
                            <table className="w-full text-sm text-white">
                                <thead className="bg-dark-400 text-dark-700">
                                <tr>
                                    <th className="px-4 py-3 text-left">Patient</th>
                                    <th className="px-4 py-3 text-left">Médecin</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">Raison</th>
                                    <th className="px-4 py-3 text-left">Statut</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredAppointments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-dark-600">
                                            Aucun rendez-vous
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAppointments.map((appt) => (
                                        <tr key={appt.id} className="border-t border-dark-400 hover:bg-dark-400 transition-colors">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium">{appt.patient.surname} {appt.patient.name}</p>
                                                    <p className="text-xs text-dark-700">{appt.patient.medicalCardNumber}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium">{appt.doctor.name}</p>
                                                    <p className="text-xs text-dark-700">{appt.doctor.specialty}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {new Date(appt.date).toLocaleDateString("fr-CA",
                                                    { day: "numeric", month: "long", year: "numeric" })}{" à "}
                                                {new Date(appt.date).toLocaleTimeString("fr-CA",
                                                    { hour: "2-digit", minute: "2-digit", hour12: false })}
                                            </td>
                                            <td className="px-4 py-3">{appt.reason}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    appt.status === "SCHEDULED" ? "bg-green-500/20 text-green-400" :
                                                        "bg-red-500/20 text-red-400"
                                                }`}>
                                                    {appt.status === "SCHEDULED" ? "Confirmé" : "Annulé"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 flex gap-2">
                                                {appt.status !== "CANCELLED" ? (
                                                    <button
                                                        onClick={() => handleStatusChange(appt.id, "CANCELLED")}
                                                        className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded text-white"
                                                    >
                                                        Annuler
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-dark-700">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default AdminDashboard

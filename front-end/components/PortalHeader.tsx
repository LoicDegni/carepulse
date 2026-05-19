"use client"
import Link from "next/link";
import { useEffect, useState } from "react"
import { LogOut, Calendar1, User } from "lucide-react";
import {getPatient } from "@/lib/api"
import { useRouter } from "next/navigation";

export default function PortalHeader() {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    type Patient = {
        medicalCardNumber: string;
        username: string;
        surname: string;
        name: string;
        dateOfBirth: string;
        email: string;
    };

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const data = await getPatient();
                setPatient(data); 
                console.log(data)
    
            } catch (e) {
                setError("Vous devez être connecté");
            } finally {
                setAuthChecked(true);
                setLoading(false);
            }
        };
    
        init();
    }, []);

    const handleLogout = async () => {
        await fetch("http://localhost:8080/api/logout", {
            method: "POST",
            credentials: "include",
        });

        router.replace("/");
    };

    const handleAppointmentHistory = async () => {
        router.push("/appointmentHistory");
    };

    const handlePortalHome = async () => {
        router.push("/patient");
    };

    return (
        //<header className="sticky top-3 z-20 mx-3 flex items-center justify-between rounded-2xl bg-sidebar px-6 py-4 shadow-lg">
        <header className="patient-header">    
            <Link href="/" className="cursor-pointer">
                <h1 className="text-24-bold text-green-500">
                    PlanCare
                </h1>
            </Link>

            <div className="flex items-center gap-3">
                <button
                    onClick={handlePortalHome}
                    className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-4 py-2 text-sm text-sidebar-foreground hover:opacity-80 transition">
                    <User className="h-4 w-4" />
                    {patient?.surname}
                </button>
                
                <button
                    onClick={handleAppointmentHistory} //Implementer page rendez-vous
                    className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-4 py-2 text-sm text-sidebar-foreground hover:opacity-80 transition">
                    <Calendar1 className="h-4 w-4" />
                    RENDEZ-VOUS
                </button>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-4 py-2 text-sm text-sidebar-foreground hover:opacity-80 transition">
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                </button>
            </div>
        </header>
    );
}
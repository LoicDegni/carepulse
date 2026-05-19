"use client"

import "react-big-calendar/lib/css/react-big-calendar.css"
import { useState } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"


import { format, parse, startOfWeek, getDay } from "date-fns"
import { fr } from "date-fns/locale"

const locales = {
    fr: fr,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

const messages = {
    date: "Date",
    time: "Heure",
    event: "Rendez-vous",
    allDay: "Toute la journée",
    week: "Semaine",
    work_week: "Semaine de travail",
    day: "Jour",
    month: "Mois",
    previous: "Précédent",
    next: "Suivant",
    yesterday: "Hier",
    tomorrow: "Demain",
    today: "Aujourd'hui",
    agenda: "Agenda",
    noEventsInRange: "Aucun rendez-vous",
}


// EVENT POUR TEST A ENLEVER !!!!!!!!!!!!!
const today = new Date()
const tomorrow = new Date()
tomorrow.setDate(today.getDate() + 1)

const initialEvents = [
  // AUJOURD’HUI
  {
    id: 1,
    title: "Frodo Baggins",
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
    status: "pending",
  },
]

const EventComponent = ({ event }: any) => {
    return (
        <div className="flex items-center justify-between gap-2 text-xs w-full">

            <div className="flex flex-col">
                <span className="font-semibold">{event.title}</span>

                <span>
                    {event.status === "pending" && "En attente"}
                    {event.status === "confirmed" && "Confirmé"}
                    {event.status === "cancelled" && "Annulé"}
                </span>
            </div>

            {event.status === "pending" && event.currentView === "agenda" && (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            event.onConfirmDay(event.start)
                        }}
                        className="bg-green-500 px-2 py-1 rounded text-white text-xs"
                    >
                        Confirmer jour
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            event.onCancelDay(event.start)
                        }}
                        className="bg-red-500 px-2 py-1 rounded text-white text-xs"
                    >
                        Annuler jour
                    </button>
                </div>
            )}
        </div>
    )
}

export default function DoctorCalendar() {

    const [eventsState, setEventsState] = useState(initialEvents)
    const [currentView, setCurrentView] = useState("month")

    // SEARCH
    const [searchTerm, setSearchTerm] = useState("")

    const handleConfirmDay = (date: Date) => {
        setEventsState((prev) =>
            prev.map((e) =>
                e.start.toDateString() === date.toDateString()
                    ? { ...e, status: "confirmed" }
                    : e
            )
        )
    }

    const handleCancelDay = (date: Date) => {
        setEventsState((prev) =>
            prev.map((e) =>
                e.start.toDateString() === date.toDateString()
                    ? { ...e, status: "cancelled" }
                    : e
            )
        )
    }

    const eventsWithActions = eventsState.map((e) => ({
        ...e,
        onConfirmDay: handleConfirmDay,
        onCancelDay: handleCancelDay,
        currentView,
    }))

    // FILTRAGE PAR NOM
    const filteredEvents = eventsWithActions.filter((e) =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const eventStyleGetter = (event: any) => {
        let backgroundColor = "#3b82f6"

        if (event.status === "confirmed") backgroundColor = "#16a34a"
        if (event.status === "pending") backgroundColor = "#eab308"
        if (event.status === "cancelled") backgroundColor = "#dc2626"

        return {
            style: {
                backgroundColor,
                borderRadius: "8px",
                color: "black",
                border: "none",
                padding: "4px",
            },
        }
    }

    return (
        <div className="bg-emerald-950 p-6 rounded-2xl space-y-4">

            {/* BARRE DE RECHERCHE */}
            <input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-emerald-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}

                eventPropGetter={eventStyleGetter}

                views={["month", "agenda"]}
                defaultView="month"

                messages={messages}
                culture="fr"

                components={{
                    event: EventComponent,
                }}

                onView={(view) => setCurrentView(view)}
            />
        </div>
    )
}
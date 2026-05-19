"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const formSchema = z.object({
  doctor: z.string().min(1, "Choisissez un médecin"),
  date: z.date(),
  time: z.string().min(1, "Choisissez une heure"),
})

type FormData = z.infer<typeof formSchema>

type Doctor = {
  id : number;
  name : string;
};

export default function AppointmentForm() {

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  // Gestion message recu pour l'ajout/refus de rdv
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [message, error]);
  

  async function onSubmit(values: FormData) {
    setMessage(null)
    setError(null)
    console.log(values)
    try {
          const response = await fetch("http://localhost:8080/api/patients/appointment", {
              method: "POST",
              credentials: "include",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  doctorId: values.doctor,
                  date: values.date.toISOString().split("T")[0],
                  time: values.time
              })
          });

          if (!response.ok) {
              // Possible d'indiquer que c'est impossible d'inscrire le rendez-vous
              console.log("Appointment Fail!");

              const result = await response.json();
              throw new Error(result.message);
          }

          //router.push("/...") //Main page
          console.log("Appointment success! Indicate success");
          //alert("Votre rendez-vous a été enregistré.");
          setMessage("Rendez-vous enregistré avec succès !");
      } catch (err : any) {
          // Afiché pourquoi on peut pas ajouter le rdv
          console.log(err.message)
          //alert(err.message);
          setError(err.message);
      }
  
  }


  // Récupérer les specialités 
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
          const response = await fetch("http://localhost:8080/api/doctors/specialties", {
              method: "GET",
              
          });

          if (!response.ok) {
              // Docteurs non récupérer
              console.log("Failed to get specialties");
              return;
          }

          const data = await response.json();
          //console.log("SPECIALTIES:", data);
          setSpecialties(data.specialties);
      } catch (err) {
          console.log(err)
      }
    };

    fetchSpecialties();
  }, []);

  // Récupérer les docteurs de la BD (par spécialité)
  
  //const [doctors, setDoctors] = useState<Doctor[]>([string specialty]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    if (!selectedSpecialty) {
      setDoctors([]);
      return;
    }
    const fetchDoctors = async () => {
      try {
          const response = await fetch(`http://localhost:8080/api/doctors/specialty/${selectedSpecialty}`, {
              method: "GET",
              
          });

          if (!response.ok) {
              // Docteurs non récupérer
              console.log("Failed to get doctors");
              return;
          }

          const data = await response.json();
          setDoctors(data)
      } catch (err) {
          console.log(err)
      }
    };

    fetchDoctors();
  }, [selectedSpecialty]);
  
  // Revoir... n'affiche pas correctement les élément placeholder
  // Changer la spécialité demande de refaire les choix docteur/date/heure
  useEffect(() => {
    form.reset()
  }, [selectedSpecialty]);

  const selectedDoctor = form.watch("doctor");

  // Changer le docteur demande de refaire les choix date/heure
  useEffect(() => {
    form.resetField("date");
    form.resetField("time");
  }, [selectedDoctor]);

  // Changer la date demande de refaire le choix d'heure
  const selectedDate = form.watch("date");
  useEffect(() => {
    form.resetField("time");
  }, [selectedDate]);
  

  

  return (
    <Card className="w-full max-w-md bg-emerald-950 text-white">
      <CardHeader>
        <CardTitle>Prendre un rendez-vous</CardTitle>
        <CardDescription>
          Choisissez un médecin, une date et une heure.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="appointment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* SPECIALTIES */}
          <div>
            <label className="text-sm">Spécialité</label>

            <Select
              onValueChange={(value) => setSelectedSpecialty(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une spécialité" />
              </SelectTrigger>

              <SelectContent className="bg-emerald-900 text-white">
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* DOCTOR */}
          <Controller
            name="doctor"
            control={form.control}
            render={({ field }) => (
              <div>
                <label className="text-sm">Médecin</label>

                <Select onValueChange={field.onChange} disabled={!selectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un médecin" />
                  </SelectTrigger>

                  <SelectContent className="bg-emerald-900 text-white" >
                    {/* RAJOUTER LES DOCTEURS */}
                    {doctors.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id.toString()}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          {/* DATE PICKER */}
          <Controller
            name="date"
            control={form.control}
            render={({ field }) => (
              <div className="flex flex-col">
                <label className="text-sm mb-2">Date</label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={!selectedDoctor}
                      className={cn(
                        "justify-start text-left",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(field.value, "PPP")
                        : "Choisir une date"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0 bg-emerald-900 text-white">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || !form.watch("doctor")
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          />

          {/* TIME SELECT */}
          <Controller
            name="time"
            control={form.control}
            render={({ field }) => (
              <div>
                <label className="text-sm">Heure</label>

                <Select onValueChange={field.onChange} disabled={!form.watch("doctor") || !form.watch("date")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une heure" />
                  </SelectTrigger>

                  <SelectContent className="bg-emerald-900 text-white">
                    <SelectItem value="08:00">08:00</SelectItem>
                    <SelectItem value="08:30">08:30</SelectItem>
                    <SelectItem value="09:00">09:00</SelectItem>
                    <SelectItem value="09:30">09:30</SelectItem>
                    <SelectItem value="10:00">10:00</SelectItem>
                    <SelectItem value="10:30">10:30</SelectItem>
                    <SelectItem value="11:00">11:00</SelectItem>
                    <SelectItem value="11:30">11:30</SelectItem>
                    <SelectItem value="12:00">12:00</SelectItem>
                    <SelectItem value="12:30">12:30</SelectItem>
                    <SelectItem value="13:00">13:00</SelectItem>
                    <SelectItem value="13:30">13:30</SelectItem>
                    <SelectItem value="14:00">14:00</SelectItem>
                    <SelectItem value="14:30">14:30</SelectItem>
                    <SelectItem value="15:00">15:00</SelectItem>
                    <SelectItem value="15:30">15:30</SelectItem>
                    <SelectItem value="16:00">16:00</SelectItem>
                    <SelectItem value="16:30">16:30</SelectItem>
                    <SelectItem value="17:00">17:00</SelectItem>
                    <SelectItem value="17:30">17:30</SelectItem>
                    <SelectItem value="18:00">18:00</SelectItem>
                    <SelectItem value="18:30">18:30</SelectItem>
                    <SelectItem value="19:00">19:00</SelectItem>
                    <SelectItem value="19:30">19:30</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          />

        </form>
        {message && (
        <div className="bg-green-600 text-white p-2 rounded">
          {message}
        </div>
        )}

        {error && (
          <div className="bg-red-600 text-white p-2 rounded">
            {error}
          </div>
        )}
      </CardContent>

      

      <CardFooter>
        <Button form="appointment-form" type="submit" className="w-full bg-emerald-400 hover:bg-emerald-300 text-black"
          disabled={!form.watch("doctor") || !form.watch("date") || !form.watch("time")}
        >
          Confirmer le rendez-vous
        </Button>
      </CardFooter>
    </Card>
  )
}
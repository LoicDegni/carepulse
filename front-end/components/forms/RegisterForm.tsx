"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import { fr } from "date-fns/locale";
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createPatient, PatientPayload } from "@/lib/api"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { useState } from "react";


/* ---------- SCHEMA ZOD ---------- */
const formSchema = z.object({
    medicalCardNumber: z
        .string()
        .regex(/^[A-Za-z]{4}\d{8}$/, "Numéro de carte médicale invalide (ex: ABCD12345678)"),
    surname: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    dateOfBirth: z.date(),
    email: z.string().email("Email invalide"),
    phone: z.string().length(10, "Numéro de téléphone invalide"),
    civicNumber: z.string().min(1, "Le numéro civique est requis"),
    street: z.string().min(1, "Le nom de la rue est requise"),
    apartment: z.string().optional(),
    postalCode: z.string()
        .regex(/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/, "Code postal invalide (ex: H1A 2B3 ou H1A2B3)"),
    city: z.string().min(1, "La ville est requise"),
    username: z.string()
        .min(6, "L'identifiant doit contenir au moin 6 caractères")
        .max(25, "L'identifiant ne doit pas dépasser 25 caractères"),
    password: z.string()
        .min(6, "Le mot de passe doit contenir au moins 6 caractères")
        .max(25, "Le mot de passe ne doit pas dépasser 25 caractères"),
    confirmPassword: z.string().min(1, "La confirmation est requise"),
    medical_infos: z.string().optional(),
    emergency_contact: z.string().length(10, "Numéro d'urgence invalide"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
})

/* ---------- FORMULAIRE ---------- */
export default function RegisterForm() {
    const router = useRouter()
    const handleSubmission = () => {
        // Après 1.5 secondes, redirection vers la page d'accueil
        setTimeout(() => {
          router.push("/")
        }, 1500)
    }
    // Pour afficher erreur lors de soumission d'un nouvel utilisateur
    const [registerError, setRegisterError] = useState<string | null>(null);
    

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            medicalCardNumber: "",
            surname: "",
            lastName: "",
            dateOfBirth: undefined,
            email: "",
            phone: "",
            civicNumber: "",
            street: "",
            apartment: "",
            postalCode: "",
            city: "",
            username: "",
            password: "",
            confirmPassword: "",
            medical_infos: "",
            emergency_contact: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        // Construire l'adresse complète
        const addressLine = data.apartment
            ? `${data.apartment}-${data.civicNumber} ${data.street}`
            : `${data.civicNumber} ${data.street}`;
        const fullAddress = `${addressLine}, ${data.postalCode}, ${data.city}`;

        // Création du payload camelCase pour TypeScript
        const payload: PatientPayload = {
            medicalCardNumber: data.medicalCardNumber,
            username: data.username,
            pwd: data.password,
            surname: data.surname,
            name: data.lastName,
            dateOfBirth: data.dateOfBirth.toISOString().split("T")[0],
            email: data.email,
            tel: data.phone,
            address: fullAddress,
            medicalInfos: data.medical_infos,
            emergencyContact: data.emergency_contact,
        };

        try {
            console.log(payload);
            setRegisterError(null);
            await createPatient(payload);
            console.log("Payload envoyé :", payload)
            handleSubmission()
            //router.push("/")
            console.log("Patient ajouté avec succès !")
        } catch (err: any) {
            setRegisterError(err.message);
            //console.error("Erreur lors de la création du patient :", err.message)
        }
    }

    return (
        <Card className="w-full max-w-4xl bg-emerald-950 border-dark-500 shadow-lg rounded-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Créer un compte</CardTitle>
                <CardDescription className="text-gray-300">
                    Remplissez le formulaire ci-dessous
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 p-8">
                <form id="register-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* ---------- SÉCURITÉ ---------- */}
                    <FieldGroup title="Sécurité">
                        <Controller
                            name="username"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-white">Identifiant *</FieldLabel>
                                    <Input {...field} placeholder="utilisateur" className="text-white placeholder-gray-300" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-white">Mot de passe *</FieldLabel>
                                    <Input {...field} type="password" placeholder="mot de passe" className="text-white placeholder-gray-300" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="confirmPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-white">Confirmez le mot de passe *</FieldLabel>
                                    <Input {...field} type="password" placeholder="mot de passe" className="text-white placeholder-gray-300" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    {/* ---------- INFORMATIONS PERSONNELLES ---------- */}
                    <FieldGroup title="Informations personnelles">
                        <Controller
                            name="medicalCardNumber"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-white">Numéro d'assurance maladie *</FieldLabel>
                                    <Input {...field} placeholder="ABCD12345678" className="text-white placeholder-gray-300" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="surname"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-white">Prénom *</FieldLabel>
                                    <Input {...field} placeholder="prénom" className="text-white placeholder-gray-300" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="lastName"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-white">Nom *</FieldLabel>
                                    <Input {...field} placeholder="nom" className="text-white placeholder-gray-300" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="dateOfBirth"
                            control={form.control}
                            render={({ field }) => (
                                <div className="flex flex-col">
                                    <label className="text-sm mb-2">Date de naissance *</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "justify-start text-left",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value
                                                    ? format(new Date(field.value), "P", { locale: fr })
                                                    : "JJ/MM/AAAA"}
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-auto p-0 bg-emerald-900 text-white">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                captionLayout="dropdown"
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        />
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-white">Email *</FieldLabel>
                                    <Input {...field} placeholder="couriel@mail.ca" className="text-white placeholder-gray-300" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="phone"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-white">Téléphone *</FieldLabel>
                                    <Input {...field} placeholder="5140001234" className="text-white placeholder-gray-300" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    {/* ---------- ADRESSE ---------- */}
                    <FieldGroup title="Adresse">
                        <Controller
                            name="civicNumber"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-white">Numéro civique *</FieldLabel>
                                    <Input {...field} placeholder="Numéro civic" className="text-white placeholder-gray-300" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="street"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-white">Nom de Rue *</FieldLabel>
                                    <Input {...field} placeholder="Rue" className="text-white placeholder-gray-300" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="apartment"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-white">Numéro d'appartement</FieldLabel>
                                    <Input {...field} placeholder="Numéro d'apartement" className="text-white placeholder-gray-300" />
                                </Field>
                            )}
                        />
                        <Controller
                            name="postalCode"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-white">Code postal *</FieldLabel>
                                    <Input {...field} placeholder="A1B 2C3" className="text-white placeholder-gray-300" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="city"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-white">Ville *</FieldLabel>
                                    <Input {...field} placeholder="Ville" className="text-white placeholder-gray-300" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    {/* ---------- INFORMATIONS MÉDICALES ---------- */}
                    <FieldGroup title="Informations médicales">
                        <Controller
                            name="medical_infos"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel className="text-white">Infos médicales</FieldLabel>
                                    <Input {...field} placeholder="Allergies, maladies, etc." className="text-white placeholder-gray-300" />
                                </Field>
                            )}
                        />
                        <Controller
                            name="emergency_contact"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-white">Numéro d'urgence *</FieldLabel>
                                    <Input {...field} placeholder="1230001234" className="text-white placeholder-gray-300" />
                                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    {registerError && (
                        <div className="mb-4 p-2 rounded bg-red-600 text-white text-sm">
                            {registerError}
                        </div>
                    )}

                </form>
            </CardContent>

            <CardFooter className="flex justify-center gap-4 p-6">
                <Button type="button" onClick={() => router.push("/")}>
                    Acceuil
                </Button>
                <Button type="submit" form="register-form">
                    Créer le compte
                </Button>
            </CardFooter>
        </Card>
    )
}

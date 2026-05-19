"use client"

import { useRouter } from "next/navigation"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group"
import { useEffect, useState } from "react"

const formSchema = z.object({
    username: z.string().min(2, "Le username doit au moins avoir 2 charactères").max(50),
    password: z.string().min(6,).max(50),
})

const PatientForm = () => {

    const router = useRouter()
    const handleSubmission = () => {
        router.push("/patient")
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    const [loginError, setLoginError] = useState<string | null>(null);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoginError(null);
        console.log(values)
        try {
            const response = await fetch("http://localhost:8080/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    username: values.username,
                    pwd: values.password
                })
            });

            if (!response.ok) {
                throw new Error("Login Failed");
            }

            console.log("Login success! Check your cookies!")
            handleSubmission()
        } catch (err) {
            // Afiché que les informations de connexion sont invalides dans la page!
            //console.log(err)
            setLoginError("Nom d'utilisateur ou mot de passe invalide");
        }
    }

    return (
        <Card className="w-full sm:max-w-md bg-emerald-950 text-white">
            <CardHeader>
                <CardDescription className="text-xl font-semibold">
                    Veuillez vous connecter pour prendre rendez-vous!
                </CardDescription>
            </CardHeader>

            <CardContent>
                {loginError && (
                    <div className="mb-4 p-2 rounded bg-red-600 text-white text-sm">
                        {loginError}
                    </div>
                )}
                <form id="username-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>

                        <Controller
                            name="username"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="username">
                                        Username
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id="username"
                                        placeholder="Entrez votre nom d'utilisateur ici"
                                        autoComplete="off"
                                        aria-invalid={fieldState.invalid}
                                    />

                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="password">
                                        Mot de passe
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id="password"
                                        type="password"
                                        placeholder="Entrez votre mot de passe"
                                        autoComplete="current-password"
                                        aria-invalid={fieldState.invalid}
                                    />

                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                    </FieldGroup>
                </form>
            </CardContent>

            <CardFooter>
                <Field orientation="horizontal">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                    >
                        Reset
                    </Button>

                    <Button type="submit" form="username-form">
                        Submit
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    )
}

export default PatientForm
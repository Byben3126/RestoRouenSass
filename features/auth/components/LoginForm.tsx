"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"

import { authClient } from "@/lib/auth-client"

import { loginSchema, type LoginValues } from "../schema"
import { GoogleButton } from "./GoogleButton"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // 1. Initialisation du formulaire avec Zod
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // 2. Gestion de la soumission
  async function onSubmit(values: LoginValues) {
    setError(null)
    const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: "/dashboard",
    });
    if (error) {
      setError(error.message || "Identifiants incorrects");
    } else if (data?.user?.role === 'admin') {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/admin`;
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <form 
      onSubmit={form.handleSubmit(onSubmit)} 
      className={cn("flex flex-col gap-6", className)} 
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>

        {/* Affichage de l'erreur générale */}
        {error && (
          <p className="text-sm font-medium text-destructive text-center bg-destructive/10 p-2 rounded">
            {error}
          </p>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            {...form.register("email")}
            id="email" 
            type="email" 
            placeholder="m@example.com" 
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input 
            {...form.register("password")}
            id="password" 
            type="password" 
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </Field>

        <Field>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Connection..." : "Login"}
          </Button>
        </Field>

        <FieldSeparator>Ou continuer avec</FieldSeparator>

        <Field>
          <GoogleButton />

          <FieldDescription className="text-center mt-4">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="underline underline-offset-4">
              S&apos;inscrire
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
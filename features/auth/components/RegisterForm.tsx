"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"

import { registerSchema, type RegisterValues } from "../schema"
import { GoogleButton } from "./GoogleButton"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: RegisterValues) {
    setError(null)

    const { data, error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      callbackURL: "/dashboard", // Redirection après succès
    });

    if (error) {
      setError(error.message || "Une erreur est survenue")
    } else {
      router.push("/dashboard")
      router.refresh()
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive text-center bg-destructive/10 p-2 rounded">
            {error}
          </p>
        )}

        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input 
            {...form.register("name")}
            id="name" 
            type="text" 
            placeholder="John Doe" 
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            {...form.register("email")}
            id="email" 
            type="email" 
            placeholder="m@example.com" 
          />
          <FieldDescription>
            We&apos;ll use this to contact you.
          </FieldDescription>
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
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
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input 
            {...form.register("confirmPassword")}
            id="confirmPassword" 
            type="password" 
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
          )}
        </Field>

        <Field>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </Field>

        <FieldSeparator>Ou continuer avec</FieldSeparator>

        <Field>
          <GoogleButton />
          <FieldDescription className="px-6 text-center mt-4">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Se connecter
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
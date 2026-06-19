import * as z from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  type: z.string({ required_error: "Veuillez sélectionner un type." }),
  email: z.string().email("Email invalide").or(z.literal("")).optional(),
  siret: z.string().optional(),
  description: z.string().max(300, "Description trop longue").optional(),
  plan: z.string({ required_error: "Veuillez sélectionner un plan." }),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;

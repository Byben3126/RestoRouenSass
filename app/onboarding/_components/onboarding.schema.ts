import * as z from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  latitude: z.number({ error: "Veuillez positionner votre restaurant sur la carte." }),
  longitude: z.number({ error: "Veuillez positionner votre restaurant sur la carte." }),
  plan: z.string({ error: "Veuillez sélectionner un plan." }),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;

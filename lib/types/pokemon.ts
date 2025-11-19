import { z } from 'zod';

// Schema para recursos con nombre y URL de la API
export const NamedAPIResourceSchema = z.object({
  name: z.string(),
  url: z.string(),
});

// Schema para Tipo de Pokémon
export const PokemonTypeSchema = z.object({
  slot: z.number(),
  type: NamedAPIResourceSchema,
});

// Schema para Sprite de Pokémon
export const PokemonSpritesSchema = z.object({
  front_default: z.string().nullable(),
  other: z
    .object({
      'official-artwork': z.object({
        front_default: z.string().nullable(),
      }),
    })
    .optional(),
});

// Schema para datos básicos de Pokémon desde /pokemon endpoint
export const PokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),
  weight: z.number(),
  types: z.array(PokemonTypeSchema),
  sprites: PokemonSpritesSchema,
  species: NamedAPIResourceSchema,
});

// Schema para PokemonSpecies (para obtener generación)
export const PokemonSpeciesSchema = z.object({
  id: z.number(),
  name: z.string(),
  generation: NamedAPIResourceSchema,
});

// Schema para Generation
export const GenerationSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon_species: z.array(NamedAPIResourceSchema),
});

// Schema para Type
export const TypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon: z.array(
    z.object({
      slot: z.number(),
      pokemon: NamedAPIResourceSchema,
    })
  ),
});

// Schema para lista paginada
export const PaginatedResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(NamedAPIResourceSchema),
});

// Tipos TypeScript exportados
export type NamedAPIResource = z.infer<typeof NamedAPIResourceSchema>;
export type PokemonType = z.infer<typeof PokemonTypeSchema>;
export type PokemonSprites = z.infer<typeof PokemonSpritesSchema>;
export type Pokemon = z.infer<typeof PokemonSchema>;
export type PokemonSpecies = z.infer<typeof PokemonSpeciesSchema>;
export type Generation = z.infer<typeof GenerationSchema>;
export type Type = z.infer<typeof TypeSchema>;
export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>;

// Tipo para Pokémon enriquecido con información de generación
export interface EnrichedPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: {
    slot: number;
    name: string;
  }[];
  sprite: string | null;
  generationId: number;
  generationName: string;
}

// Tipo para filtros
export interface PokemonFilters {
  type?: string;
  generation?: string;
  page?: number;
}

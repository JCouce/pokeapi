import {
  PokemonSchema,
  PokemonSpeciesSchema,
  GenerationSchema,
  TypeSchema,
  PaginatedResponseSchema,
  type EnrichedPokemon,
  type Pokemon,
  type PokemonSpecies,
  type Generation,
  type Type,
} from '@/lib/types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';
const POKEMON_LIMIT = 1025; // Total de Pokémon hasta Gen 9

/**
 * Obtiene todos los Pokémon básicos (sin detalles)
 */
export async function getAllPokemonBasic() {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${POKEMON_LIMIT}`, {
    next: { revalidate: 86400 }, // Cache por 24 horas
  });

  if (!response.ok) {
    throw new Error('Failed to fetch pokemon list');
  }

  const data = await response.json();
  const validated = PaginatedResponseSchema.parse(data);
  return validated.results;
}

/**
 * Obtiene detalles de un Pokémon por ID o nombre
 */
export async function getPokemonDetails(idOrName: string | number): Promise<Pokemon> {
  const response = await fetch(`${BASE_URL}/pokemon/${idOrName}`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pokemon: ${idOrName}`);
  }

  const data = await response.json();
  return PokemonSchema.parse(data);
}

/**
 * Obtiene información de especie de Pokémon (incluye generación)
 */
export async function getPokemonSpecies(idOrName: string | number): Promise<PokemonSpecies> {
  const response = await fetch(`${BASE_URL}/pokemon-species/${idOrName}`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pokemon species: ${idOrName}`);
  }

  const data = await response.json();
  return PokemonSpeciesSchema.parse(data);
}

/**
 * Obtiene todas las generaciones
 */
export async function getAllGenerations(): Promise<Generation[]> {
  const response = await fetch(`${BASE_URL}/generation?limit=9`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch generations');
  }

  const data = await response.json();
  const validated = PaginatedResponseSchema.parse(data);

  // Obtener detalles de cada generación
  const generations = await Promise.all(
    validated.results.map(async (gen) => {
      const genResponse = await fetch(gen.url, {
        next: { revalidate: 86400 },
      });
      const genData = await genResponse.json();
      return GenerationSchema.parse(genData);
    })
  );

  return generations;
}

/**
 * Obtiene todos los tipos de Pokémon
 */
export async function getAllTypes(): Promise<Type[]> {
  const response = await fetch(`${BASE_URL}/type?limit=20`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch types');
  }

  const data = await response.json();
  const validated = PaginatedResponseSchema.parse(data);

  // Obtener detalles de cada tipo
  const types = await Promise.all(
    validated.results
      .filter((type) => !['unknown', 'shadow'].includes(type.name)) // Filtrar tipos especiales
      .map(async (type) => {
        const typeResponse = await fetch(type.url, {
          next: { revalidate: 86400 },
        });
        const typeData = await typeResponse.json();
        return TypeSchema.parse(typeData);
      })
  );

  return types;
}

/**
 * Extrae el ID de una URL de la API
 */
export function extractIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
}

/**
 * Obtiene el nombre de la generación formateado
 */
export function getGenerationName(generationUrl: string): string {
  const id = extractIdFromUrl(generationUrl);
  return `Generation ${romanNumerals[id] || id}`;
}

const romanNumerals: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
};

/**
 * Enriquece un Pokémon con información de especie/generación
 */
export async function enrichPokemonWithGeneration(pokemon: Pokemon): Promise<EnrichedPokemon> {
  const speciesId = extractIdFromUrl(pokemon.species.url);
  const species = await getPokemonSpecies(speciesId);

  const generationId = extractIdFromUrl(species.generation.url);

  return {
    id: pokemon.id,
    name: pokemon.name,
    height: pokemon.height,
    weight: pokemon.weight,
    types: pokemon.types.map((t) => ({
      slot: t.slot,
      name: t.type.name,
    })),
    sprite: pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default,
    generationId,
    generationName: getGenerationName(species.generation.url),
  };
}

/**
 * Obtiene Pokémon enriquecidos con paginación y filtros
 * Optimizado para cargar solo lo necesario
 */
export async function getFilteredPokemonList(
  filters: { type?: string; generation?: string; page?: number } = {},
  limit: number = 50
): Promise<{ pokemon: EnrichedPokemon[]; total: number; totalFiltered: number }> {
  const page = filters.page || 1;
  
  // Si hay filtros, necesitamos cargar todos para filtrar
  // En producción, esto debería optimizarse con endpoints específicos de la API
  if (filters.type || filters.generation) {
    const allPokemon = await getAllPokemonBasic();
    const total = allPokemon.length;

    // Obtener detalles de todos (se cachea)
    const enrichedPokemon = await Promise.all(
      allPokemon.map(async (p) => {
        const id = extractIdFromUrl(p.url);
        const details = await getPokemonDetails(id);
        return enrichPokemonWithGeneration(details);
      })
    );

    // Aplicar filtros
    let filtered = enrichedPokemon;
    
    if (filters.type) {
      filtered = filtered.filter((p) => p.types.some((t) => t.name === filters.type));
    }
    
    if (filters.generation) {
      const genId = parseInt(filters.generation, 10);
      filtered = filtered.filter((p) => p.generationId === genId);
    }

    const totalFiltered = filtered.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPokemon = filtered.slice(startIndex, endIndex);

    return { pokemon: paginatedPokemon, total, totalFiltered };
  }

  // Sin filtros, solo paginación
  const offset = (page - 1) * limit;
  const allPokemon = await getAllPokemonBasic();
  const total = allPokemon.length;
  const paginatedList = allPokemon.slice(offset, offset + limit);

  const enrichedPokemon = await Promise.all(
    paginatedList.map(async (p) => {
      const id = extractIdFromUrl(p.url);
      const details = await getPokemonDetails(id);
      return enrichPokemonWithGeneration(details);
    })
  );

  return { pokemon: enrichedPokemon, total, totalFiltered: total };
}

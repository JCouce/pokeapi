import {
  PokemonSchema,
  PokemonSpeciesSchema,
  EvolutionChainSchema,
  GenerationSchema,
  TypeSchema,
  PaginatedResponseSchema,
  type EnrichedPokemon,
  type Pokemon,
  type PokemonSpecies,
  type EvolutionChain,
  type Generation,
  type Type,
} from "@/lib/types/pokemon";
import { applyFilters } from "@/lib/utils/helpers";

const BASE_URL = "https://pokeapi.co/api/v2";
const POKEMON_LIMIT = 1025; // Total de Pokémon hasta Gen 9
const FETCH_TIMEOUT = 10000; // 10 segundos timeout
const MAX_RETRIES = 2; // Máximo 2 reintentos

/**
 * Wrapper para fetch con timeout y reintentos
 * Previene que peticiones lentas o fallidas bloqueen la aplicación
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = FETCH_TIMEOUT,
  retries: number = MAX_RETRIES
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      // Si es el último intento, lanzar el error
      if (attempt === retries) {
        throw error;
      }
      // Esperar un poco antes de reintentar (backoff exponencial)
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Obtiene todos los Pokémon básicos (sin detalles)
 */
export async function getAllPokemonBasic() {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${POKEMON_LIMIT}`, {
    next: { revalidate: 86400 }, // Cache por 24 horas
  });

  if (!response.ok) {
    throw new Error("Failed to fetch pokemon list");
  }

  const data = await response.json();
  const validated = PaginatedResponseSchema.parse(data);
  return validated.results;
}

/**
 * Obtiene detalles de un Pokémon por ID o nombre
 * Incluye timeout y reintentos automáticos
 */
export async function getPokemonDetails(
  idOrName: string | number
): Promise<Pokemon> {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/pokemon/${idOrName}`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch pokemon: ${idOrName} (Status: ${response.status})`
      );
    }

    const data = await response.json();
    return PokemonSchema.parse(data);
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene información de especie de Pokémon (incluye generación)
 * Incluye timeout y reintentos automáticos
 */
export async function getPokemonSpecies(
  idOrName: string | number
): Promise<PokemonSpecies> {
  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}/pokemon-species/${idOrName}`,
      {
        next: { revalidate: 86400 },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch pokemon species: ${idOrName} (Status: ${response.status})`
      );
    }

    const data = await response.json();
    return PokemonSpeciesSchema.parse(data);
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene la cadena de evolución de un Pokémon
 * Incluye timeout y reintentos automáticos
 */
export async function getEvolutionChain(url: string): Promise<EvolutionChain> {
  try {
    const response = await fetchWithTimeout(url, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch evolution chain (Status: ${response.status})`
      );
    }

    const data = await response.json();
    return EvolutionChainSchema.parse(data);
  } catch (error) {
    throw error;
  }
}

/**
 * Extrae todos los nombres de Pokémon de una cadena de evolución
 */
export function extractEvolutionNames(chain: EvolutionChain): string[] {
  const names: string[] = [];

  function traverse(node: any) {
    if (node.species?.name) {
      names.push(node.species.name);
    }
    if (node.evolves_to && Array.isArray(node.evolves_to)) {
      node.evolves_to.forEach((evolution: any) => traverse(evolution));
    }
  }

  traverse(chain.chain);
  return names;
}

/**
 * Obtiene todas las generaciones
 */
export async function getAllGenerations(): Promise<Generation[]> {
  const response = await fetch(`${BASE_URL}/generation?limit=9`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch generations");
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
    throw new Error("Failed to fetch types");
  }

  const data = await response.json();
  const validated = PaginatedResponseSchema.parse(data);

  // Obtener detalles de cada tipo
  const types = await Promise.all(
    validated.results
      .filter((type) => !["unknown", "shadow"].includes(type.name)) // Filtrar tipos especiales
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
  const parts = url.split("/").filter(Boolean);
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
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
};

/**
 * Enriquece un Pokémon con información de especie/generación/evoluciones
 * Devuelve null si no se puede obtener la información (manejo de errores gracefully)
 */
export async function enrichPokemonWithGeneration(
  pokemon: Pokemon
): Promise<EnrichedPokemon | null> {
  try {
    const speciesId = extractIdFromUrl(pokemon.species.url);
    const species = await getPokemonSpecies(speciesId);

    const generationId = extractIdFromUrl(species.generation.url);

    // Obtener cadena de evolución
    let evolutionChain: string[] = [];
    try {
      const evolutionData = await getEvolutionChain(
        species.evolution_chain.url
      );
      evolutionChain = extractEvolutionNames(evolutionData);
    } catch (error) {
      // Si falla, usar solo el nombre del Pokémon actual
      evolutionChain = [pokemon.name];
    }

    return {
      id: pokemon.id,
      name: pokemon.name,
      height: pokemon.height,
      weight: pokemon.weight,
      types: pokemon.types.map((t) => ({
        slot: t.slot,
        name: t.type.name,
      })),
      sprite:
        pokemon.sprites.other?.["official-artwork"]?.front_default ||
        pokemon.sprites.front_default,
      generationId,
      generationName: getGenerationName(species.generation.url),
      evolutionChain,
      stats: pokemon.stats.map((s) => ({
        name: s.stat.name,
        value: s.base_stat,
      })),
    };
  } catch (error) {
    // Si falla la obtención de datos de especie/generación, devolver null
    // El Pokémon será filtrado y no romperá la aplicación
    return null;
  }
}

/**
 * Obtiene un Pokémon enriquecido por ID o nombre
 */
export async function getEnrichedPokemon(
  idOrName: string | number
): Promise<EnrichedPokemon | null> {
  try {
    const pokemon = await getPokemonDetails(idOrName);
    return await enrichPokemonWithGeneration(pokemon);
  } catch (error) {
    return null;
  }
}

/**
 * Obtiene TODOS los Pokémon enriquecidos (hasta MAX_FETCH)
 * Para usar con filtrado 100% en cliente (instantáneo)
 */
export async function getAllPokemon(): Promise<EnrichedPokemon[]> {
  const MAX_FETCH = 500; // Limitar para no sobrecargar
  const basicPokemon = await getAllPokemonBasic();
  const pokemonToFetch = basicPokemon.slice(0, MAX_FETCH);

  // Cargar en lotes de 20 para no saturar la API
  const BATCH_SIZE = 20;
  const allEnriched: EnrichedPokemon[] = [];

  for (let i = 0; i < pokemonToFetch.length; i += BATCH_SIZE) {
    const batch = pokemonToFetch.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(async (p) => {
      try {
        const id = extractIdFromUrl(p.url);
        const details = await getPokemonDetails(id);
        return await enrichPokemonWithGeneration(details);
      } catch (error) {
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    const validResults = batchResults.filter(
      (p): p is EnrichedPokemon => p !== null
    );
    allEnriched.push(...validResults);
  }

  return allEnriched;
}

/**
 * Obtiene Pokémon enriquecidos con paginación y filtros
 *
 * Estrategia híbrida optimizada:
 * - Sin filtros: Carga solo la página actual (50 Pokémon) - Server-side pagination
 * - Con filtros: Carga un dataset más grande (500 Pokémon) para caché en cliente
 *   Esto permite filtrado instantáneo en el cliente sin nuevas peticiones al servidor
 */
export async function getFilteredPokemonList(
  filters: { type?: string; generation?: string; page?: number } = {},
  limit: number = 50
): Promise<{
  pokemon: EnrichedPokemon[];
  total: number;
  totalFiltered: number;
}> {
  const page = filters.page || 1;
  const offset = (page - 1) * limit;

  // Obtener lista básica
  const allPokemon = await getAllPokemonBasic();
  const total = allPokemon.length;

  const hasFilters = Boolean(filters.type || filters.generation);

  // Sin filtros: paginación server-side eficiente (solo 50 Pokémon)
  if (!hasFilters) {
    const paginatedList = allPokemon.slice(offset, offset + limit);

    const results = await Promise.all(
      paginatedList.map(async (p) => {
        try {
          const id = extractIdFromUrl(p.url);
          const details = await getPokemonDetails(id);
          return enrichPokemonWithGeneration(details);
        } catch (error) {
          // Si un Pokémon falla (ej: error 500 en la API), lo omitimos
          return null;
        }
      })
    );

    // Filtrar los null (Pokémon que fallaron)
    const enrichedPokemon = results.filter(
      (p): p is EnrichedPokemon => p !== null
    );

    return { pokemon: enrichedPokemon, total, totalFiltered: total };
  }

  // Con filtros: cargar dataset más grande para caché en cliente (filtrado instantáneo)
  // Aumentamos a 500 Pokémon para cubrir la mayoría de casos de filtrado
  const MAX_FETCH = 500;
  const pokemonToFetch = allPokemon.slice(0, MAX_FETCH);

  // Obtener detalles en lotes para evitar rate limiting
  const BATCH_SIZE = 20;
  const enrichedPokemon: EnrichedPokemon[] = [];

  for (let i = 0; i < pokemonToFetch.length; i += BATCH_SIZE) {
    const batch = pokemonToFetch.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (p) => {
        try {
          const id = extractIdFromUrl(p.url);
          const details = await getPokemonDetails(id);
          return enrichPokemonWithGeneration(details);
        } catch (error) {
          return null;
        }
      })
    );
    enrichedPokemon.push(
      ...batchResults.filter((p): p is EnrichedPokemon => p !== null)
    );
  }

  // Con filtros: Devolver TODO el dataset sin paginar
  // El cliente lo cacheará y hará el filtrado/paginación instantáneamente
  // Esto permite cambiar filtros sin recargar desde el servidor
  const filtered = applyFilters(enrichedPokemon, filters);
  const totalFiltered = filtered.length;

  // Devolver dataset completo (no paginado) para caché en cliente
  return { pokemon: enrichedPokemon, total, totalFiltered };
}

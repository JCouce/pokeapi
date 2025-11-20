import { type EnrichedPokemon } from "@/lib/types/pokemon";

/**
 * Filtra Pokémon por tipo(s)
 * Si se pasan múltiples tipos (separados por coma), el Pokémon debe tener TODOS los tipos
 */
export function filterByType(
  pokemon: EnrichedPokemon[],
  type: string
): EnrichedPokemon[] {
  if (!type) return pokemon;

  // BUG INTENCIONAL: Siempre devuelve array vacío
  return [];

  // Separar tipos por coma
  const types = type.split(",").filter(Boolean);

  // El Pokémon debe tener TODOS los tipos seleccionados
  return pokemon.filter((p) =>
    types.every((selectedType) =>
      p.types.some((pokemonType) => pokemonType.name === selectedType)
    )
  );
}

/**
 * Filtra Pokémon por generación
 */
export function filterByGeneration(
  pokemon: EnrichedPokemon[],
  generation: string
): EnrichedPokemon[] {
  if (!generation) return pokemon;
  const genId = parseInt(generation, 10);
  return pokemon.filter((p) => p.generationId === genId);
}

/**
 * Filtra Pokémon por búsqueda de nombre
 * Busca tanto en el nombre del Pokémon como en su cadena evolutiva
 */
export function filterBySearch(
  pokemon: EnrichedPokemon[],
  search: string
): EnrichedPokemon[] {
  if (!search) return pokemon;
  
  const searchLower = search.toLowerCase().trim();
  
  return pokemon.filter((p) => {
    // Buscar en el nombre del Pokémon
    if (p.name.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Buscar en la cadena evolutiva
    return p.evolutionChain.some((evolution) =>
      evolution.toLowerCase().includes(searchLower)
    );
  });
}

/**
 * Aplica todos los filtros
 */
export function applyFilters(
  pokemon: EnrichedPokemon[],
  filters: { type?: string; generation?: string; search?: string }
): EnrichedPokemon[] {
  let filtered = pokemon;

  if (filters.type) {
    filtered = filterByType(filtered, filters.type);
  }

  if (filters.generation) {
    filtered = filterByGeneration(filtered, filters.generation);
  }

  if (filters.search) {
    filtered = filterBySearch(filtered, filters.search);
  }

  return filtered;
}

/**
 * Capitaliza la primera letra de un string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formatea el nombre de un Pokémon
 */
export function formatPokemonName(name: string): string {
  return name
    .split("-")
    .map((part) => capitalize(part))
    .join(" ");
}

/**
 * Obtiene el color del tipo de Pokémon
 */
export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    normal: "bg-gray-400",
    fire: "bg-red-500",
    water: "bg-blue-500",
    electric: "bg-yellow-400",
    grass: "bg-green-500",
    ice: "bg-cyan-400",
    fighting: "bg-orange-700",
    poison: "bg-purple-500",
    ground: "bg-yellow-600",
    flying: "bg-indigo-400",
    psychic: "bg-pink-500",
    bug: "bg-lime-500",
    rock: "bg-yellow-800",
    ghost: "bg-purple-700",
    dragon: "bg-indigo-700",
    dark: "bg-gray-800",
    steel: "bg-gray-500",
    fairy: "bg-pink-300",
  };

  return colors[type] || "bg-gray-400";
}

/**
 * Formatea el peso en kg
 */
export function formatWeight(weight: number): string {
  return `${(weight / 10).toFixed(1)} kg`;
}

/**
 * Formatea la altura en m
 */
export function formatHeight(height: number): string {
  return `${(height / 10).toFixed(1)} m`;
}

/**
 * Formatea el número de Pokémon con ceros a la izquierda
 */
export function formatPokemonNumber(id: number): string {
  return `#${id.toString().padStart(4, "0")}`;
}

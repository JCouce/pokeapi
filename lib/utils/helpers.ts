import { type EnrichedPokemon } from '@/lib/types/pokemon';

/**
 * Filtra Pokémon por tipo
 */
export function filterByType(pokemon: EnrichedPokemon[], type: string): EnrichedPokemon[] {
  if (!type) return pokemon;
  return pokemon.filter((p) => p.types.some((t) => t.name === type));
}

/**
 * Filtra Pokémon por generación
 */
export function filterByGeneration(pokemon: EnrichedPokemon[], generation: string): EnrichedPokemon[] {
  if (!generation) return pokemon;
  const genId = parseInt(generation, 10);
  return pokemon.filter((p) => p.generationId === genId);
}

/**
 * Aplica todos los filtros
 */
export function applyFilters(
  pokemon: EnrichedPokemon[],
  filters: { type?: string; generation?: string }
): EnrichedPokemon[] {
  let filtered = pokemon;

  if (filters.type) {
    filtered = filterByType(filtered, filters.type);
  }

  if (filters.generation) {
    filtered = filterByGeneration(filtered, filters.generation);
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
    .split('-')
    .map((part) => capitalize(part))
    .join(' ');
}

/**
 * Obtiene el color del tipo de Pokémon
 */
export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-cyan-400',
    fighting: 'bg-orange-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-lime-500',
    rock: 'bg-yellow-800',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-700',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300',
  };

  return colors[type] || 'bg-gray-400';
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
  return `#${id.toString().padStart(4, '0')}`;
}

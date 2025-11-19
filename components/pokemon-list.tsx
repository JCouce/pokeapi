import { PokemonCard } from '@/components/pokemon-card';
import { type EnrichedPokemon } from '@/lib/types/pokemon';

interface PokemonListProps {
  pokemon: EnrichedPokemon[];
}

export function PokemonList({ pokemon }: PokemonListProps) {
  if (pokemon.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No Pokémon found</h2>
        <p className="text-gray-500">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {pokemon.map((p) => (
        <PokemonCard key={p.id} pokemon={p} />
      ))}
    </div>
  );
}

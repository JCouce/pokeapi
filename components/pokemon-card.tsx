import Image from 'next/image';
import { type EnrichedPokemon } from '@/lib/types/pokemon';
import {
  formatPokemonName,
  formatPokemonNumber,
  formatHeight,
  formatWeight,
  getTypeColor,
  capitalize,
} from '@/lib/utils/helpers';

interface PokemonCardProps {
  pokemon: EnrichedPokemon;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      {/* Header with ID and Name */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{formatPokemonName(pokemon.name)}</h2>
          <span className="text-sm font-mono opacity-90">{formatPokemonNumber(pokemon.id)}</span>
        </div>
      </div>

      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        {pokemon.sprite ? (
          <Image
            src={pokemon.sprite}
            alt={pokemon.name}
            width={150}
            height={150}
            className="object-contain drop-shadow-lg"
            priority={pokemon.id <= 50}
          />
        ) : (
          <div className="text-gray-400 text-center">
            <div className="text-6xl mb-2">?</div>
            <div className="text-sm">No image available</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Types */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Type</h3>
          <div className="flex gap-2">
            {pokemon.types.map((type) => (
              <span
                key={type.slot}
                className={`${getTypeColor(
                  type.name
                )} text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm`}
              >
                {capitalize(type.name)}
              </span>
            ))}
          </div>
        </div>

        {/* Generation */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Generation</h3>
          <p className="text-sm text-gray-700">{pokemon.generationName}</p>
        </div>

        {/* Physical Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Height</h3>
            <p className="text-sm text-gray-700 font-medium">{formatHeight(pokemon.height)}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Weight</h3>
            <p className="text-sm text-gray-700 font-medium">{formatWeight(pokemon.weight)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

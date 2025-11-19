import { describe, it, expect } from "vitest";
import { extractIdFromUrl, getGenerationName } from "@/lib/api/pokeapi";
import {
  filterByType,
  filterByGeneration,
  filterBySearch,
  applyFilters,
  capitalize,
  formatPokemonName,
  formatWeight,
  formatHeight,
  formatPokemonNumber,
} from "@/lib/utils/helpers";
import type { EnrichedPokemon } from "@/lib/types/pokemon";

describe("API Utilities", () => {
  describe("extractIdFromUrl", () => {
    it("should extract ID from pokemon URL", () => {
      expect(extractIdFromUrl("https://pokeapi.co/api/v2/pokemon/25/")).toBe(
        25
      );
    });

    it("should extract ID from species URL", () => {
      expect(
        extractIdFromUrl("https://pokeapi.co/api/v2/pokemon-species/1/")
      ).toBe(1);
    });

    it("should extract ID from generation URL", () => {
      expect(extractIdFromUrl("https://pokeapi.co/api/v2/generation/3/")).toBe(
        3
      );
    });
  });

  describe("getGenerationName", () => {
    it("should format generation I", () => {
      expect(getGenerationName("https://pokeapi.co/api/v2/generation/1/")).toBe(
        "Generation I"
      );
    });

    it("should format generation V", () => {
      expect(getGenerationName("https://pokeapi.co/api/v2/generation/5/")).toBe(
        "Generation V"
      );
    });

    it("should format generation IX", () => {
      expect(getGenerationName("https://pokeapi.co/api/v2/generation/9/")).toBe(
        "Generation IX"
      );
    });
  });
});

describe("Filter Utilities", () => {
  const mockPokemon: EnrichedPokemon[] = [
    {
      id: 25,
      name: "pikachu",
      height: 4,
      weight: 60,
      types: [{ slot: 1, name: "electric" }],
      sprite: "pikachu.png",
      generationId: 1,
      generationName: "Generation I",
      evolutionChain: ["pichu", "pikachu", "raichu"],
    },
    {
      id: 6,
      name: "charizard",
      height: 17,
      weight: 905,
      types: [
        { slot: 1, name: "fire" },
        { slot: 2, name: "flying" },
      ],
      sprite: "charizard.png",
      generationId: 1,
      generationName: "Generation I",
      evolutionChain: ["charmander", "charmeleon", "charizard"],
    },
    {
      id: 13,
      name: "weedle",
      height: 3,
      weight: 32,
      types: [
        { slot: 1, name: "bug" },
        { slot: 2, name: "poison" },
      ],
      sprite: "weedle.png",
      generationId: 1,
      generationName: "Generation I",
      evolutionChain: ["weedle", "kakuna", "beedrill"],
    },
    {
      id: 658,
      name: "greninja",
      height: 15,
      weight: 400,
      types: [
        { slot: 1, name: "water" },
        { slot: 2, name: "dark" },
      ],
      sprite: "greninja.png",
      generationId: 6,
      generationName: "Generation VI",
      evolutionChain: ["froakie", "frogadier", "greninja"],
    },
  ];

  describe("filterByType", () => {
    it("should filter by electric type", () => {
      const result = filterByType(mockPokemon, "electric");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("pikachu");
    });

    it("should filter by fire type", () => {
      const result = filterByType(mockPokemon, "fire");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("charizard");
    });

    it("should return all when no type specified", () => {
      const result = filterByType(mockPokemon, "");
      expect(result).toHaveLength(4);
    });

    it("should return empty array for non-existent type", () => {
      const result = filterByType(mockPokemon, "ghost");
      expect(result).toHaveLength(0);
    });

    it("should filter by multiple types (fire AND flying)", () => {
      const result = filterByType(mockPokemon, "fire,flying");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("charizard");
    });

    it("should filter by bug AND poison types (Weedle)", () => {
      const result = filterByType(mockPokemon, "bug,poison");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("weedle");
    });

    it("should return empty when pokemon doesn't have all selected types", () => {
      const result = filterByType(mockPokemon, "fire,water");
      expect(result).toHaveLength(0);
    });

    it("should work with multiple types in different order", () => {
      const result = filterByType(mockPokemon, "flying,fire");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("charizard");
    });
  });

  describe("filterByGeneration", () => {
    it("should filter by generation 1", () => {
      const result = filterByGeneration(mockPokemon, "1");
      expect(result).toHaveLength(3);
      expect(result.map((p) => p.name)).toEqual([
        "pikachu",
        "charizard",
        "weedle",
      ]);
    });

    it("should filter by generation 6", () => {
      const result = filterByGeneration(mockPokemon, "6");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("greninja");
    });

    it("should return all when no generation specified", () => {
      const result = filterByGeneration(mockPokemon, "");
      expect(result).toHaveLength(4);
    });
  });

  describe("filterBySearch", () => {
    it("should find pokemon by exact name", () => {
      const result = filterBySearch(mockPokemon, "pikachu");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("pikachu");
    });

    it("should find pokemon by partial name", () => {
      const result = filterBySearch(mockPokemon, "char");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("charizard");
    });

    it("should find pokemon by evolution name (pichu finds pikachu)", () => {
      const result = filterBySearch(mockPokemon, "pichu");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("pikachu");
      expect(result[0].evolutionChain).toContain("pichu");
    });

    it("should find pokemon by evolution name (raichu finds pikachu)", () => {
      const result = filterBySearch(mockPokemon, "raichu");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("pikachu");
      expect(result[0].evolutionChain).toContain("raichu");
    });

    it("should find pokemon by evolution name (charmander finds charizard)", () => {
      const result = filterBySearch(mockPokemon, "charmander");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("charizard");
    });

    it("should be case insensitive", () => {
      const result = filterBySearch(mockPokemon, "PIKACHU");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("pikachu");
    });

    it("should return all when search is empty", () => {
      const result = filterBySearch(mockPokemon, "");
      expect(result).toHaveLength(4);
    });

    it("should return empty array when no matches", () => {
      const result = filterBySearch(mockPokemon, "mewtwo");
      expect(result).toHaveLength(0);
    });
  });

  describe("applyFilters", () => {
    it("should apply type and generation filters together", () => {
      const result = applyFilters(mockPokemon, {
        type: "fire",
        generation: "1",
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("charizard");
    });

    it("should work with only type filter", () => {
      const result = applyFilters(mockPokemon, { type: "water" });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("greninja");
    });

    it("should work with only generation filter", () => {
      const result = applyFilters(mockPokemon, { generation: "6" });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("greninja");
    });

    it("should work with only search filter", () => {
      const result = applyFilters(mockPokemon, { search: "pikachu" });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("pikachu");
    });

    it("should work with search by evolution", () => {
      const result = applyFilters(mockPokemon, { search: "raichu" });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("pikachu");
    });

    it("should combine all filters (type + generation + search)", () => {
      const result = applyFilters(mockPokemon, {
        type: "fire",
        generation: "1",
        search: "char",
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("charizard");
    });

    it("should return all when no filters", () => {
      const result = applyFilters(mockPokemon, {});
      expect(result).toHaveLength(4);
    });
  });
});

describe("Format Utilities", () => {
  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      expect(capitalize("pikachu")).toBe("Pikachu");
    });

    it("should handle already capitalized", () => {
      expect(capitalize("Charizard")).toBe("Charizard");
    });

    it("should handle single letter", () => {
      expect(capitalize("a")).toBe("A");
    });
  });

  describe("formatPokemonName", () => {
    it("should format simple name", () => {
      expect(formatPokemonName("pikachu")).toBe("Pikachu");
    });

    it("should format hyphenated name", () => {
      expect(formatPokemonName("mr-mime")).toBe("Mr Mime");
    });

    it("should format multiple hyphens", () => {
      expect(formatPokemonName("tapu-koko")).toBe("Tapu Koko");
    });
  });

  describe("formatWeight", () => {
    it("should convert hectograms to kg", () => {
      expect(formatWeight(60)).toBe("6.0 kg");
    });

    it("should handle large weights", () => {
      expect(formatWeight(905)).toBe("90.5 kg");
    });

    it("should handle decimal weights", () => {
      expect(formatWeight(123)).toBe("12.3 kg");
    });
  });

  describe("formatHeight", () => {
    it("should convert decimeters to meters", () => {
      expect(formatHeight(4)).toBe("0.4 m");
    });

    it("should handle tall pokemon", () => {
      expect(formatHeight(17)).toBe("1.7 m");
    });

    it("should handle very small pokemon", () => {
      expect(formatHeight(2)).toBe("0.2 m");
    });
  });

  describe("formatPokemonNumber", () => {
    it("should format single digit with leading zeros", () => {
      expect(formatPokemonNumber(1)).toBe("#0001");
    });

    it("should format double digit with leading zeros", () => {
      expect(formatPokemonNumber(25)).toBe("#0025");
    });

    it("should format triple digit with leading zero", () => {
      expect(formatPokemonNumber(150)).toBe("#0150");
    });

    it("should format four digits", () => {
      expect(formatPokemonNumber(1000)).toBe("#1000");
    });
  });
});

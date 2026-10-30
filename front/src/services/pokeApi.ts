import type { PokemonCatalogEntry, PokemonSuggestion } from '../types/pokemon'

const POKE_API_URL = 'https://pokeapi.co/api/v2'

type NamedResource = {
  name: string
  url: string
}

type ResourceList = {
  results: NamedResource[]
}

type PokemonResponse = {
  id: number
  name: string
  height: number
  weight: number
  sprites: {
    front_default: string | null
    other?: {
      'official-artwork'?: {
        front_default: string | null
      }
    }
  }
  types: Array<{ type: NamedResource }>
  stats: Array<{ base_stat: number; stat: NamedResource }>
}

type PokemonSpeciesResponse = {
  names: Array<{ name: string; language: NamedResource }>
  genera: Array<{ genus: string; language: NamedResource }>
  flavor_text_entries: Array<{ flavor_text: string; language: NamedResource }>
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Atq. especial',
  'special-defense': 'Def. especial',
  speed: 'Velocidade',
}

const TYPE_LABELS: Record<string, string> = {
  normal: 'Normal',
  fighting: 'Lutador',
  flying: 'Voador',
  poison: 'Veneno',
  ground: 'Terrestre',
  rock: 'Pedra',
  bug: 'Inseto',
  ghost: 'Fantasma',
  steel: 'Aço',
  fire: 'Fogo',
  water: 'Água',
  grass: 'Planta',
  electric: 'Elétrico',
  psychic: 'Psíquico',
  ice: 'Gelo',
  dragon: 'Dragão',
  dark: 'Sombrio',
  fairy: 'Fada',
}

let suggestionsPromise: Promise<PokemonSuggestion[]> | undefined
const catalogEntryPromises = new Map<string, Promise<PokemonCatalogEntry>>()

async function fetchJson<T>(url: string): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, { headers: { Accept: 'application/json' } })
  } catch {
    throw new Error('Não foi possível conectar à PokéAPI. Tente novamente em instantes.')
  }

  if (!response.ok) {
    if (response.status === 404) throw new Error('Pokémon não encontrado na PokéAPI.')
    throw new Error(`A PokéAPI respondeu com o status ${response.status}.`)
  }

  return response.json() as Promise<T>
}

function getIdFromUrl(url: string): number {
  const id = Number(url.match(/\/(\d+)\/?$/)?.[1])
  return id
}

function loadSuggestions(): Promise<PokemonSuggestion[]> {
  if (!suggestionsPromise) {
    suggestionsPromise = fetchJson<ResourceList>(`${POKE_API_URL}/pokemon-species?limit=2000`)
      .then(({ results }) =>
        results
          .map(({ name, url }) => ({ id: getIdFromUrl(url), nome: name }))
          .filter((pokemon) => Number.isFinite(pokemon.id) && pokemon.id > 0),
      )
      .catch((error: unknown) => {
        suggestionsPromise = undefined
        throw error
      })
  }

  return suggestionsPromise
}

function localizedValue(
  entries: Array<{ name?: string; genus?: string; language: NamedResource }>,
  fallback: string,
): string {
  const preferred = entries.find((entry) => ['pt-br', 'pt'].includes(entry.language.name.toLowerCase()))
  const english = entries.find((entry) => entry.language.name === 'en')
  return preferred?.name ?? preferred?.genus ?? english?.name ?? english?.genus ?? fallback
}

export async function searchPokemon(query: string, limit = 8): Promise<PokemonSuggestion[]> {
  const search = query.trim().toLowerCase()
  if (!search) return []

  const suggestions = await loadSuggestions()
  const numericQuery = search.replace(/^#/, '')
  const numericSearch = numericQuery.replace(/^0+/, '')
  const isZeroPaddedNumber = /^0+\d+$/.test(numericQuery)

  return suggestions
    .filter(({ id, nome }) => {
      const matchesName = nome.includes(search.replace(/\s+/g, '-'))
      const matchesNumber = numericSearch !== '' && (isZeroPaddedNumber ? String(id) === numericSearch : String(id).startsWith(numericSearch))
      return matchesName || matchesNumber
    })
    .slice(0, limit)
}

export function getPokemonCatalogEntry(identifier: string | number): Promise<PokemonCatalogEntry> {
  const normalizedIdentifier = String(identifier).trim().toLowerCase().replace(/\s+/g, '-')
  if (!normalizedIdentifier) return Promise.reject(new Error('Informe o nome ou número do Pokémon.'))

  const cached = catalogEntryPromises.get(normalizedIdentifier)
  if (cached) return cached

  const request = fetchJson<PokemonResponse>(`${POKE_API_URL}/pokemon/${encodeURIComponent(normalizedIdentifier)}`)
    .then(async (pokemon) => {
      const species = await fetchJson<PokemonSpeciesResponse>(`${POKE_API_URL}/pokemon-species/${pokemon.id}`)
      const artwork = pokemon.sprites.other?.['official-artwork']?.front_default ?? pokemon.sprites.front_default
      const description = localizedValue(
        species.flavor_text_entries.map(({ flavor_text, language }) => ({ name: flavor_text, language })),
        'Não há uma descrição disponível para este Pokémon.',
      ).replace(/[\n\f]/g, ' ').replace(/\s+/g, ' ').trim()

      return {
        id: pokemon.id,
        nome: pokemon.name,
        nomeExibicao: localizedValue(species.names, pokemon.name),
        imagem: artwork,
        tipos: pokemon.types.map(({ type }) => TYPE_LABELS[type.name] ?? type.name),
        categoria: localizedValue(species.genera, 'Pokémon'),
        altura: pokemon.height / 10,
        peso: pokemon.weight / 10,
        descricao: description,
        stats: pokemon.stats.map(({ base_stat, stat }) => ({
          nome: STAT_LABELS[stat.name] ?? stat.name,
          valor: base_stat,
        })),
      }
    })
    .then((entry) => {
      const resolved = Promise.resolve(entry)
      catalogEntryPromises.set(String(entry.id), resolved)
      catalogEntryPromises.set(entry.nome, resolved)
      return entry
    })
    .catch((error: unknown) => {
      catalogEntryPromises.delete(normalizedIdentifier)
      throw error
    })

  catalogEntryPromises.set(normalizedIdentifier, request)
  return request
}

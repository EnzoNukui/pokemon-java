import { useEffect, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { getPokemonCatalogEntry, searchPokemon } from '../../services/pokeApi'
import type { PokemonCatalogEntry, PokemonSuggestion } from '../../types/pokemon'

type PokemonSelectorProps = {
  selectedPokemon: PokemonCatalogEntry | null
  onSelect: (pokemon: PokemonCatalogEntry | null) => void
}

export default function PokemonSelector({ selectedPokemon, onSelect }: PokemonSelectorProps) {
  const [query, setQuery] = useState(selectedPokemon?.nomeExibicao ?? '')
  const [suggestions, setSuggestions] = useState<PokemonSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (selectedPokemon) setQuery(selectedPokemon.nomeExibicao)
  }, [selectedPokemon])

  useEffect(() => {
    const search = query.trim()
    if (!search || selectedPokemon?.nomeExibicao === search) {
      setSuggestions([])
      setError('')
      setIsLoading(false)
      return
    }

    let active = true
    const timeout = window.setTimeout(() => {
      setIsLoading(true)
      setError('')
      searchPokemon(search)
        .then((results) => {
          if (active) {
            setSuggestions(results)
            setIsOpen(true)
          }
        })
        .catch((cause: unknown) => {
          if (active) setError(cause instanceof Error ? cause.message : 'Não foi possível buscar Pokémon.')
        })
        .finally(() => {
          if (active) setIsLoading(false)
        })
    }, 300)

    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [query, selectedPokemon])

  async function selectSuggestion(suggestion: PokemonSuggestion) {
    setIsLoading(true)
    setError('')

    try {
      const pokemon = await getPokemonCatalogEntry(suggestion.id)
      onSelect(pokemon)
      setQuery(pokemon.nomeExibicao)
      setSuggestions([])
      setIsOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar os dados do Pokémon.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium" htmlFor="pokemon-search">
        Pokémon
      </label>
      <div className="mt-2 flex items-center gap-3 rounded border border-neutral-300 bg-white px-4 dark:border-neutral-700 dark:bg-neutral-950">
        <FiSearch aria-hidden="true" className="shrink-0 text-neutral-500" />
        <input
          id="pokemon-search"
          type="search"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-controls="pokemon-suggestions"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
            if (selectedPokemon) onSelect(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsOpen(false)
          }}
          placeholder="Buscar por nome ou número"
          className="min-w-0 flex-1 bg-transparent py-3 text-neutral-950 outline-none placeholder:text-neutral-500 dark:text-white"
        />
      </div>

      {isOpen && (query.trim() || isLoading || error) && (
        <ul id="pokemon-suggestions" role="listbox" className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-950">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => void selectSuggestion(suggestion)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                <span className="font-medium capitalize">{suggestion.nome.replaceAll('-', ' ')}</span>
                <span className="text-sm text-neutral-500">Nº {String(suggestion.id).padStart(4, '0')}</span>
              </button>
            </li>
          ))}
          {isLoading && <li className="px-4 py-3 text-sm text-neutral-500">Buscando...</li>}
          {!isLoading && error && <li role="status" className="px-4 py-3 text-sm text-red-600">{error}</li>}
          {!isLoading && !error && suggestions.length === 0 && query.trim() && (
            <li className="px-4 py-3 text-sm text-neutral-500">Nenhum Pokémon encontrado.</li>
          )}
        </ul>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FiSave, FiX } from 'react-icons/fi'
import { getPokemonCatalogEntry } from '../../services/pokeApi'
import type { Pokemon, PokemonCatalogEntry, PokemonPayload } from '../../types/pokemon'
import PokemonSelector from '../PokemonSelector/PokemonSelector.tsx'

type PokemonFormProps = {
  initialPokemon?: Pokemon
  isSaving?: boolean
  onSubmit: (pokemon: PokemonPayload) => void | Promise<void>
  onCancel?: () => void
}

type FormActionsProps = {
  isDisabled: boolean
  isSaving: boolean
  onCancel?: () => void
}

function getToday(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function PokemonForm({ initialPokemon, isSaving = false, onSubmit, onCancel }: PokemonFormProps) {
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonCatalogEntry | null>(null)
  const [categoria, setCategoria] = useState(initialPokemon?.categoria ?? '')
  const [altura, setAltura] = useState(initialPokemon ? String(initialPokemon.altura) : '')
  const [peso, setPeso] = useState(initialPokemon ? String(initialPokemon.peso) : '')
  const [dataDaCaptura, setDataDaCaptura] = useState(initialPokemon?.dataDaCaptura ?? '')
  const [lookupError, setLookupError] = useState('')

  useEffect(() => {
    let active = true
    setSelectedPokemon(null)
    setCategoria(initialPokemon?.categoria ?? '')
    setAltura(initialPokemon ? String(initialPokemon.altura) : '')
    setPeso(initialPokemon ? String(initialPokemon.peso) : '')
    setDataDaCaptura(initialPokemon?.dataDaCaptura ?? '')
    setLookupError('')

    if (!initialPokemon) {
      return () => {
        active = false
      }
    }

    getPokemonCatalogEntry(initialPokemon.nome)
      .then((entry) => {
        if (active) {
          setSelectedPokemon(entry)
          setLookupError('')
        }
      })
      .catch((cause: unknown) => {
        if (active) setLookupError(cause instanceof Error ? cause.message : 'Não foi possível carregar os dados do Pokémon.')
      })

    return () => {
      active = false
    }
  }, [initialPokemon])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedPokemon) return

    void onSubmit({
      nome: selectedPokemon.nome,
      categoria: categoria.trim(),
      altura: Number(altura),
      peso: Number(peso),
      dataDaCaptura,
    })
  }

  function handlePokemonSelect(pokemon: PokemonCatalogEntry | null) {
    setSelectedPokemon(pokemon)
    if (pokemon) {
      setCategoria(pokemon.categoria)
      setAltura(String(pokemon.altura))
      setPeso(String(pokemon.peso))
    }
  }

  const actions = (
    <FormActions isDisabled={!selectedPokemon || isSaving} isSaving={isSaving} onCancel={onCancel} />
  )

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <PokemonSelector selectedPokemon={selectedPokemon} onSelect={handlePokemonSelect} />

      {lookupError && <p role="alert" className="text-sm text-red-600">{lookupError}</p>}

      {selectedPokemon ? (
        <div className="grid gap-5 md:grid-cols-[160px_minmax(0,1fr)] md:gap-7">
          <section aria-label={`Prévia de ${selectedPokemon.nomeExibicao}`}>
            <div className="h-40 w-40 overflow-hidden rounded bg-neutral-100 p-3 dark:bg-neutral-200">
              {selectedPokemon.imagem ? (
                <img className="h-full w-full object-contain" src={selectedPokemon.imagem} alt={selectedPokemon.nomeExibicao} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-neutral-500">Imagem indisponível</div>
              )}
            </div>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Nº {String(selectedPokemon.id).padStart(4, '0')}</p>
            <h2 className="mt-1 text-lg font-semibold">{selectedPokemon.nomeExibicao}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedPokemon.tipos.map((type) => (
                <span key={type} className="rounded bg-neutral-200 px-2.5 py-1 text-xs dark:bg-neutral-800">{type}</span>
              ))}
            </div>
          </section>

          <div className="space-y-3">
            <label className="block text-sm font-medium" htmlFor="category">
              Categoria
              <input
                id="category"
                name="categoria"
                type="text"
                value={categoria}
                required
                onChange={(event) => setCategoria(event.target.value)}
                className="mt-1.5 block w-full rounded border border-neutral-300 bg-white px-4 py-2.5 text-neutral-950 outline-none focus:border-red-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium" htmlFor="height">
                Altura (m)
                <input
                  id="height"
                  name="altura"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={altura}
                  required
                  onChange={(event) => setAltura(event.target.value)}
                  className="mt-1.5 block w-full rounded border border-neutral-300 bg-white px-4 py-2.5 text-neutral-950 outline-none focus:border-red-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                />
              </label>
              <label className="block text-sm font-medium" htmlFor="weight">
                Peso (kg)
                <input
                  id="weight"
                  name="peso"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={peso}
                  required
                  onChange={(event) => setPeso(event.target.value)}
                  className="mt-1.5 block w-full rounded border border-neutral-300 bg-white px-4 py-2.5 text-neutral-950 outline-none focus:border-red-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                />
              </label>
            </div>
            <label className="block text-sm font-medium" htmlFor="capture-date">
              Data da captura
              <div className="relative mt-1.5">
                <input
                  id="capture-date"
                  name="dataDaCaptura"
                  type="date"
                  value={dataDaCaptura || ''}
                  max={getToday()}
                  required
                  onChange={(event) => setDataDaCaptura(event.target.value)}
                  className="block w-full rounded border border-neutral-300 bg-white px-4 py-2.5 text-neutral-950 accent-red-600 outline-none focus:border-red-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
              <span className="mt-1 block text-xs font-normal text-neutral-500 dark:text-neutral-400">A data pode ser hoje ou anterior.</span>
            </label>
            {actions}
          </div>
        </div>
      ) : (
        actions
      )}
    </form>
  )
}

function FormActions({ isDisabled, isSaving, onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
      {onCancel && (
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900">
          <FiX aria-hidden="true" />
          Cancelar
        </button>
      )}
      <button
        type="submit"
        disabled={isDisabled}
        className="inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiSave aria-hidden="true" />
        {isSaving ? 'Salvando...' : 'Salvar Pokémon'}
      </button>
    </div>
  )
}

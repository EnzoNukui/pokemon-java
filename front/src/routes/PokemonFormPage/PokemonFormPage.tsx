import { useEffect, useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PokemonForm from '../../components/PokemonForm/PokemonForm.tsx'
import { createPokemon, getPokemon, updatePokemon } from '../../services/pokemonApi'
import type { Pokemon, PokemonPayload } from '../../types/pokemon'

function getErrorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Não foi possível concluir a operação.'
}

export default function PokemonFormPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const rawCode = searchParams.get('codigo')
  const isEditMode = rawCode !== null
  const codigo = rawCode === null ? null : Number(rawCode)
  const isValidCode = codigo !== null && Number.isInteger(codigo) && codigo > 0

  const [initialPokemon, setInitialPokemon] = useState<Pokemon | undefined>()
  const [isLoadingPokemon, setIsLoadingPokemon] = useState(isEditMode)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    if (!isEditMode) {
      setInitialPokemon(undefined)
      setIsLoadingPokemon(false)
      setError('')
      return () => {
        active = false
      }
    }

    if (!isValidCode || codigo === null) {
      setInitialPokemon(undefined)
      setIsLoadingPokemon(false)
      setError('O código do Pokémon informado na URL é inválido.')
      return () => {
        active = false
      }
    }

    setIsLoadingPokemon(true)
    setInitialPokemon(undefined)
    setError('')

    getPokemon(codigo)
      .then((pokemon) => {
        if (active) setInitialPokemon(pokemon)
      })
      .catch((cause: unknown) => {
        if (active) setError(getErrorMessage(cause))
      })
      .finally(() => {
        if (active) setIsLoadingPokemon(false)
      })

    return () => {
      active = false
    }
  }, [codigo, isEditMode, isValidCode])

  async function handleSubmit(payload: PokemonPayload) {
    setIsSaving(true)
    setError('')

    try {
      if (isEditMode && codigo !== null && isValidCode) {
        await updatePokemon(codigo, payload)
      } else {
        await createPokemon(payload)
      }
      navigate('/', { replace: true })
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4.5rem)] max-w-5xl px-6 py-5 text-current md:px-10 md:py-6">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
      >
        <FiArrowLeft aria-hidden="true" />
        Voltar para coleção
      </button>

      <div className="mx-auto mt-5 max-w-4xl">
        <header className="mb-5 text-center">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {isEditMode ? 'Editar Pokémon' : 'Adicionar Pokémon'}
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {isEditMode ? 'Edite os dados do Pokémon e salve as alterações.' : 'Escolha um Pokémon e informe os dados da captura.'}
          </p>
        </header>

        {error && (
          <div role="alert" className="mb-6 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {isLoadingPokemon ? (
          <p role="status" className="py-16 text-center text-neutral-500">Carregando Pokémon...</p>
        ) : error && isEditMode && !initialPokemon ? (
          <div className="py-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 rounded border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              <FiArrowLeft aria-hidden="true" />
              Voltar para coleção
            </button>
          </div>
        ) : (
          <PokemonForm
            key={initialPokemon?.codigo ?? 'new'}
            initialPokemon={initialPokemon}
            isSaving={isSaving}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/')}
          />
        )}
      </div>
    </main>
  )
}

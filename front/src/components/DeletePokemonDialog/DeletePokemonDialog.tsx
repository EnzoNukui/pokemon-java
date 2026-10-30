import { useEffect, useRef } from 'react'
import { FiAlertTriangle, FiX } from 'react-icons/fi'
import type { Pokemon, PokemonCatalogEntry } from '../../types/pokemon'

type DeletePokemonDialogProps = {
  pokemon: Pokemon | null
  catalogEntry?: PokemonCatalogEntry
  isDeleting: boolean
  error: string
  onCancel: () => void
  onConfirm: () => void
}

export default function DeletePokemonDialog({
  pokemon,
  catalogEntry,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: DeletePokemonDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!pokemon) return

    cancelButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isDeleting) onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pokemon, isDeleting, onCancel])

  if (!pokemon) return null

  const displayName = catalogEntry?.nomeExibicao ?? pokemon.nome

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onCancel()
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-pokemon-title"
        aria-describedby="delete-pokemon-description"
        className="w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-950 p-6 text-white shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <FiAlertTriangle aria-hidden="true" className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="delete-pokemon-title" className="text-lg font-semibold">Excluir Pokémon?</h2>
            <p id="delete-pokemon-description" className="mt-2 text-sm leading-6 text-neutral-400">
              Tem certeza de que deseja remover <span className="font-medium text-white">{displayName}</span> da sua coleção? Essa ação não pode ser desfeita.
            </p>
          </div>
          <button
            type="button"
            aria-label="Fechar diálogo"
            disabled={isDeleting}
            onClick={onCancel}
            className="rounded p-1 text-neutral-500 transition hover:bg-neutral-800 hover:text-white disabled:opacity-50"
          >
            <FiX aria-hidden="true" className="size-5" />
          </button>
        </div>

        {error && <p role="alert" className="mt-4 rounded border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="rounded border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-900 disabled:cursor-wait disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir Pokémon'}
          </button>
        </div>
      </section>
    </div>
  )
}

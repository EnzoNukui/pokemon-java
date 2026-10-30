import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import type { Pokemon, PokemonCatalogEntry } from '../../types/pokemon'

type PokemonCardProps = {
  pokemon: Pokemon
  catalogEntry?: PokemonCatalogEntry
  isCatalogLoading?: boolean
  isDeleting?: boolean
  onEdit: (pokemon: Pokemon) => void
  onDelete: (pokemon: Pokemon) => void
}

const TYPE_COLORS: Record<string, string> = {
  Planta: 'bg-green-600',
  Veneno: 'bg-purple-600',
  Fogo: 'bg-orange-600',
  Água: 'bg-sky-600',
  Elétrico: 'bg-yellow-500',
  Normal: 'bg-neutral-500',
  Lutador: 'bg-red-700',
  Voador: 'bg-indigo-500',
  Terrestre: 'bg-amber-700',
  Pedra: 'bg-stone-600',
  Inseto: 'bg-lime-700',
  Fantasma: 'bg-violet-800',
  Aço: 'bg-slate-500',
  Psíquico: 'bg-pink-600',
  Gelo: 'bg-cyan-600',
  Dragão: 'bg-indigo-700',
  Sombrio: 'bg-neutral-800',
  Fada: 'bg-pink-400',
}

const DARK_TYPE_TEXT = new Set(['Elétrico', 'Fada'])

function formatCaptureDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-')
  return year && month && day ? `${day}/${month}/${year}` : value
}

export default function PokemonCard({ pokemon, catalogEntry, isCatalogLoading = false, isDeleting = false, onEdit, onDelete }: PokemonCardProps) {
  const displayName = catalogEntry?.nomeExibicao ?? pokemon.nome

  return (
    <article className="group relative min-w-0 rounded-lg transition duration-200 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 focus-within:-translate-y-1 focus-within:shadow-xl focus-within:shadow-black/20">
      <Link
        to={`/pokemon/${pokemon.codigo}`}
        aria-label={`Ver detalhes de ${displayName}`}
        className="block rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600"
      >
        <div className="relative aspect-square overflow-hidden rounded bg-neutral-100 p-4 dark:bg-neutral-200">
          {catalogEntry?.imagem ? (
            <img className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-105 group-focus-within:scale-105" src={catalogEntry.imagem} alt="" loading="lazy" />
          ) : isCatalogLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-neutral-500">Carregando...</div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-500">Imagem indisponível</div>
          )}
        </div>

        <div className="pt-3">
          {catalogEntry && <p className="text-xs text-neutral-500 dark:text-neutral-400">Nº {String(catalogEntry.id).padStart(4, '0')}</p>}
          <h2 className="mt-1 truncate text-lg font-semibold">{displayName}</h2>
          {catalogEntry?.tipos.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {catalogEntry.tipos.map((type) => (
                <span key={type} className={`rounded px-3 py-1 text-xs font-medium ${DARK_TYPE_TEXT.has(type) ? 'text-black' : 'text-white'} ${TYPE_COLORS[type] ?? 'bg-neutral-600'}`}>
                  {type}
                </span>
              ))}
            </div>
          ) : null}
          <p className="mt-3 truncate text-sm text-neutral-600 dark:text-neutral-300">
            {catalogEntry?.categoria ?? pokemon.categoria} · {formatCaptureDate(pokemon.dataDaCaptura)}
          </p>
        </div>
      </Link>

        <div className="absolute right-2 top-2 flex gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            aria-label={`Editar ${displayName}`}
            onClick={() => onEdit(pokemon)}
            className="rounded bg-white/95 p-2 text-neutral-700 shadow-sm hover:text-red-600"
          >
            <FiEdit2 aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Excluir ${displayName}`}
            disabled={isDeleting}
            onClick={() => onDelete(pokemon)}
            className="rounded bg-white/95 p-2 text-red-600 shadow-sm hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
          >
            <FiTrash2 aria-hidden="true" />
          </button>
        </div>
    </article>
  )
}

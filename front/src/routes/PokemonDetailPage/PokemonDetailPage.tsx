import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiEdit2, FiRefreshCw } from 'react-icons/fi'
import { getPokemonCatalogEntry } from '../../services/pokeApi'
import { getPokemon } from '../../services/pokemonApi'
import type { Pokemon, PokemonCatalogEntry } from '../../types/pokemon'

function formatCaptureDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-')
  return year && month && day ? `${day}/${month}/${year}` : value
}

function getErrorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Não foi possível carregar os dados deste Pokémon.'
}

export default function PokemonDetailPage() {
  const { codigo } = useParams()
  const databaseId = Number(codigo)
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [catalogEntry, setCatalogEntry] = useState<PokemonCatalogEntry | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true

    async function loadPokemon() {
      setIsLoading(true)
      setError('')
      setPokemon(null)
      setCatalogEntry(null)

      if (!Number.isInteger(databaseId) || databaseId <= 0) {
        setError('O código informado não é válido.')
        setIsLoading(false)
        return
      }

      try {
        const result = await getPokemon(databaseId)
        if (!active) return
        setPokemon(result)

        try {
          const catalog = await getPokemonCatalogEntry(result.nome)
          if (active) setCatalogEntry(catalog)
        } catch {
          // Mantém os dados cadastrados no backend disponíveis sem a PokéAPI.
        }
      } catch (cause) {
        if (active) setError(getErrorMessage(cause))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadPokemon()
    return () => {
      active = false
    }
  }, [databaseId, reloadToken])

  const displayName = catalogEntry?.nomeExibicao ?? pokemon?.nome ?? 'Pokémon'

  return (
    <main className="mx-auto min-h-[calc(100vh-4.5rem)] max-w-5xl px-6 py-8 text-current md:px-10 md:py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-current">
        <FiArrowLeft aria-hidden="true" />
        Voltar para a coleção
      </Link>

      {isLoading ? (
        <p role="status" className="py-24 text-center text-neutral-500">Carregando dados do Pokémon...</p>
      ) : error ? (
        <section className="py-20 text-center">
          <p role="alert" className="text-red-500">{error}</p>
          <button
            type="button"
            onClick={() => setReloadToken((current) => current + 1)}
            className="mt-5 inline-flex items-center gap-2 rounded border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            <FiRefreshCw aria-hidden="true" />
            Tentar novamente
          </button>
        </section>
      ) : pokemon ? (
        <div className="mt-7">
          <section className="grid overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 md:grid-cols-2">
            <div className="relative flex min-h-64 items-center justify-center bg-neutral-100 p-8 dark:bg-neutral-200 md:min-h-[27rem]">
              {catalogEntry?.imagem ? (
                <img src={catalogEntry.imagem} alt={displayName} className="max-h-80 w-full object-contain drop-shadow-xl" />
              ) : (
                <p className="text-sm text-neutral-500">Arte indisponível</p>
              )}
              {catalogEntry && (
                <span className="absolute left-5 top-5 font-mono text-sm font-semibold tracking-wider text-neutral-500">
                  Nº {String(catalogEntry.id).padStart(4, '0')}
                </span>
              )}
            </div>

            <div className="flex flex-col justify-center p-6 md:p-9">
              <p className="text-sm font-medium text-neutral-500">{catalogEntry?.categoria ?? pokemon.categoria}</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">{displayName}</h1>
              {catalogEntry?.tipos.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {catalogEntry.tipos.map((type) => (
                    <span key={type} className="rounded bg-neutral-200 px-3 py-1 text-sm font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">{type}</span>
                  ))}
                </div>
              ) : null}
              <p className="mt-6 leading-7 text-neutral-600 dark:text-neutral-300">
                {catalogEntry?.descricao ?? 'Informações detalhadas da PokéAPI indisponíveis no momento.'}
              </p>

              <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-5 dark:border-neutral-800">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">Altura</dt>
                  <dd className="mt-1 font-semibold">{catalogEntry?.altura ?? pokemon.altura} m</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">Peso</dt>
                  <dd className="mt-1 font-semibold">{catalogEntry?.peso ?? pokemon.peso} kg</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">Capturado em</dt>
                  <dd className="mt-1 font-semibold">{formatCaptureDate(pokemon.dataDaCaptura)}</dd>
                </div>
              </dl>

              <Link
                to={`/formulario?codigo=${pokemon.codigo}`}
                className="mt-7 inline-flex w-fit items-center gap-2 rounded bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <FiEdit2 aria-hidden="true" />
                Editar Pokémon
              </Link>
            </div>
          </section>

          {catalogEntry?.stats.length ? (
            <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950 md:p-8">
              <h2 className="text-lg font-semibold">Atributos base</h2>
              <div className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {catalogEntry.stats.map(({ nome, valor }) => (
                  <div key={nome}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-neutral-500">{nome}</span>
                      <span className="font-semibold tabular-nums">{valor}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                      <div className="h-full rounded-full bg-red-600" style={{ width: `${Math.min((valor / 255) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </main>
  )
}

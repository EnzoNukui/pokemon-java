import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiFilter, FiRefreshCw, FiSearch } from 'react-icons/fi'
import DeletePokemonDialog from '../../components/DeletePokemonDialog/DeletePokemonDialog.tsx'
import PokemonCard from '../../components/PokemonCard/PokemonCard.tsx'
import { getPokemonCatalogEntry } from '../../services/pokeApi'
import { deletePokemon, listPokemons } from '../../services/pokemonApi'
import type { Pokemon, PokemonCatalogEntry } from '../../types/pokemon'

function getErrorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Não foi possível carregar a coleção.'
}

function matchesSearch(pokemon: Pokemon, catalogEntry: PokemonCatalogEntry | undefined, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  const nameQuery = normalizedQuery.replace(/\s+/g, '-')
  const matchesName = pokemon.nome.toLowerCase().includes(nameQuery)
    || (catalogEntry?.nomeExibicao.toLowerCase().includes(normalizedQuery) ?? false)

  const numberQuery = normalizedQuery.replace(/^#/, '')
  const normalizedNumber = numberQuery.replace(/^0+/, '')
  const isNumber = /^\d+$/.test(numberQuery)
  const matchesNumber = isNumber && catalogEntry !== undefined && (
    numberQuery.startsWith('0')
      ? String(catalogEntry.id) === normalizedNumber
      : String(catalogEntry.id).startsWith(normalizedNumber)
  )

  return matchesName || matchesNumber
}

export default function PokemonListPage() {
  const navigate = useNavigate()
  const [pokemons, setPokemons] = useState<Pokemon[]>([])
  const [catalogEntries, setCatalogEntries] = useState<Record<number, PokemonCatalogEntry>>({})
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Pokemon | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [deletingCode, setDeletingCode] = useState<number | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true

    async function loadCollection() {
      setIsLoading(true)
      setError('')
      try {
        const results = await listPokemons()
        if (!active) return

        setPokemons(results)
        setCatalogEntries({})
        setIsLoading(false)
        setIsCatalogLoading(true)

        const catalogResults = await Promise.allSettled(
          results.map((pokemon) => getPokemonCatalogEntry(pokemon.nome)),
        )
        if (!active) return

        const entries: Record<number, PokemonCatalogEntry> = {}
        catalogResults.forEach((result, index) => {
          if (result.status === 'fulfilled') entries[results[index].codigo] = result.value
        })
        setCatalogEntries(entries)
        setIsCatalogLoading(false)
      } catch (cause) {
        if (active) setError(getErrorMessage(cause))
      } finally {
        if (active) {
          setIsLoading(false)
          setIsCatalogLoading(false)
        }
      }
    }

    void loadCollection()
    return () => {
      active = false
    }
  }, [reloadToken])

  const categories = useMemo(
    () => [...new Set(pokemons.map((pokemon) => catalogEntries[pokemon.codigo]?.categoria ?? pokemon.categoria).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [pokemons, catalogEntries],
  )

  const visiblePokemons = useMemo(
    () => pokemons.filter((pokemon) => {
      const catalogEntry = catalogEntries[pokemon.codigo]
      const category = catalogEntry?.categoria ?? pokemon.categoria
      const matchesCategory = !categoryFilter || category === categoryFilter
      return matchesCategory && matchesSearch(pokemon, catalogEntry, search)
    }),
    [pokemons, catalogEntries, search, categoryFilter],
  )

  function requestDelete(pokemon: Pokemon) {
    setDeleteError('')
    setPendingDelete(pokemon)
  }

  async function confirmDelete() {
    if (!pendingDelete) return

    const pokemon = pendingDelete
    setDeletingCode(pokemon.codigo)
    setDeleteError('')
    try {
      await deletePokemon(pokemon.codigo)
      setPokemons((current) => current.filter((item) => item.codigo !== pokemon.codigo))
      setCatalogEntries((current) => {
        const next = { ...current }
        delete next[pokemon.codigo]
        return next
      })
      setPendingDelete(null)
    } catch (cause) {
      setDeleteError(getErrorMessage(cause))
    } finally {
      setDeletingCode(null)
    }
  }

  function handleEdit(pokemon: Pokemon) {
    navigate(`/formulario?codigo=${pokemon.codigo}`)
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4.5rem)] max-w-7xl px-6 py-10 text-current md:px-10">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Minha coleção</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">{pokemons.length} Pokémon capturados</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded border border-neutral-300 bg-white px-4 dark:border-neutral-700 dark:bg-neutral-950 lg:w-80">
            <FiSearch aria-hidden="true" className="shrink-0 text-neutral-500" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome ou número"
              aria-label="Buscar por nome ou número da Pokédex"
              className="min-w-0 flex-1 bg-transparent py-3 text-neutral-950 outline-none placeholder:text-neutral-500 dark:text-white"
            />
          </label>

          <label className="flex items-center gap-2 rounded border border-neutral-300 bg-white px-3 dark:border-neutral-700 dark:bg-neutral-950">
            <FiFilter aria-hidden="true" className="shrink-0 text-neutral-500" />
            <select
              aria-label="Filtrar por categoria"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="min-w-0 bg-transparent py-3 text-sm text-neutral-950 outline-none [color-scheme:light] dark:text-white dark:[color-scheme:dark]"
            >
              <option className="bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white" value="">Todas as categorias</option>
              {categories.map((category) => <option className="bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white" key={category} value={category}>{category}</option>)}
            </select>
          </label>
        </div>
      </div>

      {isLoading ? (
        <p role="status" className="py-16 text-center text-neutral-500">Carregando sua coleção...</p>
      ) : error ? (
        <section className="py-16 text-center">
          <p role="alert" className="text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => setReloadToken((current) => current + 1)}
            className="mt-4 inline-flex items-center gap-2 rounded border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            <FiRefreshCw aria-hidden="true" />
            Tentar novamente
          </button>
        </section>
      ) : pokemons.length === 0 ? (
        <section className="py-20 text-center">
          <h2 className="text-xl font-semibold">Sua coleção ainda está vazia</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">Adicione seu primeiro Pokémon para começar.</p>
          <Link to="/formulario" className="mt-5 inline-flex rounded bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700">
            Adicionar Pokémon
          </Link>
        </section>
      ) : visiblePokemons.length === 0 ? (
        <section className="py-16 text-center">
          <h2 className="text-lg font-semibold">Nenhum Pokémon encontrado</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">Tente outro nome ou ajuste o filtro de categoria.</p>
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setCategoryFilter('')
            }}
            className="mt-4 text-sm font-semibold text-red-600 hover:text-red-700"
          >
            Limpar filtros
          </button>
        </section>
      ) : (
        <section aria-label="Pokémon da coleção" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {visiblePokemons.map((pokemon) => (
            <PokemonCard
              key={pokemon.codigo}
              pokemon={pokemon}
              catalogEntry={catalogEntries[pokemon.codigo]}
              isCatalogLoading={isCatalogLoading}
              isDeleting={deletingCode === pokemon.codigo}
              onEdit={handleEdit}
              onDelete={requestDelete}
            />
          ))}
        </section>
      )}

      {deletingCode !== null && <span className="sr-only" role="status">Excluindo Pokémon...</span>}
      <DeletePokemonDialog
        pokemon={pendingDelete}
        catalogEntry={pendingDelete ? catalogEntries[pendingDelete.codigo] : undefined}
        isDeleting={deletingCode !== null}
        error={deleteError}
        onCancel={() => {
          if (deletingCode === null) setPendingDelete(null)
        }}
        onConfirm={() => void confirmDelete()}
      />
    </main>
  )
}

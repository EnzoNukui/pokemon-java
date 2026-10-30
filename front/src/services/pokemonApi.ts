import type { Pokemon, PokemonPayload } from '../types/pokemon'

const POKEMON_API_URL = 'https://pokemon-java-2cnj.onrender.com/pokemon'

async function getErrorMessage(response: Response): Promise<string> {
  const message = (await response.text()).trim()
  return message || `A API respondeu com o status ${response.status}.`
}

async function request<T>(path = '', init?: RequestInit): Promise<T> {
  let response: Response
  const headers = new Headers(init?.headers)
  headers.set('Accept', 'application/json')
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  try {
    response = await fetch(`${POKEMON_API_URL}${path}`, {
      ...init,
      headers,
    })
  } catch {
    throw new Error('Não foi possível conectar ao backend. Tente novamente em instantes.')
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  if (response.status === 204) return undefined as T

  const contentType = response.headers.get('content-type') ?? ''
  const body = await response.text()

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(body) as T
    } catch {
      // O endpoint de atualização do backend responde texto, embora possa marcá-lo como JSON.
      return body as T
    }
  }

  return body as T
}

export function listPokemons(): Promise<Pokemon[]> {
  return request<Pokemon[]>()
}

export function getPokemon(codigo: number): Promise<Pokemon> {
  return request<Pokemon>(`/${codigo}`)
}

export function createPokemon(pokemon: PokemonPayload): Promise<void> {
  return request<void>('', {
    method: 'POST',
    body: JSON.stringify(pokemon),
  })
}

export function updatePokemon(codigo: number, pokemon: PokemonPayload): Promise<string> {
  return request<string>(`/${codigo}`, {
    method: 'PUT',
    body: JSON.stringify(pokemon),
  })
}

export function deletePokemon(codigo: number): Promise<void> {
  return request<void>(`/${codigo}`, { method: 'DELETE' })
}

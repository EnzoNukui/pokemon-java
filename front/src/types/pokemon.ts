export type Pokemon = {
  codigo: number
  nome: string
  altura: number
  peso: number
  categoria: string
  dataDaCaptura: string
}

export type PokemonPayload = Omit<Pokemon, 'codigo'>

export type PokemonSuggestion = {
  id: number
  nome: string
}

export type PokemonCatalogEntry = {
  id: number
  /** Nome canônico da PokéAPI, usado na integração com o backend. */
  nome: string
  nomeExibicao: string
  imagem: string | null
  tipos: string[]
  categoria: string
  altura: number
  peso: number
  descricao: string
  stats: Array<{ nome: string; valor: number }>
}

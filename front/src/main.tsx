import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './globals.css'
import App from './App.tsx'
import PokemonFormPage from './routes/PokemonFormPage/PokemonFormPage.tsx'
import PokemonDetailPage from './routes/PokemonDetailPage/PokemonDetailPage.tsx'
import PokemonListPage from './routes/PokemonListPage/PokemonListPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<PokemonListPage />} />
          <Route path="/pokemon/:codigo" element={<PokemonDetailPage />} />
          <Route path="/formulario" element={<PokemonFormPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

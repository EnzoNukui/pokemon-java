import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header/Header.tsx'

export default function App() {
  const [isLight, setIsLight] = useState(() => localStorage.getItem('pokemon-theme') === 'light')

  useEffect(() => {
    localStorage.setItem('pokemon-theme', isLight ? 'light' : 'dark')
  }, [isLight])

  return (
    <div className={`min-h-screen ${isLight ? 'bg-white text-neutral-950' : 'dark bg-black text-white'}`}>
      <Header isLight={isLight} onToggleTheme={() => setIsLight((current) => !current)} />
      <Outlet />
    </div>
  )
}

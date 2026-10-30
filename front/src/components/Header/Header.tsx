import { Link } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import ThemeToggle from '../ThemeToggle/ThemeToggle.tsx'

type HeaderProps = {
  isLight: boolean
  onToggleTheme: () => void
}

export default function Header({ isLight, onToggleTheme }: HeaderProps) {
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-neutral-200 bg-white px-6 py-4 text-neutral-950 dark:border-neutral-800 dark:bg-black dark:text-white md:px-10">
      <Link className="text-xl font-bold" to="/">
        Minha Pokédex
      </Link>
      <nav className="hidden justify-self-center sm:block">
        <Link className="text-sm font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white" to="/">
          Coleção
        </Link>
      </nav>
      <div className="flex items-center justify-self-end gap-4">
        <Link className="inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700" to="/formulario">
          <FiPlus aria-hidden="true" />
          <span>Adicionar Pokémon</span>
        </Link>
        <ThemeToggle isLight={isLight} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}

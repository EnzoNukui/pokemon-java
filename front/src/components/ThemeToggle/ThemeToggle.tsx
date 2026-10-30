import { FiMoon, FiSun } from 'react-icons/fi'

type ThemeToggleProps = {
  isLight: boolean
  onToggle: () => void
}

export default function ThemeToggle({ isLight, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      aria-label={isLight ? 'Ativar tema escuro' : 'Ativar tema claro'}
      aria-pressed={isLight}
      onClick={onToggle}
      className="rounded border border-neutral-300 p-2 text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
    >
      {isLight ? <FiMoon aria-hidden="true" /> : <FiSun aria-hidden="true" />}
    </button>
  )
}

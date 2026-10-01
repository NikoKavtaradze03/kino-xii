import { Logo } from '@/shared/ui/Logo'

const currentYear = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="flex flex-col gap-5 px-8.5 pt-6.75 pb-8.5">
      <hr className="h-px border-0 bg-raised" />
      <div className="flex items-center justify-between">
        <Logo className="gap-1 text-button" />
        <p className="text-body-s text-secondary">© {currentYear} Kino XII. All rights reserved.</p>
      </div>
    </footer>
  )
}

import { Modal } from '@/shared/ui/Modal'
import { useAuthStore } from '../store'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export function AuthModals() {
  const modal = useAuthStore((state) => state.modal)
  const closeModal = useAuthStore((state) => state.closeModal)

  const handleOpenChange = (open: boolean) => {
    if (!open) closeModal()
  }

  return (
    <>
      <Modal
        open={modal === 'login'}
        onOpenChange={handleOpenChange}
        title="Log in"
        description="Welcome back to Kino XII"
      >
        <LoginForm />
      </Modal>
      <Modal
        open={modal === 'register'}
        onOpenChange={handleOpenChange}
        title="Sign up"
        description="Welcome to Kino XII"
      >
        <RegisterForm />
      </Modal>
    </>
  )
}

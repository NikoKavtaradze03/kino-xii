import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { applyServerErrors, useSchemaValid } from '@/shared/lib/forms'
import { Button } from '@/shared/ui/Button'
import { FormError } from '@/shared/ui/FormError'
import { TextField } from '@/shared/ui/TextField'
import { useLogin } from '../hooks'
import { loginSchema, type LoginValues } from '../schemas'
import { useAuthStore } from '../store'
import { AuthSwitch } from './AuthSwitch'

export function LoginForm() {
  const openModal = useAuthStore((state) => state.openModal)
  const loginMutation = useLogin()
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })
  const canSubmit = useSchemaValid(control, loginSchema)

  const onSubmit = handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values)
    } catch (error) {
      applyServerErrors(error, setError)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-[339px] flex-col gap-8">
      <div className="flex flex-col gap-6">
        <TextField
          label="Email"
          autoFocus
          type="email"
          autoComplete="email"
          placeholder="example@gmail.com"
          error={errors.email?.message}
          valid={touchedFields.email && !errors.email}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          valid={touchedFields.password && !errors.password}
          {...register('password')}
        />
      </div>

      <div className="flex flex-col gap-6">
        <FormError message={errors.root?.server?.message} />
        <Button type="submit" disabled={!canSubmit} loading={isSubmitting} className="w-full">
          Log in
        </Button>
        <AuthSwitch
          prompt="Don't have an account?"
          action="Sign up"
          onClick={() => openModal('register')}
        />
      </div>
    </form>
  )
}

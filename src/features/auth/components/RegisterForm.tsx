import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { applyServerErrors, useSchemaValid } from '@/shared/lib/forms'
import { Button } from '@/shared/ui/Button'
import { FormError } from '@/shared/ui/FormError'
import { TextField } from '@/shared/ui/TextField'
import { useRegister } from '../hooks'
import { registerSchema, type RegisterValues } from '../schemas'
import { useAuthStore } from '../store'
import { AuthSwitch } from './AuthSwitch'
import { AvatarInput } from './AvatarInput'

export function RegisterForm() {
  const openModal = useAuthStore((state) => state.openModal)
  const registerMutation = useRegister()
  const {
    register,
    control,
    trigger,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { username: '', email: '', password: '', passwordConfirmation: '' },
  })
  const canSubmit = useSchemaValid(control, registerSchema)

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync(values)
    } catch (error) {
      applyServerErrors(error, setError, { password_confirmation: 'passwordConfirmation' })
    }
  })

  const isValidField = (name: keyof RegisterValues) => touchedFields[name] && !errors[name]

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-[411px] flex-col gap-8">
      <Controller
        name="avatar"
        control={control}
        render={({ field, fieldState }) => (
          <AvatarInput
            value={field.value}
            onChange={(file) => {
              field.onChange(file)
              void trigger('avatar')
            }}
            error={fieldState.error?.message}
          />
        )}
      />

      <div className="flex flex-col gap-6">
        <TextField
          label="Username"
          autoFocus
          autoComplete="username"
          placeholder="User"
          error={errors.username?.message}
          valid={isValidField('username')}
          {...register('username')}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="example@gmail.com"
          error={errors.email?.message}
          valid={isValidField('email')}
          {...register('email')}
        />
        <div className="flex items-start gap-3">
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="flex-1"
            error={errors.password?.message}
            valid={isValidField('password')}
            {...register('password', {
              onBlur: () => touchedFields.passwordConfirmation && trigger('passwordConfirmation'),
            })}
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="flex-1"
            error={errors.passwordConfirmation?.message}
            valid={isValidField('passwordConfirmation')}
            {...register('passwordConfirmation')}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <FormError message={errors.root?.server?.message} />
        <Button type="submit" disabled={!canSubmit} loading={isSubmitting} className="w-full">
          Sign up
        </Button>
        <AuthSwitch
          prompt="Already have an account?"
          action="Log in"
          onClick={() => openModal('login')}
        />
      </div>
    </form>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useFilterOptions } from '@/shared/api/filterOptions'
import type { User } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { applyServerErrors, useSchemaValid } from '@/shared/lib/forms'
import { Button } from '@/shared/ui/Button'
import { FormError } from '@/shared/ui/FormError'
import { SelectField } from '@/shared/ui/SelectField'
import { TextField } from '@/shared/ui/TextField'
import { useUpdateProfile } from '../hooks'
import { profileSchema, profileValues, type ProfileValues } from '../schemas'

export function ProfileForm({ user }: { user: User }) {
  const { data: options } = useFilterOptions()
  const updateMutation = useUpdateProfile()
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, touchedFields, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: profileValues(user),
  })
  const isValid = useSchemaValid(control, profileSchema)
  // A native date input has no placeholder styling; its empty "mm/dd/yyyy" is greyed like one.
  const dateOfBirth = useWatch({ control, name: 'dateOfBirth' })
  const [today] = useState(() => format(new Date(), 'yyyy-MM-dd'))

  const onSubmit = handleSubmit(async ({ preferredVenueId, ...values }) => {
    try {
      const saved = await updateMutation.mutateAsync({
        ...values,
        preferredVenueId: preferredVenueId ? Number(preferredVenueId) : null,
      })
      reset(profileValues(saved))
    } catch (error) {
      applyServerErrors(error, setError)
    }
  })

  const isValidField = (name: keyof ProfileValues) => touchedFields[name] && !errors[name]
  const venues = (options?.venues ?? []).map((venue) => ({
    value: String(venue.id),
    label: venue.name,
  }))

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-9">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4.5">
          <TextField
            label="Full name"
            autoComplete="name"
            placeholder="e.g. Nino Beridze"
            error={errors.fullName?.message}
            valid={isValidField('fullName')}
            {...register('fullName')}
          />
          <TextField
            label="Email"
            type="email"
            value={user.email}
            readOnly
            disabled
            hint="Set at registration and cannot be changed"
          />
        </div>

        <div className="flex flex-col gap-5">
          <TextField
            label="Mobile number"
            type="tel"
            autoComplete="tel-national"
            placeholder="e.g. 555 123 456"
            error={errors.mobileNumber?.message}
            valid={isValidField('mobileNumber')}
            {...register('mobileNumber')}
          />
          <TextField
            label="Date of birth"
            type="date"
            autoComplete="bday"
            max={today}
            icon="calendar"
            className={cn(
              '[&_input]:scheme-dark [&_input::-webkit-calendar-picker-indicator]:hidden',
              !dateOfBirth && !errors.dateOfBirth && '[&_input]:text-secondary',
            )}
            error={errors.dateOfBirth?.message}
            valid={isValidField('dateOfBirth')}
            {...register('dateOfBirth')}
          />
          <Controller
            name="preferredVenueId"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Preferred Venue (Optional)"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={venues}
                placeholder="Choose a venue"
                emptyLabel="No preference"
              />
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <FormError message={errors.root?.server?.message} />
        <Button
          type="submit"
          disabled={!isDirty || !isValid}
          loading={isSubmitting}
          className="self-start"
        >
          Save changes
        </Button>
      </div>
    </form>
  )
}

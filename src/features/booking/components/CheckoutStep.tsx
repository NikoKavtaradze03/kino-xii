import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { SeatHold, Session, TicketType, User } from '@/shared/api/types'
import { formatDate } from '@/shared/lib/format'
import { applyServerErrors, useSchemaValid } from '@/shared/lib/forms'
import { Button } from '@/shared/ui/Button'
import { FormError } from '@/shared/ui/FormError'
import { TextField } from '@/shared/ui/TextField'
import { ticketSummary } from '../rules'
import { checkoutSchema, type CheckoutValues } from '../schemas'
import { BookingColumns } from './BookingColumns'
import { StepPills } from './StepPills'
import { SubtotalBar } from './SubtotalBar'
import { SummaryRow } from './SummaryRow'

const FORM_ID = 'checkout-form'

type CheckoutStepProps = {
  session: Session
  hold: SeatHold
  user: User
  ticketTypes: TicketType[]
  onBack: () => void
  /** Resolves when the order is handled; rejects with errors that belong on the form. */
  onPay: (values: CheckoutValues) => Promise<void>
}

export function CheckoutStep({
  session,
  hold,
  user,
  ticketTypes,
  onBack,
  onPay,
}: CheckoutStepProps) {
  // Prefilled from the profile, which only allows booking once these are complete and valid.
  const prefilled = {
    fullName: user.fullName ?? '',
    email: user.email,
    mobileNumber: user.mobileNumber ?? '',
  }
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: { ...prefilled, cardNumber: '', expiry: '', cvv: '' },
  })
  const canSubmit = useSchemaValid(control, checkoutSchema)

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onPay(values)
    } catch (error) {
      applyServerErrors(error, setError)
    }
  })

  const field = (name: keyof CheckoutValues) => {
    const isPrefilled = name in prefilled && prefilled[name as keyof typeof prefilled] !== ''
    return {
      error: errors[name]?.message,
      valid: !errors[name] && (touchedFields[name] || isPrefilled),
      ...register(name),
    }
  }

  return (
    <BookingColumns
      main={
        <div className="flex flex-col gap-6">
          <StepPills step="checkout" onBack={onBack} />
          <form id={FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-4.5">
              <TextField
                className="min-h-17.25"
                label="Full name"
                autoComplete="name"
                placeholder="e.g. Nino Beridze"
                {...field('fullName')}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  className="min-h-17.25"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. example@gmail.com"
                  {...field('email')}
                />
                <TextField
                  className="min-h-17.25"
                  label="Mobile number"
                  type="tel"
                  autoComplete="tel-national"
                  placeholder="e.g. 555 123 456"
                  {...field('mobileNumber')}
                />
              </div>
            </div>
            <div className="h-px rounded-full bg-card" />
            <div className="flex flex-col gap-4.5">
              <TextField
                className="min-h-17.25"
                label="Card number"
                inputMode="numeric"
                autoComplete="cc-number"
                maxLength={19}
                placeholder="e.g. 1234 4567 8901 2345"
                {...field('cardNumber')}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  className="min-h-17.25"
                  label="Expiry"
                  autoComplete="cc-exp"
                  maxLength={5}
                  placeholder="e.g. 12/34"
                  {...field('expiry')}
                />
                <TextField
                  className="min-h-17.25"
                  label="CVV"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={3}
                  placeholder="e.g. 123"
                  {...field('cvv')}
                />
              </div>
            </div>
            <FormError message={errors.root?.server?.message} />
          </form>
        </div>
      }
      aside={
        <>
          <div className="flex flex-col gap-3">
            <h3 className="text-button">Summary</h3>
            <div className="flex flex-col gap-2.5 rounded-xl bg-card p-4">
              <div className="flex flex-col gap-2">
                <p className="text-button uppercase">{session.movie.title}</p>
                <p className="text-body-s text-secondary">
                  Hall {session.hall.name} · {formatDate(session.date, 'EEE d MMM')} ·{' '}
                  {session.time}
                </p>
              </div>
              <div className="h-px bg-raised" />
              <dl className="flex flex-col gap-2.5">
                <SummaryRow label="Seats" valueClassName="text-label-s">
                  {hold.seats.map((seat) => seat.code).join(', ')}
                </SummaryRow>
                <SummaryRow label="Tickets" valueClassName="text-body-s">
                  {ticketSummary(hold.seats, ticketTypes)}
                </SummaryRow>
              </dl>
            </div>
          </div>
          <SubtotalBar amount={hold.subtotal}>
            <div className="flex gap-3">
              <Button variant="transparent" onClick={onBack}>
                Back
              </Button>
              <Button
                type="submit"
                form={FORM_ID}
                disabled={!canSubmit}
                loading={isSubmitting}
                className="flex-1"
              >
                Pay: Complete order
              </Button>
            </div>
          </SubtotalBar>
        </>
      }
    />
  )
}

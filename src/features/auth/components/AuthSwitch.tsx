type AuthSwitchProps = {
  prompt: string
  action: string
  onClick: () => void
}

export function AuthSwitch({ prompt, action, onClick }: AuthSwitchProps) {
  return (
    <p className="flex justify-center gap-1.25 text-body-m text-secondary">
      {prompt}
      <button type="button" onClick={onClick} className="cursor-pointer text-button text-red">
        {action}
      </button>
    </p>
  )
}

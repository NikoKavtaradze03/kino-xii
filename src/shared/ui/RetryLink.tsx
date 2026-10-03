type RetryLinkProps = { onRetry: () => void; retrying?: boolean }

/** "Try again" inside a line of text, where an `ErrorState` with its button would not fit. */
export function RetryLink({ onRetry, retrying }: RetryLinkProps) {
  return (
    <button
      type="button"
      onClick={onRetry}
      disabled={retrying}
      className="cursor-pointer underline disabled:cursor-not-allowed disabled:opacity-40"
    >
      Try again
    </button>
  )
}

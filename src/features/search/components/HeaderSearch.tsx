import { useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { moviePath } from '@/features/catalogue/lib'
import { cn } from '@/shared/lib/cn'
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue'
import { Icon } from '@/shared/ui/Icon'
import { useSearchResults } from '../hooks'
import { optionId } from '../lib'
import { SearchPanel } from './SearchPanel'

const DEBOUNCE_MS = 300

/**
 * The navbar search pill. Focusing it opens Figma's overlay in place: the field widens from 380 to
 * 480px, the page is dimmed, and a panel below shows a prompt, the results or "No results".
 * Keyboard: Up/Down move through the results, Enter opens one, Escape closes.
 */
export function HeaderSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const trimmed = query.trim()
  const debounced = useDebouncedValue(trimmed, DEBOUNCE_MS)
  const search = useSearchResults(debounced)
  // While the next query loads, the previous results stay up; a previous empty list is not shown,
  // so "No results" never appears for text it doesn't belong to.
  const stale = search.isPlaceholderData && !search.data?.length
  const results = debounced && !stale ? search.data : undefined

  // Figma has no closed state with text in it, so closing also empties the field.
  const close = () => {
    setOpen(false)
    setQuery('')
    setActive(-1)
    inputRef.current?.blur()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const count = results?.length ?? 0
    if (event.key === 'Escape') {
      close()
    } else if (event.key === 'ArrowDown' && count) {
      event.preventDefault()
      setActive((index) => Math.min(index + 1, count - 1))
    } else if (event.key === 'ArrowUp' && count) {
      event.preventDefault()
      setActive((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && results?.[active]) {
      navigate(moviePath(results[active]))
      close()
    }
  }

  return (
    <div
      className="relative z-10 flex w-120 justify-end"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close()
      }}
    >
      {/* Opening animates (300 ms, like our hover fades): the bar widens to the left, the placeholder
          and border fade, and the backdrop and panel fade in. Figma's prototype switches instantly. */}
      {open && (
        <div
          aria-hidden
          className="fixed inset-0 -z-10 bg-black/20 transition-opacity duration-300 ease-out motion-reduce:transition-none starting:opacity-0"
          onMouseDown={close}
        />
      )}

      {/* A click anywhere on the bar (padding, icon) focuses the field; keyboard users reach the
          input directly, so this is a mouse convenience only. */}
      <div
        onMouseDown={(event) => {
          if ((event.target as Element).closest('input, button')) return
          event.preventDefault()
          inputRef.current?.focus()
        }}
        className={cn(
          'flex h-10.25 cursor-text items-center rounded-full bg-tint-white py-1.5 ring-1 transition-[width,box-shadow] duration-300 ease-out ring-inset motion-reduce:transition-none',
          open
            ? 'w-full ring-tint-white backdrop-blur-[5.6px]'
            : 'w-95 ring-transparent hover:ring-tint-white',
          !open ? 'px-3' : trimmed ? 'pr-2.25 pl-3.25' : 'pr-3 pl-6.75',
        )}
      >
        {(!open || trimmed) && <Icon name="search" className="-m-px shrink-0" />}
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search films and live events"
          aria-expanded={open}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={results?.[active] ? optionId(results[active]) : undefined}
          value={query}
          placeholder="Search films and live events"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(-1)
          }}
          onKeyDown={onKeyDown}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-body-m caret-primary outline-none placeholder:transition-colors placeholder:duration-300 placeholder:ease-out motion-reduce:placeholder:transition-none [&::-webkit-search-cancel-button]:appearance-none',
            open ? 'placeholder:text-disabled' : 'placeholder:text-primary',
            !open ? 'ml-1' : trimmed && 'ml-2',
          )}
        />
        {trimmed && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={close}
            className="relative size-6 shrink-0 cursor-pointer rounded-full bg-tint-white"
          >
            <span className="absolute top-1/2 left-1/2 h-[1.5px] w-2.5 -translate-1/2 rotate-45 bg-primary" />
            <span className="absolute top-1/2 left-1/2 h-[1.5px] w-2.5 -translate-1/2 -rotate-45 bg-primary" />
          </button>
        )}
      </div>

      {open && (
        <SearchPanel
          query={trimmed}
          resultsQuery={debounced}
          results={results}
          error={debounced ? search.error : null}
          onRetry={() => void search.refetch()}
          active={active}
          onActiveChange={setActive}
          onNavigate={close}
        />
      )}
    </div>
  )
}

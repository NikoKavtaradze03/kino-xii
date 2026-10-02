import { Select } from 'radix-ui'
import type { FilterOptions, SortId } from '@/shared/api/types'
import { Icon } from '@/shared/ui/Icon'

type SortSelectProps = {
  sorts: FilterOptions['sorts']
  value: SortId
  onChange: (sort: SortId) => void
}

export function SortSelect({ sorts, value, onChange }: SortSelectProps) {
  return (
    <Select.Root value={value} onValueChange={(sort) => onChange(sort as SortId)}>
      <Select.Trigger className="group flex cursor-pointer items-center gap-2 rounded-[10px] pr-3.5 pl-4">
        <span className="text-body-m text-secondary">Sort:</span>
        <span className="text-button">
          <Select.Value />
        </span>
        <Select.Icon>
          <Icon
            name="chevron-down"
            className="transition-transform group-data-[state=open]:rotate-180"
          />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          align="end"
          sideOffset={8}
          className="z-30 min-w-(--radix-select-trigger-width) overflow-hidden rounded-2xl bg-card py-2.5"
        >
          <Select.Viewport>
            {sorts.map((sort) => (
              <Select.Item
                key={sort.id}
                value={sort.id}
                className="flex h-10 cursor-pointer items-center justify-between gap-6 px-5 text-label-m outline-none data-highlighted:bg-raised"
              >
                <Select.ItemText>{sort.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Icon name="check" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

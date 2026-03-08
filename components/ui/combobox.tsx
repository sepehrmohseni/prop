"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, SearchIcon, CheckIcon } from "lucide-react";

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string | null | undefined;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  allowClear?: boolean;
  clearLabel?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  allowClear = false,
  clearLabel = "None",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          side="bottom"
          align="start"
          sideOffset={4}
          className="isolate z-50"
          style={{ width: "var(--anchor-width)" }}
        >
          <PopoverPrimitive.Popup className="rounded-lg bg-popover shadow-md ring-1 ring-foreground/10 outline-hidden data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <CommandPrimitive className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 border-b px-3 py-2">
                <SearchIcon className="h-4 w-4 shrink-0 opacity-50" />
                <CommandPrimitive.Input
                  placeholder={searchPlaceholder}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <CommandPrimitive.List className="max-h-56 overflow-y-auto p-1">
                <CommandPrimitive.Empty className="py-4 text-center text-sm text-muted-foreground">
                  {emptyText}
                </CommandPrimitive.Empty>
                {allowClear && (
                  <CommandPrimitive.Item
                    value="__clear__"
                    onSelect={() => {
                      onValueChange(null);
                      setOpen(false);
                    }}
                    className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-muted data-selected:text-foreground"
                  >
                    <span className="text-muted-foreground">{clearLabel}</span>
                    {value == null && (
                      <CheckIcon className="ml-auto h-4 w-4" />
                    )}
                  </CommandPrimitive.Item>
                )}
                {options.map((option) => (
                  <CommandPrimitive.Item
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                    className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-muted data-selected:text-foreground"
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && (
                      <CheckIcon className="ml-auto h-4 w-4 shrink-0" />
                    )}
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.List>
            </CommandPrimitive>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

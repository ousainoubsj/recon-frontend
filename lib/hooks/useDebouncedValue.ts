import { useEffect, useState } from 'react'

// Server-side search: wait for typing to pause instead of firing one request per keystroke.
export function useDebouncedValue<T>(value: T, delayMs = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeoutId)
  }, [value, delayMs])
  return debounced
}

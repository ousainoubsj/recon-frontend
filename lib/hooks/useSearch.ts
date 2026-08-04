import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '@/lib/axios'
import type { SearchResults } from '@/types/search'

export function useGlobalSearch(query: string) {
  const q = query.trim()
  return useQuery({
    queryKey: ['search', q],
    queryFn: async () => (await axiosInstance.get<SearchResults>('/search', { params: { q } })).data,
    enabled: q.length >= 2,
    throwOnError: false,
  })
}

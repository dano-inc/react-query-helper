import type {
  CancelOptions,
  FetchInfiniteQueryOptions,
  FetchQueryOptions,
  InfiniteData,
  InvalidateOptions,
  InvalidateQueryFilters,
  QueryClient,
  QueryKey,
  RefetchOptions,
  RefetchQueryFilters,
  ResetOptions,
  ResetQueryFilters,
  SetDataOptions,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useIsFetching,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import { QueryState } from 'react-query/types/core/query';
import { QueryFilters, Updater } from 'react-query/types/core/utils';

export interface TypedQueryClient<
  TQueryFnArgs extends unknown[] = [],
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> {
  isFetching(filters?: QueryFilters): number;
  fetchQuery(
    ...args: [
      ...args: TQueryFnArgs,
      options?: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>
    ]
  ): Promise<TData>;
  prefetchQuery(
    ...args: [
      ...args: TQueryFnArgs,
      options?: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>
    ]
  ): Promise<void>;
  fetchInfiniteQuery(
    ...args: [
      ...args: TQueryFnArgs,
      options?: FetchInfiniteQueryOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryKey
      >
    ]
  ): Promise<InfiniteData<TData>>;
  prefetchInfiniteQuery(
    ...args: [
      ...args: TQueryFnArgs,
      options?: FetchInfiniteQueryOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryKey
      >
    ]
  ): Promise<void>;
  getQueryData(
    ...args: [...args: TQueryFnArgs, filters?: QueryFilters]
  ): TData | undefined;
  getQueriesData(filters?: QueryFilters): [QueryKey, TData][];
  setQueryData(
    ...args: [
      ...args: TQueryFnArgs,
      updater: Updater<TData | undefined, TData | undefined>,
      options?: SetDataOptions
    ]
  ): TData;
  setQueriesData(
    updater: Updater<TData | undefined, TData | undefined>
  ): [QueryKey, TData][];
  getQueryState(
    ...args: [...args: TQueryFnArgs, filters?: QueryFilters]
  ): QueryState<TData, TError> | undefined;
  invalidateQueries<TPageData = unknown>(
    filters?: InvalidateQueryFilters<TPageData>,
    options?: InvalidateOptions
  ): Promise<void>;
  refetchQueries<TPageData = unknown>(
    filters?: RefetchQueryFilters<TPageData>,
    options?: RefetchOptions
  ): Promise<void>;
  cancelQueries(filters?: QueryFilters, options?: CancelOptions): Promise<void>;
  removeQueries(filters?: QueryFilters): void;
  resetQueries<TPageData = unknown>(
    filters?: ResetQueryFilters<TPageData>,
    options?: ResetOptions
  ): Promise<void>;

  // Custom
  withQueryClient(
    queryClient: QueryClient
  ): TypedQueryClient<TQueryFnArgs, TQueryFnData, TError>;
  setInfiniteQueriesData(
    updater: Updater<
      InfiniteData<TData> | undefined,
      InfiniteData<TData> | undefined
    >
  ): [QueryKey, InfiniteData<TData>][];
  getInfiniteQueriesData(
    filters?: QueryFilters
  ): [QueryKey, InfiniteData<TData>][];
  setInfiniteQueryData(
    ...args: [
      ...args: TQueryFnArgs,
      updater: Updater<
        InfiniteData<TData> | undefined,
        InfiniteData<TData> | undefined
      >,
      options?: SetDataOptions
    ]
  ): InfiniteData<TData>;
  getInfiniteQueryData(
    ...args: [...args: TQueryFnArgs, filters?: QueryFilters]
  ): InfiniteData<TData> | undefined;

  // Hooks
  useIsFetching(
    ...args: [...args: TQueryFnArgs, filters?: QueryFilters]
  ): number;
  useQuery(
    ...args: [
      ...args: TQueryFnArgs,
      filters?: UseQueryOptions<TQueryFnData, TError>
    ]
  ): UseQueryResult<TData, TError>;
  useInfiniteQuery(
    ...args: [
      ...args: TQueryFnArgs,
      filters?: UseInfiniteQueryOptions<TQueryFnData, TError>
    ]
  ): UseInfiniteQueryResult<TData, TError>;
}

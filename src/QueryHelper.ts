import type {
  CancelOptions,
  FetchInfiniteQueryOptions,
  FetchQueryOptions,
  InvalidateQueryFilters,
  QueryClient,
  RefetchOptions,
  RefetchQueryFilters,
  SetDataOptions,
  UseInfiniteQueryOptions,
  UseQueryOptions,
} from 'react-query';
import { useInfiniteQuery, useQuery } from 'react-query';
import { QueryFilters } from 'react-query/types/core/utils';

type Awaited<T> = T extends Promise<infer U> ? U : T;
type Updater<T> = T | ((oldData: T | undefined) => T);

export class QueryHelper<
  TQueryFn extends (...args: any[]) => unknown,
  TQueryFnArgs extends unknown[] = Parameters<TQueryFn>,
  TQueryFnResult extends unknown = Awaited<ReturnType<TQueryFn>>
> {
  static queryClient: QueryClient;

  public static setQueryClient(queryClient: QueryClient): void {
    this.queryClient = queryClient;
  }

  private getQueryClient(): QueryClient {
    if (!QueryHelper.queryClient) {
      throw Error(
        'QueryClient is not set. Please call QueryHelper.setQueryClient static method.'
      );
    }

    return QueryHelper.queryClient;
  }

  private baseQueryKey: unknown[];
  private queryFn: TQueryFn;

  private splitArgs<TRestArgs extends unknown[]>(
    args: unknown[]
  ): [TQueryFnArgs, TRestArgs] {
    const queryFnArgs = args.slice(0, this.queryFn.length) as TQueryFnArgs;
    const restArgs = args.slice(this.queryFn.length) as TRestArgs;

    return [queryFnArgs, restArgs];
  }

  private getQueryKey(queryFnArgs: TQueryFnArgs) {
    return [...this.baseQueryKey, ...queryFnArgs];
  }

  private getQueryFn(queryFnArgs: TQueryFnArgs) {
    // TODO: how to handle QueryFunctionContext? should it causes breaking changes?
    return () => this.queryFn.apply(null, queryFnArgs) as TQueryFnResult;
  }

  constructor(baseQueryKey: unknown[], queryFn: TQueryFn) {
    this.baseQueryKey = baseQueryKey;
    this.queryFn = queryFn;
  }

  createQuery(defaultUseQueryOptions: UseQueryOptions<TQueryFnResult> = {}) {
    return (
      ...args: [
        ...queryFnArgs: TQueryFnArgs,
        options?: UseQueryOptions<TQueryFnResult>
      ]
    ) => {
      const [queryFnArgs, [options]] =
        this.splitArgs<[UseQueryOptions<TQueryFnResult>]>(args);

      return useQuery({
        queryKey: this.getQueryKey(queryFnArgs),
        queryFn: this.getQueryFn(queryFnArgs),
        ...defaultUseQueryOptions,
        ...options,
      });
    };
  }

  createInfiniteQuery(
    defaultUseInfiniteQueryOptions: UseInfiniteQueryOptions<TQueryFnResult> = {}
  ) {
    return (
      ...args: [
        ...queryFnArgs: TQueryFnArgs,
        options?: UseInfiniteQueryOptions<TQueryFnResult>
      ]
    ) => {
      const [queryFnArgs, [options]] =
        this.splitArgs<[UseInfiniteQueryOptions<TQueryFnResult>]>(args);

      return useInfiniteQuery({
        queryKey: this.getQueryKey(queryFnArgs),
        queryFn: this.getQueryFn(queryFnArgs),
        ...defaultUseInfiniteQueryOptions,
        ...options,
      });
    };
  }

  fetchQuery(
    ...args: [
      ...queryFnArgs: TQueryFnArgs,
      options?: FetchQueryOptions<TQueryFnResult>
    ]
  ) {
    const [queryFnArgs, [options]] =
      this.splitArgs<[FetchQueryOptions<TQueryFnResult>]>(args);
    const queryClient = this.getQueryClient();

    return queryClient.fetchQuery({
      queryKey: this.getQueryKey(queryFnArgs),
      queryFn: this.getQueryFn(queryFnArgs),
      ...options,
    });
  }

  fetchInfiniteQuery(
    ...args: [
      ...queryFnArgs: TQueryFnArgs,
      options?: FetchInfiniteQueryOptions<TQueryFnResult>
    ]
  ) {
    const [queryFnArgs, [options]] =
      this.splitArgs<[FetchInfiniteQueryOptions<TQueryFnResult>]>(args);
    const queryClient = this.getQueryClient();

    return queryClient.fetchInfiniteQuery({
      queryKey: this.getQueryKey(queryFnArgs),
      queryFn: this.getQueryFn(queryFnArgs),
      ...options,
    });
  }

  prefetchQuery(
    ...args: [
      ...queryFnArgs: TQueryFnArgs,
      options?: FetchQueryOptions<TQueryFnResult>
    ]
  ) {
    const [queryFnArgs, [options]] =
      this.splitArgs<[FetchQueryOptions<TQueryFnResult>]>(args);
    const queryClient = this.getQueryClient();

    return queryClient.prefetchQuery({
      queryKey: this.getQueryKey(queryFnArgs),
      queryFn: this.getQueryFn(queryFnArgs),
      ...options,
    });
  }

  prefetchInfiniteQuery(
    ...args: [
      ...queryFnArgs: TQueryFnArgs,
      options?: FetchInfiniteQueryOptions<TQueryFnResult>
    ]
  ) {
    const [queryFnArgs, [options]] =
      this.splitArgs<[FetchInfiniteQueryOptions<TQueryFnResult>]>(args);
    const queryClient = this.getQueryClient();

    return queryClient.prefetchInfiniteQuery({
      queryKey: this.getQueryKey(queryFnArgs),
      queryFn: this.getQueryFn(queryFnArgs),
      ...options,
    });
  }

  getQueryData(
    ...args: [...queryFnArgs: TQueryFnArgs, filters?: QueryFilters]
  ) {
    const [queryFnArgs, [filters]] = this.splitArgs<[QueryFilters]>(args);
    const queryClient = this.getQueryClient();

    return queryClient.getQueryData<TQueryFnResult>(
      this.getQueryKey(queryFnArgs),
      filters
    );
  }

  getQueriesData(filters?: QueryFilters) {
    const queryClient = this.getQueryClient();

    return queryClient.getQueriesData<TQueryFnResult>(
      filters || (this.baseQueryKey as any)
    );
  }

  setQueryData(
    ...args: [...queryFnArgs: TQueryFnArgs, updater: Updater<TQueryFnResult>]
  ) {
    const [queryFnArgs, [updater]] =
      this.splitArgs<[Updater<TQueryFnResult>]>(args);
    const queryClient = this.getQueryClient();

    return queryClient.setQueryData(this.getQueryKey(queryFnArgs), updater);
  }

  getQueryState(
    ...args: [...queryFnArgs: TQueryFnArgs, filters?: QueryFilters]
  ) {
    const [queryFnArgs, [filters]] = this.splitArgs<[QueryFilters]>(args);
    const queryClient = this.getQueryClient();

    return queryClient.getQueryState<TQueryFnResult>(
      this.getQueryKey(queryFnArgs),
      filters
    );
  }

  setQueriesData(updater: Updater<TQueryFnResult>, options?: SetDataOptions) {
    const queryClient = this.getQueryClient();

    return queryClient.setQueriesData(this.baseQueryKey, updater, options);
  }

  invalidateQueries(filters?: InvalidateQueryFilters<TQueryFnResult>) {
    const queryClient = this.getQueryClient();

    return queryClient.invalidateQueries(this.baseQueryKey, filters);
  }

  refetchQueries(filters?: RefetchQueryFilters, options?: RefetchOptions) {
    const queryClient = this.getQueryClient();

    return queryClient.refetchQueries<TQueryFnResult>(
      this.baseQueryKey,
      filters,
      options
    );
  }

  cancelQueries(filters?: QueryFilters, options?: CancelOptions) {
    const queryClient = this.getQueryClient();

    return queryClient.cancelQueries(this.baseQueryKey, filters, options);
  }

  removeQueries(filters?: QueryFilters) {
    const queryClient = this.getQueryClient();

    return queryClient.removeQueries(this.baseQueryKey, filters);
  }
}

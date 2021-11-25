import {
  CancelOptions,
  FetchInfiniteQueryOptions,
  FetchQueryOptions,
  InfiniteData,
  InvalidateQueryFilters,
  QueryClient,
  QueryFunctionContext,
  RefetchOptions,
  RefetchQueryFilters,
  ResetOptions,
  SetDataOptions,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useIsFetching,
  useQuery,
  UseQueryOptions,
} from 'react-query';
import { QueryFilters, Updater } from 'react-query/types/core/utils';

type Awaited<T> = T extends Promise<infer U> ? U : T;

export class QueryHelper<
  TQueryFn extends (
    context: QueryFunctionContext
  ) => (...args: any[]) => unknown,
  TQueryFnArgs extends unknown[] = Parameters<ReturnType<TQueryFn>>,
  TQueryFnResult extends unknown = Awaited<ReturnType<ReturnType<TQueryFn>>>
> {
  static queryClient: QueryClient;

  public static setQueryClient(queryClient: QueryClient): void {
    this.queryClient = queryClient;
  }

  private baseQueryKey: unknown[];
  private queryFn: TQueryFn;
  private queryFnArgsLength: number;

  constructor(baseQueryKey: unknown[], queryFn: TQueryFn) {
    this.baseQueryKey = baseQueryKey;
    this.queryFn = queryFn;
    this.queryFnArgsLength = queryFn({
      meta: undefined,
      queryKey: this.baseQueryKey,
    }).length;
  }

  private getQueryClient(): QueryClient {
    if (!QueryHelper.queryClient) {
      throw Error(
        'QueryClient is not set. Please call QueryHelper.setQueryClient static method.'
      );
    }

    return QueryHelper.queryClient;
  }

  private splitArgs<TRestArgs extends unknown[]>(
    args: unknown[]
  ): [TQueryFnArgs, TRestArgs] {
    const queryFnArgs = args.slice(0, this.queryFnArgsLength) as TQueryFnArgs;
    const restArgs = args.slice(this.queryFnArgsLength) as TRestArgs;

    return [queryFnArgs, restArgs];
  }

  private getQueryKey(queryFnArgs: TQueryFnArgs) {
    return [...this.baseQueryKey, ...queryFnArgs];
  }

  private getQueryFn(queryFnArgs: TQueryFnArgs) {
    return (context: QueryFunctionContext) =>
      this.queryFn
        .call(null, context)
        .apply(null, queryFnArgs) as TQueryFnResult;
  }

  createUseQuery(defaultUseQueryOptions: UseQueryOptions<TQueryFnResult> = {}) {
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

  createUseInfiniteQuery(
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

  createUseIsFetching(defaultUseIsFetchingFilters: QueryFilters = {}) {
    return (
      ...args: [...queryFnArgs: TQueryFnArgs, filters?: QueryFilters]
    ) => {
      const [queryFnArgs, [filters]] = this.splitArgs<[QueryFilters?]>(args);

      return useIsFetching(this.getQueryKey(queryFnArgs), {
        ...defaultUseIsFetchingFilters,
        ...filters,
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

  getInfiniteQueryData(
    ...args: [...queryFnArgs: TQueryFnArgs, filters?: QueryFilters]
  ) {
    return this.getQueryData(...args) as
      | InfiniteData<TQueryFnResult>
      | undefined;
  }

  getQueriesData(filters?: QueryFilters) {
    const queryClient = this.getQueryClient();

    return queryClient.getQueriesData<TQueryFnResult>(
      filters || (this.baseQueryKey as any)
    );
  }

  setQueryData(
    ...args: [
      ...queryFnArgs: TQueryFnArgs,
      updater: Updater<TQueryFnResult | undefined, TQueryFnResult>,
      options?: SetDataOptions
    ]
  ) {
    const [queryFnArgs, [updater, options]] =
      this.splitArgs<
        [Updater<TQueryFnResult | undefined, TQueryFnResult>, SetDataOptions?]
      >(args);
    const queryClient = this.getQueryClient();

    return queryClient.setQueryData(
      this.getQueryKey(queryFnArgs),
      updater,
      options
    );
  }

  setInfiniteQueryData(
    ...args: [
      ...queryFnArgs: TQueryFnArgs,
      updater: Updater<
        InfiniteData<TQueryFnResult> | undefined,
        InfiniteData<TQueryFnResult>
      >,
      options?: SetDataOptions
    ]
  ) {
    return this.setQueryData(...(args as any)) as InfiniteData<TQueryFnResult>;
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

  setQueriesData(
    updater: Updater<TQueryFnResult | undefined, TQueryFnResult>,
    options?: SetDataOptions
  ) {
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

  resetQueries(filters?: QueryFilters, options?: ResetOptions) {
    const queryClient = this.getQueryClient();

    return queryClient.resetQueries(this.baseQueryKey, filters, options);
  }

  isFetching(filters?: QueryFilters) {
    const queryClient = this.getQueryClient();

    return queryClient.isFetching(this.baseQueryKey, filters);
  }
}

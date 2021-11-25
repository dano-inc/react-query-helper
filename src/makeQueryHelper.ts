import type {
  CancelOptions,
  FetchInfiniteQueryOptions,
  FetchQueryOptions,
  InfiniteData,
  InvalidateQueryFilters,
  QueryFunctionContext,
  RefetchOptions,
  RefetchQueryFilters,
  ResetOptions,
  SetDataOptions,
  UseInfiniteQueryOptions,
  UseQueryOptions,
} from 'react-query';
import {
  QueryClient,
  useInfiniteQuery,
  useIsFetching,
  useQuery,
} from 'react-query';
import { QueryFilters, Updater } from 'react-query/types/core/utils';

type Awaited<T> = T extends Promise<infer U>
  ? U extends Promise<unknown>
    ? Awaited<U>
    : U
  : T;

export const makeQueryHelper = <
  TQueryFn extends (
    context: QueryFunctionContext
  ) => (...args: any[]) => unknown
>({
  queryClient,
  baseQueryKey,
  queryFn,
}: {
  queryClient: QueryClient;
  baseQueryKey: string[];
  queryFn: TQueryFn;
}) => {
  type TQueryFnArgs = Parameters<ReturnType<TQueryFn>>;
  type TQueryFnResult = Awaited<ReturnType<ReturnType<TQueryFn>>>;

  const queryFnArgsLength = queryFn({
    meta: undefined,
    queryKey: baseQueryKey,
  }).length;

  const getQueryKey = (queryFnArgs: TQueryFnArgs) => [
    ...baseQueryKey,
    ...queryFnArgs,
  ];

  const getQueryFn =
    (queryFnArgs: TQueryFnArgs) => (context: QueryFunctionContext) =>
      queryFn.call(null, context).apply(null, queryFnArgs) as TQueryFnResult;

  const splitArgs = <TRestArgs extends unknown[]>(
    args: unknown[]
  ): [TQueryFnArgs, TRestArgs] => {
    const queryFnArgs = args.slice(0, queryFnArgsLength) as TQueryFnArgs;
    const restArgs = args.slice(queryFnArgsLength) as TRestArgs;

    return [queryFnArgs, restArgs];
  };

  const queryHelper = (queryClient: QueryClient) => ({
    createUseQuery(
      defaultUseQueryOptions: UseQueryOptions<TQueryFnResult> = {}
    ) {
      return (
        ...args: [
          ...queryFnArgs: TQueryFnArgs,
          options?: UseQueryOptions<TQueryFnResult>
        ]
      ) => {
        const [queryFnArgs, [options]] =
          splitArgs<[UseQueryOptions<TQueryFnResult>]>(args);

        return useQuery({
          queryKey: getQueryKey(queryFnArgs),
          queryFn: getQueryFn(queryFnArgs),
          ...defaultUseQueryOptions,
          ...options,
        });
      };
    },

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
          splitArgs<[UseInfiniteQueryOptions<TQueryFnResult>]>(args);

        return useInfiniteQuery({
          queryKey: getQueryKey(queryFnArgs),
          queryFn: getQueryFn(queryFnArgs),
          ...defaultUseInfiniteQueryOptions,
          ...options,
        });
      };
    },

    createUseIsFetching(defaultUseIsFetchingFilters: QueryFilters = {}) {
      return (
        ...args: [...queryFnArgs: TQueryFnArgs, filters?: QueryFilters]
      ) => {
        const [queryFnArgs, [filters]] = splitArgs<[QueryFilters?]>(args);

        return useIsFetching(getQueryKey(queryFnArgs), {
          ...defaultUseIsFetchingFilters,
          ...filters,
        });
      };
    },

    fetchQuery(
      ...args: [
        ...queryFnArgs: TQueryFnArgs,
        options?: FetchQueryOptions<TQueryFnResult>
      ]
    ) {
      const [queryFnArgs, [options]] =
        splitArgs<[FetchQueryOptions<TQueryFnResult>]>(args);

      return queryClient.fetchQuery({
        queryKey: getQueryKey(queryFnArgs),
        queryFn: getQueryFn(queryFnArgs),
        ...options,
      });
    },

    fetchInfiniteQuery(
      ...args: [
        ...queryFnArgs: TQueryFnArgs,
        options?: FetchInfiniteQueryOptions<TQueryFnResult>
      ]
    ) {
      const [queryFnArgs, [options]] =
        splitArgs<[FetchInfiniteQueryOptions<TQueryFnResult>]>(args);

      return queryClient.fetchInfiniteQuery({
        queryKey: getQueryKey(queryFnArgs),
        queryFn: getQueryFn(queryFnArgs),
        ...options,
      });
    },

    prefetchQuery(
      ...args: [
        ...queryFnArgs: TQueryFnArgs,
        options?: FetchQueryOptions<TQueryFnResult>
      ]
    ) {
      const [queryFnArgs, [options]] =
        splitArgs<[FetchQueryOptions<TQueryFnResult>]>(args);

      return queryClient.prefetchQuery({
        queryKey: getQueryKey(queryFnArgs),
        queryFn: getQueryFn(queryFnArgs),
        ...options,
      });
    },

    prefetchInfiniteQuery(
      ...args: [
        ...queryFnArgs: TQueryFnArgs,
        options?: FetchInfiniteQueryOptions<TQueryFnResult>
      ]
    ) {
      const [queryFnArgs, [options]] =
        splitArgs<[FetchInfiniteQueryOptions<TQueryFnResult>]>(args);

      return queryClient.prefetchInfiniteQuery({
        queryKey: getQueryKey(queryFnArgs),
        queryFn: getQueryFn(queryFnArgs),
        ...options,
      });
    },

    getQueryData(
      ...args: [...queryFnArgs: TQueryFnArgs, filters?: QueryFilters]
    ) {
      const [queryFnArgs, [filters]] = splitArgs<[QueryFilters]>(args);

      return queryClient.getQueryData<TQueryFnResult>(
        getQueryKey(queryFnArgs),
        filters
      );
    },

    getInfiniteQueryData(
      ...args: [...queryFnArgs: TQueryFnArgs, filters?: QueryFilters]
    ) {
      const [queryFnArgs, [filters]] = splitArgs<[QueryFilters]>(args);

      return queryClient.getQueryData<InfiniteData<TQueryFnResult>>(
        getQueryKey(queryFnArgs),
        filters
      );
    },

    getQueriesData(filters?: QueryFilters) {
      return queryClient.getQueriesData<TQueryFnResult>(
        filters || (baseQueryKey as any)
      );
    },

    getInfiniteQueriesData(filters?: QueryFilters) {
      return queryClient.getQueriesData<InfiniteData<TQueryFnResult>>(
        filters || (baseQueryKey as any)
      );
    },

    setQueryData(
      ...args: [
        ...queryFnArgs: TQueryFnArgs,
        updater: Updater<TQueryFnResult | undefined, TQueryFnResult>,
        options?: SetDataOptions
      ]
    ) {
      const [queryFnArgs, [updater, options]] =
        splitArgs<
          [Updater<TQueryFnResult | undefined, TQueryFnResult>, SetDataOptions?]
        >(args);

      return queryClient.setQueryData(
        getQueryKey(queryFnArgs),
        updater,
        options
      );
    },

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
      const [queryFnArgs, [updater, options]] =
        splitArgs<
          [
            Updater<
              InfiniteData<TQueryFnResult> | undefined,
              InfiniteData<TQueryFnResult>
            >,
            SetDataOptions?
          ]
        >(args);

      return queryClient.setQueryData(
        getQueryKey(queryFnArgs),
        updater,
        options
      );
    },

    getQueryState(
      ...args: [...queryFnArgs: TQueryFnArgs, filters?: QueryFilters]
    ) {
      const [queryFnArgs, [filters]] = splitArgs<[QueryFilters]>(args);

      return queryClient.getQueryState<TQueryFnResult>(
        getQueryKey(queryFnArgs),
        filters
      );
    },

    setQueriesData(
      updater: Updater<TQueryFnResult | undefined, TQueryFnResult>,
      options?: SetDataOptions
    ) {
      return queryClient.setQueriesData(baseQueryKey, updater, options);
    },

    setInfiniteQueriesData(
      updater: Updater<
        InfiniteData<TQueryFnResult> | undefined,
        InfiniteData<TQueryFnResult>
      >,
      options?: SetDataOptions
    ) {
      return queryClient.setQueriesData(baseQueryKey, updater, options);
    },

    invalidateQueries(filters?: InvalidateQueryFilters<TQueryFnResult>) {
      return queryClient.invalidateQueries(baseQueryKey, filters);
    },

    refetchQueries(filters?: RefetchQueryFilters, options?: RefetchOptions) {
      return queryClient.refetchQueries<TQueryFnResult>(
        baseQueryKey,
        filters,
        options
      );
    },

    cancelQueries(filters?: QueryFilters, options?: CancelOptions) {
      return queryClient.cancelQueries(baseQueryKey, filters, options);
    },

    removeQueries(filters?: QueryFilters) {
      return queryClient.removeQueries(baseQueryKey, filters);
    },

    resetQueries(filters?: QueryFilters, options?: ResetOptions) {
      return queryClient.resetQueries(baseQueryKey, filters, options);
    },

    isFetching(filters?: QueryFilters) {
      return queryClient.isFetching(baseQueryKey, filters);
    },

    withQueryClient(queryClient: QueryClient) {
      return queryHelper(queryClient);
    },
  });

  return queryHelper(queryClient);
};

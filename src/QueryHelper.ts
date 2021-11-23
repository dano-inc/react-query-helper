import type {
  QueryClient,
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

  setQueryData(
    ...args: [...queryFnArgs: TQueryFnArgs, updater: Updater<TQueryFnResult>]
  ) {
    const [queryFnArgs, [updater]] =
      this.splitArgs<[Updater<TQueryFnResult>]>(args);
    const queryClient = this.getQueryClient();

    return queryClient.setQueryData(this.getQueryKey(queryFnArgs), updater);
  }
}

import type {
  QueryClient,
  UseQueryOptions,
  UseInfiniteQueryOptions,
} from 'react-query';
import { useQuery, useInfiniteQuery } from 'react-query';
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
      const queryFnArgs = args
        .slice(0, this.queryFn.length)
        .filter((arg) => arg !== undefined) as TQueryFnArgs;
      const options = args.slice(this.queryFn.length)[0] as
        | UseQueryOptions<TQueryFnResult>
        | undefined;

      return useQuery({
        queryKey: [...this.baseQueryKey, ...queryFnArgs],
        // TODO: how to handle QueryFunctionContext? should it causes breaking changes?
        queryFn: () => this.queryFn.apply(null, queryFnArgs) as TQueryFnResult,
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
      const queryFnArgs = args
        .slice(0, this.queryFn.length)
        .filter((arg) => arg !== undefined) as TQueryFnArgs;
      const options = args.slice(this.queryFn.length)[0] as
        | UseInfiniteQueryOptions<TQueryFnResult>
        | undefined;

      return useInfiniteQuery({
        queryKey: [...this.baseQueryKey, ...queryFnArgs],
        // TODO: how to handle QueryFunctionContext? should it causes breaking changes?
        queryFn: () => this.queryFn.apply(null, queryFnArgs) as TQueryFnResult,
        ...defaultUseInfiniteQueryOptions,
        ...options,
      });
    };
  }

  getQueryData(filters?: QueryFilters) {
    const queryClient = this.getQueryClient();
    return queryClient.getQueryData<TQueryFnResult>(this.baseQueryKey, filters);
  }

  setQueryData(updater: Updater<TQueryFnResult>) {
    const queryClient = this.getQueryClient();
    return queryClient.setQueryData(this.baseQueryKey, updater);
  }
}

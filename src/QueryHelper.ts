import type {
  QueryClient,
  UseQueryOptions,
  UseInfiniteQueryOptions,
} from "react-query";
import { useQuery, useInfiniteQuery } from "react-query";

type Awaited<T> = T extends Promise<infer U> ? U : T;

export class QueryHelper<
  TQueryFn extends (...args: any[]) => unknown,
  TQueryFnArgs extends unknown[] = Parameters<TQueryFn>,
  TQueryFnResult extends unknown = Awaited<ReturnType<TQueryFn>>
> {
  static queryClient: QueryClient;

  public static setQueryClient(queryClient: QueryClient): void {
    this.queryClient = queryClient;
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
      const queryFnArgs = args.slice(0, this.queryFn.length) as TQueryFnArgs;
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
      const queryFnArgs = args.slice(0, this.queryFn.length) as TQueryFnArgs;
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
}

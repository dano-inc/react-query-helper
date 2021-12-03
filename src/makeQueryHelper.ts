import {
  QueryClient,
  QueryFunctionContext,
  useInfiniteQuery,
  useIsFetching,
  useQuery,
} from 'react-query';
import { TypedQueryClient } from './types';

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

  // @ts-expect-error
  const queryFnArgsLength = queryFn().length;

  const splitArgs = (args: any[]) => {
    const queryFnArgs = args.slice(0, queryFnArgsLength);
    const restArgs = args.slice(queryFnArgsLength);

    return [queryFnArgs, restArgs];
  };
  const getQueryKey = (queryFnArgs: any[]) => [...baseQueryKey, ...queryFnArgs];
  const getQueryFn = (queryFnArgs: any[]) => (context: QueryFunctionContext) =>
    queryFn.call(null, context).apply(null, queryFnArgs);

  const makeHookHandler =
    (hook: any) =>
    (...args: any[]) => {
      const [queryFnArgs, [options]] = splitArgs(args);
      return hook({
        queryKey: getQueryKey(queryFnArgs),
        queryFn: getQueryFn(queryFnArgs),
        ...options,
      });
    };

  const baseQueryHelper: Pick<
    TypedQueryClient,
    'withQueryClient' | 'useIsFetching' | 'useQuery' | 'useInfiniteQuery'
  > = {
    useInfiniteQuery: makeHookHandler(useInfiniteQuery),
    useQuery: makeHookHandler(useQuery),
    useIsFetching: (...args) => {
      const [queryFnArgs, [filters]] = splitArgs(args);
      return useIsFetching(getQueryKey(queryFnArgs), { ...filters });
    },
    withQueryClient: (queryClient: QueryClient) => getQueryHelper(queryClient),
  };

  const getQueryHelper = (queryClient: QueryClient) => {
    return new Proxy(baseQueryHelper, {
      get(target: any, property: any) {
        if (typeof target[property] !== 'undefined') {
          return target[property];
        }

        return (...args: any[]) => {
          const [queryFnArgs, restArgs] = splitArgs(args);
          const queryKey = getQueryKey(queryFnArgs);

          const originalPropertyMap: any = {
            setInfiniteQueriesData: 'setQueriesData',
            getInfiniteQueriesData: 'getQueriesData',
            getInfiniteQueryData: 'getQueryData',
            setInfiniteQueryData: 'setQueryData',
          };

          let property$ = originalPropertyMap[property] || property;

          switch (property$) {
            case 'fetchQuery':
            case 'prefetchQuery':
            case 'fetchInfiniteQuery':
            case 'prefetchInfiniteQuery':
              return (queryClient as any)[property$]({
                queryKey,
                queryFn: getQueryFn(queryFnArgs),
                ...restArgs[0],
              });
            case 'getQueryData':
            case 'getQueryState':
              return (queryClient as any)[property$]({
                queryKey,
                ...restArgs[0],
              });
            case 'setQueryData':
              return (queryClient as any)[property$](queryKey, ...restArgs);
            case 'setQueriesData':
            case 'invalidateQueries':
            case 'refetchQueries':
            case 'cancelQueries':
            case 'removeQueries':
            case 'resetQueries':
            case 'isFetching':
              return (queryClient as any)[property$](baseQueryKey, ...args);
            case 'getQueriesData':
              return (queryClient as any)[property$](args[0] || { queryKey });
            default:
              return target[property$];
          }
        };
      },
    });
  };

  return getQueryHelper(queryClient) as TypedQueryClient<
    TQueryFnArgs,
    TQueryFnResult,
    Error
  >;
};

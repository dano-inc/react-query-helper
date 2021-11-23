import { Query, QueryClient, useInfiniteQuery, useQuery } from 'react-query';
import { QueryHelper } from './QueryHelper';

jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: jest.fn(),
  useInfiniteQuery: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 0,
    },
  },
});

beforeAll(() => {
  QueryHelper.setQueryClient(queryClient);
});

beforeEach(() => {
  queryClient.clear();
});

type Post = { id: number; title: string };

const getPosts = new QueryHelper(
  ['posts'],
  (payload?: { after?: string; first?: number }) => [] as Post[]
);

const getPostById = new QueryHelper(
  ['post'],
  (id?: number) => ({ id, title: `Post#${id}` } as Post)
);

it('should throw error if QueryHelper.setQueryClient not have been called', () => {
  // NOTE: Is this right method?
  QueryHelper.setQueryClient(null as any);

  expect(() => getPosts.getQueryData()).toThrowErrorMatchingInlineSnapshot(
    `"QueryClient is not set. Please call QueryHelper.setQueryClient static method."`
  );

  QueryHelper.setQueryClient(queryClient);
});

describe('fetchQuery', () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(queryClient, 'fetchQuery');
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('should call QueryClient.fetchQuery with baseQueryKey and queryFn', () => {
    getPosts.fetchQuery();

    expect(spy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "queryFn": [Function],
            "queryKey": Array [
              "posts",
            ],
          },
        ],
      ]
    `);
  });

  it('should call QueryClient.fetchQuery with baseQueryKey and queryFn and fetchOptions', () => {
    getPosts.fetchQuery(undefined, { staleTime: 1000 });

    expect(spy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "queryFn": [Function],
            "queryKey": Array [
              "posts",
              undefined,
            ],
            "staleTime": 1000,
          },
        ],
      ]
    `);
  });
});

describe('fetchInfiniteQuery', () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(queryClient, 'fetchInfiniteQuery');
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('should call QueryClient.fetchInfiniteQuery with baseQueryKey and queryFn', () => {
    getPosts.fetchInfiniteQuery();

    expect(spy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "behavior": Object {
              "onFetch": [Function],
            },
            "queryFn": [Function],
            "queryKey": Array [
              "posts",
            ],
          },
        ],
      ]
    `);
  });

  it('should call QueryClient.fetchInfiniteQuery with baseQueryKey and queryFn and fetchOptions', () => {
    getPosts.fetchInfiniteQuery(undefined, { staleTime: 1000 });

    expect(spy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "behavior": Object {
              "onFetch": [Function],
            },
            "queryFn": [Function],
            "queryKey": Array [
              "posts",
              undefined,
            ],
            "staleTime": 1000,
          },
        ],
      ]
    `);
  });
});

describe('prefetchQuery', () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(queryClient, 'prefetchQuery');
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('should call QueryClient.prefetchQuery with baseQueryKey and queryFn', () => {
    getPosts.prefetchQuery();

    expect(spy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "queryFn": [Function],
            "queryKey": Array [
              "posts",
            ],
          },
        ],
      ]
    `);
  });

  it('should call QueryClient.prefetchQuery with baseQueryKey and queryFn and fetchOptions', () => {
    getPosts.prefetchQuery(undefined, { staleTime: 1000 });

    expect(spy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "queryFn": [Function],
            "queryKey": Array [
              "posts",
              undefined,
            ],
            "staleTime": 1000,
          },
        ],
      ]
    `);
  });
});

describe('prefetchInfiniteQuery', () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(queryClient, 'prefetchInfiniteQuery');
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('should call QueryClient.prefetchInfiniteQuery with baseQueryKey and queryFn', () => {
    getPosts.prefetchInfiniteQuery();

    expect(spy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "behavior": Object {
              "onFetch": [Function],
            },
            "queryFn": [Function],
            "queryKey": Array [
              "posts",
            ],
          },
        ],
      ]
    `);
  });

  it('should call QueryClient.prefetchInfiniteQuery with baseQueryKey and queryFn and fetchOptions', () => {
    getPosts.prefetchInfiniteQuery(undefined, { staleTime: 1000 });

    expect(spy.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "behavior": Object {
              "onFetch": [Function],
            },
            "queryFn": [Function],
            "queryKey": Array [
              "posts",
              undefined,
            ],
            "staleTime": 1000,
          },
        ],
      ]
    `);
  });
});

describe('getQueryData', () => {
  it('should get access query data', () => {
    queryClient.setQueryData(
      ['posts'],
      [
        { id: 1, title: 'foo' },
        { id: 2, title: 'bar' },
      ]
    );

    expect(getPosts.getQueryData()).toMatchInlineSnapshot(`
      Array [
        Object {
          "id": 1,
          "title": "foo",
        },
        Object {
          "id": 2,
          "title": "bar",
        },
      ]
    `);
  });

  it('should get access query data with parameter', () => {
    queryClient.setQueryData(['post', 1], { id: 1, title: 'foo' });

    expect(getPostById.getQueryData(1)).toMatchInlineSnapshot(`
      Object {
        "id": 1,
        "title": "foo",
      }
    `);
  });
});

describe('getQueriesData', () => {
  beforeEach(async () => {
    await getPostById.prefetchQuery(1, { cacheTime: 1 });
    await getPostById.prefetchQuery(2, { cacheTime: 1 });
    await getPostById.prefetchQuery(3, { cacheTime: 1 });
  });

  it('should get all queries what matching with baseQueryKey', () => {
    expect(getPostById.getQueriesData().length).toBe(3);
  });

  it('should get specific query what matching with baseQueryKey and queryFnArgs', () => {
    expect(getPostById.getQueriesData(1).length).toBe(1);
  });

  it('should get queries what matching with filter', () => {
    const queryFilterPredicate = (query: Query) => query.queryKey[1] !== 3;
    expect(
      getPostById.getQueriesData(undefined, { predicate: queryFilterPredicate })
        .length
    ).toBe(2);
  });
});

describe('setQueryData', () => {
  it('should set posts query data', () => {
    expect(getPosts.getQueryData()).toMatchInlineSnapshot(`undefined`);

    getPosts.setQueryData(undefined, [
      { id: 1, title: 'foo' },
      { id: 2, title: 'bar' },
    ]);

    expect(getPosts.getQueryData(undefined)).toMatchInlineSnapshot(`
      Array [
        Object {
          "id": 1,
          "title": "foo",
        },
        Object {
          "id": 2,
          "title": "bar",
        },
      ]
    `);
  });

  it('should set posts query data as function', () => {
    getPosts.setQueryData(undefined, [{ id: 1, title: 'foo' }]);

    expect(getPosts.getQueryData(undefined)).toMatchInlineSnapshot(`
      Array [
        Object {
          "id": 1,
          "title": "foo",
        },
      ]
    `);

    getPosts.setQueryData(undefined, (oldData) => {
      if (!oldData) {
        return [];
      }

      return [...oldData, { id: 2, title: 'bar' }, { id: 3, title: 'baz' }];
    });

    expect(getPosts.getQueryData(undefined)).toMatchInlineSnapshot(`
      Array [
        Object {
          "id": 1,
          "title": "foo",
        },
        Object {
          "id": 2,
          "title": "bar",
        },
        Object {
          "id": 3,
          "title": "baz",
        },
      ]
    `);
  });
});

describe('getQueryState', () => {
  let originalDateNow: any;

  beforeAll(() => {
    originalDateNow = Date.now;
    Date.now = () => 1;
  });

  afterAll(() => {
    Date.now = originalDateNow;
  });

  it('should return current query state', async () => {
    await getPostById.prefetchQuery(1, { cacheTime: 1 });

    expect(getPostById.getQueryState(1)).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "id": 1,
          "title": "Post#1",
        },
        "dataUpdateCount": 1,
        "dataUpdatedAt": 1,
        "error": null,
        "errorUpdateCount": 0,
        "errorUpdatedAt": 0,
        "fetchFailureCount": 0,
        "fetchMeta": null,
        "isFetching": false,
        "isInvalidated": false,
        "isPaused": false,
        "status": "success",
      }
    `);
  });
});

describe('useQuery', () => {
  it('should call useQuery with queryKey based on argument', () => {
    const useGetPostById = getPostById.createQuery();
    useGetPostById(1);

    expect((useQuery as jest.Mock).mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "queryFn": [Function],
          "queryKey": Array [
            "post",
            1,
          ],
        },
      ]
    `);
  });

  it('should call useQuery with options from last argument', () => {
    const useGetPostById = getPostById.createQuery();
    useGetPostById(2, { enabled: true, suspense: true });

    expect((useQuery as jest.Mock).mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "enabled": true,
          "queryFn": [Function],
          "queryKey": Array [
            "post",
            2,
          ],
          "suspense": true,
        },
      ]
    `);
  });

  it('should call useQuery with default query options and options from last argument', () => {
    const useGetPostById = getPostById.createQuery({ cacheTime: 1000 });
    useGetPostById(3, { meta: { type: 'test' } });

    expect((useQuery as jest.Mock).mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "cacheTime": 1000,
          "meta": Object {
            "type": "test",
          },
          "queryFn": [Function],
          "queryKey": Array [
            "post",
            3,
          ],
        },
      ]
    `);
  });
});

describe('useInfiniteQuery', () => {
  it('should call useInfiniteQuery with queryKey based on argument', () => {
    const useGetPosts = getPosts.createInfiniteQuery();
    useGetPosts({ after: '', first: 10 });

    expect((useInfiniteQuery as jest.Mock).mock.calls[0])
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "queryFn": [Function],
          "queryKey": Array [
            "posts",
            Object {
              "after": "",
              "first": 10,
            },
          ],
        },
      ]
    `);
  });

  it('should call useInfiniteQuery with options from last argument', () => {
    const useGetPosts = getPosts.createInfiniteQuery();
    useGetPosts({ after: '', first: 10 }, { enabled: true, suspense: true });

    expect((useInfiniteQuery as jest.Mock).mock.calls[0])
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "enabled": true,
          "queryFn": [Function],
          "queryKey": Array [
            "posts",
            Object {
              "after": "",
              "first": 10,
            },
          ],
          "suspense": true,
        },
      ]
    `);
  });

  it('should call useInfiniteQuery with default query options and options from last argument', () => {
    const useGetPosts = getPosts.createInfiniteQuery({ cacheTime: 1000 });
    useGetPosts({ after: '', first: 10 }, { meta: { type: 'test' } });

    expect((useInfiniteQuery as jest.Mock).mock.calls[0])
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "cacheTime": 1000,
          "meta": Object {
            "type": "test",
          },
          "queryFn": [Function],
          "queryKey": Array [
            "posts",
            Object {
              "after": "",
              "first": 10,
            },
          ],
        },
      ]
    `);
  });
});

import {
  Query,
  QueryClient,
  useInfiniteQuery,
  useIsFetching,
  useQuery,
} from 'react-query';
import { QueryHelper } from './QueryHelper';

jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: jest.fn(),
  useInfiniteQuery: jest.fn(),
  useIsFetching: jest.fn(),
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

let originalDateNow: any;

beforeAll(() => {
  originalDateNow = Date.now;
  Date.now = () => 1;
});

afterAll(() => {
  Date.now = originalDateNow;
});

type Post = { id: number; title: string };

const getPosts = new QueryHelper(
  ['posts'],
  () => (payload?: { after?: string; first?: number }) => [] as Post[]
);

const getPostById = new QueryHelper(
  ['post'],
  () => (id?: number) => ({ id, title: `Post#${id}` } as Post)
);

it('should throw error if QueryHelper.setQueryClient not have been called', () => {
  // NOTE: Is this right method?
  QueryHelper.setQueryClient(null as any);

  expect(() => getPosts.getQueryData()).toThrowErrorMatchingInlineSnapshot(
    `"QueryClient is not set. Please call QueryHelper.setQueryClient static method."`
  );

  QueryHelper.setQueryClient(queryClient);
});

describe('createUseQuery', () => {
  it('should call useQuery with queryKey based on argument', () => {
    const useGetPostById = getPostById.createUseQuery();
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
    const useGetPostById = getPostById.createUseQuery();
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
    const useGetPostById = getPostById.createUseQuery({ cacheTime: 1000 });
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

describe('createUseInfiniteQuery', () => {
  it('should call useInfiniteQuery with queryKey based on argument', () => {
    const useGetPosts = getPosts.createUseInfiniteQuery();
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
    const useGetPosts = getPosts.createUseInfiniteQuery();
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
    const useGetPosts = getPosts.createUseInfiniteQuery({ cacheTime: 1000 });
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

describe('createUseIsFetching', () => {
  it('should call useIsFetching with queryKey based on argument', () => {
    const useGetPostByIdIsFetching = getPostById.createUseIsFetching();
    useGetPostByIdIsFetching(1);

    expect((useIsFetching as jest.Mock).mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Array [
            "post",
            1,
          ],
          Object {},
        ],
      ]
    `);
  });

  it('should call useIsFetching with filters from last argument', () => {
    const useGetPostByIdIsFetching = getPostById.createUseIsFetching();
    useGetPostByIdIsFetching(1, { exact: true });

    expect((useIsFetching as jest.Mock).mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Array [
            "post",
            1,
          ],
          Object {
            "exact": true,
          },
        ],
      ]
    `);
  });

  it('should call useIsFetching with default query filters and filters from last argument', () => {
    const useGetPostByIdIsFetching = getPostById.createUseIsFetching({
      stale: true,
    });
    useGetPostByIdIsFetching(1, { exact: true });

    expect((useIsFetching as jest.Mock).mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Array [
            "post",
            1,
          ],
          Object {
            "exact": true,
            "stale": true,
          },
        ],
      ]
    `);
  });
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

  it('should get queries what matching with filter', () => {
    const queryFilterPredicate = (query: Query) => query.queryKey[1] !== 3;
    expect(
      getPostById.getQueriesData({ predicate: queryFilterPredicate }).length
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

describe('setInfiniteQueryData', () => {
  it('should set posts infinite query data', () => {
    expect(getPosts.getQueryData()).toMatchInlineSnapshot(`undefined`);

    getPosts.setInfiniteQueryData(undefined, {
      pageParams: [],
      pages: [[{ id: 1, title: 'foo' }], [{ id: 2, title: 'bar' }]],
    });

    expect(getPosts.getQueryData(undefined)).toMatchInlineSnapshot(`
      Object {
        "pageParams": Array [],
        "pages": Array [
          Array [
            Object {
              "id": 1,
              "title": "foo",
            },
          ],
          Array [
            Object {
              "id": 2,
              "title": "bar",
            },
          ],
        ],
      }
    `);
  });

  it('should set posts infinite query data as function', () => {
    getPosts.setInfiniteQueryData(undefined, {
      pageParams: [],
      pages: [[{ id: 1, title: 'foo' }], [{ id: 2, title: 'bar' }]],
    });

    expect(getPosts.getQueryData(undefined)).toMatchInlineSnapshot(`
      Object {
        "pageParams": Array [],
        "pages": Array [
          Array [
            Object {
              "id": 1,
              "title": "foo",
            },
          ],
          Array [
            Object {
              "id": 2,
              "title": "bar",
            },
          ],
        ],
      }
    `);

    getPosts.setInfiniteQueryData(undefined, (data) => ({
      pages: [...data!.pages, [{ id: 3, title: 'baz' }]],
      pageParams: data!.pageParams,
    }));

    expect(getPosts.getQueryData(undefined)).toMatchInlineSnapshot(`
      Object {
        "pageParams": Array [],
        "pages": Array [
          Array [
            Object {
              "id": 1,
              "title": "foo",
            },
          ],
          Array [
            Object {
              "id": 2,
              "title": "bar",
            },
          ],
          Array [
            Object {
              "id": 3,
              "title": "baz",
            },
          ],
        ],
      }
    `);
  });
});

describe('getQueryState', () => {
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

describe('setQueriesData', () => {
  beforeEach(async () => {
    await getPostById.prefetchQuery(1, { cacheTime: 1 });
    await getPostById.prefetchQuery(2, { cacheTime: 1 });
    await getPostById.prefetchQuery(3, { cacheTime: 1 });
  });

  it('should update each queries data', () => {
    getPostById.setQueriesData((cache: Post | undefined) => {
      cache!.title = `Modified ${cache!.title}`;
      return cache as Post;
    });

    expect(getPostById.getQueryData(1)).toMatchInlineSnapshot(`
      Object {
        "id": 1,
        "title": "Modified Post#1",
      }
    `);
    expect(getPostById.getQueryData(2)).toMatchInlineSnapshot(`
      Object {
        "id": 2,
        "title": "Modified Post#2",
      }
    `);
    expect(getPostById.getQueryData(3)).toMatchInlineSnapshot(`
      Object {
        "id": 3,
        "title": "Modified Post#3",
      }
    `);
  });
});

describe('invalidateQueries', () => {
  beforeEach(async () => {
    await getPostById.prefetchQuery(1, { cacheTime: 1 });
    await getPostById.prefetchQuery(2, { cacheTime: 1 });
    await getPostById.prefetchQuery(3, { cacheTime: 1 });
  });

  it('should invalidate all queries', () => {
    getPostById.invalidateQueries();

    expect(getPostById.getQueryState(1)?.isInvalidated).toBe(true);
    expect(getPostById.getQueryState(2)?.isInvalidated).toBe(true);
    expect(getPostById.getQueryState(3)?.isInvalidated).toBe(true);
  });

  it('should invalidate queries what matching by filter', () => {
    const predicate = (query: Query) => query.queryKey[1] !== 1;
    getPostById.invalidateQueries({ predicate });

    expect(getPostById.getQueryState(1)?.isInvalidated).toBe(false);
    expect(getPostById.getQueryState(2)?.isInvalidated).toBe(true);
    expect(getPostById.getQueryState(3)?.isInvalidated).toBe(true);
  });
});

describe('refetchQueries', () => {
  beforeEach(async () => {
    await getPostById.prefetchQuery(1, { cacheTime: 1 });
    await getPostById.prefetchQuery(2, { cacheTime: 1 });
  });

  it('should refetch all queries', async () => {
    expect(getPostById.getQueryState(1)?.dataUpdateCount).toBe(1);

    await getPostById.refetchQueries();

    expect(getPostById.getQueryState(1)?.dataUpdateCount).toBe(2);
  });

  it('should refetch queries what matching by filter', async () => {
    expect(getPostById.getQueryState(1)?.dataUpdateCount).toBe(1);
    expect(getPostById.getQueryState(2)?.dataUpdateCount).toBe(1);

    const predicate = (query: Query) => query.queryKey[1] !== 1;
    await getPostById.refetchQueries({ predicate });

    expect(getPostById.getQueryState(1)?.dataUpdateCount).toBe(1);
    expect(getPostById.getQueryState(2)?.dataUpdateCount).toBe(2);
  });
});

describe('cancelQueries', () => {
  it('should cancel all queries', async () => {
    getPostById.fetchQuery(1, { cacheTime: 1 });
    expect(getPostById.getQueryState(1)).toMatchInlineSnapshot(`
      Object {
        "data": undefined,
        "dataUpdateCount": 0,
        "dataUpdatedAt": 0,
        "error": null,
        "errorUpdateCount": 0,
        "errorUpdatedAt": 0,
        "fetchFailureCount": 0,
        "fetchMeta": null,
        "isFetching": true,
        "isInvalidated": false,
        "isPaused": false,
        "status": "loading",
      }
    `);

    await getPostById.cancelQueries();
    expect(getPostById.getQueryState(1)).toMatchInlineSnapshot(`
      Object {
        "data": undefined,
        "dataUpdateCount": 0,
        "dataUpdatedAt": 0,
        "error": null,
        "errorUpdateCount": 0,
        "errorUpdatedAt": 0,
        "fetchFailureCount": 0,
        "fetchMeta": null,
        "isFetching": false,
        "isInvalidated": false,
        "isPaused": false,
        "status": "idle",
      }
    `);
  });

  it('should cancel queries what matching by filter', async () => {
    getPostById.fetchQuery(1, { cacheTime: 1 });
    getPostById.fetchQuery(2, { cacheTime: 1 });
    expect(getPostById.getQueryState(1)).toMatchInlineSnapshot(`
      Object {
        "data": undefined,
        "dataUpdateCount": 0,
        "dataUpdatedAt": 0,
        "error": null,
        "errorUpdateCount": 0,
        "errorUpdatedAt": 0,
        "fetchFailureCount": 0,
        "fetchMeta": null,
        "isFetching": true,
        "isInvalidated": false,
        "isPaused": false,
        "status": "loading",
      }
    `);
    expect(getPostById.getQueryState(2)).toMatchInlineSnapshot(`
      Object {
        "data": undefined,
        "dataUpdateCount": 0,
        "dataUpdatedAt": 0,
        "error": null,
        "errorUpdateCount": 0,
        "errorUpdatedAt": 0,
        "fetchFailureCount": 0,
        "fetchMeta": null,
        "isFetching": true,
        "isInvalidated": false,
        "isPaused": false,
        "status": "loading",
      }
    `);

    const predicate = (query: Query) => query.queryKey[1] !== 1;
    await getPostById.cancelQueries({ predicate });

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
    expect(getPostById.getQueryState(2)).toMatchInlineSnapshot(`
      Object {
        "data": undefined,
        "dataUpdateCount": 0,
        "dataUpdatedAt": 0,
        "error": null,
        "errorUpdateCount": 0,
        "errorUpdatedAt": 0,
        "fetchFailureCount": 0,
        "fetchMeta": null,
        "isFetching": false,
        "isInvalidated": false,
        "isPaused": false,
        "status": "idle",
      }
    `);
  });
});

describe('removeQueries', () => {
  it('should remove all queries', async () => {
    await getPostById.prefetchQuery(1, { cacheTime: 1 });
    expect(getPostById.getQueryData(1)).toMatchInlineSnapshot(`
      Object {
        "id": 1,
        "title": "Post#1",
      }
    `);

    getPostById.removeQueries();
    expect(getPostById.getQueryData(1)).toMatchInlineSnapshot(`undefined`);
  });

  it('should remove queries what matching by filter', async () => {
    await getPostById.prefetchQuery(1, { cacheTime: 1 });
    await getPostById.prefetchQuery(2, { cacheTime: 1 });
    expect(getPostById.getQueryData(1)).toMatchInlineSnapshot(`
      Object {
        "id": 1,
        "title": "Post#1",
      }
    `);
    expect(getPostById.getQueryData(2)).toMatchInlineSnapshot(`
      Object {
        "id": 2,
        "title": "Post#2",
      }
    `);

    const predicate = (query: Query) => query.queryKey[1] !== 1;
    getPostById.removeQueries({ predicate });

    expect(getPostById.getQueryData(1)).toMatchInlineSnapshot(`
      Object {
        "id": 1,
        "title": "Post#1",
      }
    `);
    expect(getPostById.getQueryData(2)).toMatchInlineSnapshot(`undefined`);
  });
});

describe('resetQueries', () => {
  beforeEach(async () => {
    await getPostById.prefetchQuery(1, {
      cacheTime: 1,
      initialData: { id: 1, title: 'Initial Title#1' },
    });
    await getPostById.prefetchQuery(2, {
      cacheTime: 1,
      initialData: { id: 2, title: 'Initial Title#2' },
    });
  });
  it('should reset all queries', async () => {
    expect(getPostById.getQueryData(1)).toMatchInlineSnapshot(`
      Object {
        "id": 1,
        "title": "Post#1",
      }
    `);

    await getPostById.resetQueries();
    expect(getPostById.getQueryData(1)).toMatchInlineSnapshot(`
      Object {
        "id": 1,
        "title": "Initial Title#1",
      }
    `);
  });

  it('should reset queries what matching by filter', async () => {
    expect(getPostById.getQueryData(1)).toMatchInlineSnapshot(`
      Object {
        "id": 1,
        "title": "Post#1",
      }
    `);
    expect(getPostById.getQueryData(2)).toMatchInlineSnapshot(`
      Object {
        "id": 2,
        "title": "Post#2",
      }
    `);

    const predicate = (query: Query) => query.queryKey[1] !== 1;
    getPostById.resetQueries({ predicate });

    expect(getPostById.getQueryData(1)).toMatchInlineSnapshot(`
      Object {
        "id": 1,
        "title": "Post#1",
      }
    `);
    expect(getPostById.getQueryData(2)).toMatchInlineSnapshot(`
      Object {
        "id": 2,
        "title": "Initial Title#2",
      }
    `);
  });
});

describe('isFetching', () => {
  it('should return 0 if any queries not fetching', () => {
    expect(getPostById.isFetching()).toEqual(0);
  });

  it('should return 1 if exsists query exists that currently fetching', () => {
    getPostById.prefetchQuery(1);

    expect(getPostById.isFetching()).toEqual(1);
  });

  it('should return a count of queries that currently fetching', () => {
    getPostById.prefetchQuery(1, { cacheTime: 1 });
    getPostById.prefetchQuery(2, { cacheTime: 1 });
    getPostById.prefetchQuery(3, { cacheTime: 1 });

    const predicate = (query: Query) => query.queryKey[1] !== 1;
    expect(getPostById.isFetching({ predicate })).toEqual(2);
  });
});

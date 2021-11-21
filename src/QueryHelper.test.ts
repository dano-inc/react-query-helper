import { QueryClient, useInfiniteQuery, useQuery } from 'react-query';
import { QueryHelper } from './QueryHelper';

jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: jest.fn(),
  useInfiniteQuery: jest.fn(),
}));

it('should pass', () => {
  expect(1 + 1).toBe(2);
});

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

it('should throw error if QueryHelper.setQueryClient not have been called', () => {
  // NOTE: Is this right method?
  QueryHelper.setQueryClient(null as any);

  expect(() => getPosts.getQueryData()).toThrowErrorMatchingInlineSnapshot(
    `"QueryClient is not set. Please call QueryHelper.setQueryClient static method."`
  );

  QueryHelper.setQueryClient(queryClient);
});

describe('getQueryData', () => {
  beforeEach(() => {
    queryClient.setQueryData(
      ['posts'],
      [
        { id: 1, title: 'foo' },
        { id: 2, title: 'bar' },
      ]
    );
  });

  it('should get posts query data', () => {
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
});

describe('setQueryData', () => {
  it('should set posts query data', () => {
    expect(getPosts.getQueryData()).toMatchInlineSnapshot(`undefined`);

    getPosts.setQueryData([
      { id: 1, title: 'foo' },
      { id: 2, title: 'bar' },
    ]);

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

  it('should set posts query data as function', () => {
    getPosts.setQueryData([{ id: 1, title: 'foo' }]);

    expect(getPosts.getQueryData()).toMatchInlineSnapshot(`
      Array [
        Object {
          "id": 1,
          "title": "foo",
        },
      ]
    `);

    getPosts.setQueryData((oldData) => {
      if (!oldData) {
        return [];
      }

      return [...oldData, { id: 2, title: 'bar' }, { id: 3, title: 'baz' }];
    });

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
        Object {
          "id": 3,
          "title": "baz",
        },
      ]
    `);
  });
});

const getPostById = new QueryHelper(
  ['post'],
  (id: number) => ({ id, title: `Post#${id}` } as Post)
);

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

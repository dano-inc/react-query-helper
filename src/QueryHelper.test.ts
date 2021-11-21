import { QueryClient } from 'react-query';
import { QueryHelper } from './QueryHelper';

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

const getPosts = new QueryHelper(['posts'], () => [] as Post[]);

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

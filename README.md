# react-query-helper

[![npm version](https://badge.fury.io/js/react-query-helper.svg)](https://badge.fury.io/js/react-query-helper) [![codecov](https://codecov.io/gh/dano-inc/react-query-helper/branch/master/graph/badge.svg?token=TD9B2BKN24)](https://codecov.io/gh/dano-inc/react-query-helper) ![GitHub](https://img.shields.io/github/license/dano-inc/react-query-helper)

A helper library to use react-query more efficient, consistency

## Problems

I've been using react-query for 2-3 years. in most situations, I used it to manage the remote server state.
however, managing the query keys and having to match the type were tires for me.
especially, when the type that I inferred manually is not matched with the actual type, it's really hard.

## Features

- **Write query key once, use everywhere.** you don't have to remember something's query key. the query key will be generated with your baseQueryKey and arguments of queryFn that you were defined.
- **Written in TypeScript.** you can infer your query result type/interface.

## Installation

> NOTE: react-query-helper depends on react-query as a **peer** dependency.

```bash
$ yarn add react-query-helper

# or npm:
$ npm install react-query-helper
```

## Usage

At the first, You have to call `QueryHelper.setQueryClient()` before using some methods.
This allows `QueryHelper` instances to be able to use the same `QueryClient`.

```tsx
import { QueryClient, QueryClientProvider } from 'react-query';
import { QueryHelper } from 'react-query-helper';

const queryClient = new QueryClient();
QueryHelper.setQueryClient(queryClient);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserInfo />
    </QueryClientProvider>
  );
}
```

Then, create `QueryHelper` instance. this is examples:

```tsx
import type { User } from './types';

export const getUserById = new QueryHelper(['user'], (id: number) => {
  return fetch(`https://jsonplaceholder.typicode.com/users/${id}/`).then(
    (response) => response.json() as Promise<User>
  );
});
```

Now you can make a hook that type-safe `useQuery` with `createUseQuery` and get or set query data type-safety.

```tsx
import { getUserById } from '../remotes/getUserById';

const useGetUserById = getUserById.createUseQuery();

const UserInfo: FC = () => {
  const { data } = useGetUserById(1);

  return <p>name: {data?.name}</p>;
};

const UserUpdater: FC = () => {
  const handleClick = () => {
    const user = getUserById.getQueryData(1);

    if (user) {
      getUserById.setQueryData({
        ...user,
        name: 'John Doe',
      });
    }
  };

  return <button onClick={handleClick}>Update name</button>;
};
```

## Examples

- [Basic Query](https://codesandbox.io/s/basic-query-1dn5u?file=/src/App.tsx)
- [Manage Query Data](https://codesandbox.io/s/manage-query-data-lytzd)

> More examples will be added by library progress.

## Contribution

There's no contribute guide. I will write soon! currently, Please consider sharing feedback or reporting an issue.

## License

MIT (See the [LICENSE](./LICENSE) file)

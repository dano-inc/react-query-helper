# React Query Helper

[![npm version](https://badge.fury.io/js/react-query-helper.svg)](https://badge.fury.io/js/react-query-helper) ![npm bundle size](https://img.shields.io/bundlephobia/min/react-query-helper) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-query-helper) [![Test](https://github.com/dano-inc/react-query-helper/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/dano-inc/react-query-helper/actions/workflows/test.yml) [![codecov](https://codecov.io/gh/dano-inc/react-query-helper/branch/main/graph/badge.svg?token=TD9B2BKN24)](https://codecov.io/gh/dano-inc/react-query-helper) ![GitHub](https://img.shields.io/github/license/dano-inc/react-query-helper)

A helper library to help you use [React Query](https://react-query.tanstack.com/) more easily and consistently.

## Features

- **Write query key once, use everywhere.** you don't have to remember something's query key; the query key will be generated with your baseQueryKey and arguments of queryFn that you were called as defined
- **Written in TypeScript.** you can infer your query result type/interface.

## Why?

I've been using React Query for 2-3 years. In most situations, I used to make a custom hook and manage query keys as constant strings. but it was quite tiring.

Sometimes, It makes me sad when the query data type that I inferred manually is not equal with the actual query data type. for example:

```ts
// Set query's data.
queryClient.setQueryData([queryKeys.product.all], [{}] as IProductList);

// It is unknown type:
queryClient.getQueryData([queryKeys.product.all]);

// Okay, we know we can use generic type but we can also make a mistake.
// These mistakes are quite hard to find.
queryClient.getQueryData<IProduct>([queryKeys.product.all]);
queryClient.getQueryData<IProductList>([queryKeys.category.all]);
```

Essentially, Making a custom hook using useQuery or managing Query Keys as constants strings are not guaranteed your query result type. so you have to infer types manually like `queryClient.getQueryData<IProductList>` or you'll get `unknown` type as result.

## Installation

> NOTE: This libary depends on React Query as a **peer** dependency.

```bash
$ yarn add react-query react-query-helper

# or npm:
$ npm install react-query react-query-helper
```

## Usage

Call `makeQueryHelper` function to create query helper. Examples:

```tsx
import { makeQueryHelper } from 'react-query-helper';
import { queryClient } from '../queryClient';
import type { User } from '../types';

export const getUserById = makeQueryHelper({
  queryClient,
  baseQueryKey: ['user'],
  // NOTE: You can access QueryFunctionContext in your function scope.
  queryFn: (context) => (id: number) => {
    return fetch(`https://jsonplaceholder.typicode.com/users/${id}/`).then(
      (response) => response.json() as Promise<User>
    );
  },
});
```

Now you can use type-safe `useQuery` and get or set query data type-safety.

```tsx
import { getUserById } from '../remotes/getUserById';

const UserInfo: FC = () => {
  const { data } = getUserById.useQuery(1);

  return <p>name: {data?.name}</p>;
};

const UserUpdater: FC = () => {
  const handleClick = () => {
    const user = getUserById.getQueryData(1);

    if (user) {
      getUserById.setQueryData(1, {
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
- [Optimistic Update](https://codesandbox.io/s/optimistic-update-t1lkt)
- [With Next.js (Using Hydration)](https://codesandbox.io/s/with-next-js-typescript-forked-94kzy)

> More examples will be added by library progress.

## Contribution

There's no contribute guide. I will write soon. currently, Please consider sharing feedback or reporting an issue.

## License

MIT (See the [LICENSE](./LICENSE) file)

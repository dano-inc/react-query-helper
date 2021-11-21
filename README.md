# react-query-helper

[![npm version](https://badge.fury.io/js/react-query-helper.svg)](https://badge.fury.io/js/react-query-helper) [![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

A helper library to use react-query more efficient, consistency

## Features

- **Write query key once, use everywhere.** you don't have to remember something's query key.
- **Written in TypeScript.** you can infer your query result type/interface.

## Install

> NOTE: react-query-helper depends on react-query as a **peer** dependency.

```bash
$ yarn add react-query-helper

# or npm:
$ npm install react-query-helper
```

## Usage

### Basic ([CodeSandbox](https://codesandbox.io/s/basic-query-1dn5u?file=/src/App.tsx))

```tsx
import { QueryHelper } from "react-query-helper";
import type { User } from "./types";

const getUserById = new QueryHelper(["user"], (id: number) => {
  return fetch(`https://jsonplaceholder.typicode.com/users/${id}/`).then(
    (response) => response.json() as Promise<User>
  );
});

const useGetUserById = getUserById.createQuery();

const UserInfo: FC = () => {
  // Hook is type-safe!
  const { data, isLoading } = useGetUserById(1, {
    enabled: true,
  });

  if (isLoading) {
    return null;
  }

  return (
    <div>
      <p>Name: {data?.name}</p>
      <p>Email: {data?.email}</p>
    </div>
  );
};
```

> WIP: More usage & examples will be added by library progress.

## License

MIT (See the [LICENSE](./LICENSE) file)

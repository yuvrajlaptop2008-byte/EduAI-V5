# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `default`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListInstitutes*](#listinstitutes)
  - [*GetUserProfile*](#getuserprofile)
  - [*ListBatches*](#listbatches)
  - [*GetTopPerformers*](#gettopperformers)
- [**Mutations**](#mutations)
  - [*UpsertUserProfile*](#upsertuserprofile)
  - [*CreateInstitute*](#createinstitute)
  - [*EnrollStudentInBatch*](#enrollstudentinbatch)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `default`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@eduai/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@eduai/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@eduai/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListInstitutes
You can execute the `ListInstitutes` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listInstitutes(options?: ExecuteQueryOptions): QueryPromise<ListInstitutesData, undefined>;

interface ListInstitutesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListInstitutesData, undefined>;
}
export const listInstitutesRef: ListInstitutesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listInstitutes(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListInstitutesData, undefined>;

interface ListInstitutesRef {
  ...
  (dc: DataConnect): QueryRef<ListInstitutesData, undefined>;
}
export const listInstitutesRef: ListInstitutesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listInstitutesRef:
```typescript
const name = listInstitutesRef.operationName;
console.log(name);
```

### Variables
The `ListInstitutes` query has no variables.
### Return Type
Recall that executing the `ListInstitutes` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListInstitutesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListInstitutesData {
  institutes: ({
    id: UUIDString;
    name: string;
    code: string;
    slug?: string | null;
    contactEmail?: string | null;
    isActive: boolean;
  } & Institute_Key)[];
}
```
### Using `ListInstitutes`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listInstitutes } from '@eduai/dataconnect';


// Call the `listInstitutes()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listInstitutes();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listInstitutes(dataConnect);

console.log(data.institutes);

// Or, you can use the `Promise` API.
listInstitutes().then((response) => {
  const data = response.data;
  console.log(data.institutes);
});
```

### Using `ListInstitutes`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listInstitutesRef } from '@eduai/dataconnect';


// Call the `listInstitutesRef()` function to get a reference to the query.
const ref = listInstitutesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listInstitutesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.institutes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.institutes);
});
```

## GetUserProfile
You can execute the `GetUserProfile` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getUserProfile(options?: ExecuteQueryOptions): QueryPromise<GetUserProfileData, undefined>;

interface GetUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserProfileData, undefined>;
}
export const getUserProfileRef: GetUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserProfile(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserProfileData, undefined>;

interface GetUserProfileRef {
  ...
  (dc: DataConnect): QueryRef<GetUserProfileData, undefined>;
}
export const getUserProfileRef: GetUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserProfileRef:
```typescript
const name = getUserProfileRef.operationName;
console.log(name);
```

### Variables
The `GetUserProfile` query has no variables.
### Return Type
Recall that executing the `GetUserProfile` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserProfileData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserProfileData {
  user?: {
    uid: string;
    email: string;
    displayName?: string | null;
    role: string;
    targetExam?: string | null;
    targetYear?: number | null;
    streakCount?: number | null;
    totalPoints?: number | null;
    createdAt: TimestampString;
  } & User_Key;
}
```
### Using `GetUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserProfile } from '@eduai/dataconnect';


// Call the `getUserProfile()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserProfile();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserProfile(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getUserProfile().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUserProfile`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserProfileRef } from '@eduai/dataconnect';


// Call the `getUserProfileRef()` function to get a reference to the query.
const ref = getUserProfileRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserProfileRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## ListBatches
You can execute the `ListBatches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listBatches(vars: ListBatchesVariables, options?: ExecuteQueryOptions): QueryPromise<ListBatchesData, ListBatchesVariables>;

interface ListBatchesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListBatchesVariables): QueryRef<ListBatchesData, ListBatchesVariables>;
}
export const listBatchesRef: ListBatchesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listBatches(dc: DataConnect, vars: ListBatchesVariables, options?: ExecuteQueryOptions): QueryPromise<ListBatchesData, ListBatchesVariables>;

interface ListBatchesRef {
  ...
  (dc: DataConnect, vars: ListBatchesVariables): QueryRef<ListBatchesData, ListBatchesVariables>;
}
export const listBatchesRef: ListBatchesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listBatchesRef:
```typescript
const name = listBatchesRef.operationName;
console.log(name);
```

### Variables
The `ListBatches` query requires an argument of type `ListBatchesVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListBatchesVariables {
  instituteId: UUIDString;
}
```
### Return Type
Recall that executing the `ListBatches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListBatchesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListBatchesData {
  batches: ({
    id: UUIDString;
    name: string;
    code?: string | null;
    examTarget: string;
    academicYear: string;
    isActive: boolean;
  } & Batch_Key)[];
}
```
### Using `ListBatches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listBatches, ListBatchesVariables } from '@eduai/dataconnect';

// The `ListBatches` query requires an argument of type `ListBatchesVariables`:
const listBatchesVars: ListBatchesVariables = {
  instituteId: ..., 
};

// Call the `listBatches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listBatches(listBatchesVars);
// Variables can be defined inline as well.
const { data } = await listBatches({ instituteId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listBatches(dataConnect, listBatchesVars);

console.log(data.batches);

// Or, you can use the `Promise` API.
listBatches(listBatchesVars).then((response) => {
  const data = response.data;
  console.log(data.batches);
});
```

### Using `ListBatches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listBatchesRef, ListBatchesVariables } from '@eduai/dataconnect';

// The `ListBatches` query requires an argument of type `ListBatchesVariables`:
const listBatchesVars: ListBatchesVariables = {
  instituteId: ..., 
};

// Call the `listBatchesRef()` function to get a reference to the query.
const ref = listBatchesRef(listBatchesVars);
// Variables can be defined inline as well.
const ref = listBatchesRef({ instituteId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listBatchesRef(dataConnect, listBatchesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.batches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.batches);
});
```

## GetTopPerformers
You can execute the `GetTopPerformers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getTopPerformers(vars: GetTopPerformersVariables, options?: ExecuteQueryOptions): QueryPromise<GetTopPerformersData, GetTopPerformersVariables>;

interface GetTopPerformersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTopPerformersVariables): QueryRef<GetTopPerformersData, GetTopPerformersVariables>;
}
export const getTopPerformersRef: GetTopPerformersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getTopPerformers(dc: DataConnect, vars: GetTopPerformersVariables, options?: ExecuteQueryOptions): QueryPromise<GetTopPerformersData, GetTopPerformersVariables>;

interface GetTopPerformersRef {
  ...
  (dc: DataConnect, vars: GetTopPerformersVariables): QueryRef<GetTopPerformersData, GetTopPerformersVariables>;
}
export const getTopPerformersRef: GetTopPerformersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getTopPerformersRef:
```typescript
const name = getTopPerformersRef.operationName;
console.log(name);
```

### Variables
The `GetTopPerformers` query requires an argument of type `GetTopPerformersVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetTopPerformersVariables {
  examTarget: string;
}
```
### Return Type
Recall that executing the `GetTopPerformers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetTopPerformersData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetTopPerformersData {
  performanceSummaries: ({
    id: UUIDString;
    averageScore: number;
    rank?: number | null;
    percentile?: number | null;
    user: {
      uid: string;
      displayName?: string | null;
      email: string;
    } & User_Key;
  } & PerformanceSummary_Key)[];
}
```
### Using `GetTopPerformers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getTopPerformers, GetTopPerformersVariables } from '@eduai/dataconnect';

// The `GetTopPerformers` query requires an argument of type `GetTopPerformersVariables`:
const getTopPerformersVars: GetTopPerformersVariables = {
  examTarget: ..., 
};

// Call the `getTopPerformers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getTopPerformers(getTopPerformersVars);
// Variables can be defined inline as well.
const { data } = await getTopPerformers({ examTarget: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getTopPerformers(dataConnect, getTopPerformersVars);

console.log(data.performanceSummaries);

// Or, you can use the `Promise` API.
getTopPerformers(getTopPerformersVars).then((response) => {
  const data = response.data;
  console.log(data.performanceSummaries);
});
```

### Using `GetTopPerformers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getTopPerformersRef, GetTopPerformersVariables } from '@eduai/dataconnect';

// The `GetTopPerformers` query requires an argument of type `GetTopPerformersVariables`:
const getTopPerformersVars: GetTopPerformersVariables = {
  examTarget: ..., 
};

// Call the `getTopPerformersRef()` function to get a reference to the query.
const ref = getTopPerformersRef(getTopPerformersVars);
// Variables can be defined inline as well.
const ref = getTopPerformersRef({ examTarget: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getTopPerformersRef(dataConnect, getTopPerformersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.performanceSummaries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.performanceSummaries);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## UpsertUserProfile
You can execute the `UpsertUserProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
upsertUserProfile(vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;

interface UpsertUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
}
export const upsertUserProfileRef: UpsertUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertUserProfile(dc: DataConnect, vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;

interface UpsertUserProfileRef {
  ...
  (dc: DataConnect, vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
}
export const upsertUserProfileRef: UpsertUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertUserProfileRef:
```typescript
const name = upsertUserProfileRef.operationName;
console.log(name);
```

### Variables
The `UpsertUserProfile` mutation requires an argument of type `UpsertUserProfileVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertUserProfileVariables {
  displayName?: string | null;
  role: string;
  targetExam?: string | null;
  targetYear?: number | null;
}
```
### Return Type
Recall that executing the `UpsertUserProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertUserProfileData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertUserProfileData {
  user_upsert: User_Key;
}
```
### Using `UpsertUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertUserProfile, UpsertUserProfileVariables } from '@eduai/dataconnect';

// The `UpsertUserProfile` mutation requires an argument of type `UpsertUserProfileVariables`:
const upsertUserProfileVars: UpsertUserProfileVariables = {
  displayName: ..., // optional
  role: ..., 
  targetExam: ..., // optional
  targetYear: ..., // optional
};

// Call the `upsertUserProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertUserProfile(upsertUserProfileVars);
// Variables can be defined inline as well.
const { data } = await upsertUserProfile({ displayName: ..., role: ..., targetExam: ..., targetYear: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertUserProfile(dataConnect, upsertUserProfileVars);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
upsertUserProfile(upsertUserProfileVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

### Using `UpsertUserProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertUserProfileRef, UpsertUserProfileVariables } from '@eduai/dataconnect';

// The `UpsertUserProfile` mutation requires an argument of type `UpsertUserProfileVariables`:
const upsertUserProfileVars: UpsertUserProfileVariables = {
  displayName: ..., // optional
  role: ..., 
  targetExam: ..., // optional
  targetYear: ..., // optional
};

// Call the `upsertUserProfileRef()` function to get a reference to the mutation.
const ref = upsertUserProfileRef(upsertUserProfileVars);
// Variables can be defined inline as well.
const ref = upsertUserProfileRef({ displayName: ..., role: ..., targetExam: ..., targetYear: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertUserProfileRef(dataConnect, upsertUserProfileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

## CreateInstitute
You can execute the `CreateInstitute` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createInstitute(vars: CreateInstituteVariables): MutationPromise<CreateInstituteData, CreateInstituteVariables>;

interface CreateInstituteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateInstituteVariables): MutationRef<CreateInstituteData, CreateInstituteVariables>;
}
export const createInstituteRef: CreateInstituteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createInstitute(dc: DataConnect, vars: CreateInstituteVariables): MutationPromise<CreateInstituteData, CreateInstituteVariables>;

interface CreateInstituteRef {
  ...
  (dc: DataConnect, vars: CreateInstituteVariables): MutationRef<CreateInstituteData, CreateInstituteVariables>;
}
export const createInstituteRef: CreateInstituteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createInstituteRef:
```typescript
const name = createInstituteRef.operationName;
console.log(name);
```

### Variables
The `CreateInstitute` mutation requires an argument of type `CreateInstituteVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateInstituteVariables {
  name: string;
  code: string;
  slug?: string | null;
  contactEmail?: string | null;
}
```
### Return Type
Recall that executing the `CreateInstitute` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateInstituteData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateInstituteData {
  institute_insert: Institute_Key;
}
```
### Using `CreateInstitute`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createInstitute, CreateInstituteVariables } from '@eduai/dataconnect';

// The `CreateInstitute` mutation requires an argument of type `CreateInstituteVariables`:
const createInstituteVars: CreateInstituteVariables = {
  name: ..., 
  code: ..., 
  slug: ..., // optional
  contactEmail: ..., // optional
};

// Call the `createInstitute()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createInstitute(createInstituteVars);
// Variables can be defined inline as well.
const { data } = await createInstitute({ name: ..., code: ..., slug: ..., contactEmail: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createInstitute(dataConnect, createInstituteVars);

console.log(data.institute_insert);

// Or, you can use the `Promise` API.
createInstitute(createInstituteVars).then((response) => {
  const data = response.data;
  console.log(data.institute_insert);
});
```

### Using `CreateInstitute`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createInstituteRef, CreateInstituteVariables } from '@eduai/dataconnect';

// The `CreateInstitute` mutation requires an argument of type `CreateInstituteVariables`:
const createInstituteVars: CreateInstituteVariables = {
  name: ..., 
  code: ..., 
  slug: ..., // optional
  contactEmail: ..., // optional
};

// Call the `createInstituteRef()` function to get a reference to the mutation.
const ref = createInstituteRef(createInstituteVars);
// Variables can be defined inline as well.
const ref = createInstituteRef({ name: ..., code: ..., slug: ..., contactEmail: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createInstituteRef(dataConnect, createInstituteVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.institute_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.institute_insert);
});
```

## EnrollStudentInBatch
You can execute the `EnrollStudentInBatch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
enrollStudentInBatch(vars: EnrollStudentInBatchVariables): MutationPromise<EnrollStudentInBatchData, EnrollStudentInBatchVariables>;

interface EnrollStudentInBatchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: EnrollStudentInBatchVariables): MutationRef<EnrollStudentInBatchData, EnrollStudentInBatchVariables>;
}
export const enrollStudentInBatchRef: EnrollStudentInBatchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
enrollStudentInBatch(dc: DataConnect, vars: EnrollStudentInBatchVariables): MutationPromise<EnrollStudentInBatchData, EnrollStudentInBatchVariables>;

interface EnrollStudentInBatchRef {
  ...
  (dc: DataConnect, vars: EnrollStudentInBatchVariables): MutationRef<EnrollStudentInBatchData, EnrollStudentInBatchVariables>;
}
export const enrollStudentInBatchRef: EnrollStudentInBatchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the enrollStudentInBatchRef:
```typescript
const name = enrollStudentInBatchRef.operationName;
console.log(name);
```

### Variables
The `EnrollStudentInBatch` mutation requires an argument of type `EnrollStudentInBatchVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface EnrollStudentInBatchVariables {
  batchId: UUIDString;
}
```
### Return Type
Recall that executing the `EnrollStudentInBatch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `EnrollStudentInBatchData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface EnrollStudentInBatchData {
  batchEnrollment_insert: BatchEnrollment_Key;
}
```
### Using `EnrollStudentInBatch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, enrollStudentInBatch, EnrollStudentInBatchVariables } from '@eduai/dataconnect';

// The `EnrollStudentInBatch` mutation requires an argument of type `EnrollStudentInBatchVariables`:
const enrollStudentInBatchVars: EnrollStudentInBatchVariables = {
  batchId: ..., 
};

// Call the `enrollStudentInBatch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await enrollStudentInBatch(enrollStudentInBatchVars);
// Variables can be defined inline as well.
const { data } = await enrollStudentInBatch({ batchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await enrollStudentInBatch(dataConnect, enrollStudentInBatchVars);

console.log(data.batchEnrollment_insert);

// Or, you can use the `Promise` API.
enrollStudentInBatch(enrollStudentInBatchVars).then((response) => {
  const data = response.data;
  console.log(data.batchEnrollment_insert);
});
```

### Using `EnrollStudentInBatch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, enrollStudentInBatchRef, EnrollStudentInBatchVariables } from '@eduai/dataconnect';

// The `EnrollStudentInBatch` mutation requires an argument of type `EnrollStudentInBatchVariables`:
const enrollStudentInBatchVars: EnrollStudentInBatchVariables = {
  batchId: ..., 
};

// Call the `enrollStudentInBatchRef()` function to get a reference to the mutation.
const ref = enrollStudentInBatchRef(enrollStudentInBatchVars);
// Variables can be defined inline as well.
const ref = enrollStudentInBatchRef({ batchId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = enrollStudentInBatchRef(dataConnect, enrollStudentInBatchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.batchEnrollment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.batchEnrollment_insert);
});
```


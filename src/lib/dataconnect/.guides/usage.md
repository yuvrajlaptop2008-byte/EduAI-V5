# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { upsertUserProfile, createInstitute, enrollStudentInBatch, listInstitutes, getUserProfile, listBatches, getTopPerformers } from '@eduai/dataconnect';


// Operation UpsertUserProfile:  For variables, look at type UpsertUserProfileVars in ../index.d.ts
const { data } = await UpsertUserProfile(dataConnect, upsertUserProfileVars);

// Operation CreateInstitute:  For variables, look at type CreateInstituteVars in ../index.d.ts
const { data } = await CreateInstitute(dataConnect, createInstituteVars);

// Operation EnrollStudentInBatch:  For variables, look at type EnrollStudentInBatchVars in ../index.d.ts
const { data } = await EnrollStudentInBatch(dataConnect, enrollStudentInBatchVars);

// Operation ListInstitutes: 
const { data } = await ListInstitutes(dataConnect);

// Operation GetUserProfile: 
const { data } = await GetUserProfile(dataConnect);

// Operation ListBatches:  For variables, look at type ListBatchesVars in ../index.d.ts
const { data } = await ListBatches(dataConnect, listBatchesVars);

// Operation GetTopPerformers:  For variables, look at type GetTopPerformersVars in ../index.d.ts
const { data } = await GetTopPerformers(dataConnect, getTopPerformersVars);


```
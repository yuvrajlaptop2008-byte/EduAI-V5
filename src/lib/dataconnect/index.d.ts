import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface BatchEnrollment_Key {
  batchId: UUIDString;
  userUid: string;
  __typename?: 'BatchEnrollment_Key';
}

export interface Batch_Key {
  id: UUIDString;
  __typename?: 'Batch_Key';
}

export interface CreateInstituteData {
  institute_insert: Institute_Key;
}

export interface CreateInstituteVariables {
  name: string;
  code: string;
  slug?: string | null;
  contactEmail?: string | null;
}

export interface EnrollStudentInBatchData {
  batchEnrollment_insert: BatchEnrollment_Key;
}

export interface EnrollStudentInBatchVariables {
  batchId: UUIDString;
}

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

export interface GetTopPerformersVariables {
  examTarget: string;
}

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

export interface Institute_Key {
  id: UUIDString;
  __typename?: 'Institute_Key';
}

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

export interface ListBatchesVariables {
  instituteId: UUIDString;
}

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

export interface PerformanceSummary_Key {
  id: UUIDString;
  __typename?: 'PerformanceSummary_Key';
}

export interface UpsertUserProfileData {
  user_upsert: User_Key;
}

export interface UpsertUserProfileVariables {
  displayName?: string | null;
  role: string;
  targetExam?: string | null;
  targetYear?: number | null;
}

export interface User_Key {
  uid: string;
  __typename?: 'User_Key';
}

interface UpsertUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
  operationName: string;
}
export const upsertUserProfileRef: UpsertUserProfileRef;

export function upsertUserProfile(vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;
export function upsertUserProfile(dc: DataConnect, vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;

interface CreateInstituteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateInstituteVariables): MutationRef<CreateInstituteData, CreateInstituteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateInstituteVariables): MutationRef<CreateInstituteData, CreateInstituteVariables>;
  operationName: string;
}
export const createInstituteRef: CreateInstituteRef;

export function createInstitute(vars: CreateInstituteVariables): MutationPromise<CreateInstituteData, CreateInstituteVariables>;
export function createInstitute(dc: DataConnect, vars: CreateInstituteVariables): MutationPromise<CreateInstituteData, CreateInstituteVariables>;

interface EnrollStudentInBatchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: EnrollStudentInBatchVariables): MutationRef<EnrollStudentInBatchData, EnrollStudentInBatchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: EnrollStudentInBatchVariables): MutationRef<EnrollStudentInBatchData, EnrollStudentInBatchVariables>;
  operationName: string;
}
export const enrollStudentInBatchRef: EnrollStudentInBatchRef;

export function enrollStudentInBatch(vars: EnrollStudentInBatchVariables): MutationPromise<EnrollStudentInBatchData, EnrollStudentInBatchVariables>;
export function enrollStudentInBatch(dc: DataConnect, vars: EnrollStudentInBatchVariables): MutationPromise<EnrollStudentInBatchData, EnrollStudentInBatchVariables>;

interface ListInstitutesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListInstitutesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListInstitutesData, undefined>;
  operationName: string;
}
export const listInstitutesRef: ListInstitutesRef;

export function listInstitutes(options?: ExecuteQueryOptions): QueryPromise<ListInstitutesData, undefined>;
export function listInstitutes(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListInstitutesData, undefined>;

interface GetUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserProfileData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserProfileData, undefined>;
  operationName: string;
}
export const getUserProfileRef: GetUserProfileRef;

export function getUserProfile(options?: ExecuteQueryOptions): QueryPromise<GetUserProfileData, undefined>;
export function getUserProfile(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserProfileData, undefined>;

interface ListBatchesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListBatchesVariables): QueryRef<ListBatchesData, ListBatchesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListBatchesVariables): QueryRef<ListBatchesData, ListBatchesVariables>;
  operationName: string;
}
export const listBatchesRef: ListBatchesRef;

export function listBatches(vars: ListBatchesVariables, options?: ExecuteQueryOptions): QueryPromise<ListBatchesData, ListBatchesVariables>;
export function listBatches(dc: DataConnect, vars: ListBatchesVariables, options?: ExecuteQueryOptions): QueryPromise<ListBatchesData, ListBatchesVariables>;

interface GetTopPerformersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTopPerformersVariables): QueryRef<GetTopPerformersData, GetTopPerformersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTopPerformersVariables): QueryRef<GetTopPerformersData, GetTopPerformersVariables>;
  operationName: string;
}
export const getTopPerformersRef: GetTopPerformersRef;

export function getTopPerformers(vars: GetTopPerformersVariables, options?: ExecuteQueryOptions): QueryPromise<GetTopPerformersData, GetTopPerformersVariables>;
export function getTopPerformers(dc: DataConnect, vars: GetTopPerformersVariables, options?: ExecuteQueryOptions): QueryPromise<GetTopPerformersData, GetTopPerformersVariables>;


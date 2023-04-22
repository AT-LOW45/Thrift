import { z as zod } from "zod";

// methods common to different service providers in the application
export interface ThriftServiceProvider<T> {
	readAll(): Promise<T[]>;
	find(id: string): Promise<T>;
	addDoc(entity: T): Promise<string | false>;
	deleteDoc(id: string): Promise<void>;
}

/**
 * 1. creates the timestamp object as stored in Firestore
 * 2. date inputs received by the frontend application are interpreted as a Date instance
 * 3. when the date object reaches Firestore, it will be stored as the schema defined below
 * 4. After receiving a timestamp object from Firestore, it will be first casted to the below schema to create a new Date object
 */
export const FirestoreTimestampObjectSchema = zod
	.object({ nanoseconds: zod.number(), seconds: zod.number() })
	.default({ nanoseconds: 0, seconds: 0 });

export type FirestoreTimestampObject = zod.infer<typeof FirestoreTimestampObjectSchema>


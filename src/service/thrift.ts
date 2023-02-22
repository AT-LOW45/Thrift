import { z as zod } from "zod";

export interface ThriftServiceProvider<T> {
	readAll(): Promise<T[]>;
	find(id: string): Promise<T>;
	addDoc(entity: T): Promise<string | false>;
	deleteDoc(id: string): Promise<void>;
}

export const FirestoreTimestampObjectSchema = zod
	.object({ nanoseconds: zod.number(), seconds: zod.number() })
	.default({ nanoseconds: 0, seconds: 0 });

export type FirestoreTimestampObject = zod.infer<typeof FirestoreTimestampObjectSchema>


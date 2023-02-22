import {
	collection,
	DocumentData,
	getFirestore,
	Query,
	QueryConstraint,
	WhereFilterOp,
	where,
	query,
	onSnapshot,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import app from "../firebaseConfig";

type DataType = {
	data: { collection: string } | { collection: string; id: string };
};

type FirestoreClause = {
	field: string;
	operator: WhereFilterOp;
	value: string;
};

const useRealtimeUpdate = <T extends { id?: string }>({ data }: DataType) => {
	const firestore = getFirestore(app);
	const [firestoreCollection, setFirestoreCollection] = useState<T[]>([]);
	const [firestoreDoc, setFirestoreDoc] = useState<T>();
	const [filters, setFilters] = useState<Query<DocumentData> | undefined>();
	const [clause, setClause] = useState<Array<FirestoreClause> | undefined>();

	const getCollection = useCallback(() => {
		const collectionRef = collection(firestore, data.collection);

		if (clause) {
			const whereClauses: QueryConstraint[] = clause.map((c) =>
				where(c.field, c.operator, c.value)
			);
			const filterQuery = query(collectionRef, ...whereClauses);
			setFilters(filterQuery);
		}

		const collectionStream = onSnapshot(
			filters === undefined ? collectionRef : filters,
			(snapShot) => {
				const result = snapShot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
				setFirestoreCollection(result);
			}
		);

		return collectionStream;
	}, []);

	useEffect(() => {
		const unsub = getCollection();

		return () => {
			unsub();
		};
	}, [getCollection, data.collection]);

    return {firestoreCollection, setClause}
};

export default useRealtimeUpdate;

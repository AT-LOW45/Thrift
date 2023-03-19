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
	doc,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import app from "../firebaseConfig";

type DocType = { collection: string; id: string };
type DataType = {
	data: { collection: string } | DocType;
};

type FirestoreClause = {
	field: string;
	operator: WhereFilterOp;
	value: string | string[];
};

const firestore = getFirestore(app);

const useRealtimeUpdate = <T extends { id?: string }>(
	{ data }: DataType,
	initialFilters?: FirestoreClause[]
) => {
	const [firestoreCollection, setFirestoreCollection] = useState<T[]>([]);
	const [firestoreDoc, setFirestoreDoc] = useState<T>({} as T);
	const [filters, setFilters] = useState<Query<DocumentData> | undefined>();
	const [clause, setClause] = useState<FirestoreClause[] | undefined>();
	const [initialClause, setInitialClause] = useState<Query<DocumentData> | undefined>();
	const [isLoading, setIsLoading] = useState(true);

	const getCollection = useCallback(() => {
		setIsLoading(true);
		const collectionRef = collection(firestore, data.collection);

		if (initialFilters) {
			const initialWhere: QueryConstraint[] = initialFilters.map((c) =>
				where(c.field, c.operator, c.value)
			);
			const initialQuery = query(collectionRef, ...initialWhere);
			setInitialClause(initialQuery);
		}

		if (clause) {
			const whereClauses: QueryConstraint[] = clause.map((c) =>
				where(c.field, c.operator, c.value)
			);
			const filterQuery = query(collectionRef, ...whereClauses);
			setFilters(filterQuery);
		}

		const collectionStream = onSnapshot(
			filters === undefined ? (initialClause ? initialClause : collectionRef) : filters,
			(snapShot) => {
				const result = snapShot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
				setFirestoreCollection(result);
				setIsLoading(false);
			}
		);

		return collectionStream;
	}, [clause]);

	const getSingleDoc = useCallback(() => {
		setIsLoading(true);
		const entityRef = doc(firestore, data.collection, (data as DocType).id);

		const docStream = onSnapshot(entityRef, (snapshot) => {
			const result = { id: snapshot.id, ...(snapshot.data() as T) };
			setFirestoreDoc(result);
			setIsLoading(false);
		});

		return docStream;
	}, []);

	useEffect(() => {
		const unsub = "id" in data ? getSingleDoc() : getCollection();

		return () => {
			unsub();
		};
	}, [getCollection, data.collection, getSingleDoc, (data as DocType).id]);

	return { firestoreCollection, firestoreDoc, setClause, isLoading };
};

export default useRealtimeUpdate;

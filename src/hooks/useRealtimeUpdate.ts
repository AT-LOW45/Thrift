/**
 * Programmer Name: Koh Choon Mun
 * Program: useRealtimeUpdate.ts
 * Description: Streams updated data from the database to the client application in real-time
 * First written: 6/2/2023
 * Edited on: 29/4/2023
 */

import {
	DocumentData,
	Query,
	QueryConstraint,
	collection,
	doc,
	getFirestore,
	onSnapshot,
	query,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import app from "../firebaseConfig";

// type alias to retrieve a single document
type DocType = { collection: string; id: string };
// a union type that allows the hook to either retrieve a collection or a single document
type DataType = {
	data: { collection: string } | DocType;
};

const firestore = getFirestore(app);

const useRealtimeUpdate = <T extends { id?: string }>(
	{ data }: DataType, // the type of data to be retrieved (collection or document)
	...queryConstraints: QueryConstraint[] // initial filtering conditions
) => {
	const [firestoreCollection, setFirestoreCollection] = useState<T[]>([]); // holds the collection
	const [firestoreDoc, setFirestoreDoc] = useState<T>({} as T); // holds the document
	const [filters, setFilters] = useState<Query<DocumentData> | undefined>(); // holds potential filters provided by the client
	const [subsequentConstraints, setSubsequentConstraints] = useState<
		QueryConstraint[] | undefined
	>();
	const [isLoading, setIsLoading] = useState(true);

	// function to retrieve a collection
	const getCollection = useCallback(() => {
		setIsLoading(true);
		const collectionRef = collection(firestore, data.collection);

		let initialQuery;
		// set the initial filters if the second hook argument is provided
		if (queryConstraints) {
			initialQuery = query(collectionRef, ...queryConstraints);
		}

		// set any subsequent filters that the client may supply
		if (subsequentConstraints) {
			const filterQuery = query(collectionRef, ...subsequentConstraints);
			setFilters(filterQuery);
		}

		const providedConditions = initialQuery ? initialQuery : collectionRef;
		const collectionStream = onSnapshot(
			filters === undefined ? providedConditions : filters,
			(snapShot) => {
				const result = snapShot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
				setFirestoreCollection(result);
				setIsLoading(false);
			}
		);

		return collectionStream;
	}, [subsequentConstraints, queryConstraints]);

	// function to retrieve a single document
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
		// fetch data based on the first argument of the hook
		const unsub = "id" in data ? getSingleDoc() : getCollection();

		return () => {
			// terminates the stream once the component consuming this hook is unmounted
			unsub();
		};
	}, [data.collection, (data as DocType).id]);

	return { firestoreCollection, firestoreDoc, setSubsequentConstraints, isLoading };
};

export default useRealtimeUpdate;

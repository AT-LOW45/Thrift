/**
 * Programmer Name: Koh Choon Mun
 * Program: useInputGroup.ts
 * Description: Manages a group of input fields
 * First written: 12/2/2023
 * Edited on: 29/4/2023
 */

import { useState } from "react";

// the precondition of using input groups is that the data model must contain a (nullable) id attribute
type Identifiable = { id?: string };

// an input group contains a combination of different input types such as text fields and select controls
const useInputGroup = <T extends Identifiable>(
	maxGroupNumber: number, // limits the number of groups created by the hook
	groupValues: T, // defines a generic data model for each input group
	predefined?: T[]
) => {
	/**
	 * the group values will be set to any predefined values provided by the client
	 * otherwise, the hook will create a single input group with the provided data model (groupValues)
	 */
	const [group, setGroup] = useState<T[]>(predefined ? predefined : [groupValues]);

	/**
	 * 1. adds an additional input collection to the group
	 * 2. cannot add beyond the specified group limit
	 */
	const addGroup = () => {
		if (group.length < maxGroupNumber) {
			setGroup([...group, groupValues]);
		}
	};

	/**
	 * 1. removes an input collection from the group
	 * 2. cannot remove if only a single input collection is present
	 */
	const removeGroup = (id: number) => {
		if (group.length > 1) {
			const list = [...group];
			list.splice(id, 1);
			setGroup(list);
		}
	};

	// handles input changes to any input collection in the group
	const handleGroupUpdate = (
		index: number,
		field: string,
		updatedValues: any,
		setParentContext: (context: T[]) => void
	) => {
		setGroup((group) => {
			const localResult = [
				...group.slice(0, index),
				{ ...group[index], [field]: updatedValues },
				...group.slice(index + 1),
			];
			setParentContext.call(null, localResult);
			return localResult;
		});
	};

	return {
		group: group.map((el, index) => ({ ...el, id: index.toString() })),
		hasSingleGroup: group.length === 1,
		addGroup,
		removeGroup,
		setGroup,
		handleGroupUpdate,
	};
};

export default useInputGroup;

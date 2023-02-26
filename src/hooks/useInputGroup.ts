import { useState } from "react";

type Identifiable = { id?: string };

const useInputGroup = <T extends Identifiable>(
	maxGroupNumber: number,
	groupValues: T,
	predefined?: T[]
) => {
	const [group, setGroup] = useState<T[]>(predefined ? predefined : [groupValues]);

	const addGroup = () => {
		if (group.length < maxGroupNumber) {
			setGroup([...group, groupValues]);
		}
	};

	const removeGroup = (id: number) => {
		if (group.length > 1) {
			const list = [...group];
			list.splice(id, 1);
			setGroup(list);
		}
	};

	const handleGroupUpdate = <K extends keyof T>(
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

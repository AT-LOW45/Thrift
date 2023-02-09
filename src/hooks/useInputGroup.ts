import { useState } from "react";
import { useFunctional } from "./useFunctional";

type Input = { id: string };

const useInputGroup = <T extends object>(maxNumber: number, groupValues: T, predefined?: T[]) => {
	const [group, setGroup] = useState<T[]>(predefined ? predefined : [groupValues]);
	const { curry } = useFunctional();

	const addGroup = () => {
		if (group.length <= maxNumber) {
			setGroup([...group, groupValues]);
		}
	};

	const removeGroup = (id: number) => {
		const list = [...group];
		list.splice(id, 1);
		setGroup(list);
	};

	const handleGroupUpdate = <K extends keyof T>(
		index: number,
		field: string,
		update: any,
		setParentContext: (context: T[]) => void
	) => {
		setGroup((group) => {
			const localResult = [
				...group.slice(0, index),
				{ ...group[index], [field]: update },
				...group.slice(index + 1),
			];
			setParentContext && setParentContext.call(null, localResult);
			return localResult;
		});
	};

	const update = curry(handleGroupUpdate);

	return { group, addGroup, removeGroup, setGroup, update };
};

export default useInputGroup;

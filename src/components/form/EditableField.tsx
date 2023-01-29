import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, ButtonGroup, ExtendButtonBase, IconButton } from "@mui/material";
import { IconButtonTypeMap } from "@mui/material/IconButton";
import React, { createContext, FC, ReactNode, useContext, useMemo, useRef, useState } from "react";
import "./editableField.css";

type EditableModeProps = { children: JSX.Element[] | JSX.Element };
type IconType = React.ReactElement<ExtendButtonBase<IconButtonTypeMap<{}, "button">>>;
type Final = FC<EditableFieldProps> & {
	View: FC<EditableModeProps>;
	Edit: FC<EditableModeProps & { additionalActions?: IconType }>;
};
type EditableFieldProps = { children: JSX.Element[] };
type EditableFieldContextProps = { children: ReactNode };

type EditableFieldCtx = {
	editActive: boolean;
	handleModeSwitch(e: React.MouseEvent): void;
};

const defaultValue: EditableFieldCtx = {
	editActive: false,
	handleModeSwitch: (): void => {},
};

const EditableFieldContext = createContext<EditableFieldCtx>(defaultValue);

const EditableFieldContextProvider = ({ children }: EditableFieldContextProps): JSX.Element => {
	const [editActive, setEditActive] = useState(false);

	const handleModeSwitch = (e: React.MouseEvent) => {
		setEditActive((mode) => !mode);
		const parentContainer = e.currentTarget.closest(".container");
		const children = parentContainer?.closest(".editable-field")?.children!;
		let sibilingEl;

		for (const child of children) {
			if (child !== parentContainer) {
				sibilingEl = child;
				break;
			}
		}

		parentContainer?.classList.add("hide");
		(sibilingEl as HTMLDivElement).classList.remove("hide");
	};

	const memoizedContextExports = useMemo(() => ({ editActive, handleModeSwitch }), [editActive]);

	return (
		<EditableFieldContext.Provider value={memoizedContextExports}>
			{children}
		</EditableFieldContext.Provider>
	);
};

const EditableField: Final = ({ children }) => {
	return (
		<EditableFieldContextProvider>
			<div className='editable-field'>{children}</div>
		</EditableFieldContextProvider>
	);
};

EditableField.View = ({ children }) => {
	const { editActive, handleModeSwitch } = useContext(EditableFieldContext);
	const editButtonRef = useRef<HTMLButtonElement>(null);

	const toggleEditButtonVisibility = () => {
		const editButtonClassList = editButtonRef.current?.classList;
		editButtonClassList?.contains("reveal-edit-button")
			? editButtonClassList.remove("reveal-edit-button")
			: editButtonClassList?.add("reveal-edit-button");
	};

	return (
		<div
			onMouseEnter={toggleEditButtonVisibility}
			onMouseLeave={toggleEditButtonVisibility}
			className='container view'
		>
			<Box>{children}</Box>
			<Box sx={{ display: "flex", pl: { sm: 0, md: 3 } }}>
				<Button
					className='edit-button'
					ref={editButtonRef}
					startIcon={<EditIcon />}
					color='success'
					sx={{
						fontWeight: "700",
						transition: "all 200ms",
						fontSize: "1.2rem",
						margin: { sm: "auto", md: 0 },
					}}
					onClick={handleModeSwitch}
				>
					Edit
				</Button>
			</Box>
		</div>
	);
};

EditableField.Edit = ({ children, additionalActions }) => {
	const { handleModeSwitch } = useContext(EditableFieldContext);

	return (
		<div className='container edit hide'>
			<Box>{children}</Box>
			<Box>
				<ButtonGroup
					aria-label='outlined primary button group'
					sx={{ justifyContent: "center", display: { sm: "flex", md: "block" } }}
				>
					<IconButton>
						<CheckIcon />
					</IconButton>
					<IconButton onClick={handleModeSwitch}>
						<CloseIcon />
					</IconButton>
					{additionalActions}
				</ButtonGroup>
			</Box>
		</div>
	);
};

export default EditableField;

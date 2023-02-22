import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, ButtonGroup, ExtendButtonBase, IconButton } from "@mui/material";
import { IconButtonTypeMap } from "@mui/material/IconButton";
import { useSelector } from "@xstate/react";
import React, { FC, ReactNode, useContext, useRef } from "react";
import { EditableContext } from "../../../context/EditableContext";
import "./editableField.css";

type EditableModeProps = { children: ReactNode };
type IconType = React.ReactElement<ExtendButtonBase<IconButtonTypeMap<{}, "button">>>;
type EditableFieldProps = {
	children: ReactNode;
	compact: boolean;
};
type EditableFieldType = FC<EditableFieldProps> & {
	View: FC<EditableModeProps>;
	Edit: FC<
		EditableModeProps & {
			additionalActions?: IconType;
		}
	>;
};

const EditableField: EditableFieldType = ({ children, compact }) => {
	return (
		<div className='editable-field' style={{ width: compact ? "fit-content" : "100%" }}>
			{children}
		</div>
	);
};

EditableField.View = ({ children }) => {
	const editButtonRef = useRef<HTMLButtonElement>(null);

	const { handleModeSwitch, editableService } = useContext(EditableContext);
	const isEditting = useSelector(editableService, (state) => state.matches("Edit Active"));

	const toggleEditButtonVisibility = () => {
		const editButtonClassList = editButtonRef.current?.classList;
		editButtonClassList?.contains("reveal-edit-button")
			? editButtonClassList.remove("reveal-edit-button")
			: editButtonClassList?.add("reveal-edit-button");
	};

	const activateEdit = (event: React.MouseEvent) => {
		handleModeSwitch(event);
		editableService.send("activate edit");
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
					disabled={isEditting}
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
					onClick={activateEdit}
				>
					Edit
				</Button>
			</Box>
		</div>
	);
};

EditableField.Edit = ({ children, additionalActions }) => {
	const { handleModeSwitch, editableService } = useContext(EditableContext);

	const deactivateEdit = (event: React.MouseEvent) => {
		handleModeSwitch(event);
		editableService.send("deactivate edit");
	};

	return (
		<div className='container edit hide' style={{ display: "flex" }}>
			<Box>{children}</Box>
			<Box>
				<ButtonGroup
					aria-label='outlined primary button group'
					sx={{ justifyContent: "center", display: { sm: "flex", md: "block" } }}
				>
					<IconButton type='submit'>
						<CheckIcon />
					</IconButton>
					<IconButton onClick={deactivateEdit}>
						<CloseIcon />
					</IconButton>
					{additionalActions}
				</ButtonGroup>
			</Box>
		</div>
	);
};

export default EditableField;

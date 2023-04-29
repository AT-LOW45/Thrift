import { Portal } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { FormEvent } from "react";

export type FormDialogProps = {
	open: boolean;
	toggleModal(): void;
	children: JSX.Element[] | JSX.Element;
	actions: JSX.Element[]
	title: string
};

const FormDialog = ({ open, toggleModal, children, actions, title }: FormDialogProps) => {

	const submit = (event: FormEvent) => {
		event.preventDefault()
	}

	return (
		<Portal>
			<Dialog open={open} onClose={toggleModal} fullWidth={true} maxWidth='lg'>
				<form method='POST' onSubmit={submit}>
					<DialogTitle>{title}</DialogTitle>
					<DialogContent dividers>{children}</DialogContent>
					<DialogActions>
						{actions}
					</DialogActions>
				</form>
			</Dialog>
		</Portal>
	);
};

export default FormDialog;

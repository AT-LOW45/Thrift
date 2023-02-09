import { Portal } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

export type FormDialogProps = {
	open: boolean;
	toggleModal(): void;
	children: JSX.Element[];
	actions: JSX.Element[]
};

const FormDialog = ({ open, toggleModal, children, actions }: FormDialogProps) => {
	return (
		<Portal>
			<Dialog open={open} onClose={toggleModal} fullWidth={true} maxWidth='lg'>
				<form method='POST'>
					<DialogTitle>Subscribe</DialogTitle>
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

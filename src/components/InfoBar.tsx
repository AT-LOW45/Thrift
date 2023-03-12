import CloseIcon from "@mui/icons-material/Close";
import { Alert, AlertColor, IconButton, Snackbar } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

type InfoBarProps = {
	infoBarOpen: boolean;
	setInfoBarOpen: Dispatch<SetStateAction<boolean>>;
	type: AlertColor;
	message: string;
};

const InfoBar = ({ infoBarOpen, setInfoBarOpen, type, message }: InfoBarProps) => {
	const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === "clickaway") {
			return;
		}

		setInfoBarOpen(false);
	};

	return (
		<Snackbar open={infoBarOpen} autoHideDuration={5000}>
			<Alert
				severity={type}
				variant='filled'
				onClose={handleClose}
				action={
					<IconButton
						size='small'
						aria-label='close'
						color='inherit'
						onClick={handleClose}
					>
						<CloseIcon fontSize='small' />
					</IconButton>
				}
			>
				{message}
			</Alert>
		</Snackbar>
	);
};

export default InfoBar;

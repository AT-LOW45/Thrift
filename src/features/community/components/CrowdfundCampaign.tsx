import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import {
	Avatar,
	AvatarGroup,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Portal,
	Stack,
	Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { Fragment } from "react";
import { InfoBar, Tray } from "../../../components";
import { FirestoreTimestampObject } from "../../../service/thrift";
import useCrowdfundRetrieval from "../hooks/useCrowdfundRetrieval";
import CrowdfundCreationDialog from "./CrowdfundCreationDialog";
import CrowdfundDetailsDialog from "./CrowdfundDetailsDialog";

const CrowdfundCampaign = () => {
	const {
		convertDate,
		creationDialogOpen,
		dialogOpen,
		findSelectedCrowdfund,
		firestoreCollection,
		myCrowdfund,
		selectedCrowdfund,
		selectedCrowdfundCumulativeAmount,
		toggleCreationDialog,
		toggleConfirmCloseDialog,
		crowdfundCloseConfirmationOpen,
		toggleDialog,
		closeCrowdfund,
		closedCrowdfundName, 
		closingErrorInfoBarOpen,
		setClosingErrorInfoBarOpen,
		closingInfoBarOpen,
		setClosingInfoBarOpen
	} = useCrowdfundRetrieval();

	return (
		<Fragment>
			{myCrowdfund ? (
				<Grid2 container sx={{ placeContent: "center" }}>
					<Tray title={myCrowdfund.name} colSpan={{ xs: 12, md: 6 }}>
						<Stack spacing={1}>
							<Typography pt={2} variant='numberHeading'>
								Target Amount: RM {myCrowdfund.targetAmount}
							</Typography>
							<Typography>
								Ending on: &nbsp;
								{convertDate(myCrowdfund.endDate as FirestoreTimestampObject)}
							</Typography>
							<Button
								color='tertiary'
								endIcon={<AssignmentTurnedInIcon />}
								onClick={toggleConfirmCloseDialog}
							>
								Close Crowdfund
							</Button>
						</Stack>
					</Tray>
				</Grid2>
			) : (
				<Box
					sx={{
						backgroundColor: "white",
						boxShadow: "0 4px 10px 3px lightgray",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						borderRadius: "5px",
						p: 5,
					}}
				>
					<Stack justifyContent='center' alignItems='center' spacing={2}>
						<EmojiPeopleIcon sx={{ fontSize: "4rem", color: "gray" }} />
						<Typography variant='regularLight' fontSize='1.5rem' textAlign='center'>
							You do not have an ongoing crowdfund
						</Typography>
						<Button
							sx={{ width: "fit-content" }}
							variant='contained'
							onClick={toggleCreationDialog}
						>
							Initiate Crowdfund
						</Button>
					</Stack>
				</Box>
			)}

			<Stack mt={5} spacing={2}>
				<Typography variant='regularSubHeading'>Crowdfund List</Typography>
				<List sx={{ backgroundColor: "white" }}>
					{firestoreCollection.map((crowdfund) => (
						<Fragment key={crowdfund.id}>
							<ListItem disablePadding>
								<ListItemButton
									onClick={() => findSelectedCrowdfund(crowdfund.id!)}
								>
									<Stack width='100%' spacing={1}>
										<Stack
											direction='row'
											justifyContent='space-between'
											alignItems='center'
										>
											<Stack direction='row' spacing={2}>
												<Typography fontSize='1.3rem'>
													{crowdfund.name}
												</Typography>
												<Box
													display='grid'
													sx={{
														placeContent: "center",
														backgroundColor: crowdfund.isActive
															? "green"
															: "red",
														color: "white",
														px: 2,
														paddingTop: "1px",
														paddingBottom: "1px",
														borderRadius: "5px",
													}}
												>
													{crowdfund.isActive ? "Active" : "Closed"}
												</Box>
											</Stack>
											<Typography variant='numberParagraph'>
												Target: RM {crowdfund.targetAmount}
											</Typography>
											{crowdfund.contributors.length === 0 ? (
												<Typography variant='regularLight'>
													No contributors yet
												</Typography>
											) : (
												<AvatarGroup max={3}>
													{crowdfund.contributors.map((cont) => (
														<Avatar key={cont.user}>
															{cont.user.charAt(0).toUpperCase()}
														</Avatar>
													))}
												</AvatarGroup>
											)}
										</Stack>

										<Stack direction='row' spacing={2} alignItems='center'>
											<Stack direction='row' alignItems='center' spacing={1}>
												<Avatar>
													{crowdfund.initiator.charAt(0).toUpperCase()}
												</Avatar>
												<Typography variant='regularLight'>
													{crowdfund.initiator}
												</Typography>
											</Stack>
											<ListItemText
												primary={`ending on ${convertDate(
													crowdfund.endDate as FirestoreTimestampObject
												)}`}
											/>
										</Stack>
									</Stack>
								</ListItemButton>
							</ListItem>
							<Divider />
						</Fragment>
					))}
				</List>
			</Stack>
			<CrowdfundDetailsDialog
				open={dialogOpen}
				toggleModal={toggleDialog}
				crowdfund={selectedCrowdfund}
				crowdfundCumulativeAmount={selectedCrowdfundCumulativeAmount}
			/>
			<CrowdfundCreationDialog open={creationDialogOpen} toggleModal={toggleCreationDialog} />
			<Portal>
				<Dialog
					open={crowdfundCloseConfirmationOpen}
					onClose={toggleConfirmCloseDialog}
					aria-labelledby='alert-dialog-title'
					aria-describedby='alert-dialog-description'
				>
					<DialogTitle>Close This Crowdfund?</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Closing this crowdfund will mean the following:
						</DialogContentText>
						<Box component='ul' sx={{ px: 5 }}>
							<Typography component='li' color='gray'>
								People can no longer contribute to your crowdfund
							</Typography>
							<Typography component='li' color='gray'>
								The accumulated amount will be transferred to a separate account
							</Typography>
							<Typography component='li' color='gray'>
								You will need to configure the payback period and amount
							</Typography>
						</Box>
					</DialogContent>
					<DialogActions>
						<Button onClick={toggleConfirmCloseDialog}>Disagree</Button>
						<Button onClick={() => closeCrowdfund(myCrowdfund!.id!)}>Agree</Button>
					</DialogActions>
				</Dialog>
			</Portal>
			<InfoBar
				infoBarOpen={closingInfoBarOpen}
				setInfoBarOpen={setClosingErrorInfoBarOpen}
				message={`You closed ${closedCrowdfundName}`}
				type='info'
			/>
			<InfoBar
				infoBarOpen={closingErrorInfoBarOpen}
				setInfoBarOpen={setClosingErrorInfoBarOpen}
				message='Unable to initiate crowdfund. Please try again later'
				type='success'
			/>
		</Fragment>
	);
};

export default CrowdfundCampaign;

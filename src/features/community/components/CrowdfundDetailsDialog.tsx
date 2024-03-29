import {
	Avatar,
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	FormControl,
	InputLabel,
	MenuItem,
	Portal,
	IconButton,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { Fragment } from "react";
import { InfoBar, ProgressBar } from "../../../components";
import { CrowdFund } from "../community.schema";
import useCrowdfundDetails from "../hooks/useCrowdfundDetails";
import CloseIcon from "@mui/icons-material/Close";

type CrowdfundDetailsDialogProps = {
	open: boolean;
	toggleModal(): void;
	crowdfund: CrowdFund;
	crowdfundCumulativeAmount: { currency: number; percentage: number };
};

const CrowdfundDetailsDialog = ({
	crowdfund,
	open,
	toggleModal,
	crowdfundCumulativeAmount,
}: CrowdfundDetailsDialogProps) => {
	const {
		balance,
		donate,
		donation,
		accounts,
		handleAccountChange,
		handleDonationChange,
		getSortedContributors,
		errorMessage,
		errorInfoBarOpen,
		infoInfoBarOpen,
		setErrorInfoBarOpen,
		setInfoInfoBarOpen,
	} = useCrowdfundDetails(toggleModal, crowdfund);

	return (
		<Fragment>
			<Portal>
				<Dialog open={open} onClose={toggleModal} fullWidth={true} maxWidth='md'>
					<Stack
						direction='row'
						justifyContent='space-between'
						alignItems='center'
						pr={2}
					>
						<DialogTitle>{crowdfund.name}</DialogTitle>
						<IconButton onClick={toggleModal}>
							<CloseIcon />
						</IconButton>
					</Stack>
					<DialogContent dividers>
						<Stack spacing={3}>
							<Stack direction='row' alignItems='center' spacing={1}>
								<Typography>Created by:</Typography>
								<Avatar>{crowdfund.initiator.charAt(0).toUpperCase()}</Avatar>
								<Typography variant='regularLight'>
									{crowdfund.initiator}
								</Typography>
							</Stack>
							<Stack spacing={1}>
								<Typography variant='regularSubHeading'>Contributors</Typography>
								<Stack
									maxHeight='200px'
									overflow='auto'
									direction='row'
									flexWrap='wrap'
									sx={{
										"&::-webkit-scrollbar": {
											width: "0.3rem",
										},
										"&::-webkit-scrollbar-thumb": {
											background: "#1A46C4",
										},
									}}
								>
									{crowdfund.contributors.length === 0 ? (
										<Typography
											variant='regularLight'
											textAlign='center'
											py={3}
											component='p'
											width='100%'
										>
											No contributors yet
										</Typography>
									) : (
										getSortedContributors(crowdfund.contributors).map(
											(cont) => (
												<Stack
													key={cont.user}
													direction='row'
													flexBasis='50%'
													spacing={1}
													py={1}
													alignItems='center'
													justifyContent='center'
												>
													<Avatar>
														{cont.user.charAt(0).toUpperCase()}
													</Avatar>
													<Typography variant='regularLight'>
														{cont.user}
													</Typography>
												</Stack>
											)
										)
									)}
								</Stack>
							</Stack>
							<Stack spacing={1} px={7}>
								<Typography variant='numberHeading'>
									RM {crowdfundCumulativeAmount.currency} / RM{" "}
									{crowdfund.targetAmount}
								</Typography>
								<ProgressBar
									fillPercentage={crowdfundCumulativeAmount.percentage}
									fillType='#1A46C4'
								/>
							</Stack>
							<Box sx={{ backgroundColor: "rgba(232, 232, 232, 0.7)", px: 2, py: 1 }}>
								{crowdfund.description}
							</Box>
							{crowdfund.isActive && (
								<Fragment>
									<Divider />
									<DialogContentText>{`Assist in ${crowdfund.initiator}'s cause!`}</DialogContentText>
									<Stack spacing={2}>
										<Stack
											direction='row'
											spacing={2}
											justifyContent='center'
											alignItems='center'
										>
											<FormControl sx={{ width: "30%" }} variant='standard'>
												<InputLabel id='demo-simple-select-standard-label'>
													Account
												</InputLabel>
												<Select
													value={donation.accountName}
													name='account'
													label='Account'
													onChange={handleAccountChange}
												>
													{accounts.map((acc) => (
														<MenuItem key={acc.id} value={acc.name}>
															{acc.name}
														</MenuItem>
													))}
												</Select>
											</FormControl>
											<Typography variant='numberParagraph'>
												Remaining: RM {balance}
											</Typography>
										</Stack>
										<Stack direction='row' spacing={2} justifyContent='center'>
											<TextField
												value={
													isNaN(donation.amount) ? "" : donation.amount
												}
												variant='standard'
												label='Donation amount'
												onChange={handleDonationChange}
												type='number'
												name='amount'
												placeholder='amount to contribute'
											/>
											<Button variant='contained' onClick={donate}>
												Donate
											</Button>
										</Stack>
										{errorMessage && (
											<Typography variant='regularLight' textAlign='center'>
												{errorMessage}
											</Typography>
										)}
									</Stack>
								</Fragment>
							)}
						</Stack>
					</DialogContent>
				</Dialog>
			</Portal>
			<InfoBar
				infoBarOpen={infoInfoBarOpen}
				setInfoBarOpen={setInfoInfoBarOpen}
				message={`You contributed RM${donation.amount} to ${crowdfund.name}`}
				type='info'
			/>
			<InfoBar
				infoBarOpen={errorInfoBarOpen}
				setInfoBarOpen={setErrorInfoBarOpen}
				message='Unable to process transaction. Please try again later'
				type='error'
			/>
		</Fragment>
	);
};

export default CrowdfundDetailsDialog;

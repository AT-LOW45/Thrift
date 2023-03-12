import {
	Avatar,
	Box,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Portal,
	Stack,
	Typography,
	DialogContentText,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { ChangeEvent, Fragment, useContext, useEffect, useState } from "react";
import { ProgressBar } from "../../../components";
import { AuthContext } from "../../../context/AuthContext";
import { PersonalAccount } from "../../payment_info/paymentInfo.schema";
import paymentInfoService from "../../payment_info/paymentInfo.service";
import { CrowdFund } from "../community.schema";
import communityService from "../community.service";

type CrowdfundDetailsDialogProps = {
	open: boolean;
	toggleModal(): void;
	crowdfund: CrowdFund;
};

const CrowdfundDetailsDialog = ({ crowdfund, open, toggleModal }: CrowdfundDetailsDialogProps) => {
	const [accounts, setAccounts] = useState<PersonalAccount[]>([]);
	const [donation, setDonation] = useState<{
		accountName: string;
		accountId: string;
		amount: number;
	}>({
		accountName: "",
		accountId: "",
		amount: 0,
	});
	const [cumulativeAmount, setCumulativeAmount] = useState<{
		currency: number;
		percentage: number;
	}>({ currency: 0, percentage: 0 });
	const [balance, setBalance] = useState<number>();
	const { user } = useContext(AuthContext);

	useEffect(() => {
		console.log(crowdfund)
		const currency =
			crowdfund.contributors.length === 0
				? 0
				: crowdfund.contributors
						.map((cont) => cont.amount)
						.reduce((prev, cur) => prev + cur, 0);
		// console.log(crowdfund.contributors);
		const percentage = Math.round((currency / crowdfund.targetAmount) * 100);
		console.log(percentage)
		setCumulativeAmount({ currency, percentage });
	}, [crowdfund]);

	useEffect(() => {
		const getPaymentAccounts = async () => {
			const personalAccounts = await paymentInfoService.getPersonalAccounts();
			setAccounts(personalAccounts);
		};
		getPaymentAccounts();
	}, []);

	const handleAccountChange = (event: SelectChangeEvent) => {
		const selectedAccount = accounts.find((acc) => acc.name === event.target.value);
		setDonation((donation) => ({
			...donation,
			accountName: event.target.value,
			accountId: selectedAccount?.id!,
		}));
		setBalance(selectedAccount?.balance);
	};

	const handleDonationChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setDonation((donation) => ({ ...donation, amount: parseInt(event.target.value) }));
	};

	const donate = async () => {
		const selectedAccount = accounts.find((acc) => acc.name === donation.accountName);
		if (
			donation.amount > selectedAccount?.balance! ||
			donation.amount === 0 ||
			donation.accountName === ""
		) {
			console.log("cannot donate");
		} else {
			const contributionResult = await communityService.contribute(
				user?.uid!,
				donation,
				crowdfund
			);
			if (typeof contributionResult === "string") {
				toggleModal();
			} else {
				console.log("an error occurred");
			}
		}
	};

	return (
		<Portal>
			<Dialog open={open} onClose={toggleModal} fullWidth={true} maxWidth='md'>
				<DialogTitle>{crowdfund.name}</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={3}>
						<Stack direction='row' alignItems='center' spacing={1}>
							<Typography>Created by:</Typography>
							<Avatar>{crowdfund.initiator.charAt(0).toUpperCase()}</Avatar>
							<Typography variant='regularLight'>{crowdfund.initiator}</Typography>
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
									crowdfund.contributors.map((cont) => (
										<Stack
											key={cont.user}
											direction='row'
											flexBasis='50%'
											spacing={1}
											py={1}
											alignItems='center'
											justifyContent='center'
										>
											<Avatar>{cont.user.charAt(0).toUpperCase()}</Avatar>
											<Typography variant='regularLight'>
												{cont.user}
											</Typography>
										</Stack>
									))
								)}
							</Stack>
						</Stack>
						<Stack spacing={1} px={7}>
							<Typography variant='numberHeading'>
								RM {cumulativeAmount.currency} / RM {crowdfund.targetAmount}
							</Typography>
							<ProgressBar
								fillPercentage={cumulativeAmount.percentage}
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
											value={isNaN(donation.amount) ? "" : donation.amount}
											variant='standard'
											onChange={handleDonationChange}
											type='number'
											name='amount'
											placeholder='amount to contribute'
										/>
										<Button variant='contained' onClick={donate}>
											Donate
										</Button>
									</Stack>
								</Stack>
							</Fragment>
						)}
					</Stack>
				</DialogContent>
			</Dialog>
		</Portal>
	);
};

export default CrowdfundDetailsDialog;

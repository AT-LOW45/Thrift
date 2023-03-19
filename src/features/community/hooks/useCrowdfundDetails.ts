import { SelectChangeEvent } from "@mui/material";
import { useState, useContext, useEffect, ChangeEvent } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { PersonalAccount } from "../../payment_info/paymentInfo.schema";
import paymentInfoService from "../../payment_info/paymentInfo.service";
import { CrowdFund } from "../community.schema";
import communityService from "../community.service";

const useCrowdfundDetails = (toggleModal: () => void, crowdfund: CrowdFund) => {
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
	const [balance, setBalance] = useState<number>();
	const { user } = useContext(AuthContext);

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

	return {
		donate,
		donation,
		balance,
		handleAccountChange,
		handleDonationChange,
		accounts,
	};
};

export default useCrowdfundDetails;

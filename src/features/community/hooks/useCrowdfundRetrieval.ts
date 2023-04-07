import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import useRealtimeUpdate from "../../../hooks/useRealtimeUpdate";
import { FirestoreTimestampObject } from "../../../service/thrift";
import profileService from "../../profile/profile.service";
import { CrowdFund, CrowdfundSchemaDefaults } from "../community.schema";
import communityService from "../community.service";

const useCrowdfundRetrieval = () => {
	const { firestoreCollection } = useRealtimeUpdate<CrowdFund>({
		data: { collection: "Crowdfund" },
	});
	const { user } = useContext(AuthContext);
	const [myCrowdfund, setMyCrowdfund] = useState<CrowdFund | null>(null);
	const [selectedCrowdfund, setSelectedCrowdfund] = useState<CrowdFund>(
		CrowdfundSchemaDefaults.parse({})
	);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [creationDialogOpen, setCreationDialogOpen] = useState(false);
	const [selectedCrowdfundCumulativeAmount, setSelectedCrowdfundCumulativeAmount] = useState<{
		currency: number;
		percentage: number;
	}>({ currency: 0, percentage: 0 });
	const [crowdfundCloseConfirmationOpen, setCrowdfundCloseConfirmationOpen] = useState(false);

	useEffect(() => {
		const findCrowdfund = async () => {
			const profile = await profileService.findProfile(user?.uid!);
			const myCrowdfund = await communityService.findMyCrowdfund(profile.username);
			setMyCrowdfund(myCrowdfund);
		};
		findCrowdfund();
	}, [firestoreCollection]);

	const toggleDialog = () => setDialogOpen((open) => !open);
	const toggleCreationDialog = () => setCreationDialogOpen((open) => !open);
	const toggleConfirmCloseDialog = () => setCrowdfundCloseConfirmationOpen((open) => !open);

	const convertDate = (timestamp: FirestoreTimestampObject) => {
		return new Date(timestamp.seconds * 1000).toLocaleDateString();
	};

	const findSelectedCrowdfund = (crowdfundId: string) => {
		const crowdfund = firestoreCollection.find((fund) => fund.id === crowdfundId);
		if (crowdfund) {
			setSelectedCrowdfund(() => {
				const currency =
					crowdfund.contributors.length === 0
						? 0
						: crowdfund.contributors
								.map((cont) => cont.amount)
								.reduce((prev, cur) => prev + cur, 0);
				const percentage = Math.round((currency / crowdfund.targetAmount) * 100);
				setSelectedCrowdfundCumulativeAmount({ currency, percentage });
				return crowdfund;
			});
			toggleDialog();
		}
	};

	const closeCrowdfund = async (crowdfundId: string) => {
		await communityService.closeCrowdfund(crowdfundId);
		toggleConfirmCloseDialog()
	};

	return {
		firestoreCollection,
		myCrowdfund,
		selectedCrowdfund,
		dialogOpen,
		creationDialogOpen,
		selectedCrowdfundCumulativeAmount,
		crowdfundCloseConfirmationOpen,
		toggleCreationDialog,
		convertDate,
		toggleConfirmCloseDialog,
		findSelectedCrowdfund,
		toggleDialog,
		closeCrowdfund,
	};
};

export default useCrowdfundRetrieval;

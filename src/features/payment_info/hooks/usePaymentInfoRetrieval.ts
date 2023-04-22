import { useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import useRealtimeUpdate from "../../../hooks/useRealtimeUpdate";
import { PersonalAccount } from "../paymentInfo.schema";
import paymentInfoService from "../paymentInfo.service";
import { where } from "firebase/firestore";

const usePaymentInfoRetrieval = () => {
	const { user } = useContext(AuthContext);
	const [paymentDetailsDialogOpen, setPaymentDetailsDialogOpen] = useState(false);
	const [selectedPersonalAccountId, setSelectedPersonalAccountId] = useState<string>("");
	const [confirmAccountCloseDialogOpen, setConfirmAccountCloseDialogOpen] = useState(false);
	const [pendingDeleteAccountId, setPendingDeleteAccountId] = useState<string>("");
	const [cannotRemoveErrorDialogOpen, setCannotRemoveErrorDialogOpen] = useState(false);
	const [addPaymentInfoDialogOpen, setAddPaymentDialogOpen] = useState(false);
	const { firestoreCollection } = useRealtimeUpdate<PersonalAccount>(
		{ data: { collection: "PaymentInfo" } },
		where("userUid", "==", user?.uid!),
		where("isActive", "==", true)
	);
	const [infoInfoBarOpen, setInfoInfoBarOpen] = useState(false);

	const togglePaymentDetailsDialog = () => setPaymentDetailsDialogOpen((open) => !open);
	const toggleConfirmCloseDialog = () => setConfirmAccountCloseDialogOpen((open) => !open);
	const toggleCannotRemoveDialog = () => setCannotRemoveErrorDialogOpen((open) => !open);
	const toggleAddPaymentDialog = () => setAddPaymentDialogOpen((open) => !open);

	const getPaymentDetails = (accountId: string) => {
		setSelectedPersonalAccountId(accountId);
		togglePaymentDetailsDialog();
	};

	const removePaymentInfo = async () => {
		if (pendingDeleteAccountId !== "") {
			await paymentInfoService.deactivatePaymentAccount(pendingDeleteAccountId);
			toggleConfirmCloseDialog();
			setInfoInfoBarOpen(true);
		}
	};

	return {
		paymentDetailsDialogOpen,
		selectedPersonalAccountId,
		confirmAccountCloseDialogOpen,
		pendingDeleteAccountId,
		cannotRemoveErrorDialogOpen,
		addPaymentInfoDialogOpen,
		firestoreCollection,
		infoInfoBarOpen,
		setInfoInfoBarOpen,
		toggleAddPaymentDialog,
		setPendingDeleteAccountId,
		toggleCannotRemoveDialog,
		toggleConfirmCloseDialog,
		togglePaymentDetailsDialog,
		getPaymentDetails,
		removePaymentInfo,
	};
};

export default usePaymentInfoRetrieval;

import { Button, Stack, Typography } from "@mui/material";
import { MultiStep } from "../../../context/MultiStepContext";
import {
	GroupAccount,
	GroupAccountSchemaDefaults,
	PersonalAccount,
} from "../../payment_info/paymentInfo.schema";
import createGroupImage from "../../../assets/create_group.png";
import { Group, GroupSchemaDefaults } from "../group.schema";
import GroupCreationDialog from "./GroupCreationDialog";
import GroupDetailsSetup from "./group_creation/GroupDetailsSetup";
import { useEffect, useState } from "react";
import GroupAccountSetup from "./group_creation/GroupAccountSetup";
import paymentInfoService from "../../payment_info/paymentInfo.service";

export type GroupCreation = {
	group: Group;
	groupAccount: GroupAccount;
};

const CreateGroupBanner = () => {
	const [groupCreationDialogOpen, setGroupCreationDialogOpen] = useState(false);
	const [personalAccounts, setPersonalAccounts] = useState<PersonalAccount[]>([]);
	const [selectedAccount, setSelectedAccount] = useState<PersonalAccount>();

	useEffect(() => {
		const getPersonalAccounts = async () => {
			const foundAccounts = await paymentInfoService.getPersonalAccounts();
			setPersonalAccounts(foundAccounts);
		};
		getPersonalAccounts();
	}, []);

	const toggleGroupCreationDialog = () => setGroupCreationDialogOpen((open) => !open);

	return (
		<Stack sx={{ mt: 2 }} alignItems='center' spacing={1}>
			<img src={createGroupImage} style={{ width: "40%", height: "auto" }} alt='' />
			<Typography variant='regularSubHeading'>You're not part of a group yet</Typography>
			<Button variant='contained' onClick={toggleGroupCreationDialog}>
				Create Group
			</Button>

			<MultiStep
				defaultValues={GroupSchemaDefaults.parse({})}
				steps={[
					<GroupDetailsSetup key={1} />,
					<GroupAccountSetup
						personalAccounts={personalAccounts}
						selectedAccount={selectedAccount}
						setSelectedAccount={setSelectedAccount}
						key={2}
					/>,
				]}
			>
				<GroupCreationDialog
					selectedAccount={selectedAccount!}
					open={groupCreationDialogOpen}
					toggleModal={toggleGroupCreationDialog}
				/>
			</MultiStep>
		</Stack>
	);
};

export default CreateGroupBanner;

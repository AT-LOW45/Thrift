import { Button, Stack, Typography } from "@mui/material";
import { MultiStep } from "../../../context/MultiStepContext";
import { GroupAccountSchemaDefaults } from "../../payment_info/paymentInfo.schema";
import createGroupImage from "../../../assets/create_group.png"
import { GroupSchemaDefaults } from "../group.schema";
import GroupCreationDialog from "./GroupCreationDialog";

const CreateGroupBanner = () => {
	return (
		<Stack sx={{ mt: 2 }} alignItems='center' spacing={1}>
			<img src={createGroupImage} style={{ width: "40%", height: "auto" }} alt='' />
			<Typography variant='regularSubHeading'>You're not part of a group yet</Typography>
			<Button variant='contained'>Create Group</Button>

			<MultiStep
				defaultValues={{
					group: GroupSchemaDefaults.parse({}),
					groupAccount: GroupAccountSchemaDefaults.parse({}),
				}}
                steps={[]}
			>
                <GroupCreationDialog />
            </MultiStep>
		</Stack>
	);
};

export default CreateGroupBanner;

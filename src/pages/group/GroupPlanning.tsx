import { Box, Stack, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import CreateGroupBanner from "../../features/group_planning/components/CreateGroupBanner";
import GroupDetails from "../../features/group_planning/components/GroupDetails";
import { Group, GroupSchemaDefaults } from "../../features/group_planning/group.schema";
import groupService from "../../features/group_planning/group.service";
import profileService from "../../features/profile/profile.service";

const GroupPlanning = () => {
	const { user } = useContext(AuthContext);
	const [hasGroup, setHasGroup] = useState(false);
	const [isOwner, setIsOwner] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [group, setGroup] = useState<Group>(GroupSchemaDefaults.parse({}));

	useEffect(() => {
		const findCurrentUser = async () => {
			setIsLoading(true);
			const userProfile = await profileService.findProfile(user?.uid!);
			const groupId = userProfile.group;
			setHasGroup(groupId === "" ? false : true);

			if (groupId !== "") {
				const foundGroup = await groupService.find(groupId);

				setIsOwner(foundGroup.owner === user?.uid ? true : false);
				setGroup(foundGroup);
			}
			setIsLoading(false);
		};
		findCurrentUser();
	}, []);

	const getPageContent = () =>
		!hasGroup ? <CreateGroupBanner /> : <GroupDetails isOwner={isOwner} group={group} />;

	return (
		<Box sx={{ pt: 2, px: 3 }}>
			<Stack>
				<Typography variant='regularHeading'>Group Planning</Typography>
				{!isLoading && getPageContent()}
			</Stack>
		</Box>
	);
};

export default GroupPlanning;

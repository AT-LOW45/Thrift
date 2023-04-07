import AddIcon from "@mui/icons-material/Add";
import { Box, Fab, Tab, Tabs, Tooltip } from "@mui/material";
import React, { useState } from "react";
import { TabPanel } from "../components";
import CrowdfundCampaign from "../features/community/components/CrowdfundCampaign";
import Feed from "../features/community/components/Feed";
import PostCreationDialog from "../features/community/components/PostCreationDialog";

const Community = () => {
	const [currentTab, setCurrentTab] = useState(0);
	const [postCreationDialogOpen, setPostCreationDialogOpen] = useState(false);

	const toggleModal = () => setPostCreationDialogOpen((open) => !open);

	const changeTab = (event: React.SyntheticEvent, newValue: number) => setCurrentTab(newValue);

	return (
		<Box sx={{ pt: 2, px: 3 }}>
			<Tabs value={currentTab} onChange={changeTab} centered>
				<Tab label='Feed' />
				<Tab label='Crowdfund' />
			</Tabs>
			<TabPanel value={currentTab} index={0}>
				<Feed />
				<Tooltip title='add post' sx={{ position: "fixed", bottom: 50, right: 70 }} placement="top">
					<Fab color='primary' aria-label='add' onClick={toggleModal}>
						<AddIcon />
					</Fab>
				</Tooltip>
			</TabPanel>
			<TabPanel value={currentTab} index={1}>
				<CrowdfundCampaign />
			</TabPanel>
			<PostCreationDialog open={postCreationDialogOpen} toggleModal={toggleModal} />
		</Box>
	);
};

export default Community;

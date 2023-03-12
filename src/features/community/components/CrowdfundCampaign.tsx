import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import {
	Avatar,
	AvatarGroup,
	Box,
	Button,
	Divider,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Stack,
	Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { Fragment, useContext, useState, useEffect } from "react";
import { Tray } from "../../../components";
import { AuthContext } from "../../../context/AuthContext";
import useRealtimeUpdate from "../../../hooks/useRealtimeUpdate";
import { FirestoreTimestampObject } from "../../../service/thrift";
import profileService from "../../profile/profile.service";
import { CrowdfundSchemaDefaults, CrowdFund } from "../community.schema";
import communityService from "../community.service";
import CrowdfundCreationDialog from "./CrowdfundCreationDialog";
import CrowdfundDetailsDialog from "./CrowdfundDetailsDialog";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

const CrowdfundCampaign = () => {
	const { firestoreCollection } = useRealtimeUpdate<CrowdFund>({
		data: { collection: "Crowdfund" },
	});
	const { user } = useContext(AuthContext);
	const [myCrowdfund, setMyCrowdfund] = useState<CrowdFund | null>(null);
	const [selectedCrowdfund, setSelectedCrowdfund] = useState<CrowdFund>(
		CrowdfundSchemaDefaults.parse({})
	);

	useEffect(() => {
		const findCrowdfund = async () => {
			const profile = await profileService.findProfile(user?.uid!);
			const myCrowdfund = await communityService.findMyCrowdfund(profile.username);
			setMyCrowdfund(myCrowdfund);
		};
		findCrowdfund();
	}, []);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [creationDialogOpen, setCreationDialogOpen] = useState(false);

	const toggleDialog = () => setDialogOpen((open) => !open);
	const toggleCreationDialog = () => setCreationDialogOpen((open) => !open);

	const convertDate = (timestamp: FirestoreTimestampObject) => {
		return new Date(timestamp.seconds * 1000).toLocaleDateString();
	};

	const findSelectedCrowdfund = (crowdfundId: string) => {
		const crowdfund = firestoreCollection.find((fund) => fund.id === crowdfundId);
		if (crowdfund) {
			setSelectedCrowdfund(crowdfund);
			toggleDialog();
		}
	};

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
							<Button color='tertiary' endIcon={<AssignmentTurnedInIcon />}>
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
				<Typography variant='regularSubHeading'>Available Crowdfunds</Typography>
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
												<Typography variant='regularSubHeading'>
													{crowdfund.name}
												</Typography>
												<Box
													display='grid'
													sx={{
														placeContent: "center",
														backgroundColor: "green",
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
			/>
			<CrowdfundCreationDialog open={creationDialogOpen} toggleModal={toggleCreationDialog} />
		</Fragment>
	);
};

export default CrowdfundCampaign;

import DoorBackIcon from "@mui/icons-material/DoorBack";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {
	Alert,
	AlertTitle,
	Avatar,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Paper,
	Portal,
	Stack,
	Table,
	TableBody,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	styled,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tray } from "../../../components";
import { Group } from "../group.schema";
import groupService from "../group.service";
import useGroupDetailRetrieval from "../hooks/useGroupDetailRetrieval";
import AddMemberDialog from "./AddMemberDialog";
import ContributionDialog from "./ContributionDialog";
import PendingTransactionDialog from "./PendingTransactionDialog";
import RemoveMemberDialog from "./RemoveMemberDialog";

type GroupDetailsProps = { isOwner: boolean; group: Group };

const GroupDetails = ({ isOwner, group }: GroupDetailsProps) => {
	const {
		StyledTableCell,
		StyledTableRow,
		groupTransactions,
		members,
		owner,
		groupAccount,
		pendingTransactions,
	} = useGroupDetailRetrieval(group);
	const [pendingTransactionsDialogOpen, setPendingTransactionsDialogOpen] = useState(false);
	const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
	const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
	const [exitGroupDialogOpen, setExitGroupDialogOpen] = useState(false);
	const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);

	const navigate = useNavigate();

	const togglePendingTransactionsDialog = () => setPendingTransactionsDialogOpen((open) => !open);
	const toggleAddMemberDialog = () => setAddMemberDialogOpen((open) => !open);
	const toggleContributionDialog = () => setContributionDialogOpen((open) => !open);
	const toggleExitGroupDialog = () => setExitGroupDialogOpen((open) => !open);
	const getStatusText = (status: boolean) => (status ? "approved" : "pending");
	const toggleRemoveMemberDialog = () => setRemoveMemberDialogOpen((open) => !open);

	const exitGroup = async () => {
		await groupService.leaveGroup();
		navigate("/group-planning");
	};

	const AvatarContainer = styled(Stack)(() => ({
		overflow: "auto",
		flexWrap: "wrap",
		marginTop: "10px",
		padding: "10px 10px",
		"&::-webkit-scrollbar": {
			width: "0.3rem",
		},
		"&::-webkit-scrollbar-thumb": {
			background: "#1A46C4",
		},
		backgroundColor: "rgba(0, 0, 0, 0.05)",
		borderRadius: "10px",
	}));

	return (
		<Stack spacing={4} mt={3} mx={5}>
			{isOwner && pendingTransactions.pendingTransactions.length !== 0 && (
				<Alert
					action={
						<Button
							variant='outlined'
							sx={{ mr: 2 }}
							color='warning'
							onClick={togglePendingTransactionsDialog}
						>
							Check
						</Button>
					}
					severity='warning'
					sx={{ boxShadow: "0 4px 10px 3px lightgray" }}
				>
					<AlertTitle>Pending Transactions</AlertTitle>
					{pendingTransactions.pendingTransactions.length} pending transaction(s) made by{" "}
					{pendingTransactions.memberCount} member(s)
				</Alert>
			)}

			<Stack direction='row' alignItems='center' spacing={5}>
				<Stack>
					<Typography variant='regularSubHeading'>{group.name}</Typography>
					<Stack
						direction='row'
						spacing={1}
						py={1}
						alignItems='center'
						justifyContent='center'
					>
						<Typography>Created by:</Typography>
						<Avatar sx={{ bgcolor: "#0083DE" }}>
							{owner.username.charAt(0).toUpperCase()}
						</Avatar>
						<Typography>{owner.username}</Typography>
					</Stack>
				</Stack>
				<Button
					variant='contained'
					sx={{ alignSelf: "flex-start" }}
					onClick={toggleContributionDialog}
				>
					Contribute
				</Button>
			</Stack>

			<Typography fontSize='1.2rem' fontWeight={500}>
				You are authorised to spend
				<Typography component='span' px={1} variant='numberHeading'>
					RM {group.spendingLimit}
				</Typography>
				in a month,
				<Typography component='span' px={1} variant='numberHeading'>
					RM {group.transactionLimit}
				</Typography>
				per transaction
			</Typography>

			<Grid2 container sx={{ placeContent: "center" }}>
				<Tray colSpan={{ xs: 12, md: 6 }} title={groupAccount.name}>
					<Box>
						<Stack width='100%' mt={2}>
							<Typography textAlign='center'>Balance</Typography>
							<Typography variant='numberHeading' textAlign='center'>
								RM {groupAccount.balance}
							</Typography>
						</Stack>
						<Typography textAlign='start' pt={2}>
							Maintained by
						</Typography>
						<AvatarContainer maxHeight='200px' direction='row'>
							{[...groupAccount.maintainers].length === 0 ? (
								<Typography
									component='p'
									sx={{ py: 1, px: 2 }}
									variant='regularLight'
									textAlign='center'
								>
									Wow, such empty
								</Typography>
							) : (
								[...groupAccount.maintainers].map((maintainer) => (
									<Stack
										key={maintainer}
										direction='row'
										flexBasis='50%'
										spacing={1}
										py={1}
										alignItems='center'
										justifyContent='center'
									>
										<Avatar sx={{ bgcolor: "#0083DE" }}>
											{maintainer.charAt(0).toUpperCase()}
										</Avatar>
										<Typography>{maintainer}</Typography>
									</Stack>
								))
							)}
						</AvatarContainer>
					</Box>
				</Tray>
			</Grid2>

			<Stack spacing={2}>
				<Stack spacing={3} direction='row' mt={3}>
					<Typography variant='regularSubHeading'>Members</Typography>
					{isOwner && (
						<Fragment>
							<Button variant='contained' onClick={toggleAddMemberDialog}>
								Add Member
							</Button>
							<Button variant='outlined' onClick={toggleRemoveMemberDialog}>
								Remove member
							</Button>
						</Fragment>
					)}
				</Stack>
				<AvatarContainer maxHeight='400px' direction='row'>
					{members.length === 0 ? (
						<Typography
							component='p'
							sx={{ py: 1, px: 2 }}
							variant='regularLight'
							textAlign='center'
						>
							Wow, such empty
						</Typography>
					) : (
						members.map((member) => (
							<Stack
								key={member.id}
								direction='row'
								flexBasis='25%'
								spacing={1}
								py={1}
								alignItems='center'
								justifyContent='center'
							>
								<Avatar sx={{ bgcolor: "#0083DE" }}>
									{member.username.charAt(0).toUpperCase()}
								</Avatar>
								<Typography>{member.username}</Typography>
							</Stack>
						))
					)}
				</AvatarContainer>
			</Stack>

			<Stack spacing={2} pb={10}>
				<Stack direction='row' spacing={3} mt={3} alignItems='center'>
					<Typography variant='regularSubHeading'>Last Accessed</Typography>
					<Button
						endIcon={<KeyboardArrowRightIcon />}
						onClick={() => navigate("/transactions")}
					>
						Go to Records
					</Button>
				</Stack>
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 700 }} aria-label='customized table'>
						<TableHead>
							<TableRow>
								<StyledTableCell>Amount (RM)</StyledTableCell>
								<StyledTableCell>Member</StyledTableCell>
								<StyledTableCell>Date</StyledTableCell>
								<StyledTableCell>Status</StyledTableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{groupTransactions.length === 0 ? (
								<StyledTableRow>
									<StyledTableCell colSpan={4}>
										<Typography
											component='p'
											sx={{ py: 1, px: 2 }}
											variant='regularLight'
											textAlign='center'
										>
											Wow, such empty
										</Typography>
									</StyledTableCell>
								</StyledTableRow>
							) : (
								groupTransactions.map((transac) => (
									<StyledTableRow key={transac.id}>
										<StyledTableCell>{transac.amount}</StyledTableCell>
										<StyledTableCell size='medium'>
											{transac.madeBy}
										</StyledTableCell>
										<StyledTableCell>
											{(transac.transactionDate as Date).toLocaleDateString()}
										</StyledTableCell>

										<StyledTableCell>
											{"status" in transac
												? getStatusText(transac.status)
												: "approved"}
										</StyledTableCell>
									</StyledTableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
				{!isOwner && (
					<Box sx={{ py: 2, display: "flex" }}>
						<Button
							color='error'
							variant='contained'
							onClick={toggleExitGroupDialog}
							endIcon={<DoorBackIcon />}
							sx={{ width: "fit-content", margin: "auto" }}
						>
							Leave Group
						</Button>
					</Box>
				)}
			</Stack>
			{isOwner && pendingTransactions.pendingTransactions.length !== 0 && (
				<PendingTransactionDialog
					open={pendingTransactionsDialogOpen}
					toggleModal={togglePendingTransactionsDialog}
					pendingTransactions={pendingTransactions.pendingTransactions}
				/>
			)}

			<ContributionDialog
				open={contributionDialogOpen}
				toggleModal={toggleContributionDialog}
				group={group}
			/>
			{!isOwner ? (
				<Portal>
					<Dialog
						open={exitGroupDialogOpen}
						onClose={toggleExitGroupDialog}
						aria-labelledby='alert-dialog-title'
						aria-describedby='alert-dialog-description'
					>
						<DialogTitle>Leave this Group?</DialogTitle>
						<DialogContent>
							<DialogContentText>
								You will not be able to view any group records after exiting the
								group. You can rejoin the group if the group owner adds you as a
								member
							</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button onClick={toggleExitGroupDialog}>Disagree</Button>
							<Button onClick={exitGroup}>Agree</Button>
						</DialogActions>
					</Dialog>
				</Portal>
			) : (
				<Fragment>
					<AddMemberDialog
						open={addMemberDialogOpen}
						toggleModal={toggleAddMemberDialog}
						groupId={group.id!}
					/>
					<RemoveMemberDialog
						open={removeMemberDialogOpen}
						toggleModal={toggleRemoveMemberDialog}
						groupId={group.id!}
					/>
				</Fragment>
			)}
		</Stack>
	);
};

export default GroupDetails;

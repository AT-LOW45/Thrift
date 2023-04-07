import { Avatar, Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { Profile } from "../features/profile/profile.schema";
import useRealtimeUpdate from "../hooks/useRealtimeUpdate";
import { Editable } from "../context/EditableContext";
import ProfileFields from "../features/profile/ProfileFields";
import { Fragment } from "react";

const UserProfile = () => {
	const { profileId } = useParams();
	const { firestoreDoc, isLoading } = useRealtimeUpdate<Profile>({
		data: { collection: "UserProfile", id: profileId },
	});

	return (
		<Box sx={{ px: 2, py: 3 }}>
			{!isLoading && (
				<Fragment>
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							p: 5,
						}}
					>
						<Avatar sx={{ width: 200, height: 200, fontSize: "2rem" }}>
							{firestoreDoc.username.charAt(0).toUpperCase()}
						</Avatar>
					</Box>
					<Box sx={{ p: 2 }}>
						<Editable
							key={`${firestoreDoc.username}_${firestoreDoc.interest}`}
							initialValues={firestoreDoc}
						>
							<ProfileFields />
						</Editable>
					</Box>
				</Fragment>
			)}
		</Box>
	);
};

export default UserProfile;

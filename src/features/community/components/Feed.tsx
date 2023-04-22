import {
	Avatar,
	Box,
	Card,
	CardActionArea,
	CardContent,
	CardMedia,
	Divider,
	Stack,
	Typography,
} from "@mui/material";
import { useState } from "react";
import useRealtimeUpdate from "../../../hooks/useRealtimeUpdate";
import { FirestoreTimestampObject } from "../../../service/thrift";
import { Post, PostSchemaDefaults } from "../community.schema";
import PostDetailsDialog from "./PostDetailsDialog";
import { orderBy } from "firebase/firestore";

const Feed = () => {
	const { firestoreCollection } = useRealtimeUpdate<Post>(
		{ data: { collection: "Post" } },
		orderBy("datePosted", "desc")
	);
	const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
	const [post, setPost] = useState<Post>(PostSchemaDefaults.parse({}));

	const toggleDialog = () => setDetailsDialogOpen((open) => !open);

	const findPost = (postId: string | undefined) => {
		const targetPost = firestoreCollection.find((post) => post.id === postId);
		if (targetPost) {
			setPost(targetPost);
			toggleDialog();
		}
	};

	return (
		<Box display='flex'>
			<Stack direction='column' flexGrow={1} spacing={5}>
				{firestoreCollection.map((post) => (
					<Card sx={{ maxWidth: 600, maxHeight: 600 }} key={post.id}>
						<CardActionArea onClick={() => findPost(post.id)}>
							{post.mediaAttachment && (
								<CardMedia
									component='img'
									height='200'
									image={post.mediaAttachment}
									alt='green iguana'
								/>
							)}

							<CardContent sx={{ overflow: "hidden" }}>
								<Typography gutterBottom variant='h5' component='div'>
									{post.title}
								</Typography>
								<Divider />
								<Typography
									variant='body2'
									color='text.secondary'
									sx={{
										my: 2,
										display: "-webkit-box",
										textOverflow: "ellipsis",
										WebkitLineClamp: "3",
										WebkitBoxOrient: "vertical",
										overflow: "hidden",
										wordWrap: "break-word",
									}}
								>
									{post.body}
								</Typography>
								<Divider />
								<Typography mt={1}>Posted by: {post.postedBy}</Typography>
							</CardContent>
						</CardActionArea>
					</Card>
				))}
			</Stack>
			<Box flexGrow={1} sx={{ display: { xs: "none", lg: "flex" } }}>
				<Stack direction='column' spacing={2} sx={{ position: "sticky", top: 0, pr: 3 }}>
					<Typography textAlign='right' variant='regularSubHeading'>
						Recent Activities
					</Typography>
					{firestoreCollection.slice(0, 3).map((post) => (
						<Stack direction='row' spacing={2} key={post.id}>
							<Avatar>{post.postedBy.charAt(0).toUpperCase()}</Avatar>
							<Stack
								direction='column'
								sx={{
									maxWidth: 200,
								}}
							>
								<Typography
									sx={{
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										wordWrap: "break-word",
										overflow: "hidden",
									}}
								>
									{post.body}
								</Typography>
								<Typography>
									{new Date(
										(post.datePosted as FirestoreTimestampObject).seconds * 1000
									).toLocaleDateString()}
								</Typography>
							</Stack>
						</Stack>
					))}
				</Stack>
			</Box>
			<PostDetailsDialog open={detailsDialogOpen} toggleModal={toggleDialog} post={post} />
		</Box>
	);
};

export default Feed;

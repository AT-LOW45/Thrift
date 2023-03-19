import {
	Avatar,
	Box,
	Card,
	CardActionArea,
	CardContent,
	CardMedia,
	Divider,
	Stack,
	Typography
} from "@mui/material";
import { useState } from "react";
import useRealtimeUpdate from "../../../hooks/useRealtimeUpdate";
import { Post, PostSchemaDefaults } from "../community.schema";
import PostDetailsDialog from "./PostDetailsDialog";

const Feed = () => {
	const { firestoreCollection } = useRealtimeUpdate<Post>({ data: { collection: "Post" } });
	const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
	const [post, setPost] = useState<Post>(PostSchemaDefaults.parse({}));

	console.log(firestoreCollection)

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
				{firestoreCollection.map((post, index) => (
					<Card sx={{ maxWidth: 600, maxHeight: 600 }} key={index}>
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
				<Stack
					direction='column'
					spacing={2}
					sx={{ position: "sticky", top: 0, pr: 3 }}
					flexGrow={1}
				>
					<Typography textAlign='right' variant='regularSubHeading'>
						Recent Activities
					</Typography>
					<Stack direction='row' style={{ marginLeft: "auto" }} spacing={2}>
						<Avatar>N</Avatar>
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
								Lorem ipsum dolor sit amet consectetur, adipisicing elit. Vitae,
								ullam.
							</Typography>
							<Typography>xx/xx/xx</Typography>
						</Stack>
					</Stack>
				</Stack>
			</Box>
			<PostDetailsDialog open={detailsDialogOpen} toggleModal={toggleDialog} post={post} />
		</Box>
	);
};

export default Feed;

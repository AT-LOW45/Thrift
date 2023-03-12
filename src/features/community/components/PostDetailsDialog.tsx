import { Box, Dialog, DialogContent, DialogTitle, Portal, Stack, Typography } from "@mui/material";
import { Post } from "../community.schema";

type PostDetailsDialogProps = {
	open: boolean;
	toggleModal(): void;
	post: Post;
};

const PostDetailsDialog = ({ open, toggleModal, post }: PostDetailsDialogProps) => {

	return (
		<Portal>
			<Dialog open={open} onClose={toggleModal} fullWidth={true} maxWidth='md'>
				<DialogTitle>{post.title}</DialogTitle>
				<DialogContent dividers>
					<Stack direction='column' alignItems='center' spacing={3}>
						{post.mediaAttachment && (
							<img src={post.mediaAttachment} style={{ height: "auto", maxWidth: "50%" }} />
						)}
						<Box component='pre' sx={{ p: 3 }}>
							<Typography textAlign='justify'>{post.body}</Typography>
						</Box>
					</Stack>
				</DialogContent>
			</Dialog>
		</Portal>
	);
};

export default PostDetailsDialog;

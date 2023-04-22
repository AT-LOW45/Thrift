import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { ChangeEvent, useRef, useState } from "react";
import FormDialog, { FormDialogProps } from "../../../components/form/FormDialog";
import { Post, PostSchemaDefaults } from "../community.schema";
import communityService from "../community.service";
import { ZodError } from "zod";

type PostCreationDialogProps = Pick<FormDialogProps, "toggleModal" | "open">;

const PostCreationDialog = ({ open, toggleModal }: PostCreationDialogProps) => {
	const [image, setSelectedImage] = useState<string>();
	const [selectedFile, setSelectedFile] = useState<File>();
	const [post, setPost] = useState<Post>(PostSchemaDefaults.parse({}));
	const [isValid, setIsValid] = useState(false);
	const [errorMessages, setErrorMessages] =
		useState<ZodError<Post>["formErrors"]["fieldErrors"]>();

	const fileSelectRef = useRef<HTMLInputElement>(null);

	const changeAttachment = (event: ChangeEvent<HTMLInputElement>) => {
		const [file] = event.target.files!;
		setSelectedFile(file);
		setSelectedImage(URL.createObjectURL(file));
	};

	const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setPost((post) => {
			const updated = { ...post, [event.target.name]: event.target.value };
			const result = communityService.validatePost(updated);

			if (result === true) {
				setErrorMessages(undefined);
				setIsValid(true);
			} else {
				setErrorMessages(result);
				setIsValid(false);
			}
			return updated;
		});
	};

	const addPost = async () => {
		console.log("added");
		const result = await communityService.addPost(post, selectedFile);
		if (typeof result === "string") {
			toggleModal();
			setPost(PostSchemaDefaults.parse({}));
		}
	};

	return (
		<FormDialog
			open={open}
			toggleModal={toggleModal}
			actions={[
				<Button
					key={2}
					onClick={() => {
						toggleModal();
						setPost(PostSchemaDefaults.parse({}));
					}}
				>
					Cancel
				</Button>,
				<Button key={1} onClick={addPost} disabled={!isValid}>
					Add Post
				</Button>,
			]}
			title='Post Creation'
		>
			<Stack direction='column' spacing={3}>
				<TextField
					sx={{ maxWidth: "50%" }}
					autoFocus
					value={post.title}
					label='Title'
					name='title'
					onChange={handleInputChange}
					helperText={errorMessages?.title ? errorMessages?.title : ""}
					variant='standard'
					required
					color='primary'
				/>
				<TextField
					multiline
					rows={5}
					value={post.body}
					onChange={handleInputChange}
					sx={{ maxWidth: "70%" }}
					label="What's on your mind?"
					name='body'
					helperText={errorMessages?.body ? errorMessages?.body : ""}
				/>

				<Stack direction='row' spacing={2}>
					<label
						htmlFor='mediaAttachment'
						style={{
							width: "fit-content",
							borderRadius: "10px",
							padding: "5px 10px",
							color: "white",
							backgroundColor: "#1A46C4",
							cursor: "pointer",
						}}
					>
						Add Image
					</label>
					<Button variant='contained' onClick={() => setSelectedImage(undefined)}>
						Remove Image
					</Button>
				</Stack>
				<TextField
					onChange={changeAttachment}
					ref={fileSelectRef}
					type='file'
					inputProps={{ accept: ".png, .jpeg, .jpg, .svg" }}
					sx={{ display: "none" }}
					id='mediaAttachment'
					name='mediaAttachment'
				/>
				<Box
					sx={
						image
							? {
									display: "flex",
									border: "3px dashed black",
									width: "fit-content",
									alignSelf: "center",
							  }
							: {
									display: "flex",
									border: "3px dashed black",
									width: "50%",
									height: "300px",
									alignSelf: "center",
							  }
					}
				>
					{!image && (
						<Typography
							component='p'
							sx={{
								display: "flex",
								flexDirection: "column",
								margin: "auto",
								alignItems: "center",
								fontSize: "1.2rem",
							}}
							variant='regularLight'
						>
							Image Preview
							<InsertPhotoIcon sx={{ fontSize: "3rem" }} />
						</Typography>
					)}
					{image && (
						<img
							src={image}
							style={{
								maxWidth: "100%",
								maxHeight: "400px",
							}}
						/>
					)}
				</Box>
			</Stack>
		</FormDialog>
	);
};

export default PostCreationDialog;

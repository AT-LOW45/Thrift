import { Visibility, VisibilityOff } from "@mui/icons-material";
import {ZodError} from "zod"
import {
	FormControl,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useMultiStep } from "../../context/MultiStepContext";
import { marketAuxIndustries } from "../../service/marketaux";
import { Registration, validateProfileFields } from "./Register";

const ProfileConfiguration = () => {
	const { formData, updateContext } = useMultiStep<Registration>();
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<ZodError<Registration>["formErrors"]["fieldErrors"]>();

	const togglePasswordView = () => setShowPassword((show) => !show);

	const handleInputChange = (
		event:
			| React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
			| React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
			| SelectChangeEvent
	) => {
		updateContext(event, (data) => [
			(() => {
				const result = validateProfileFields(data);
				if (result === true) {
					setErrors(undefined);
					return result;
				} else {
					setErrors(result);
					return false;
				}
			})(),
			data.confirmPassword === data.password,
		]);
	};

	return (
		<Stack
			direction='column'
			justifyContent='center'
			alignItems='center'
			sx={{ px: 10, py: 5 }}
			spacing={errors ? 3 : 5}
		>
			<Typography variant='regularSubHeading' textAlign='center'>
				Hi there 👋! Thank you for choosing Thrift - Money Management System to manage your
				daily spending. Let's start by creating your user profile
			</Typography>
			<Stack spacing={2} direction='column' sx={{ pt: 5 }} width='100%' alignItems='center'>
				<TextField
					onFocus={handleInputChange}
					autoFocus
					value={formData.email}
					variant='standard'
					label='Email'
					name='email'
					onChange={handleInputChange}
					type='email'
					helperText={errors?.email ? errors.email : ""}
					color={errors?.email ? "error" : "primary"}
					sx={{ width: "50%" }}
				/>
				<TextField
					value={formData.username}
					variant='standard'
					name='username'
					label='Username'
					helperText={errors?.username ? errors.username : ""}
					sx={{ width: "50%" }}
					onChange={handleInputChange}
				/>
				<TextField
					value={formData.password}
					name='password'
					onChange={handleInputChange}
					variant='standard'
					sx={{ width: "50%" }}
					label='Password'
					helperText={errors?.password ? errors.password : ""}
					type={showPassword ? "text" : "password"}
					InputProps={{
						endAdornment: (
							<InputAdornment position='end'>
								<IconButton
									aria-label='toggle password visibility'
									onMouseDown={togglePasswordView}
								>
									{showPassword ? <Visibility /> : <VisibilityOff />}
								</IconButton>
							</InputAdornment>
						),
					}}
				/>
				<TextField
					value={formData.confirmPassword}
					name='confirmPassword'
					helperText={errors?.confirmPassword ? errors.confirmPassword : ""}
					onChange={handleInputChange}
					sx={{ width: "50%" }}
					variant='standard'
					label='Confirm Password'
					type={showPassword ? "text" : "password"}
					fullWidth
				/>
				<FormControl fullWidth variant='standard' sx={{ width: "50%" }}>
					<InputLabel>Interest</InputLabel>
					<Select
						value={formData.interest}
						name='interest'
						label='Interest'
						onChange={handleInputChange}
					>
						{marketAuxIndustries.map((val) => (
							<MenuItem key={val} value={val}>
								{val}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Stack>
		</Stack>
	);
};

export default ProfileConfiguration;

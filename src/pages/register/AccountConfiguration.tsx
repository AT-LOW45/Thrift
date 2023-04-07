import AddIcon from "@mui/icons-material/Add";
import {
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	Stack,
	TextField,
	Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { ZodError } from "zod";
import { useMultiStep } from "../../context/MultiStepContext";
import {
	PersonalAccount,
	PersonalAccountSchemaDefaults,
	accountTypes,
} from "../../features/payment_info/paymentInfo.schema";
import useInputGroup from "../../hooks/useInputGroup";
import { Registration, validateRegistrationFields } from "./Register";

const AccountConfiguration = () => {
	const { formData, updateContext } = useMultiStep<Registration>();
	const { addGroup, removeGroup, group, handleGroupUpdate, hasSingleGroup } =
		useInputGroup<PersonalAccount>(
			5,
			PersonalAccountSchemaDefaults.parse({}),
			formData.paymentInfo
		);
	const [errors, setErrors] =
		useState<ZodError<PersonalAccount[]>["formErrors"]["fieldErrors"]>();

	useEffect(() => {
		updateContext({ key: "paymentInfo", value: group }, (data) => [
			(() => {
				const result = validateRegistrationFields(data);
				if (result === true) {
					setErrors(undefined);
					return true;
				} else {
					setErrors(result);
					return false;
				}
			})(),
		]);
	}, [group.length]);

	const handleGroupChange = (
		index: number,
		event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | SelectChangeEvent
	) => {
		const targetValue =
			event.target.name === "balance" ? parseInt(event.target.value) : event.target.value;
		handleGroupUpdate(index, event.target.name, targetValue, (result) => {
			updateContext({ key: "paymentInfo", value: result }, (data) => [
				(() => {
					const result = validateRegistrationFields(data);
					if (result === true) {
						setErrors(undefined);
						return true;
					} else {
						setErrors(result);
						return false;
					}
				})(),
			]);
		});
	};

	return (
		<Stack direction='column' sx={{ py: 5, px: 10 }}>
			<Typography textAlign='center' variant='regularSubHeading'>
				You're almost there! Let's configure your payment info
			</Typography>

			<Stack direction='column' sx={{ my: 5, mx: { sm: 0, lg: 20 } }} spacing={3}>
				{group.map((personalAcc, index) => (
					<Stack spacing={2} key={personalAcc.id}>
						<Stack spacing={1}>
							<Stack direction='row' spacing={2} key={personalAcc.id}>
								<TextField
									label='Account Name'
									name='name'
									onChange={(e) => handleGroupChange(index, e)}
									variant='standard'
									value={personalAcc.name}
									sx={{ flexBasis: "30%" }}
								/>
								<TextField
									variant='standard'
									label='Initial Balance'
									name='balance'
									type='number'
									onChange={(e) => handleGroupChange(index, e)}
									value={isNaN(personalAcc.balance) ? "" : personalAcc.balance}
									sx={{ flexBasis: "30%" }}
								/>
								<FormControl fullWidth variant='standard' sx={{ flexBasis: "40%" }}>
									<InputLabel>Account Type</InputLabel>
									<Select
										value={personalAcc.type}
										name='type'
										label='Account Type'
										autoFocus
										onChange={(e) => handleGroupChange(index, e)}
									>
										{accountTypes.map((val) => (
											<MenuItem key={val} value={val}>
												{val}
											</MenuItem>
										))}
									</Select>
								</FormControl>
								<Button
									disabled={hasSingleGroup}
									onClick={() => removeGroup(index)}
								>
									Remove
								</Button>
							</Stack>
							<Stack component='ul'>
								{errors &&
									errors[index] &&
									errors[index]!.map((error, index) => (
										<Typography
											variant='regularLight'
											component='li'
											key={index}
										>
											{error}
										</Typography>
									))}
							</Stack>
						</Stack>
					</Stack>
				))}
			</Stack>
			<Button
				variant='contained'
				sx={{ alignSelf: "center" }}
				onClick={addGroup}
				disabled={group.length === 5 ? true : false}
				endIcon={<AddIcon />}
			>
				Add Payment Info
			</Button>
		</Stack>
	);
};

export default AccountConfiguration;

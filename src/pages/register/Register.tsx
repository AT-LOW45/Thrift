import { Box, Button, Stack } from "@mui/material";
import { Fragment, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { z as zod } from "zod";
import { AuthContext } from "../../context/AuthContext";
import { useMultiStepContainer } from "../../context/MultiStepContext";
import {
	PersonalAccountSchema,
	PersonalAccountSchemaDefaults,
} from "../../features/payment_info/paymentInfo.schema";
import { MarketAuxIndustriesSchema } from "../../service/marketaux";

export const RegisterSchema = zod.object({
	email: zod.string().email(),
	username: zod.string().min(5).max(20),
	password: zod.string().min(8),
	confirmPassword: zod.string().min(8),
	interest: MarketAuxIndustriesSchema,
	paymentInfo: zod.array(PersonalAccountSchema),
});

export const RegisterSchemaDefaults = zod.object({
	email: zod.string().default(""),
	username: zod.string().default(""),
	password: zod.string().default(""),
	confirmPassword: zod.string().default(""),
	interest: MarketAuxIndustriesSchema.default("Financial Services"),
	paymentInfo: zod.array(PersonalAccountSchemaDefaults).default([{}]),
});

export type Registration = zod.infer<typeof RegisterSchema>;

export const validateRegistrationFields = (registerInfo: Registration) => {
	const result = RegisterSchema.shape.paymentInfo.safeParse(registerInfo.paymentInfo);
	return result.success;
};

export const validateProfileFields = (profileInfo: Registration) => {
	const result = RegisterSchema.omit({ paymentInfo: true }).safeParse(profileInfo);
	return result.success;
};

const Register = () => {
	const { currentStep, isFirstStep, isLastStep, next, back, isValid, formData } =
		useMultiStepContainer();
	const navigate = useNavigate();
	const { signUpWithEmailAndPassword } = useContext(AuthContext);

	const signUp = () => {
		signUpWithEmailAndPassword(formData)
			.then((res) => navigate("/overview"))
			.catch(() => console.log("something went wrong"));
	};

	return (
		<Stack flexGrow={1}>
			<Box flexBasis='90%'>{currentStep}</Box>
			<Stack flexBasis='10%' justifyContent='space-evenly' direction='row'>
				<Fragment key={1}>
					{isFirstStep && <Button onClick={() => navigate("/")}>Back to Login</Button>}
				</Fragment>
				<Fragment key={2}>{!isFirstStep && <Button onClick={back}>Back</Button>}</Fragment>
				<Fragment key={3}>
					{!isLastStep && (
						<Button onClick={next} disabled={isValid}>
							Next
						</Button>
					)}
				</Fragment>
				<Fragment key={4}>
					{isLastStep && (
						<Button onClick={signUp} disabled={isValid}>
							Finish
						</Button>
					)}
				</Fragment>
			</Stack>
		</Stack>
	);
};

export default Register;

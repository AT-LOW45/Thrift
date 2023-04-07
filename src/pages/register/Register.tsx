import { Box, Button, Stack } from "@mui/material";
import { Fragment, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ZodError, z as zod } from "zod";
import { AuthContext } from "../../context/AuthContext";
import { useMultiStepContainer } from "../../context/MultiStepContext";
import {
	PersonalAccount,
	PersonalAccountSchema,
	PersonalAccountSchemaDefaults,
} from "../../features/payment_info/paymentInfo.schema";
import { MarketAuxIndustriesSchema } from "../../service/marketaux";

export const RegisterSchema = zod.object({
	email: zod.string().email({ message: "Incorrect email format" }),
	username: zod
		.string()
		.min(5, { message: "Your username must have at least 5 characters" })
		.max(20, { message: "Your username cannot exceed 20 characters" }),
	password: zod.string().min(8, { message: "Your password must have a minimum of 8 characters" }),
	confirmPassword: zod
		.string()
		.min(8, { message: "Your password must have a minimum of 8 characters" }),
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

export const validateRegistrationFields = (
	registerInfo: Registration
): true | ZodError<PersonalAccount[]>["formErrors"]["fieldErrors"] => {
	const result = RegisterSchema.shape.paymentInfo.safeParse(registerInfo.paymentInfo);
	if (result.success === false) {
		return result.error.formErrors.fieldErrors;
	} else {
		return result.success;
	}
};

export const validateProfileFields = (
	profileInfo: Registration
): true | ZodError<Registration>["formErrors"]["fieldErrors"] => {
	const result = RegisterSchema.omit({ paymentInfo: true }).safeParse(profileInfo);
	if (result.success === false) {
		return result.error.formErrors.fieldErrors;
	} else {
		return result.success;
	}
};

const Register = () => {
	const { currentStep, isFirstStep, isLastStep, next, back, isValid, formData } =
		useMultiStepContainer();
	const navigate = useNavigate();
	const { signUpWithEmailAndPassword } = useContext(AuthContext);

	const signUp = () => {
		console.log(formData);
		signUpWithEmailAndPassword(formData)
			.then((res) => (res === true ? navigate("/overview") : console.log(res)))
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

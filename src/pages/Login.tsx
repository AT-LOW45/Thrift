import {
	Box,
	Button,
	Card,
	CardContent,
	Stack,
	styled,
	TextField,
	Typography,
} from "@mui/material";
import { FormEvent, Fragment, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import thriftLogo from "../assets/Thrift-logos_white.png";
import thrift from "../assets/thrift_banner.jpg";
import { InfoBar } from "../components";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
	const { login } = useContext(AuthContext);
	const navigate = useNavigate();
	const [infoBarOpen, setInfoBarOpen] = useState(false);

	const verifyLogin = async (event: FormEvent) => {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const email = (form[0] as HTMLInputElement).value;
		const password = (form[1] as HTMLInputElement).value;

		const result = await login(email, password);

		if (result === true) {
			navigate("/overview");
		}

		if (typeof result === "string") {
			setInfoBarOpen(true);
		}
	};

	const LoginBanner = styled(Box)(({ theme }) => ({
		background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${thrift});`,
		flexBasis: "50%",
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "right",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		[theme.breakpoints.down("md")]: {
			display: "none",
		},
	}));

	const LoginForm = styled(Box)(({ theme }) => ({
		background: "#EEF4F5",
		flexBasis: "50%",
		[theme.breakpoints.down("md")]: {
			background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${thrift});`,
			backgroundSize: "cover",
		},
	}));

	return (
		<Fragment>
			{/* banner */}
			<LoginBanner>
				<img src={thriftLogo} style={{ width: "auto", height: "400px" }} alt='' />
				<Typography color='white' fontStyle='italic' fontSize='2rem' textAlign="center" px={5}>
					”Money is only a tool. It will take you wherever you wish, but it will not
					replace you as the driver.”
				</Typography>
				<Typography color='white' fontSize='1.6rem'>
					- Ayn Rand
				</Typography>
			</LoginBanner>

			{/* login form */}
			<LoginForm
				component='form'
				onSubmit={verifyLogin}
				display='flex'
				justifyContent='center'
				alignItems='center'
				flexGrow={1}
			>
				<Card sx={{ width: "80%" }}>
					<CardContent sx={{ px: 5, py: 3 }}>
						<Stack direction='column' spacing={2}>
							<Typography variant='regularSubHeading' textAlign='center'>
								Welcome Back!
							</Typography>
							<Stack direction='column' spacing={1}>
								<TextField
									variant='standard'
									name='email'
									type='email'
									label='Email'
								/>
								<TextField
									variant='standard'
									name='password'
									type='password'
									label='Password'
								/>
							</Stack>
							<Stack spacing={1} alignItems='center' direction='column'>
								<Button
									variant='contained'
									type='submit'
									color='primary'
									sx={{ width: "50%" }}
								>
									Login
								</Button>

								<Button
									type='button'
									variant='outlined'
									onClick={() => navigate("/register")}
									sx={{ width: "50%" }}
								>
									Sign Up
								</Button>
							</Stack>
						</Stack>
					</CardContent>
				</Card>
			</LoginForm>
			<InfoBar
				infoBarOpen={infoBarOpen}
				setInfoBarOpen={setInfoBarOpen}
				message='Incorrect Credentials'
				type='error'
			/>
		</Fragment>
	);
};

export default Login;

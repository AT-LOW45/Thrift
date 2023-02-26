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
import { FormEvent, Fragment, useContext } from "react";
import { useNavigate } from "react-router-dom";
import thriftLogo from "../assets/Thrift-logos_white.png";
import thrift from "../assets/thrift_banner.jpg";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
	const { login } = useContext(AuthContext);
	const navigate = useNavigate();

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
			console.log(result);
		}
	};

	const LoginBanner = styled(Box)(({ theme }) => ({
		background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${thrift});`,
		flexGrow: 1,
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
				<Typography color='white' fontStyle='italic' fontSize='2rem'>
					"Some profound quote"
				</Typography>
				<Typography color='white' fontSize='1.6rem'>
					- someone
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
									type="button"
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
		</Fragment>
	);
};

export default Login;

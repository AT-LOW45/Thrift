import { createTheme } from "@mui/material";
import "./global_styles.css";

const theme = createTheme({
	typography: {
		fontFamily: "Nunito Sans",
		regularHeading: {
			fontSize: "2.5rem",
			letterSpacing: "0.15em",
			textTransform: "uppercase",
			fontWeight: "bold"
		},
		regularSubHeading: {
			fontSize: "1.5rem",
			fontWeight: 600
		},
		regularLight: {
			color: "gray",
			fontSize: "0.9rem",
			fontWeight: "lighter"
		},
		regularParagraph: {
			
		},
		numberHeading: {
			fontFamily: "Jetbrains Mono",
			fontSize: "1.5rem"
		},
		numberParagraph: {
			fontFamily: "Jetbrains Mono",
			fontSize: "1rem"
		}
	},
	palette: {
		primary: {
			main: "#1A46C4",
		},
		secondary: {
			main: "#0083DE",
		},
		tertiary: {
			main: "#00A8AC",
			contrastText: "white",
		},
	},
});

export default theme;

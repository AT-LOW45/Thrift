import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import App from "./App";
import theme from "./assets/theme";
import Auth from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route
					path='/*'
					element={
						<ThemeProvider theme={theme}>
							<Auth>
								<App />
							</Auth>
						</ThemeProvider>
					}
				></Route>
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
);

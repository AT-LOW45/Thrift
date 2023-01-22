import { Fragment } from "react";
import { Route, Routes } from "react-router-dom";
import { DashboardLayout, PlainLayout } from "./components";
import { Overview, NotFound } from "./pages";

function App() {
	// authenticate user before routing
	const isLoggedIn = true;

	return (
		<Routes>
			{isLoggedIn ? (
				<Fragment>
					<Route path='/' element={<DashboardLayout />}>
						<Route index element={<Overview />} />
					</Route>
					<Route path='*' element={<NotFound />} />
				</Fragment>
			) : (
				<Route path='/' element={<PlainLayout />}></Route>
			)}
		</Routes>
	);
}

export default App;

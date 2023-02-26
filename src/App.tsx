import { Fragment, useContext, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { DashboardLayout, PlainLayout } from "./components";
import { AuthContext } from "./context/AuthContext";
import { MultiStep } from "./context/MultiStepContext";
import { NotFound, Overview } from "./pages";
import BudgetPlanDetails from "./pages/budget/BudgetPlanDetails";
import Budgets from "./pages/budget/Budgets";
import Login from "./pages/Login";
import Transactions from "./pages/records/Records";
import AccountConfiguration from "./pages/register/AccountConfiguration";
import ProfileConfiguration from "./pages/register/ProfileConfiguration";
import Register, { RegisterSchemaDefaults } from "./pages/register/Register";

function App() {
	// authenticate user before routing
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const {user} = useContext(AuthContext)

	const test = true

	useEffect(() => {
		const changeRoute = () => {
			user === null ? setIsLoggedIn(false) : setIsLoggedIn(true)
		}
		changeRoute()
		console.log(user)
	}, [user])

	return (
		<Routes>
			{isLoggedIn ? (
				<Fragment>
					<Route path='/' element={<DashboardLayout />}>
						<Route path='/overview' element={<Overview />} />
						<Route path='/budgets' element={<Budgets />} />
						<Route path='/budgets/:id' element={<BudgetPlanDetails />} />
						<Route path='/transactions' element={<Transactions />} />
					</Route>
					<Route path='*' element={<NotFound />} />
				</Fragment>
			) : (
				<Route path='/' element={<PlainLayout />}>
					<Route index element={<Login />} />
					<Route
						path='/register'
						element={
							<MultiStep
								steps={[
									<ProfileConfiguration key={1} />,
									<AccountConfiguration key={2} />,
								]}
								defaultValues={RegisterSchemaDefaults.parse({})}
							>
								<Register />
							</MultiStep>
						}
					/>
				</Route>
			)}
		</Routes>
	);
}

export default App;

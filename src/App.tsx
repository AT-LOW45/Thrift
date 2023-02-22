import { Fragment } from "react";
import { Route, Routes } from "react-router-dom";
import { DashboardLayout, PlainLayout } from "./components";
import { NotFound, Overview } from "./pages";
import BudgetPlanDetails from "./pages/budget/BudgetPlanDetails";
import Budgets from "./pages/budget/Budgets";
import Transactions from "./pages/records/Records";

function App() {
	// authenticate user before routing
	const isLoggedIn = true;

	return (
		<Routes>
			{isLoggedIn ? (
				<Fragment>
					<Route path='/' element={<DashboardLayout />}>
						<Route path='/overview' element={<Overview />} />
						<Route path='/budgets' element={<Budgets />} />
						<Route path='/budgets/:id' element={<BudgetPlanDetails />} />
						<Route path="/transactions" element={<Transactions />} />
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

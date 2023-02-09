import { ThriftServiceProvider } from "../../service/thrift";
import { BudgetPlan, Category, PlannedPayment } from "./models";

interface BudgetServiceProvider extends ThriftServiceProvider<BudgetPlan> {
	validateCategory(category: Category): boolean;
	validateName(data: BudgetPlan): boolean;
	validatePlanned(data: PlannedPayment): boolean;
	validateLimit(data: BudgetPlan): boolean;
}

const budgetService: BudgetServiceProvider = {
	readAll: function (): Promise<BudgetPlan[]> {
		throw new Error("Function not implemented.");
	},
	find: function (): Promise<BudgetPlan> {
		throw new Error("Function not implemented.");
	},
	addDoc: async () => {
		return Promise.resolve("");
	},
	deleteDoc: async () => {},
	editDoc: function (): Promise<void> {
		throw new Error("Function not implemented.");
	},
	validateCategory: function (category: Category) {
		return category.spendingLimit >= 10;
	},
	validateName: function (data: BudgetPlan) {
		return data.name.length >= 10 && data.spendingLimit >= 20;
	},
	validatePlanned: function (planned: PlannedPayment) {
		return planned.amount >= 15;
	},
	validateLimit: function (plan: BudgetPlan) {
        // console.log(plan.categories[0].spendingLimit + plan.plannedPayments[0].amount)
        // console.log(plan.spendingLimit)
		const isOver =
			(plan.categories[0].spendingLimit + plan.plannedPayments[0].amount) < plan.spendingLimit;
            console.log(isOver)
		return isOver;
	},
};

export default budgetService;

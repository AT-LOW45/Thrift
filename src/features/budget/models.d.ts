import { ChipOptions } from "./components/BudgetChip";

export type BudgetPlan = {
	id: string;
	name: string;
	spendingLimit: number;
	spendingThreshold: number;
	note: string;
	renewalTerm: "biweekly" | "monthly";
	categories: Category[];
	plannedPayments: PlannedPayment[];
};

export type BudgetPlanOverview = Pick<BudgetPlan, "note" | "spendingLimit" | "spendingThreshold">;

export type Category = Pick<BudgetPlan, "id" | "name" | "spendingLimit"> & {
	iconType: ChipOptions;
	amountLeftPercentage?: number;
	amountLeftCurrency?: number;
	colourScheme: {
		primaryHue: string;
		secondaryHue: string;
	};
};

export type PlannedPayment = Pick<BudgetPlan, "id" | "name"> & {
	amount: number;
	startDate: Date;
};

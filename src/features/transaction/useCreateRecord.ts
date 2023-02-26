import { SelectChangeEvent } from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import { BudgetPlan, budgetService } from "../budget";
import { ChipOptions } from "../budget/components/BudgetChip";
import { PersonalAccount } from "../payment_info/paymentInfo.schema";
import paymentInfoService from "../payment_info/paymentInfo.service";
import {
	Income,
	IncomeSchemaDefaults,
	labels,
	Transaction,
	TransactionSchemaDefaults,
} from "./transaction.schema";
import transactionService from "./transaction.service";

const useCreateRecord = (toggleModal: () => void) => {
	const [recordType, setRecordType] = useState<"income" | "transaction">("transaction");
	const [record, setRecord] = useState<Transaction | Income>(TransactionSchemaDefaults.parse({}));
	const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
	const [availableLabels, setAvailableLabels] = useState<Set<string>>(new Set(labels));
	const [label, setLabel] = useState("");
	const [amountLeftCategory, setAmountLeftCategory] = useState<number>();
	const [accounts, setAccounts] = useState<PersonalAccount[]>([]);
	const [balance, setBalance] = useState<number>();
	const [isValid, setIsValid] = useState(false);
	const [budgets, setBudgets] = useState<{ bud: ChipOptions; amount: number }[]>([]);

	const validateRecord = (record: Transaction | Income): boolean => {
		const isRecordFieldsValid = transactionService.validateRecordDetails(record);
		let isBalanceEnough: boolean;
		isBalanceEnough =
			recordType === "income"
				? true
				: record.amount < balance! && record.amount < amountLeftCategory!;
		return isRecordFieldsValid && isBalanceEnough;
	};

	useEffect(() => {
		const getPlans = async () => {
			const budgetPlans = await budgetService.readAll();
			const personalAccounts = await paymentInfoService.getPersonalAccounts();
			budgetPlans.length > 0 &&
				setRecord((record) => ({ budgetPlanName: budgetPlans[0].name, ...record }));
			setBudgetPlans(budgetPlans);
			setAccounts(personalAccounts);
		};
		getPlans();
	}, []);

	useEffect(() => {
		const getAmount = async () => {
			const plan = budgetPlans.find(
				(plan) => plan.name === (record as Transaction).budgetPlanName
			);

			if (plan && plan.id !== undefined) {
				const val = await Promise.all(
					plan.categories.map(async (cat) => {
						const { amountLeftCurrencyCat } =
							await budgetService.getRemainingCategoryAmount(plan.id!, cat.name);
						const n = cat.name;
						return { bud: n, amount: amountLeftCurrencyCat };
					})
				);
				const selectedBudget = val[0].bud;
				setAmountLeftCategory(val[0].amount);
				setBudgets(val);
				return selectedBudget;
			} else {
				return undefined;
			}
		};
		getAmount().then((selectedBudget) => {
			setRecord((record) => {
				const updated =
					recordType === "transaction"
						? ({ ...record, category: selectedBudget } as Transaction)
						: record;
				const result = validateRecord(updated);
				setIsValid(result);
				return updated;
			});
		});
	}, [(record as Transaction).budgetPlanName]);

	const changeRecordType = (event: SelectChangeEvent) => {
		const selection = event.target.value as "income" | "transaction";
		setRecordType(() => selection);
		setRecord(
			selection === "income"
				? IncomeSchemaDefaults.parse({})
				: TransactionSchemaDefaults.parse({})
		);

		setAmountLeftCategory(undefined);
	};

	const testAuto = (event: SyntheticEvent<Element, Event>, value: string) => {
		setLabel(value);
	};

	const testAutoFree = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setLabel(event.target.value);
	};

	const removeLabel = (label: string) => {
		setRecord((record) => {
			const selectedLabels = record.labels;
			selectedLabels.delete(label);

			labels.has(label) &&
				setAvailableLabels((availableLabels) => {
					availableLabels.add(label);
					return availableLabels;
				});

			return { ...record, labels: selectedLabels };
		});
	};

	const addLabel = () => {
		label !== "" &&
			!record.labels.has(label) &&
			setRecord((record) => {
				const selectedLabels = record.labels;
				selectedLabels.add(label);

				labels.has(label) &&
					setAvailableLabels((availableLabels) => {
						availableLabels.delete(label);
						return availableLabels;
					});

				return { ...record, labels: selectedLabels };
			});
		setLabel("");
	};

	const handleSelectChange = (event: SelectChangeEvent) => {
		setRecord((record) => {
			let updated = {} as Transaction | Income;
			if (event.target.name === "budgetPlanName") {
				const plan = budgetPlans.find((plan) => plan.name === event.target.value);
				if (plan && plan.id) {
					updated = {
						...record,
						budgetPlanName: event.target.value,
						budgetPlanId: plan.id,
					} as Transaction;
				}
			} else {
				updated = { ...record, [event.target.name]: event.target.value };
			}

			const type =
				recordType === "transaction" ? (updated as Transaction) : (updated as Income);
			const result = validateRecord(type);
			setIsValid(result);
			return updated;
		});
	};

	const handleAccountChange = (event: SelectChangeEvent) => {
		const account = accounts.find((acc) => acc.name === event.target.value);
		setRecord((record) => {
			let updated = {} as Transaction | Income;
			if (account && account.id) {
				updated = { ...record, accountId: account.id, accountName: event.target.value };
			} else {
				updated = { ...record, [event.target.name]: event.target.value };
			}
			const result = validateRecord(updated);
			setIsValid(result);
			return updated;
		});
		setBalance(account?.balance);
	};

	const handleCategoryChange = (event: SelectChangeEvent) => {
		setRecord((record) => ({ ...record, category: event.target.value as ChipOptions }));
		const selectedBudget = budgets.find((budget) => budget.bud === event.target.value);
		setAmountLeftCategory(selectedBudget?.amount);
	};

	const handleAmountOrMemoChange = (
		event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
	) => {
		const isAmountField = event.target.name === "amount";
		const value = isAmountField ? parseInt(event.target.value) : event.target.value;
		setRecord((record) => {
			const updated = { ...record, [event.target.name]: value };
			const type =
				recordType === "transaction" ? (updated as Transaction) : (updated as Income);
			const result = validateRecord(type);
			setIsValid(result);
			return updated;
		});
	};

	const handleSubmit = async () => {
		console.log(record);
		const result = await transactionService.addDoc(record);
		if (typeof result === "string") {
			toggleModal();
		} else {
			console.log("transaction error");
		}
	};

	return {
		recordType,
		setRecordType,
		record,
		setRecord,
		budgetPlans,
		isValid,
		availableLabels,
		label,
		accounts,
		// amountLeft,
		amountLeftCategory,
		handleAccountChange,
		balance,
		budgets,
		addLabel,
		removeLabel,
		changeRecordType,
		handleCategoryChange,
		testAuto,
		testAutoFree,
		handleSelectChange,
		handleAmountOrMemoChange,
		handleSubmit,
	};
};

export default useCreateRecord;

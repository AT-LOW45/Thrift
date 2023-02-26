import { SelectChangeEvent } from '@mui/material';
import React from 'react'
import { BudgetPlan } from '../../budget';
import { PersonalAccount } from '../../payment_info/paymentInfo.schema';
import { Income, Transaction } from '../transaction.schema';

type RecordLinkProps = {
	handleAccountChange: (event: SelectChangeEvent<string>) => void;
	accounts: PersonalAccount[];
	record: Transaction | Income;
	budgetPlans: BudgetPlan[];
	handleCategoryChange: (event: SelectChangeEvent<string>) => void;
	amountLeftCategory: number | undefined;
	handleSelectChange: (event: SelectChangeEvent<string>) => void;
};

const RecordLink = ({accounts, amountLeftCategory, budgetPlans, handleAccountChange, handleCategoryChange, handleSelectChange, record}: RecordLinkProps) => {
  return (
    <div>RecordLink</div>
  )
}

export default RecordLink
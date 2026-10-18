import { useLocalSearchParams } from 'expo-router';

import { TransactionFormScreen } from '@/components/transactions/transaction-form-screen';

export default function NewTransactionScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  return <TransactionFormScreen initialType={type === 'INCOME' ? 'INCOME' : 'EXPENSE'} />;
}

import {pageMetadata} from '@/lib/page-metadata';
import ExpenseSplitterClient from './ExpenseSplitterClient';

export const metadata = pageMetadata("/projects/expense-splitter", {
  title: 'Expense Splitter | Arpit Agarwala',
  description: 'Split bills fairly. Settle up simply.',
});

export default function ExpenseSplitterPage() {
  return <ExpenseSplitterClient />;
}


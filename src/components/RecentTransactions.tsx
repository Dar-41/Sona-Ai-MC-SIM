import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Transaction {
  id: string;
  merchant: string;
  category: string;
  account: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  logoText: string;
  logoBg: string;
}

interface RecentTransactionsProps {
  customTransactions?: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ customTransactions }) => {
  const defaultTransactions: Transaction[] = [
    {
      id: 'tx-1',
      merchant: 'Stripe payout',
      category: 'Income',
      account: 'Bank A',
      date: 'Jun 12',
      amount: 2400,
      type: 'income',
      logoText: 'S',
      logoBg: 'bg-[#635BFF]',
    },
    {
      id: 'tx-2',
      merchant: 'Rewe Market',
      category: 'Food',
      account: 'Bank B',
      date: 'Jun 11',
      amount: 86.20,
      type: 'expense',
      logoText: 'REWE',
      logoBg: 'bg-[#CC071E]',
    },
    {
      id: 'tx-3',
      merchant: 'Netflix',
      category: 'Subscriptions',
      account: 'Bank A',
      date: 'Jun 10',
      amount: 17.99,
      type: 'expense',
      logoText: 'N',
      logoBg: 'bg-[#E50914]',
    },
    {
      id: 'tx-4',
      merchant: 'Spotify',
      category: 'Subscriptions',
      account: 'Bank A',
      date: 'Jun 09',
      amount: 12.99,
      type: 'expense',
      logoText: 'S',
      logoBg: 'bg-[#1DB954]',
    },
    {
      id: 'tx-5',
      merchant: 'AWS Cloud',
      category: 'Infrastructure',
      account: 'Bank A',
      date: 'Jun 08',
      amount: 45.60,
      type: 'expense',
      logoText: 'A',
      logoBg: 'bg-[#FF9900]',
    },
  ];

  const transactions = customTransactions && customTransactions.length > 0 
    ? customTransactions 
    : defaultTransactions;

  const formatEuro = (v: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(v);
  };

  return (
    <div className="flux-card p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Recent Transactions & Inflows
          </h3>
          <p className="text-[11px] text-[#717789] mt-0.5">
            Parsed recurring cash flows feeding simulation drift
          </p>
        </div>
        <button className="text-[#8E95A8] hover:text-white transition-colors">
          <ArrowUpRight size={18} />
        </button>
      </div>

      {/* Table Header matching Behance */}
      <div className="grid grid-cols-12 text-[11px] font-medium text-[#5E6478] pb-2 border-b border-[#1E212E] px-2">
        <span className="col-span-4">Merchant</span>
        <span className="col-span-3">Category</span>
        <span className="col-span-2 hidden sm:block">Account</span>
        <span className="col-span-2 hidden sm:block">Date</span>
        <span className="col-span-3 sm:col-span-1 text-right">Amount</span>
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-[#181A25]">
        {transactions.map((tx) => {
          return (
            <div 
              key={tx.id}
              className="grid grid-cols-12 items-center text-xs py-2.5 px-2 hover:bg-[#161823] rounded-lg transition-colors"
            >
              {/* Merchant */}
              <div className="col-span-4 flex items-center gap-2.5 min-w-0 pr-2">
                <div className={`w-6 h-6 rounded-md ${tx.logoBg} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                  {tx.logoText}
                </div>
                <span className="font-medium text-white truncate">
                  {tx.merchant}
                </span>
              </div>

              {/* Category Pill */}
              <div className="col-span-3">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-[#1A1D2B] text-[#8E95A8] border border-[#24283A] truncate max-w-full">
                  {tx.category}
                </span>
              </div>

              {/* Account */}
              <div className="col-span-2 hidden sm:block text-[#717789]">
                {tx.account}
              </div>

              {/* Date */}
              <div className="col-span-2 hidden sm:block text-[#717789] font-mono text-[11px]">
                {tx.date}
              </div>

              {/* Amount */}
              <div className="col-span-3 sm:col-span-1 text-right font-mono font-medium">
                <span className={tx.type === 'income' ? 'text-[#FF5722]' : 'text-white'}>
                  {tx.type === 'income' ? `+${formatEuro(tx.amount)}` : formatEuro(tx.amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

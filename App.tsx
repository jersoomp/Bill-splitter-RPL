import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { BillSplitter } from './components/BillSplitter';
import { BillHistory } from './components/BillHistory';
import { Button } from './components/ui/button';
import { Home } from 'lucide-react';

interface BillData {
  billName?: string;
  people: any[];
  items: any[];
  useItemizedList: boolean;
  billAmount: string;
  tipPercent: string;
  taxPercent: string;
  globalDiscounts: any[];
  deliveryFee: string;
  activeAdjustments: string[];
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'splitter' | 'history'>('home');
  const [loadedBillData, setLoadedBillData] = useState<BillData | undefined>(undefined);

  const handleLoadBill = (billData: BillData) => {
    setLoadedBillData(billData);
    setCurrentPage('splitter');
  };

  return (
    <div>
      {currentPage === 'splitter' && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            onClick={() => setCurrentPage('home')}
            variant="outline"
            size="sm"
            className="bg-white shadow-md"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      )}
      
      {currentPage === 'home' ? (
        <HomePage onStartSplitting={() => {
          setLoadedBillData(undefined);
          setCurrentPage('splitter');
        }} />
      ) : currentPage === 'history' ? (
        <BillHistory
          onBack={() => setCurrentPage('splitter')}
          onLoadBill={handleLoadBill}
        />
      ) : (
        <BillSplitter
          onViewHistory={() => setCurrentPage('history')}
          initialData={loadedBillData}
        />
      )}
    </div>
  );
}
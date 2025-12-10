import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { History, ArrowLeft, Trash2, Eye, Calendar, Users } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Person {
  id: string;
  name: string;
  paid: number;
}

interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  assignedTo: string[];
}

interface GlobalDiscount {
  id: string;
  percent: number;
}

interface SavedBill {
  key: string;
  value: {
    billName: string;
    people: Person[];
    items: Item[];
    useItemizedList: boolean;
    billAmount: string;
    tipPercent: string;
    taxPercent: string;
    globalDiscounts: GlobalDiscount[];
    deliveryFee: string;
    activeAdjustments: string[];
    totalAmount: number;
    createdAt: string;
  };
}

interface BillHistoryProps {
  onBack: () => void;
  onLoadBill: (bill: SavedBill['value']) => void;
}

export function BillHistory({ onBack, onLoadBill }: BillHistoryProps) {
  const [bills, setBills] = useState<SavedBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<SavedBill | null>(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ec49694e/bills`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      
      if (data.success) {
        // Filter out invalid bills and sort by createdAt descending (newest first)
        const validBills = (data.bills || []).filter(
          (bill: SavedBill) => bill?.value?.createdAt
        );
        const sortedBills = validBills.sort((a: SavedBill, b: SavedBill) => {
          const dateA = new Date(a.value.createdAt).getTime();
          const dateB = new Date(b.value.createdAt).getTime();
          return dateB - dateA;
        });
        setBills(sortedBills);
      } else {
        console.error('Error fetching bills:', data.error);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleDeleteBill = async (billId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ec49694e/bills/${billId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setBills(bills.filter((bill) => bill.key !== billId));
        if (selectedBill?.key === billId) {
          setSelectedBill(null);
        }
      } else {
        console.error('Error deleting bill:', data.error);
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
    }
  };

  const formatIDR = (amount: number) => {
    return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (selectedBill) {
    const bill = selectedBill.value;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedBill(null)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to History
            </Button>
            <Button
              onClick={() => {
                onLoadBill(bill);
                onBack();
              }}
              className="gap-2"
            >
              Load Bill
            </Button>
          </div>

          <Card className="p-4 md:p-6">{/* Reduced padding on mobile */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="mb-2">{bill.billName || 'Unnamed Bill'}</h2>
                <p className="text-sm text-gray-500">{formatDate(bill.createdAt)}</p>
              </div>
              <Badge variant="outline" className="gap-1">
                <Users className="w-3 h-3" />
                {bill.people.length} people
              </Badge>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <h3 className="mb-3">Bill Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatIDR(bill.useItemizedList ? 
                      bill.items.reduce((sum, item) => {
                        const itemSubtotal = item.price * item.quantity;
                        const itemAfterDiscount = itemSubtotal - (itemSubtotal * item.discount / 100);
                        return sum + itemAfterDiscount;
                      }, 0) : parseFloat(bill.billAmount) || 0)}</span>
                  </div>
                  {bill.activeAdjustments.includes('discount') && bill.globalDiscounts.length > 0 && (
                    bill.globalDiscounts.map((discount, index) => (
                      <div key={discount.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount #{index + 1} ({discount.percent}%):</span>
                        <span className="text-green-600">Applied</span>
                      </div>
                    ))
                  )}
                  {bill.activeAdjustments.includes('tax') && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax ({bill.taxPercent}%):</span>
                      <span>Applied</span>
                    </div>
                  )}
                  {bill.activeAdjustments.includes('tip') && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tip ({bill.tipPercent}%):</span>
                      <span>Applied</span>
                    </div>
                  )}
                  {bill.activeAdjustments.includes('delivery') && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span>{formatIDR(parseFloat(bill.deliveryFee) || 0)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>{formatIDR(bill.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3">Participants</h3>
                <div className="space-y-2">
                  {bill.people.map((person) => (
                    <div key={person.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>{person.name || 'Unnamed'}</span>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Paid: {formatIDR(person.paid)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {bill.useItemizedList && bill.items.length > 0 && (
                <div>
                  <h3 className="mb-3">Items</h3>
                  <div className="space-y-2">
                    {bill.items.map((item) => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between mb-1">
                          <span>{item.name || 'Unnamed Item'}</span>
                          <span>{formatIDR(item.price * item.quantity)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Qty: {item.quantity} {item.discount > 0 && `• Discount: ${item.discount}%`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this bill?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this bill from your history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteBill(selectedBill.key)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          onClick={onBack}
          className="mb-4 md:mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bill Splitter
        </Button>

        <div className="text-center mb-6 md:mb-8">{/* Reduced margin on mobile */}
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-indigo-600 rounded-full mb-3 md:mb-4">{/* Smaller on mobile */}
            <History className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-indigo-900 mb-1 md:mb-2 text-2xl md:text-3xl">Bill History</h1>{/* Smaller heading on mobile */}
          <p className="text-gray-600 text-sm md:text-base">View and manage your saved bills</p>
        </div>

        {loading ? (
          <Card className="p-6 md:p-8 text-center">{/* Reduced padding on mobile */}
            <p className="text-gray-500">Loading history...</p>
          </Card>
        ) : bills.length === 0 ? (
          <Card className="p-6 md:p-8 text-center">{/* Reduced padding on mobile */}
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No bills saved yet</p>
            <p className="text-sm text-gray-400">Save bills from the bill splitter to see them here</p>
          </Card>
        ) : (
          <div className="space-y-3 md:space-y-4">{/* Reduced spacing on mobile */}
            {bills.map((bill) => (
              <Card
                key={bill.key}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedBill(bill)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1">{bill.value.billName || 'Unnamed Bill'}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(bill.value.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {bill.value.people.length} people
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Total</div>
                    <div>{formatIDR(bill.value.totalAmount)}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
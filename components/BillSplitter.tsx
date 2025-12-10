import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
import { UserPlus, X, Receipt, Users, Banknote, Plus, ShoppingCart, Trash2, Save, History as HistoryIcon } from 'lucide-react';
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
  discount: number; // Discount percentage for this item
  assignedTo: string[]; // Array of person IDs
}

interface GlobalDiscount {
  id: string;
  percent: number;
}

interface BillSplitterProps {
  onViewHistory: () => void;
  initialData?: {
    billName?: string;
    people: Person[];
    items: Item[];
    useItemizedList: boolean;
    billAmount: string;
    tipPercent: string;
    taxPercent: string;
    globalDiscounts: GlobalDiscount[];
    deliveryFee: string;
    activeAdjustments: string[];
  };
}

export function BillSplitter({ onViewHistory, initialData }: BillSplitterProps) {
  const [people, setPeople] = useState<Person[]>(initialData?.people || [
    { id: '1', name: '', paid: 0 },
    { id: '2', name: '', paid: 0 },
  ]);
  const [items, setItems] = useState<Item[]>(initialData?.items || []);
  const [useItemizedList, setUseItemizedList] = useState<boolean>(initialData?.useItemizedList || false);
  const [billAmount, setBillAmount] = useState<string>(initialData?.billAmount || '');
  const [tipPercent, setTipPercent] = useState<string>(initialData?.tipPercent || '');
  const [taxPercent, setTaxPercent] = useState<string>(initialData?.taxPercent || '');
  const [globalDiscounts, setGlobalDiscounts] = useState<GlobalDiscount[]>(initialData?.globalDiscounts || []);
  const [deliveryFee, setDeliveryFee] = useState<string>(initialData?.deliveryFee || '');
  const [activeAdjustments, setActiveAdjustments] = useState<string[]>(initialData?.activeAdjustments || []);

  const addPerson = () => {
    setPeople([
      ...people,
      { id: Date.now().toString(), name: '', paid: 0 },
    ]);
  };

  const removePerson = (id: string) => {
    if (people.length > 1) {
      setPeople(people.filter((p) => p.id !== id));
    }
  };

  const updatePersonName = (id: string, name: string) => {
    setPeople(people.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const updatePersonPaid = (id: string, paid: string) => {
    const amount = paid === '' ? 0 : parseFloat(paid);
    setPeople(
      people.map((p) => (p.id === id ? { ...p, paid: isNaN(amount) ? 0 : amount } : p))
    );
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), name: '', price: 0, quantity: 1, discount: 0, assignedTo: [] },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItemName = (id: string, name: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, name } : item)));
  };

  const updateItemPrice = (id: string, price: string) => {
    const amount = price === '' ? 0 : parseFloat(price);
    setItems(
      items.map((item) => (item.id === id ? { ...item, price: isNaN(amount) ? 0 : amount } : item))
    );
  };

  const updateItemQuantity = (id: string, quantity: string) => {
    const qty = quantity === '' ? 1 : parseInt(quantity);
    setItems(
      items.map((item) => (item.id === id ? { ...item, quantity: isNaN(qty) || qty < 1 ? 1 : qty } : item))
    );
  };

  const updateItemDiscount = (id: string, discount: string) => {
    const disc = discount === '' ? 0 : parseFloat(discount);
    setItems(
      items.map((item) => (item.id === id ? { ...item, discount: isNaN(disc) ? 0 : Math.max(0, Math.min(100, disc)) } : item))
    );
  };

  const toggleItemAssignment = (itemId: string, personId: string) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const isAssigned = item.assignedTo.includes(personId);
          return {
            ...item,
            assignedTo: isAssigned
              ? item.assignedTo.filter((id) => id !== personId)
              : [...item.assignedTo, personId],
          };
        }
        return item;
      })
    );
  };

  const addGlobalDiscount = () => {
    setGlobalDiscounts([
      ...globalDiscounts,
      { id: Date.now().toString(), percent: 0 },
    ]);
  };

  const removeGlobalDiscount = (id: string) => {
    setGlobalDiscounts(globalDiscounts.filter((d) => d.id !== id));
  };

  const updateGlobalDiscount = (id: string, percent: string) => {
    const discountValue = percent === '' ? 0 : parseFloat(percent);
    setGlobalDiscounts(
      globalDiscounts.map((d) =>
        d.id === id ? { ...d, percent: isNaN(discountValue) ? 0 : Math.max(0, Math.min(100, discountValue)) } : d
      )
    );
  };

  const handleAddAdjustment = (type: string) => {
    if (!activeAdjustments.includes(type)) {
      setActiveAdjustments([...activeAdjustments, type]);
      if (type === 'discount' && globalDiscounts.length === 0) {
        addGlobalDiscount();
      }
    } else {
      // Toggle off - remove the adjustment
      handleRemoveAdjustment(type);
    }
  };

  const handleRemoveAdjustment = (type: string) => {
    setActiveAdjustments(activeAdjustments.filter((a) => a !== type));
    if (type === 'discount') {
      setGlobalDiscounts([]);
    } else if (type === 'tax') {
      setTaxPercent('');
    } else if (type === 'tip') {
      setTipPercent('');
    } else if (type === 'delivery') {
      setDeliveryFee('');
    }
  };

  const clearAll = () => {
    setPeople([
      { id: '1', name: '', paid: 0 },
      { id: '2', name: '', paid: 0 },
    ]);
    setItems([]);
    setUseItemizedList(false);
    setBillAmount('');
    setTipPercent('');
    setTaxPercent('');
    setGlobalDiscounts([]);
    setDeliveryFee('');
    setActiveAdjustments([]);
  };

  const saveBill = async (billName: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ec49694e/bills`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            billName,
            people,
            items,
            useItemizedList,
            billAmount,
            tipPercent,
            taxPercent,
            globalDiscounts,
            deliveryFee,
            activeAdjustments,
            totalAmount,
          }),
        }
      );
      const data = await response.json();
      
      if (data.success) {
        return true;
      } else {
        console.error('Error saving bill:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Error saving bill:', error);
      return false;
    }
  };

  const itemsTotal = items.reduce((sum, item) => {
    const itemSubtotal = item.price * item.quantity;
    const itemAfterDiscount = itemSubtotal - (itemSubtotal * item.discount / 100);
    return sum + itemAfterDiscount;
  }, 0);
  const bill = useItemizedList ? itemsTotal : (parseFloat(billAmount) || 0);
  
  // Apply global discounts sequentially
  const applyGlobalDiscounts = (amount: number) => {
    if (globalDiscounts.length === 0) return amount;
    
    return globalDiscounts.reduce((currentAmount, discount) => {
      return currentAmount - (currentAmount * discount.percent / 100);
    }, amount);
  };
  
  const tax = parseFloat(taxPercent) || 0;
  const tip = parseFloat(tipPercent) || 0;
  const delivery = parseFloat(deliveryFee) || 0;

  // Calculate each person's share
  const calculatePersonShare = (personId: string) => {
    if (useItemizedList) {
      // Calculate based on assigned items
      let personItemsTotal = 0;
      items.forEach((item) => {
        if (item.assignedTo.includes(personId) && item.assignedTo.length > 0) {
          const itemSubtotal = item.price * item.quantity;
          const itemAfterDiscount = itemSubtotal - (itemSubtotal * item.discount / 100);
          personItemsTotal += itemAfterDiscount / item.assignedTo.length;
        }
      });

      // Apply global discounts sequentially to person's items
      const personAfterDiscount = applyGlobalDiscounts(personItemsTotal);
      
      // Apply tax and tip to discounted amount
      const personWithTaxTip = personAfterDiscount + (personAfterDiscount * tax) / 100 + (personAfterDiscount * tip) / 100;
      
      // Add equal share of delivery fee
      const deliveryPerPerson = delivery / people.length;
      
      return personWithTaxTip + deliveryPerPerson;
    } else {
      // Equal split of everything
      const billAfterDiscount = applyGlobalDiscounts(bill);
      const totalAmount = billAfterDiscount + (billAfterDiscount * tax) / 100 + (billAfterDiscount * tip) / 100 + delivery;
      return totalAmount / people.length;
    }
  };

  const sharePerPerson = (personId: string) => calculatePersonShare(personId);
  
  // Calculate totals for display
  const billAfterDiscount = applyGlobalDiscounts(bill);
  const totalAmount = billAfterDiscount + (billAfterDiscount * tax) / 100 + (billAfterDiscount * tip) / 100 + delivery;
  const totalPaid = people.reduce((sum, p) => sum + p.paid, 0);

  const formatIDR = (amount: number) => {
    return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
  };

  const getBalance = (person: Person) => {
    return person.paid - sharePerPerson(person.id);
  };

  const settlements = () => {
    const balances = people.map((p) => ({
      ...p,
      balance: getBalance(p),
    }));

    const owes = balances.filter((b) => b.balance < -1);
    const owed = balances.filter((b) => b.balance > 1);

    const result: Array<{ from: string; to: string; amount: number }> = [];

    let i = 0;
    let j = 0;

    while (i < owes.length && j < owed.length) {
      const amount = Math.min(Math.abs(owes[i].balance), owed[j].balance);
      
      result.push({
        from: owes[i].name || `Person ${people.findIndex(p => p.id === owes[i].id) + 1}`,
        to: owed[j].name || `Person ${people.findIndex(p => p.id === owed[j].id) + 1}`,
        amount: amount,
      });

      owes[i].balance += amount;
      owed[j].balance -= amount;

      if (Math.abs(owes[i].balance) < 1) i++;
      if (Math.abs(owed[j].balance) < 1) j++;
    }

    return result;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-indigo-600 rounded-full mb-3 md:mb-4">
            <Receipt className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-indigo-900 mb-1 md:mb-2 text-2xl md:text-3xl">Split Bill</h1>
          <p className="text-gray-600 text-sm md:text-base">Easily split bills with friends</p>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center mt-3 md:mt-4 px-2">{/* Changed to flex-col for mobile, flex-row for sm+ */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Bill
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Save this bill</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter a name for this bill to save it to your history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-3">
                  <Label htmlFor="bill-name">Bill Name</Label>
                  <Input
                    id="bill-name"
                    placeholder="e.g., Dinner at Restaurant, Grocery Shopping"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        saveBill(input.value).then((success) => {
                          if (success) {
                            input.value = '';
                            document.getElementById('close-save-dialog')?.click();
                          }
                        });
                      }
                    }}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel id="close-save-dialog">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      const input = document.getElementById('bill-name') as HTMLInputElement;
                      saveBill(input.value).then((success) => {
                        if (success) {
                          input.value = '';
                        } else {
                          e.preventDefault();
                        }
                      });
                    }}
                  >
                    Save
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" className="gap-2" onClick={onViewHistory}>
              <HistoryIcon className="w-4 h-4" />
              History
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all bill details, items, and participants. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAll}>Clear Everything</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">{/* Reduced gap on mobile */}
          {/* Left Panel - Bill Details */}
          <Card className="p-4 md:p-6">{/* Reduced padding on mobile */}
            <div className="flex items-center gap-2 mb-4 md:mb-6">{/* Reduced margin on mobile */}
              <Banknote className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg md:text-xl">Bill Details</h2>{/* Smaller heading on mobile */}
            </div>

            <div className="space-y-3 md:space-y-4">{/* Reduced spacing on mobile */}
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="use-itemized">Use Itemized List</Label>
                  <span className="text-sm text-gray-500">Add individual items</span>
                </div>
                <Switch
                  id="use-itemized"
                  checked={useItemizedList}
                  onCheckedChange={setUseItemizedList}
                />
              </div>

              {useItemizedList ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Items</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      className="gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </Button>
                  </div>

                  {items.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      No items yet. Click "Add Item" to get started.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-gray-50 rounded-lg space-y-3"
                        >
                          <div className="flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder="Item name"
                                value={item.name}
                                onChange={(e) => updateItemName(item.id, e.target.value)}
                              />
                              <div className="flex gap-2">
                                <div className="w-16">
                                  <Input
                                    type="number"
                                    placeholder="Qty"
                                    value={item.quantity || ''}
                                    onChange={(e) => updateItemQuantity(item.id, e.target.value)}
                                    min="1"
                                  />
                                </div>
                                <Input
                                  type="number"
                                  placeholder="Price"
                                  value={item.price || ''}
                                  onChange={(e) => updateItemPrice(item.id, e.target.value)}
                                  className="flex-1"
                                />
                                <div className="w-20">
                                  <Input
                                    type="number"
                                    placeholder="Disc%"
                                    value={item.discount || ''}
                                    onChange={(e) => updateItemDiscount(item.id, e.target.value)}
                                    min="0"
                                    max="100"
                                  />
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="mt-1"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Shared by:</Label>
                            <div className="flex flex-wrap gap-3">
                              {people.map((person) => (
                                <div key={person.id} className="flex items-center gap-2">
                                  <Checkbox
                                    id={`item-${item.id}-person-${person.id}`}
                                    checked={item.assignedTo.includes(person.id)}
                                    onCheckedChange={() => toggleItemAssignment(item.id, person.id)}
                                  />
                                  <label
                                    htmlFor={`item-${item.id}-person-${person.id}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {person.name || `Person ${people.indexOf(person) + 1}`}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                    <span className="text-gray-700">Items Subtotal:</span>
                    <span>{formatIDR(itemsTotal)}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="bill-amount">Total Bill Amount</Label>
                  <Input
                    id="bill-amount"
                    type="number"
                    placeholder="0"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="include-discount">Include Discount</Label>
                  <span className="text-sm text-gray-500">Apply sequential discounts to bill</span>
                </div>
                <Switch
                  id="include-discount"
                  checked={globalDiscounts.length > 0}
                  onCheckedChange={() => handleAddAdjustment('discount')}
                />
              </div>

              {activeAdjustments.includes('discount') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Global Discounts (Applied Sequentially)</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addGlobalDiscount}
                      className="gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Discount
                    </Button>
                  </div>

                  {globalDiscounts.length === 0 ? (
                    <div className="text-center py-3 text-gray-500 text-sm">
                      No discounts yet. Click "Add Discount" to get started.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {globalDiscounts.map((discount, index) => (
                        <div key={discount.id} className="flex gap-2 items-center">
                          <span className="text-sm text-gray-500 w-16">#{index + 1}</span>
                          <Input
                            type="number"
                            placeholder="0"
                            value={discount.percent || ''}
                            onChange={(e) => updateGlobalDiscount(discount.id, e.target.value)}
                            min="0"
                            max="100"
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-500">%</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeGlobalDiscount(discount.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="include-tax">Include Tax</Label>
                  <span className="text-sm text-gray-500">Add tax to total bill</span>
                </div>
                <Switch
                  id="include-tax"
                  checked={activeAdjustments.includes('tax')}
                  onCheckedChange={() => handleAddAdjustment('tax')}
                />
              </div>

              {activeAdjustments.includes('tax') && (
                <div>
                  <Label htmlFor="tax-percent">Tax (%)</Label>
                  <Input
                    id="tax-percent"
                    type="number"
                    placeholder="0"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="include-tip">Include Tip</Label>
                  <span className="text-sm text-gray-500">Add tip to total bill</span>
                </div>
                <Switch
                  id="include-tip"
                  checked={activeAdjustments.includes('tip')}
                  onCheckedChange={() => handleAddAdjustment('tip')}
                />
              </div>

              {activeAdjustments.includes('tip') && (
                <div>
                  <Label htmlFor="tip-percent">Tip (%)</Label>
                  <Input
                    id="tip-percent"
                    type="number"
                    placeholder="0"
                    value={tipPercent}
                    onChange={(e) => setTipPercent(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="include-delivery">Include Delivery Fee</Label>
                  <span className="text-sm text-gray-500">Add delivery fee to bill</span>
                </div>
                <Switch
                  id="include-delivery"
                  checked={activeAdjustments.includes('delivery')}
                  onCheckedChange={() => handleAddAdjustment('delivery')}
                />
              </div>

              {activeAdjustments.includes('delivery') && (
                <div>
                  <Label htmlFor="delivery-fee">Delivery Fee (Rp)</Label>
                  <Input
                    id="delivery-fee"
                    type="number"
                    placeholder="0"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <Separator />

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatIDR(bill)}</span>
                </div>
                {activeAdjustments.includes('discount') && globalDiscounts.length > 0 && (
                  <>
                    {globalDiscounts.map((discount, index) => {
                      const previousAmount = globalDiscounts.slice(0, index).reduce((amt, d) => {
                        return amt - (amt * d.percent / 100);
                      }, bill);
                      const discountAmount = previousAmount * discount.percent / 100;
                      return (
                        <div key={discount.id} className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Discount #{index + 1} ({discount.percent}%):</span>
                          <span className="text-green-600">-{formatIDR(discountAmount)}</span>
                        </div>
                      );
                    })}
                  </>
                )}
                {activeAdjustments.includes('tax') && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tax ({tax}%):</span>
                    <span>{formatIDR((billAfterDiscount * tax) / 100)}</span>
                  </div>
                )}
                {activeAdjustments.includes('tip') && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tip ({tip}%):</span>
                    <span>{formatIDR((billAfterDiscount * tip) / 100)}</span>
                  </div>
                )}
                {activeAdjustments.includes('delivery') && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span>{formatIDR(delivery)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span>Total:</span>
                  <span>{formatIDR(totalAmount)}</span>
                </div>
              </div>

              {!useItemizedList && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                  <div className="text-gray-600 mb-1">Per Person (Equal Split)</div>
                  <div className="text-green-700">{formatIDR(sharePerPerson(people[0]?.id || '1'))}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Right Panel - People */}
          <Card className="p-4 md:p-6">{/* Reduced padding on mobile */}
            <div className="flex items-center justify-between mb-4 md:mb-6">{/* Reduced margin on mobile */}
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg md:text-xl">People ({people.length})</h2>{/* Smaller heading on mobile */}
              </div>
              <Button onClick={addPerson} size="sm" variant="outline" className="text-xs md:text-sm">{/* Smaller text on mobile */}
                <UserPlus className="w-4 h-4 mr-1 md:mr-2" />{/* Less margin on mobile */}
                Add
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">{/* Consistent spacing */}
              {people.map((person, index) => (
                <div key={person.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2 mb-3">
                    <div className="flex-1">
                      <Input
                        placeholder={`Person ${index + 1}`}
                        value={person.name}
                        onChange={(e) => updatePersonName(person.id, e.target.value)}
                      />
                    </div>
                    {people.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePerson(person.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="mb-2">
                    <Label htmlFor={`paid-${person.id}`} className="text-sm">
                      Amount Paid
                    </Label>
                    <Input
                      id={`paid-${person.id}`}
                      type="number"
                      placeholder="0"
                      value={person.paid === 0 ? '' : person.paid}
                      onChange={(e) => updatePersonPaid(person.id, e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Separator className="my-2" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Should Pay:</span>
                      <span>{formatIDR(sharePerPerson(person.id))}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm text-gray-600">Balance:</span>
                      <Badge
                        variant={
                          getBalance(person) > 1
                            ? 'default'
                            : getBalance(person) < -1
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {getBalance(person) > 1
                          ? `+${formatIDR(getBalance(person))}`
                          : getBalance(person) < -1
                          ? `-${formatIDR(Math.abs(getBalance(person)))}`
                          : formatIDR(0)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Settlements */}
        {totalAmount > 0 && totalPaid > 0 && (
          <Card className="mt-4 md:mt-6 p-4 md:p-6">{/* Reduced spacing on mobile */}
            <h2 className="mb-3 md:mb-4 text-lg md:text-xl">Settlement Summary</h2>{/* Smaller heading on mobile */}
            
            {Math.abs(totalPaid - totalAmount) > 1 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                ⚠️ Total paid ({formatIDR(totalPaid)}) doesn{"'"}t match total bill ({formatIDR(totalAmount)})
              </div>
            )}

            {settlements().length > 0 ? (
              <div className="space-y-2 md:space-y-3">{/* Reduced spacing on mobile */}
                {settlements().map((settlement, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
                  >
                    <div>
                      <span>{settlement.from}</span>
                      <span className="text-gray-500 mx-2">→</span>
                      <span>{settlement.to}</span>
                    </div>
                    <Badge variant="outline">{formatIDR(settlement.amount)}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                All settled! Everyone has paid their share.
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
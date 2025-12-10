import { Card } from './ui/card';
import { Button } from './ui/button';
import { Receipt, Users, Calculator, DollarSign, CheckCircle, ArrowRight } from 'lucide-react';

interface HomePageProps {
  onStartSplitting: () => void;
}

export function HomePage({ onStartSplitting }: HomePageProps) {
  
  const features = [
    {
      icon: Users,
      title: "Split with Multiple People",
      description: "Easily add friends and assign items to them.",
    },
    {
      icon: Calculator,
      title: "Auto Calculations",
      description: "Tax and tip are calculated automatically.",
    },
    {
      icon: DollarSign,
      title: "Tax & Tip Handling",
      description: "Flexible options for tax and service charges.",
    },
    {
      icon: CheckCircle,
      title: "Smart Settlement",
      description: "See exactly who owes what instantly.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 mt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-full mb-6">
            <Receipt className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">Split Bills with Friends</h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            The easiest way to split expenses, calculate tips, and share costs without the headache.
          </p>
          <Button onClick={onStartSplitting} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            Start Splitting Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12 mb-8">
          <Button onClick={onStartSplitting} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            Split Your Bill
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
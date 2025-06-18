import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FormData, CurrencyCode, ProjectDuration } from '../../ProjectPricingPage';

interface MonthlyFlow {
  month: number;
  personnel: number;
  technical: number;
  management: number;
  marketing: number;
  other: number;
  revenue: number;
  balance: number;
  cumulativeBalance: number;
}

export const CashFlowModule: React.FC = () => {
  const { watch, register, setValue } = useFormContext<FormData>();
  const formValues = watch();
  const currencyCode = watch('currencyCode');
  const language = watch('language');
  
  // Aylık nakit akışı hesaplama
  const cashFlowData = React.useMemo(() => {
    const data: MonthlyFlow[] = [];
    const duration = formValues.projectDuration || 12;
    let cumulativeBalance = 0;
    
    for (let i = 1; i <= duration; i++) {
      const monthPersonnel = formValues.personnelItems.reduce((acc, item) => 
        acc + (i <= item.duration ? item.monthlySalary * item.count : 0), 0);
        
      const monthTechnical = formValues.serverCost / duration + formValues.domainCost / 12;
      const monthManagement = formValues.officeCost;
      const monthMarketing = i === 1 ? formValues.advertisingBudget / 2 : formValues.advertisingBudget / (2 * duration);
      
      let monthRevenue = 0;
      if (formValues.salesModel === 'subscription' || formValues.salesModel === 'hybrid') {
        // Abonelik geliri dağılımı - her ay eşit
        monthRevenue += formValues.monthlySubscriptionFee * formValues.estimatedUserCount;
      }
      
      if (formValues.salesModel === 'one_time' || formValues.salesModel === 'hybrid') {
        // Tek seferlik satışlar projenin sonunda gerçekleşir
        if (i === duration) {
          monthRevenue += formValues.oneTimeSalesPrice * formValues.plannedSalesCount;
        }
      }
      
      const monthOtherExpenses = (monthPersonnel + monthTechnical + monthManagement + monthMarketing) * (formValues.contingencyRate / 100);
      
      const monthBalance = monthRevenue - (monthPersonnel + monthTechnical + monthManagement + monthMarketing + monthOtherExpenses);
      cumulativeBalance += monthBalance;
      
      data.push({
        month: i,
        personnel: monthPersonnel,
        technical: monthTechnical,
        management: monthManagement,
        marketing: monthMarketing,
        other: monthOtherExpenses,
        revenue: monthRevenue,
        balance: monthBalance,
        cumulativeBalance
      });
    }
    
    return data;
  }, [formValues]);

  // Ay değeri değiştiğinde monthlyExpenses state'ini güncelle
  React.useEffect(() => {
    if (cashFlowData.length > 0) {
      setValue('monthlyExpenses', cashFlowData.map(item => ({
        month: item.month,
        personnelCost: item.personnel,
        technicalCost: item.technical,
        managementCost: item.management,
        marketingCost: item.marketing,
        otherCost: item.other,
        revenue: item.revenue
      })));
    }
  }, [cashFlowData, setValue]);

  const formatCurrency = (value: number): string => {
    const localeMap: Record<string, string> = {
      'tr': 'tr-TR',
      'en': 'en-US'
    };
    
    const locale = localeMap[language] || 'tr-TR';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <label htmlFor="projectDuration" className="block text-sm font-medium text-gray-700 mb-1">
          Proje Süresi (Ay)
        </label>
        <select
          {...register('projectDuration')}
          id="projectDuration"
          className="w-full md:w-1/4 rounded-md border border-gray-300 py-2 px-3 bg-white"
        >
          <option value="1">1 Ay</option>
          <option value="2">2 Ay</option>
          <option value="3">3 Ay</option>
          <option value="6">6 Ay</option>
          <option value="9">9 Ay</option>
          <option value="12">12 Ay</option>
          <option value="18">18 Ay</option>
          <option value="24">24 Ay</option>
        </select>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-base text-gray-800 mb-2">Aylık Nakit Akışı</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={cashFlowData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                label={{ value: 'Ay', position: 'insideBottomRight', offset: 0 }}
              />
              <YAxis 
                label={{ value: `Tutar (${currencyCode})`, angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                formatter={(value) => typeof value === 'number' ? formatCurrency(value) : `${value}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cumulativeBalance" 
                stroke="#8884d8" 
                name="Birikimli Bakiye"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#82ca9d" 
                name="Aylık Bakiye" 
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#00C49F" 
                name="Gelir" 
              />
              <Line 
                type="monotone" 
                dataKey="personnel" 
                stroke="#0088FE" 
                name="Personel Gideri" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ay
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Personel
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teknik
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yönetim
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pazarlama
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gelir
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bakiye
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cashFlowData.map((month) => (
                <tr key={month.month} className={month.month % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {month.month}. Ay
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(month.personnel)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(month.technical)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(month.management)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(month.marketing)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(month.revenue)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${month.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(month.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  TOPLAM
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(cashFlowData.reduce((sum, month) => sum + month.personnel, 0))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(cashFlowData.reduce((sum, month) => sum + month.technical, 0))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(cashFlowData.reduce((sum, month) => sum + month.management, 0))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(cashFlowData.reduce((sum, month) => sum + month.marketing, 0))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(cashFlowData.reduce((sum, month) => sum + month.revenue, 0))}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${cashFlowData.length > 0 && cashFlowData[cashFlowData.length - 1].cumulativeBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {cashFlowData.length > 0 ? formatCurrency(cashFlowData[cashFlowData.length - 1].cumulativeBalance) : '0'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

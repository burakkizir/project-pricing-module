import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData, ScenarioType } from '../../ProjectPricingPage';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ScenarioResult {
  scenarioName: string;
  scenarioType: ScenarioType;
  totalCost: number;
  totalRevenue: number;
  profit: number;
  profitMargin: number;
  suggestedPrice: number;
  breakEvenPoint: number;
}

export const ScenarioModule: React.FC = () => {
  const { watch, register, setValue } = useFormContext<FormData>();
  const formValues = watch();
  const currencyCode = watch('currencyCode');
  const language = watch('language');
  
  // Para birimi formatı için yardımcı fonksiyon
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
  
  // Yüzde formatı için yardımcı fonksiyon
  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };
  
  // Senaryoları varsayılan değerlerle başlat
  React.useEffect(() => {
    if (!formValues.scenarios || formValues.scenarios.length === 0) {
      setValue('scenarios', [
        {
          type: 'optimistic',
          name: 'İyimser',
          personnelMultiplier: 0.9,
          durationMultiplier: 0.8,
          salesMultiplier: 1.2,
          expensesMultiplier: 0.9
        },
        {
          type: 'normal',
          name: 'Normal',
          personnelMultiplier: 1,
          durationMultiplier: 1,
          salesMultiplier: 1,
          expensesMultiplier: 1
        },
        {
          type: 'pessimistic',
          name: 'Kötümser',
          personnelMultiplier: 1.2,
          durationMultiplier: 1.3,
          salesMultiplier: 0.8,
          expensesMultiplier: 1.1
        }
      ]);
    }
  }, [setValue, formValues.scenarios]);
  
  // Senaryo bazlı hesaplamalar
  const scenarioResults = React.useMemo((): ScenarioResult[] => {
    if (!formValues.scenarios) return [];
    
    return formValues.scenarios.map(scenario => {
      // Personel maliyeti hesaplama
      const personnelCost = formValues.personnelItems.reduce((total, item) => {
        return total + (
          item.monthlySalary * 
          item.count * 
          Math.ceil(item.duration * scenario.durationMultiplier) * 
          scenario.personnelMultiplier
        );
      }, 0);
      
      // Diğer maliyetler
      const technicalCost = (formValues.serverCost + formValues.domainCost + formValues.thirdPartyLicenses + 
        formValues.dataStorageCost + formValues.backupCost) * scenario.expensesMultiplier;
        
      const managementCost = (formValues.accountingCost + formValues.officeCost * formValues.officeMonths + 
        formValues.hardwareCost) * scenario.expensesMultiplier;
      
      const marketingCost = (formValues.advertisingBudget + formValues.salesRepCost + 
        formValues.demoCost + formValues.websiteCost) * scenario.expensesMultiplier;
      
      // Toplam maliyet
      const subtotalCost = personnelCost + technicalCost + managementCost + marketingCost;
      const contingencyCost = subtotalCost * (formValues.contingencyRate / 100);
      const totalCost = subtotalCost + contingencyCost;
      
      // Gelir hesaplama
      let totalRevenue = 0;
      
      if (formValues.salesModel === 'one_time' || formValues.salesModel === 'hybrid') {
        totalRevenue += formValues.oneTimeSalesPrice * 
          Math.ceil(formValues.plannedSalesCount * scenario.salesMultiplier);
      }
      
      if (formValues.salesModel === 'subscription' || formValues.salesModel === 'hybrid') {
        totalRevenue += formValues.monthlySubscriptionFee * 
          Math.ceil(formValues.estimatedUserCount * scenario.salesMultiplier) * 12;
      }
      
      // Kâr hesapla
      const profit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
      
      // Break-even noktası
      const breakEvenPoint = totalCost > 0 ? 
        Math.ceil(totalCost / (formValues.oneTimeSalesPrice > 0 ? formValues.oneTimeSalesPrice : 1)) : 0;
      
      // Fiyat önerisi
      const suggestedPrice = formValues.plannedSalesCount > 0 
        ? totalCost / Math.ceil(formValues.plannedSalesCount * scenario.salesMultiplier) * 1.2 // %20 kâr hedefi
        : 0;
      
      return {
        scenarioName: scenario.name,
        scenarioType: scenario.type,
        totalCost,
        totalRevenue,
        profit,
        profitMargin,
        suggestedPrice,
        breakEvenPoint
      };
    });
  }, [formValues]);
  
  // Grafik için veri hazırlama
  const chartData = React.useMemo(() => {
    return scenarioResults.map(result => ({
      name: result.scenarioName,
      maliyet: result.totalCost,
      gelir: result.totalRevenue,
      kar: result.profit > 0 ? result.profit : 0,
      zarar: result.profit < 0 ? Math.abs(result.profit) : 0
    }));
  }, [scenarioResults]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {formValues.scenarios?.map((scenario, index) => (
          <div 
            key={scenario.type} 
            className={`p-4 rounded-lg border-2 ${
              scenario.type === 'optimistic' ? 'bg-blue-50 border-blue-200' : 
              scenario.type === 'pessimistic' ? 'bg-red-50 border-red-200' : 
              'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-medium text-lg ${
                scenario.type === 'optimistic' ? 'text-blue-800' : 
                scenario.type === 'pessimistic' ? 'text-red-800' : 
                'text-green-800'
              }`}>
                {scenario.name} Senaryo
              </h4>
              {scenario.type !== 'normal' && (
                <button 
                  type="button"
                  onClick={() => {
                    setValue(`scenarios.${index}.personnelMultiplier`, 1);
                    setValue(`scenarios.${index}.durationMultiplier`, 1);
                    setValue(`scenarios.${index}.salesMultiplier`, 1);
                    setValue(`scenarios.${index}.expensesMultiplier`, 1);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Sıfırla
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Personel Maliyet Çarpanı
                </label>
                <div className="flex items-center">
                  <input
                    {...register(`scenarios.${index}.personnelMultiplier` as const, { 
                      valueAsNumber: true, 
                      min: 0.5, 
                      max: 2,
                      disabled: scenario.type === 'normal'
                    })}
                    type="number"
                    step="0.1"
                    className="w-full rounded-md border border-gray-300 py-1 px-2 text-sm disabled:bg-gray-100"
                    disabled={scenario.type === 'normal'}
                  />
                  <span className="ml-2 text-sm">{scenario.type === 'optimistic' ? '(Düşük)' : scenario.type === 'pessimistic' ? '(Yüksek)' : ''}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Proje Süresi Çarpanı
                </label>
                <div className="flex items-center">
                  <input
                    {...register(`scenarios.${index}.durationMultiplier` as const, { 
                      valueAsNumber: true, 
                      min: 0.5, 
                      max: 2,
                      disabled: scenario.type === 'normal'
                    })}
                    type="number"
                    step="0.1"
                    className="w-full rounded-md border border-gray-300 py-1 px-2 text-sm disabled:bg-gray-100"
                    disabled={scenario.type === 'normal'}
                  />
                  <span className="ml-2 text-sm">{scenario.type === 'optimistic' ? '(Kısa)' : scenario.type === 'pessimistic' ? '(Uzun)' : ''}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Satış Adedi Çarpanı
                </label>
                <div className="flex items-center">
                  <input
                    {...register(`scenarios.${index}.salesMultiplier` as const, { 
                      valueAsNumber: true, 
                      min: 0.5, 
                      max: 2,
                      disabled: scenario.type === 'normal'
                    })}
                    type="number"
                    step="0.1"
                    className="w-full rounded-md border border-gray-300 py-1 px-2 text-sm disabled:bg-gray-100"
                    disabled={scenario.type === 'normal'}
                  />
                  <span className="ml-2 text-sm">{scenario.type === 'optimistic' ? '(Yüksek)' : scenario.type === 'pessimistic' ? '(Düşük)' : ''}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Giderler Çarpanı
                </label>
                <div className="flex items-center">
                  <input
                    {...register(`scenarios.${index}.expensesMultiplier` as const, { 
                      valueAsNumber: true, 
                      min: 0.5, 
                      max: 2,
                      disabled: scenario.type === 'normal'
                    })}
                    type="number"
                    step="0.1"
                    className="w-full rounded-md border border-gray-300 py-1 px-2 text-sm disabled:bg-gray-100"
                    disabled={scenario.type === 'normal'}
                  />
                  <span className="ml-2 text-sm">{scenario.type === 'optimistic' ? '(Düşük)' : scenario.type === 'pessimistic' ? '(Yüksek)' : ''}</span>
                </div>
              </div>
            </div>
            
            {scenarioResults[index] && (
              <div className={`mt-4 p-3 rounded-lg ${
                scenario.type === 'optimistic' ? 'bg-blue-100' : 
                scenario.type === 'pessimistic' ? 'bg-red-100' : 
                'bg-green-100'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Toplam Maliyet:</span>
                  <span className="text-sm">{formatCurrency(scenarioResults[index].totalCost)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Toplam Gelir:</span>
                  <span className="text-sm">{formatCurrency(scenarioResults[index].totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Kâr/Zarar:</span>
                  <span className={`text-sm font-medium ${scenarioResults[index].profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(scenarioResults[index].profit)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Kâr Marjı:</span>
                  <span className={`text-sm ${scenarioResults[index].profitMargin >= 15 ? 'text-green-700' : scenarioResults[index].profitMargin >= 0 ? 'text-yellow-700' : 'text-red-700'}`}>
                    {formatPercentage(scenarioResults[index].profitMargin)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Önerilen Birim Fiyat:</span>
                  <span className="text-sm font-bold">{formatCurrency(scenarioResults[index].suggestedPrice)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-base text-gray-800 mb-4">Senaryo Karşılaştırması</h4>
        
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : `${value}`} />
              <Legend />
              <Bar dataKey="maliyet" name="Toplam Maliyet" fill="#FF8042" />
              <Bar dataKey="gelir" name="Toplam Gelir" fill="#0088FE" />
              <Bar dataKey="kar" name="Kâr" stackId="a" fill="#82ca9d" />
              <Bar dataKey="zarar" name="Zarar" stackId="a" fill="#d32f2f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Senaryo
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam Maliyet
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam Gelir
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kâr
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kâr Marjı
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Önerilen Birim Satış Fiyatı
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Break-Even (adet)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scenarioResults.map((result, index) => (
                <tr key={index} className={
                  result.scenarioType === 'optimistic' ? 'bg-blue-50' : 
                  result.scenarioType === 'pessimistic' ? 'bg-red-50' : 
                  'bg-green-50'
                }>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.scenarioName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(result.totalCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(result.totalRevenue)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${result.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(result.profit)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                    result.profitMargin >= 15 ? 'text-green-600' : 
                    result.profitMargin >= 0 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {formatPercentage(result.profitMargin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(result.suggestedPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {result.breakEvenPoint}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

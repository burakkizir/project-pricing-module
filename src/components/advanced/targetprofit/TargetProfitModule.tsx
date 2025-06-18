import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '../../ProjectPricingPage';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export const TargetProfitModule: React.FC = () => {
  const { watch, register } = useFormContext<FormData>();
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

  // Toplam maliyet hesaplama
  const totalCost = React.useMemo(() => {
    // Personel maliyeti
    const personnelCost = formValues.personnelItems?.reduce((sum, item) => {
      return sum + (item.monthlySalary * item.count * item.duration);
    }, 0) || 0;
    
    // Teknik maliyetler
    const technicalCost = (formValues.serverCost || 0) + 
                         (formValues.domainCost || 0) + 
                         (formValues.thirdPartyLicenses || 0) + 
                         (formValues.dataStorageCost || 0) + 
                         (formValues.backupCost || 0);
    
    // Yönetim maliyetleri
    const managementCost = (formValues.accountingCost || 0) + 
                          (formValues.officeCost || 0) * (formValues.officeMonths || 0) + 
                          (formValues.hardwareCost || 0);
    
    // Pazarlama maliyetleri
    const marketingCost = (formValues.advertisingBudget || 0) + 
                         (formValues.salesRepCost || 0) + 
                         (formValues.demoCost || 0) + 
                         (formValues.websiteCost || 0);
    
    const subtotal = personnelCost + technicalCost + managementCost + marketingCost;
    const contingency = subtotal * (formValues.contingencyRate || 0) / 100;
    
    return {
      personnelCost,
      technicalCost,
      managementCost,
      marketingCost,
      contingencyCost: contingency,
      total: subtotal + contingency
    };
  }, [formValues]);

  // Hedef kâr hesaplama
  const targetProfitCalculations = React.useMemo(() => {
    const targetProfit = formValues.targetProfit || 0;
    const salesCount = formValues.plannedSalesCount || 1;
    const subscriptionCount = formValues.estimatedUserCount || 1;
    
    // Hedef kârı elde etmek için gereken minimum satış fiyatı
    const requiredPriceForOneTime = (totalCost.total + targetProfit) / salesCount;
    
    // Hedef kârı elde etmek için gereken minimum aylık abonelik ücreti (yıllık)
    const requiredPriceForSubscription = (totalCost.total + targetProfit) / (subscriptionCount * 12);
    
    // Mevcut fiyatlandırma ile elde edilebilecek kâr
    let projectedRevenue = 0;
    if (formValues.salesModel === 'one_time' || formValues.salesModel === 'hybrid') {
      projectedRevenue += (formValues.oneTimeSalesPrice || 0) * salesCount;
    }
    
    if (formValues.salesModel === 'subscription' || formValues.salesModel === 'hybrid') {
      projectedRevenue += (formValues.monthlySubscriptionFee || 0) * subscriptionCount * 12;
    }
    
    const projectedProfit = projectedRevenue - totalCost.total;
    const profitMargin = projectedRevenue > 0 ? (projectedProfit / projectedRevenue) * 100 : 0;
    
    // Mevcut fiyatlarla kâr hedefine ulaşmak için gereken satış adedi
    const requiredSalesCount = formValues.oneTimeSalesPrice > 0 
      ? Math.ceil((totalCost.total + targetProfit) / formValues.oneTimeSalesPrice)
      : 0;
    
    // Mevcut fiyatlarla kâr hedefine ulaşmak için gereken abonelik sayısı
    const requiredSubscriptionCount = formValues.monthlySubscriptionFee > 0
      ? Math.ceil((totalCost.total + targetProfit) / (formValues.monthlySubscriptionFee * 12))
      : 0;
    
    return {
      requiredPriceForOneTime,
      requiredPriceForSubscription,
      projectedProfit,
      profitMargin,
      requiredSalesCount,
      requiredSubscriptionCount,
      targetProfitPercentage: projectedRevenue > 0 ? (targetProfit / projectedRevenue) * 100 : 0
    };
  }, [formValues, totalCost]);

  // Pasta grafik için veri hazırlama
  const pieData = React.useMemo(() => {
    const targetProfit = formValues.targetProfit || 0;
    
    return [
      { name: 'Personel', value: totalCost.personnelCost },
      { name: 'Teknik', value: totalCost.technicalCost },
      { name: 'Yönetim', value: totalCost.managementCost },
      { name: 'Pazarlama', value: totalCost.marketingCost },
      { name: 'Beklenmeyen', value: totalCost.contingencyCost },
      { name: 'Hedef Kâr', value: targetProfit }
    ];
  }, [formValues, totalCost]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#27AE60'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-base text-gray-800 mb-4">Hedef Kâr Ayarları</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hedef Kâr Tutarı
              </label>
              <div className="flex items-center">
                <input
                  {...register('targetProfit', { valueAsNumber: true, min: 0 })}
                  type="number"
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                  min="0"
                  step="1000"
                  placeholder="Hedeflenen kâr tutarını girin"
                />
                <span className="ml-2 text-gray-500">{currencyCode}</span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="font-medium text-sm text-gray-700 mb-2">Maliyet Dağılımı</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span>Personel Maliyeti:</span>
                  <span className="font-medium">{formatCurrency(totalCost.personnelCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Teknik Maliyetler:</span>
                  <span className="font-medium">{formatCurrency(totalCost.technicalCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Yönetim Maliyetleri:</span>
                  <span className="font-medium">{formatCurrency(totalCost.managementCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pazarlama Maliyetleri:</span>
                  <span className="font-medium">{formatCurrency(totalCost.marketingCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Beklenmeyen Giderler:</span>
                  <span className="font-medium">{formatCurrency(totalCost.contingencyCost)}</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                  <span className="font-bold">Toplam Maliyet:</span>
                  <span className="font-bold">{formatCurrency(totalCost.total)}</span>
                </div>
                <div className="border-t border-green-200 mt-2 pt-2 flex justify-between items-center text-green-700">
                  <span className="font-bold">+ Hedef Kâr:</span>
                  <span className="font-bold">{formatCurrency(formValues.targetProfit || 0)}</span>
                </div>
                <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between items-center font-bold text-gray-900">
                  <span>Minimum Gelir İhtiyacı:</span>
                  <span>{formatCurrency(totalCost.total + (formValues.targetProfit || 0))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-base text-gray-800 mb-4">Maliyet ve Kâr Dağılımı</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={(entry) => `${entry.name}: ${formatPercentage(entry.percent * 100)}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-medium text-base text-green-800 mb-4">Hedef Kâra Ulaşmak İçin</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-green-100">
            <h5 className="font-medium text-sm text-gray-700 mb-2">Tek Seferlik Satış Modeli</h5>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Gerekli birim satış fiyatı:</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(targetProfitCalculations.requiredPriceForOneTime)}
                </p>
                <p className="text-xs text-gray-500">
                  (Toplam Maliyet + Hedef Kâr) / Planlanan Satış Adedi
                </p>
              </div>
              
              <div className="border-t border-gray-100 pt-2">
                <p className="text-sm text-gray-500">Mevcut fiyatla ({formatCurrency(formValues.oneTimeSalesPrice || 0)}) gereken minimum satış adedi:</p>
                <p className="text-xl font-bold text-green-700">
                  {targetProfitCalculations.requiredSalesCount} adet
                </p>
                <p className="text-xs text-gray-500">
                  (Toplam Maliyet + Hedef Kâr) / Birim Satış Fiyatı
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-green-100">
            <h5 className="font-medium text-sm text-gray-700 mb-2">Abonelik Modeli</h5>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Gerekli aylık abonelik ücreti:</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(targetProfitCalculations.requiredPriceForSubscription)}
                </p>
                <p className="text-xs text-gray-500">
                  (Toplam Maliyet + Hedef Kâr) / (Tahmini Kullanıcı Sayısı × 12 ay)
                </p>
              </div>
              
              <div className="border-t border-gray-100 pt-2">
                <p className="text-sm text-gray-500">Mevcut abonelikle ({formatCurrency(formValues.monthlySubscriptionFee || 0)}) gereken minimum abone sayısı:</p>
                <p className="text-xl font-bold text-green-700">
                  {targetProfitCalculations.requiredSubscriptionCount} abone
                </p>
                <p className="text-xs text-gray-500">
                  (Toplam Maliyet + Hedef Kâr) / (Aylık Abonelik Ücreti × 12 ay)
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-white rounded-lg border border-green-100">
          <h5 className="font-medium text-sm text-gray-700 mb-3">Mevcut Fiyatlandırma ile Projeksiyon</h5>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Tahmini Gelir:</p>
              <p className="text-lg font-bold text-gray-800">
                {formatCurrency(totalCost.total + targetProfitCalculations.projectedProfit)}
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Tahmini Kâr:</p>
              <p className={`text-lg font-bold ${targetProfitCalculations.projectedProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(targetProfitCalculations.projectedProfit)}
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Kâr Marjı:</p>
              <p className={`text-lg font-bold ${
                targetProfitCalculations.profitMargin >= 20 ? 'text-green-700' :
                targetProfitCalculations.profitMargin >= 0 ? 'text-yellow-600' :
                'text-red-700'
              }`}>
                {formatPercentage(targetProfitCalculations.profitMargin)}
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-sm">
              {targetProfitCalculations.projectedProfit >= formValues.targetProfit ? (
                <span className="text-green-700 font-medium">✓ Mevcut fiyatlandırma ile hedef kâra ulaşılabilir.</span>
              ) : (
                <span className="text-red-700 font-medium">⚠️ Mevcut fiyatlandırma ile hedef kâra ulaşılamaz. Fiyatları artırın veya daha fazla satış yapın.</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

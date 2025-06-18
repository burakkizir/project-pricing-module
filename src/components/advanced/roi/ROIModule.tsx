import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '../../ProjectPricingPage';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export const ROIModule: React.FC = () => {
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
    
    return subtotal + contingency;
  }, [formValues]);

  // Gelir hesaplama
  const totalRevenue = React.useMemo(() => {
    let revenue = 0;
    
    if (formValues.salesModel === 'one_time' || formValues.salesModel === 'hybrid') {
      revenue += (formValues.oneTimeSalesPrice || 0) * (formValues.plannedSalesCount || 0);
    }
    
    if (formValues.salesModel === 'subscription' || formValues.salesModel === 'hybrid') {
      revenue += (formValues.monthlySubscriptionFee || 0) * (formValues.estimatedUserCount || 0) * 12;
    }
    
    return revenue;
  }, [formValues]);

  // Net kâr
  const netProfit = totalRevenue - totalCost;
  
  // ROI hesaplama
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  
  // Aylık kümülatif kâr hesaplama
  const monthlyProfitData = React.useMemo(() => {
    const data = [];
    const duration = formValues.projectDuration || 12;
    let cumulativeRevenue = 0;
    let cumulativeCost = 0;
    let cumulativeProfit = 0;
    let breakEvenMonth = null;
    
    for (let i = 1; i <= duration; i++) {
      // Aylık gelir hesaplama
      let monthlyRevenue = 0;
      if (formValues.salesModel === 'subscription' || formValues.salesModel === 'hybrid') {
        // Abonelik geliri - aylık sabit
        monthlyRevenue += (formValues.monthlySubscriptionFee || 0) * (formValues.estimatedUserCount || 0);
      }
      
      if ((formValues.salesModel === 'one_time' || formValues.salesModel === 'hybrid') && i === duration) {
        // Tek seferlik satışlar - proje sonunda
        monthlyRevenue += (formValues.oneTimeSalesPrice || 0) * (formValues.plannedSalesCount || 0);
      }
      
      // Aylık gider hesaplama (basitleştirilmiş)
      const monthlyCost = totalCost / duration;
      
      cumulativeRevenue += monthlyRevenue;
      cumulativeCost += monthlyCost;
      cumulativeProfit = cumulativeRevenue - cumulativeCost;
      
      // Break-even noktasını bul
      if (breakEvenMonth === null && cumulativeProfit >= 0) {
        breakEvenMonth = i;
      }
      
      data.push({
        month: i,
        revenue: monthlyRevenue,
        cost: monthlyCost,
        profit: monthlyRevenue - monthlyCost,
        cumulativeRevenue,
        cumulativeCost,
        cumulativeProfit
      });
    }
    
    return {
      data,
      breakEvenMonth: breakEvenMonth === null ? 'Yok' : `${breakEvenMonth}. Ay`
    };
  }, [formValues, totalCost]);

  // Amortisman süresi (kümülatif kârın ilk kez pozitif olduğu ay)
  const amortization = monthlyProfitData.breakEvenMonth;
  
  const chartData = monthlyProfitData.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <h4 className="text-blue-800 font-semibold mb-2">Yatırım Geri Dönüşü (ROI)</h4>
          <div className="text-4xl font-bold text-blue-900">
            {formatPercentage(roi)}
          </div>
          <p className="text-sm text-blue-700 mt-2">ROI = (Net Kâr / Toplam Maliyet) × 100</p>
          <div className="mt-4 w-full bg-white bg-opacity-50 rounded p-2">
            <div className="flex justify-between text-sm">
              <span>Toplam Maliyet:</span>
              <span className="font-medium">{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Toplam Gelir:</span>
              <span className="font-medium">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Net Kâr:</span>
              <span className={`font-medium ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-700">
            {roi >= 100 ? '👍 Mükemmel ROI!' : roi >= 50 ? '✓ İyi ROI!' : roi >= 0 ? '⚠️ Düşük ROI!' : '❌ Negatif ROI!'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <h4 className="text-green-800 font-semibold mb-2">Break-Even (Başa Baş) Noktası</h4>
          <div className="text-2xl font-bold text-green-900 mb-2">
            {amortization}
          </div>
          <p className="text-sm text-green-700">İlk pozitif kârın gerçekleştiği ay</p>
          
          <div className="mt-4 w-full bg-white bg-opacity-50 rounded p-2">
            <div className="text-xs text-green-800 mb-1">Sat-Başa Baş Noktası:</div>
            <div className="text-lg font-bold">
              {totalCost > 0 && formValues.oneTimeSalesPrice > 0
                ? Math.ceil(totalCost / formValues.oneTimeSalesPrice)
                : '0'} adet
            </div>
            <div className="text-xs text-green-700 mt-1">
              (Toplam Maliyet / Birim Satış Fiyatı)
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <h4 className="text-purple-800 font-semibold mb-2">Hedef ROI</h4>
          <div className="flex items-center mb-3">
            <input
              {...register('targetROI', { valueAsNumber: true, min: 0, max: 200 })}
              type="number"
              min="0"
              max="200"
              step="5"
              className="w-20 rounded-l-md border border-purple-300 py-2 px-3 text-center text-lg font-bold"
            />
            <span className="bg-purple-200 py-2 px-3 rounded-r-md border border-l-0 border-purple-300 font-bold">%</span>
          </div>
          
          {formValues.targetROI && formValues.targetROI > 0 && (
            <div className="w-full bg-white bg-opacity-60 rounded p-3 text-sm">
              <p className="text-purple-900">
                %{formValues.targetROI} ROI için gereken:
              </p>
              <div className="mt-1 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Minimum Satış Fiyatı:</span>
                  <span className="font-medium">
                    {formatCurrency(totalCost * (1 + formValues.targetROI / 100) / (formValues.plannedSalesCount || 1))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Satış Adedi:</span>
                  <span className="font-medium">
                    {Math.ceil(totalCost * (1 + formValues.targetROI / 100) / (formValues.oneTimeSalesPrice || 1))} adet
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-base text-gray-800 mb-4">Aylara Göre Birikimli Kâr</h4>
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: 'Ay', position: 'insideBottomRight', offset: 0 }} />
              <YAxis label={{ value: `Tutar (${currencyCode})`, angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : `${value}`} />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="cumulativeProfit"
                stroke="#8884d8"
                name="Birikimli Kâr"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="cumulativeRevenue"
                stroke="#82ca9d"
                name="Birikimli Gelir"
              />
              <Line
                type="monotone"
                dataKey="cumulativeCost"
                stroke="#ff7300"
                name="Birikimli Gider"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6">
          <h5 className="font-medium text-sm text-gray-700 mb-2">Aylık Kâr/Zarar Dağılımı</h5>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : `${value}`} />
                <Legend />
                <Bar dataKey="profit" name="Aylık Kâr/Zarar" fill={netProfit >= 0 ? "#82ca9d" : "#ff7373"} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

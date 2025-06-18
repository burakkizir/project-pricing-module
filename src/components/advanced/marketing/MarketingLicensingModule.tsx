import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '../../ProjectPricingPage';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export const MarketingLicensingModule: React.FC = () => {
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

  // Toplam gelir hesaplama
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

  // Pazarlama ve lisanslama maliyet hesaplamaları
  const marketingLicensingCalculations = React.useMemo(() => {
    // Mağaza komisyonu
    const storeCommissionRate = formValues.storeCommissionRate || 0;
    const storeCommissionAmount = totalRevenue * (storeCommissionRate / 100);
    
    // Aylık pazarlama bütçesi
    const monthlyMarketingBudget = formValues.monthlyMarketingBudget || 0;
    const projectDuration = formValues.projectDuration || 12;
    const totalMarketingCost = monthlyMarketingBudget * projectDuration;
    
    // Toplam pazarlama ve lisanslama maliyeti
    const totalMarketingLicensingCost = storeCommissionAmount + totalMarketingCost;
    
    // Net gelir
    const netRevenue = totalRevenue - totalMarketingLicensingCost;
    
    // Müşteri edinme maliyeti (CAC)
    const totalUsers = (formValues.plannedSalesCount || 0) + (formValues.estimatedUserCount || 0);
    const customerAcquisitionCost = totalUsers > 0 ? totalMarketingCost / totalUsers : 0;
    
    // Pazarlama ROI
    const marketingROI = totalMarketingCost > 0 ? ((totalRevenue - totalMarketingCost) / totalMarketingCost) * 100 : 0;
    
    // Aylık gelir ve pazarlama gider dağılımı
    const monthlyRevenue = totalRevenue / projectDuration;
    const monthlyData = Array.from({ length: projectDuration }, (_, i) => {
      return {
        month: i + 1,
        gelir: monthlyRevenue,
        pazarlama: monthlyMarketingBudget,
        komisyon: storeCommissionAmount / projectDuration,
        netGelir: monthlyRevenue - monthlyMarketingBudget - (storeCommissionAmount / projectDuration)
      };
    });
    
    return {
      storeCommissionRate,
      storeCommissionAmount,
      monthlyMarketingBudget,
      totalMarketingCost,
      totalMarketingLicensingCost,
      netRevenue,
      customerAcquisitionCost,
      marketingROI,
      monthlyData
    };
  }, [formValues, totalRevenue]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-base text-gray-800 mb-4">Mağaza Komisyonları ve Pazarlama Bütçesi</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mağaza/Platform Komisyon Oranı (%)
              </label>
              <div className="flex items-center">
                <input
                  {...register('storeCommissionRate', { valueAsNumber: true, min: 0, max: 50 })}
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                  placeholder="Örn: Apple Store %30, Google Play %15"
                />
                <span className="ml-2 text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Bu oran, yazılımınızın dağıtıldığı platform tarafından alınan komisyonu temsil eder (örn: Apple App Store %30, Google Play %15).
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aylık Pazarlama Bütçesi
              </label>
              <div className="flex items-center">
                <input
                  {...register('monthlyMarketingBudget', { valueAsNumber: true, min: 0 })}
                  type="number"
                  min="0"
                  step="1000"
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                />
                <span className="ml-2 text-gray-500">{currencyCode}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Yazılımınızın tanıtımı ve pazarlaması için aylık ayrılan bütçe.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <p className="text-xs text-purple-700">Toplam Pazarlama Bütçesi</p>
                <p className="text-lg font-bold text-purple-900">
                  {formatCurrency(marketingLicensingCalculations.totalMarketingCost)}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {formValues.projectDuration || 12} ay boyunca
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700">Mağaza Komisyonları</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(marketingLicensingCalculations.storeCommissionAmount)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {formatPercentage(marketingLicensingCalculations.storeCommissionRate)} gelirin
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-base text-gray-800 mb-4">Pazarlama Metrikleri</h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-md border border-green-100">
                <p className="text-xs text-gray-500">Brüt Gelir</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-md border border-green-100">
                <p className="text-xs text-gray-500">Net Gelir (Komisyon ve Pazarlama Sonrası)</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(marketingLicensingCalculations.netRevenue)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                <p className="text-xs text-gray-500">Müşteri Edinme Maliyeti (CAC)</p>
                <p className="text-lg font-bold text-blue-700">
                  {formatCurrency(marketingLicensingCalculations.customerAcquisitionCost)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  kişi başı
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                <p className="text-xs text-gray-500">Pazarlama ROI</p>
                <p className={`text-lg font-bold ${
                  marketingLicensingCalculations.marketingROI > 100 ? 'text-green-700' :
                  marketingLicensingCalculations.marketingROI > 0 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {formatPercentage(marketingLicensingCalculations.marketingROI)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  (Gelir - Pazarlama) / Pazarlama
                </p>
              </div>
            </div>
            
            <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Pazarlama + Komisyon Toplam Maliyeti:</span>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(marketingLicensingCalculations.totalMarketingLicensingCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Gelirin Yüzdesi:</span>
                <span className={`text-sm font-medium ${
                  (marketingLicensingCalculations.totalMarketingLicensingCost / totalRevenue) * 100 > 30 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatPercentage((marketingLicensingCalculations.totalMarketingLicensingCost / totalRevenue) * 100)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-base text-gray-800 mb-4">Aylık Gelir ve Gider Dağılımı</h4>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={marketingLicensingCalculations.monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                label={{ value: 'Ay', position: 'insideBottomRight', offset: -5 }} 
              />
              <YAxis
                label={{ value: `Tutar (${currencyCode})`, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="gelir" name="Brüt Gelir" fill="#82ca9d" />
              <Bar dataKey="pazarlama" name="Pazarlama Gideri" fill="#8884d8" />
              <Bar dataKey="komisyon" name="Mağaza Komisyonu" fill="#ffc658" />
              <Bar dataKey="netGelir" name="Net Gelir" fill="#0088fe" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg border border-green-100 mt-6">
          <h5 className="font-medium text-sm text-green-800 mb-2">Pazarlama ve Satış Önerileri</h5>
          
          <div className="space-y-1 text-sm text-gray-700">
            {marketingLicensingCalculations.storeCommissionRate > 0 && (
              <p>
                <span className="font-medium">Mağaza Komisyonları:</span> Platform komisyonu için gelirden %{marketingLicensingCalculations.storeCommissionRate} ayrılmıştır. 
                Direkt satış kanalları kullanarak bu maliyeti azaltmayı değerlendirin.
              </p>
            )}
            
            {marketingLicensingCalculations.monthlyMarketingBudget > 0 && (
              <p>
                <span className="font-medium">Pazarlama Bütçesi:</span> Aylık {formatCurrency(marketingLicensingCalculations.monthlyMarketingBudget)} pazarlama harcaması planlandı.
                {marketingLicensingCalculations.marketingROI > 100 
                  ? ' Pazarlama ROI\'nız oldukça iyi, bütçeyi artırabilirsiniz.' 
                  : marketingLicensingCalculations.marketingROI < 0
                    ? ' Pazarlama ROI\'nız negatif, stratejiyi gözden geçirin.'
                    : ' Pazarlama etkinliğini artırmak için farklı kanalları test edin.'}
              </p>
            )}
            
            {marketingLicensingCalculations.customerAcquisitionCost > 0 && (
              <p>
                <span className="font-medium">Müşteri Edinme Maliyeti (CAC):</span> Kişi başı {formatCurrency(marketingLicensingCalculations.customerAcquisitionCost)} harcıyorsunuz.
                {marketingLicensingCalculations.customerAcquisitionCost > (formValues.oneTimeSalesPrice || 0) * 0.3 && 
                  ' Bu değer satış fiyatınıza göre yüksek, pazarlama verimliliğinizi artırın.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

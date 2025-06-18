import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '../../ProjectPricingPage';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export const DelaySimulationModule: React.FC = () => {
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

  // Personel maliyetlerini hesapla
  const personnelCost = React.useMemo(() => {
    return formValues.personnelItems?.reduce((sum, item) => {
      return sum + (item.monthlySalary * item.count * item.duration);
    }, 0) || 0;
  }, [formValues.personnelItems]);

  // Aylık personel maliyeti
  const monthlyPersonnelCost = React.useMemo(() => {
    // Toplam kişi sayısı
    const totalHeadCount = formValues.personnelItems?.reduce(
      (sum, item) => sum + item.count, 0
    ) || 0;

    // Ortalama aylık personel maliyeti
    const avgMonthlySalary = totalHeadCount > 0 
      ? formValues.personnelItems?.reduce(
          (sum, item) => sum + (item.monthlySalary * item.count), 0
        ) / totalHeadCount || 0
      : 0;
      
    return {
      totalHeadCount,
      avgMonthlySalary,
      totalMonthly: avgMonthlySalary * totalHeadCount
    };
  }, [formValues.personnelItems]);

  // Gecikme etkisi hesaplama
  const delayImpact = React.useMemo(() => {
    const delayMonths = formValues.delayMonths || 0;
    const overtimeRate = formValues.overtimeRate || 0;
    const overtimeFactor = 1 + (overtimeRate / 100);
    
    // Gecikme olmazsa nominal maliyet
    const nominalPersonnelCost = personnelCost;
    
    // Gecikme durumunda ek personel maliyeti - fazla mesai ile
    // Gecikmeyi telafi etme durumu
    const extraMonthlyPersonnelCost = monthlyPersonnelCost.totalMonthly * overtimeFactor;
    
    // Gecikme telafisi için gereken ek süre (ay)
    // Fazla mesai oranına göre telafi hızı belirlenir
    const recoveryMonths = overtimeRate > 0 
      ? Math.ceil(delayMonths / (overtimeRate / 100))
      : delayMonths;
      
    // Telafi maliyeti
    const recoveryCost = extraMonthlyPersonnelCost * recoveryMonths;
    
    // Gecikme yaparak projeyi uzatma durumunda maliyet
    const extendedProjectCost = monthlyPersonnelCost.totalMonthly * delayMonths;
    
    // Sabit maliyetlerin aylık kısmı
    const monthlyFixedCosts = formValues.expenseTypes
      ?.filter(expense => expense.type === 'fixed')
      .reduce((sum, expense) => sum + expense.amount, 0) || 0;
    
    const monthlyFixedCostEstimate = monthlyFixedCosts / (formValues.projectDuration || 12);
    
    // Gecikme yaparak projeyi uzatma durumundaki ek sabit maliyetler
    const extendedFixedCosts = monthlyFixedCostEstimate * delayMonths;
    
    // Fazla mesai ile telafi durumunda ek sabit maliyet yok, normal sürede bitecek
    
    return {
      delayMonths,
      overtimeRate,
      recoveryMonths,
      
      // Fazla mesai ile gecikmeyi telafi etme
      recoveryCost,
      // Proje süresini uzatma
      extendedProjectCost,
      extendedFixedCosts,
      extendedTotalCost: extendedProjectCost + extendedFixedCosts,
      
      // Karşılaştırma
      costDifference: (recoveryCost - (extendedProjectCost + extendedFixedCosts)),
      percentageIncrease: {
        recovery: (recoveryCost / personnelCost) * 100 - 100,
        extended: ((extendedProjectCost + extendedFixedCosts) / personnelCost) * 100 - 100
      }
    };
  }, [
    formValues.delayMonths, 
    formValues.overtimeRate, 
    formValues.expenseTypes,
    formValues.projectDuration,
    personnelCost, 
    monthlyPersonnelCost.totalMonthly
  ]);

  // Grafik verileri
  const chartData = React.useMemo(() => {
    // Gecikme süresi aylara göre maliyet grafiği
    const data = [];
    const maxDelay = 6; // Maksimum 6 aya kadar hesapla
    
    for (let i = 0; i <= maxDelay; i++) {
      const overtimeRate = formValues.overtimeRate || 0;
      const overtimeFactor = 1 + (overtimeRate / 100);
      
      // Gecikmeyi telafi için gereken ek süre
      const recoveryMonths = overtimeRate > 0 
        ? Math.ceil(i / (overtimeRate / 100))
        : i;
        
      // Telafi maliyeti
      const recoveryCost = monthlyPersonnelCost.totalMonthly * overtimeFactor * recoveryMonths;
      
      // Gecikme yaparak projeyi uzatma durumunda maliyet
      const extendedProjectCost = monthlyPersonnelCost.totalMonthly * i;
      
      // Sabit maliyetlerin aylık kısmı
      const monthlyFixedCosts = formValues.expenseTypes
        ?.filter(expense => expense.type === 'fixed')
        .reduce((sum, expense) => sum + expense.amount, 0) || 0;
      
      const monthlyFixedCostEstimate = monthlyFixedCosts / (formValues.projectDuration || 12);
      
      // Gecikme yaparak projeyi uzatma durumundaki ek sabit maliyetler
      const extendedFixedCosts = monthlyFixedCostEstimate * i;
      
      data.push({
        months: i,
        fazlaMesai: recoveryCost,
        projeUzatma: extendedProjectCost + extendedFixedCosts
      });
    }
    
    return data;
  }, [
    formValues.overtimeRate, 
    formValues.projectDuration, 
    formValues.expenseTypes, 
    monthlyPersonnelCost.totalMonthly
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-base text-gray-800 mb-4">Gecikme Parametreleri</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahmini Gecikme Süresi (Ay)
              </label>
              <div className="flex items-center">
                <input
                  {...register('delayMonths', { valueAsNumber: true, min: 0 })}
                  type="number"
                  min="0"
                  step="1"
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                />
                <span className="ml-2 text-gray-500">ay</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fazla Mesai Oranı (%)
              </label>
              <div className="flex items-center">
                <input
                  {...register('overtimeRate', { valueAsNumber: true, min: 0, max: 100 })}
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-2 font-medium w-8 text-right">
                  {formValues.overtimeRate || 0}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Bu oran, gecikmeyi telafi etmek için personelin fazla mesai yapma düzeyini gösterir. 
                %0: Fazla mesai yok, %100: Zamanın iki katı (2x) çalışma.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
              <h5 className="font-medium text-sm text-blue-800 mb-2">Personel Durumu</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Toplam Personel:</span>
                  <p className="font-medium">{monthlyPersonnelCost.totalHeadCount} kişi</p>
                </div>
                <div>
                  <span className="text-gray-600">Aylık Personel Maliyeti:</span>
                  <p className="font-medium">{formatCurrency(monthlyPersonnelCost.totalMonthly)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-base text-gray-800 mb-4">Gecikme Analizi</h4>
          
          <div className="space-y-4">
            {delayImpact.delayMonths > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                    <h5 className="text-sm font-medium text-yellow-800 mb-1">1. Senaryo: Fazla Mesai</h5>
                    <p className="text-xs text-gray-600 mb-2">
                      {formValues.overtimeRate || 0}% oranında fazla mesai ile gecikmeyi telafi
                    </p>
                    {formValues.overtimeRate && formValues.overtimeRate > 0 ? (
                      <>
                        <div className="text-sm">
                          <p>Telafi süresi: <span className="font-medium">{delayImpact.recoveryMonths} ay</span></p>
                          <p>Ek Maliyet: <span className="font-medium text-red-600">{formatCurrency(delayImpact.recoveryCost)}</span></p>
                          <p>Artış: <span className="font-medium text-red-600">%{delayImpact.percentageIncrease.recovery.toFixed(1)}</span></p>
                        </div>
                      </>
                    ) : (
                      <p className="italic text-sm text-gray-500">Fazla mesai ayarlanmadı</p>
                    )}
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                    <h5 className="text-sm font-medium text-blue-800 mb-1">2. Senaryo: Proje Uzatma</h5>
                    <p className="text-xs text-gray-600 mb-2">
                      Projeyi {delayImpact.delayMonths} ay uzatarak tamamla
                    </p>
                    <div className="text-sm">
                      <p>Ek Personel: <span className="font-medium">{formatCurrency(delayImpact.extendedProjectCost)}</span></p>
                      <p>Ek Sabit Gider: <span className="font-medium">{formatCurrency(delayImpact.extendedFixedCosts)}</span></p>
                      <p>Toplam Ek: <span className="font-medium text-red-600">{formatCurrency(delayImpact.extendedTotalCost)}</span></p>
                      <p>Artış: <span className="font-medium text-red-600">%{delayImpact.percentageIncrease.extended.toFixed(1)}</span></p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-md bg-gray-50 border border-gray-200">
                  <h5 className="font-medium text-sm text-gray-700 mb-2">Karşılaştırma</h5>
                  
                  {delayImpact.costDifference > 0 ? (
                    <div className="text-sm">
                      <p>Proje uzatma seçeneği <span className="font-medium text-green-600">{formatCurrency(Math.abs(delayImpact.costDifference))}</span> daha ekonomik.</p>
                      <p className="mt-1 italic text-xs text-gray-500">
                        Öneri: Gecikmeyi kabul ederek projeyi uzatmak daha ekonomik olacaktır.
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <p>Fazla mesai seçeneği <span className="font-medium text-green-600">{formatCurrency(Math.abs(delayImpact.costDifference))}</span> daha ekonomik.</p>
                      <p className="mt-1 italic text-xs text-gray-500">
                        Öneri: Fazla mesai yaparak projeyi zamanında tamamlamak daha ekonomik olacaktır.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-center text-gray-500">
                <div>
                  <p>Gecikme süresi girilmemiş.</p>
                  <p className="text-sm mt-1">Lütfen tahmini gecikme süresini ay olarak belirtin.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-base text-gray-800 mb-4">Gecikme Maliyeti Grafiği</h4>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="months" 
                label={{ value: 'Gecikme (Ay)', position: 'insideBottomRight', offset: -5 }} 
              />
              <YAxis
                label={{ value: `Ek Maliyet (${currencyCode})`, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="fazlaMesai"
                name="Fazla Mesai ile Telafi"
                stroke="#8884d8"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="projeUzatma"
                name="Proje Süresini Uzatma"
                stroke="#82ca9d"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>
            <strong>Fazla mesai ile telafi:</strong> Gecikmeyi telafi etmek için ekibin fazla mesai yapması durumunda oluşacak ek maliyeti gösterir.
            Proje zamanında tamamlanır, ancak personel maliyeti artar.
          </p>
          <p className="mt-1">
            <strong>Proje süresini uzatma:</strong> Projenin gecikmesine izin verilerek tamamlama süresinin uzatılması durumunda oluşacak ek maliyeti gösterir.
            Bu senaryoda hem personel hem de sabit giderlerin proje uzadıkça artması hesaplanır.
          </p>
        </div>
      </div>
    </div>
  );
};

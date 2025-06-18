import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData, CurrencyCode } from '../../ProjectPricingPage';

interface CurrencyDisplay {
  code: CurrencyCode;
  name: string;
  symbol: string;
}

export const CurrencyRatesModule: React.FC = () => {
  const { watch, register, setValue } = useFormContext<FormData>();
  
  const formValues = watch();
  const currencyCode = watch('currencyCode');
  const language = watch('language');
  
  const currencies: CurrencyDisplay[] = [
    { code: 'TRY', name: 'Türk Lirası', symbol: '₺' },
    { code: 'USD', name: 'Amerikan Doları', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'İngiliz Sterlini', symbol: '£' }
  ];
  
  // Varsayılan kur oranları
  React.useEffect(() => {
    if (!formValues.currencyRates || formValues.currencyRates.length === 0) {
      setValue('currencyRates', [
        { code: 'TRY', rate: 1 },
        { code: 'USD', rate: 30.5 },
        { code: 'EUR', rate: 33.2 },
        { code: 'GBP', rate: 39.1 }
      ]);
      
      if (!formValues.currencyRiskRate) {
        setValue('currencyRiskRate', 10);
      }
    }
  }, [setValue, formValues.currencyRates, formValues.currencyRiskRate]);
  
  // Toplam maliyeti hesapla
  const totalCost = React.useMemo(() => {
    let total = 0;
    
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
    
    total = subtotal + contingency;
    return total;
  }, [formValues]);
  
  // Kur riski etkisini hesapla
  const currencyRiskImpact = React.useMemo(() => {
    const riskRate = formValues.currencyRiskRate || 10;
    return totalCost * (riskRate / 100);
  }, [totalCost, formValues.currencyRiskRate]);
  
  // Para birimi formatı için yardımcı fonksiyon
  const formatCurrency = (value: number, code: CurrencyCode): string => {
    const localeMap: Record<string, string> = {
      'tr': 'tr-TR',
      'en': 'en-US'
    };
    
    const locale = localeMap[language] || 'tr-TR';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-base text-gray-800 mb-4">Döviz Kurları</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {formValues.currencyRates?.map((currency, index) => (
            <div key={currency.code} className="space-y-2 p-3 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{currencies.find(c => c.code === currency.code)?.name}</span>
                <span className="text-lg font-bold">{currencies.find(c => c.code === currency.code)?.symbol}</span>
              </div>
              <label className="block text-sm font-medium text-gray-700">
                {currency.code} / TL Kuru
              </label>
              <div className="flex items-center">
                <span className="mr-2">1 {currency.code} =</span>
                <input
                  {...register(`currencyRates.${index}.rate` as const, { 
                    valueAsNumber: true, 
                    min: currency.code === 'TRY' ? 1 : 0.01,
                    disabled: currency.code === 'TRY'
                  })}
                  type="number"
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 py-2 px-3 disabled:bg-gray-100 disabled:text-gray-500"
                  disabled={currency.code === 'TRY'}
                />
                <span className="ml-2">TL</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kur Riski Simülasyonu (%)
            </label>
            <div className="flex items-center">
              <input
                {...register('currencyRiskRate', { valueAsNumber: true, min: 0, max: 100 })}
                type="range"
                min="0"
                max="100"
                step="1"
                className="w-full md:w-1/2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="ml-2 font-medium">
                {formValues.currencyRiskRate || 0}%
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-base text-yellow-700 mb-2">Kur Riski Analizi</h4>
            <p className="text-yellow-800">
              %{formValues.currencyRiskRate || 0} kur artışı durumunda, toplam maliyette 
              <span className="font-bold ml-1">{formatCurrency(currencyRiskImpact, currencyCode)}</span> artış olacaktır.
            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border border-yellow-100">
                <p className="text-sm text-gray-700">Mevcut Toplam Maliyet:</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalCost, currencyCode)}</p>
              </div>
              <div className="bg-white p-3 rounded border border-yellow-100">
                <p className="text-sm text-gray-700">Kur Artışı Sonrası Maliyet:</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalCost + currencyRiskImpact, currencyCode)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h5 className="font-medium text-base text-gray-700 mb-2">Harcama Çevirici</h5>
        <p className="text-sm text-gray-500 mb-4">
          Farklı para birimlerindeki tutarları TL'ye çevirebilirsiniz.
        </p>
        
        <div className="flex flex-wrap gap-4">
          {currencies.filter(c => c.code !== 'TRY').map((currency) => {
            const rate = formValues.currencyRates?.find(c => c.code === currency.code)?.rate || 1;
            return (
              <div key={`converter-${currency.code}`} className="flex-1 min-w-[180px] p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700">1.000 {currency.symbol}</p>
                <p className="text-lg font-bold text-gray-900">= {formatCurrency(1000 * rate, 'TRY')}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

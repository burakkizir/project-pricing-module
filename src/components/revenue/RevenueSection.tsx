import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData, SalesModel } from '../ProjectPricingPage';

export const RevenueSection: React.FC = () => {
  const { register, watch } = useFormContext<FormData>();
  const salesModel = watch('salesModel');

  const salesModelOptions: Array<{ value: SalesModel; label: string }> = [
    { value: 'one_time', label: 'Tek Seferlik' },
    { value: 'subscription', label: 'Aylık Abonelik' },
    { value: 'hybrid', label: 'Hibrit (Tek Seferlik + Abonelik)' },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-medium text-base sm:text-lg text-gray-900">Gelir Unsurları</h3>
      
      <div>
        <label htmlFor="salesModel" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Satış Modeli
        </label>
        <select
          {...register('salesModel')}
          id="salesModel"
          className="w-full rounded-md border border-gray-300 py-1.5 sm:py-2 px-2 sm:px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          {salesModelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {(salesModel === 'one_time' || salesModel === 'hybrid') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="oneTimeSalesPrice" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Tek Seferlik Satış Fiyatı (₺)
            </label>
            <input
              {...register('oneTimeSalesPrice', { valueAsNumber: true, min: 0 })}
              id="oneTimeSalesPrice"
              type="number"
              className="w-full rounded-md border border-gray-300 py-1.5 sm:py-2 px-2 sm:px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="plannedSalesCount" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Planlanan Satış Adedi
            </label>
            <input
              {...register('plannedSalesCount', { valueAsNumber: true, min: 0 })}
              id="plannedSalesCount"
              type="number"
              className="w-full rounded-md border border-gray-300 py-1.5 sm:py-2 px-2 sm:px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      )}
      
      {(salesModel === 'subscription' || salesModel === 'hybrid') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="monthlySubscriptionFee" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Aylık Abonelik Ücreti (₺)
            </label>
            <input
              {...register('monthlySubscriptionFee', { valueAsNumber: true, min: 0 })}
              id="monthlySubscriptionFee"
              type="number"
              className="w-full rounded-md border border-gray-300 py-1.5 sm:py-2 px-2 sm:px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="estimatedUserCount" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Tahmini Kullanıcı Sayısı
            </label>
            <input
              {...register('estimatedUserCount', { valueAsNumber: true, min: 0 })}
              id="estimatedUserCount"
              type="number"
              className="w-full rounded-md border border-gray-300 py-1.5 sm:py-2 px-2 sm:px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="supportRevenue" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Bakım / Destek Geliri (₺)
          </label>
          <input
            {...register('supportRevenue', { valueAsNumber: true, min: 0 })}
            id="supportRevenue"
            type="number"
            className="w-full rounded-md border border-gray-300 py-1.5 sm:py-2 px-2 sm:px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm"
          />
          <p className="mt-0.5 sm:mt-1 text-xs text-gray-500">
            Bu, yıllık toplam destek geliridir.
          </p>
        </div>
        
        <div>
          <label htmlFor="vatRate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            KDV Oranı (%)
          </label>
          <input
            {...register('vatRate', { valueAsNumber: true, min: 0, max: 100 })}
            id="vatRate"
            type="number"
            className="w-full rounded-md border border-gray-300 py-1.5 sm:py-2 px-2 sm:px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

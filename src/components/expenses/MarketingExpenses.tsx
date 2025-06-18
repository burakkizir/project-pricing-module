import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '../ProjectPricingPage';

export const MarketingExpenses: React.FC = () => {
  const { register } = useFormContext<FormData>();

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg text-gray-900">4. Pazarlama ve Satış Giderleri</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="advertisingBudget" className="block text-sm font-medium text-gray-700 mb-1">
            Reklam Bütçesi (₺)
          </label>
          <input
            {...register('advertisingBudget', { valueAsNumber: true, min: 0 })}
            id="advertisingBudget"
            type="number"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="salesRepCost" className="block text-sm font-medium text-gray-700 mb-1">
            Satış Temsilcisi Maliyeti (₺)
          </label>
          <input
            {...register('salesRepCost', { valueAsNumber: true, min: 0 })}
            id="salesRepCost"
            type="number"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="demoCost" className="block text-sm font-medium text-gray-700 mb-1">
            Demo / Sunum Hazırlığı (₺)
          </label>
          <input
            {...register('demoCost', { valueAsNumber: true, min: 0 })}
            id="demoCost"
            type="number"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="websiteCost" className="block text-sm font-medium text-gray-700 mb-1">
            Web Sitesi / Tanıtım Sayfası Gideri (₺)
          </label>
          <input
            {...register('websiteCost', { valueAsNumber: true, min: 0 })}
            id="websiteCost"
            type="number"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '../ProjectPricingPage';

export const ManagementExpenses: React.FC = () => {
  const { register } = useFormContext<FormData>();

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg text-gray-900">3. Yönetim ve Operasyonel Giderler</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="accountingCost" className="block text-sm font-medium text-gray-700 mb-1">
            Muhasebe / Danışmanlık (₺)
          </label>
          <input
            {...register('accountingCost', { valueAsNumber: true, min: 0 })}
            id="accountingCost"
            type="number"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="officeCost" className="block text-sm font-medium text-gray-700 mb-1">
            Aylık Ofis Kirası / Enerji Gideri (₺)
          </label>
          <input
            {...register('officeCost', { valueAsNumber: true, min: 0 })}
            id="officeCost"
            type="number"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="officeMonths" className="block text-sm font-medium text-gray-700 mb-1">
            Ofis Kullanım Süresi (ay)
          </label>
          <input
            {...register('officeMonths', { valueAsNumber: true, min: 1 })}
            id="officeMonths"
            type="number"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="hardwareCost" className="block text-sm font-medium text-gray-700 mb-1">
            Donanım Giderleri (Tek Seferlik) (₺)
          </label>
          <input
            {...register('hardwareCost', { valueAsNumber: true, min: 0 })}
            id="hardwareCost"
            type="number"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};

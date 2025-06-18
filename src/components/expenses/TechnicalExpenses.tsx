import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '../ProjectPricingPage';

export const TechnicalExpenses: React.FC = () => {
  const { register } = useFormContext<FormData>();

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg text-gray-900">2. Teknik Giderler</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="serverCost" className="block text-sm font-medium text-gray-700 mb-1">
            Sunucu / Hosting (₺)
          </label>
          <input
            {...register('serverCost', { valueAsNumber: true, min: 0 })}
            id="serverCost"
            type="number"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="domainCost" className="block text-sm font-medium text-gray-700 mb-1">
            Domain / SSL (₺)
          </label>
          <input
            {...register('domainCost', { valueAsNumber: true, min: 0 })}
            id="domainCost"
            type="number"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="thirdPartyLicenses" className="block text-sm font-medium text-gray-700 mb-1">
            3. Parti API / Lisanslar (₺)
          </label>
          <input
            {...register('thirdPartyLicenses', { valueAsNumber: true, min: 0 })}
            id="thirdPartyLicenses"
            type="number"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="dataStorageCost" className="block text-sm font-medium text-gray-700 mb-1">
            Veri Depolama Maliyeti (₺)
          </label>
          <input
            {...register('dataStorageCost', { valueAsNumber: true, min: 0 })}
            id="dataStorageCost"
            type="number"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="backupCost" className="block text-sm font-medium text-gray-700 mb-1">
            Backup / İzleme Hizmetleri (₺)
          </label>
          <input
            {...register('backupCost', { valueAsNumber: true, min: 0 })}
            id="backupCost"
            type="number"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};

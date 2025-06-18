import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '../ProjectPricingPage';

export const ExtraExpenses: React.FC = () => {
  const { register } = useFormContext<FormData>();

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg text-gray-900">5. Ekstra / Risk Payı</h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="contingencyRate" className="block text-sm font-medium text-gray-700 mb-1">
            Beklenmeyen Gider Oranı (%)
          </label>
          <div className="flex items-center">
            <input
              {...register('contingencyRate', { valueAsNumber: true, min: 0, max: 100 })}
              id="contingencyRate"
              type="number"
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
            <span className="ml-2 text-sm text-gray-500">Toplam giderlerin belirtilen yüzdesi kadar</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Beklenmeyen durumlar için projenin %5-10'u kadar bir pay ayrılması tavsiye edilir.
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { CurrencyCode, FormData } from '../ProjectPricingPage';

// Para birimi seçenekleri
const currencyOptions: Array<{ value: CurrencyCode; label: string; symbol: string }> = [
  { value: 'TRY', label: 'Türk Lirası', symbol: '₺' },
  { value: 'USD', label: 'ABD Doları', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'İngiliz Sterlini', symbol: '£' }
];

// Dil seçenekleri
const languageOptions = [
  { value: 'tr', label: 'Türkçe' },
  { value: 'en', label: 'English' }
];

export const CurrencySettings: React.FC = () => {
  const { register } = useFormContext<FormData>();

  return (
    <div className="bg-white p-4 rounded-lg border-2 border-blue-100 shadow mb-4">
      <h3 className="font-medium text-lg text-gray-900 mb-3">Para Birimi ve Dil Ayarları</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="currencyCode" className="block text-sm font-medium text-gray-700 mb-1">
            Para Birimi
          </label>
          <select
            {...register('currencyCode')}
            id="currencyCode"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            {currencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.symbol})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            Dil
          </label>
          <select
            {...register('language')}
            id="language"
            className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

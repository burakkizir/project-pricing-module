import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormData, PersonnelItem, Role } from '../ProjectPricingPage';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export const PersonnelExpenses: React.FC = () => {
  const { control, register } = useFormContext<FormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'personnelItems',
  });

  const roleOptions: Array<{ value: Role; label: string }> = [
    { value: 'developer', label: 'Yazılımcı' },
    { value: 'ui_ux', label: 'UI/UX' },
    { value: 'tester', label: 'Testçi' },
    { value: 'pm', label: 'PM' },
    { value: 'devops', label: 'DevOps' },
    { value: 'other', label: 'Diğer' },
  ];

  const addPersonnel = () => {
    append({
      id: `personnel-${Date.now()}`,
      role: 'developer',
      monthlySalary: 20000,
      count: 1,
      duration: 3,
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-medium text-base sm:text-lg text-gray-900">1. Personel Giderleri</h3>
      <div className="space-y-3 sm:space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4 bg-white p-3 sm:p-4 rounded shadow-sm">
            <div>
              <label htmlFor={`personnelItems.${index}.role`} className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                {...register(`personnelItems.${index}.role` as const)}
                id={`personnelItems.${index}.role`}
                className="w-full rounded-md border border-gray-300 py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`personnelItems.${index}.monthlySalary`} className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Maaş (₺)
              </label>
              <input
                {...register(`personnelItems.${index}.monthlySalary` as const, {
                  valueAsNumber: true,
                  min: 0,
                })}
                id={`personnelItems.${index}.monthlySalary`}
                type="number"
                className="w-full rounded-md border border-gray-300 py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor={`personnelItems.${index}.count`} className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Kişi
              </label>
              <input
                {...register(`personnelItems.${index}.count` as const, {
                  valueAsNumber: true,
                  min: 1,
                })}
                id={`personnelItems.${index}.count`}
                type="number"
                className="w-full rounded-md border border-gray-300 py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor={`personnelItems.${index}.duration`} className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Süre (ay)
              </label>
              <input
                {...register(`personnelItems.${index}.duration` as const, {
                  valueAsNumber: true,
                  min: 1,
                })}
                id={`personnelItems.${index}.duration`}
                type="number"
                className="w-full rounded-md border border-gray-300 py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center justify-end sm:justify-start sm:items-end mt-2 sm:mt-0">
              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded-md bg-red-50 p-1.5 sm:p-2 text-red-600 hover:bg-red-100 focus:outline-none"
              >
                <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div>
        <button
          type="button"
          onClick={addPersonnel}
          className="flex items-center rounded-md bg-blue-50 py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none"
        >
          <PlusIcon className="mr-2 h-5 w-5" />
          Personel Ekle
        </button>
      </div>
    </div>
  );
};

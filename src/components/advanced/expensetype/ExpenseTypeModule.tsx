import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '../../ProjectPricingPage';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

type ExpenseType = 'fixed' | 'variable';

interface ExpenseItem {
  name: string;
  amount: number;
  type: ExpenseType;
}

export const ExpenseTypeModule: React.FC = () => {
  // FormData interface'i artık expenseTypes dizisini içeriyor
const { watch, setValue } = useFormContext<FormData>();
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

  // Varsayılan gider tiplerini ayarla
  React.useEffect(() => {
    if (!formValues.expenseTypes || formValues.expenseTypes.length === 0) {
      setValue('expenseTypes', [
        // Personel giderleri varsayılan olarak değişken
        ...formValues.personnelItems?.map(item => ({
          name: `${item.role} (${item.count} kişi)`,
          amount: item.monthlySalary * item.count * item.duration,
          type: 'variable' as ExpenseType
        })) || [],
        
        // Teknik giderler
        { name: 'Server Maliyeti', amount: formValues.serverCost || 0, type: 'fixed' as ExpenseType },
        { name: 'Domain Maliyeti', amount: formValues.domainCost || 0, type: 'fixed' as ExpenseType },
        { name: '3. Parti Lisanslar', amount: formValues.thirdPartyLicenses || 0, type: 'fixed' as ExpenseType },
        { name: 'Veri Depolama', amount: formValues.dataStorageCost || 0, type: 'variable' as ExpenseType },
        { name: 'Yedekleme', amount: formValues.backupCost || 0, type: 'variable' as ExpenseType },
        
        // Yönetim giderleri
        { name: 'Muhasebe', amount: formValues.accountingCost || 0, type: 'fixed' as ExpenseType },
        { name: 'Ofis Maliyeti', amount: (formValues.officeCost || 0) * (formValues.officeMonths || 0), type: 'fixed' as ExpenseType },
        { name: 'Donanım', amount: formValues.hardwareCost || 0, type: 'fixed' as ExpenseType },
        
        // Pazarlama giderleri
        { name: 'Reklam Bütçesi', amount: formValues.advertisingBudget || 0, type: 'variable' as ExpenseType },
        { name: 'Satış Temsilcisi', amount: formValues.salesRepCost || 0, type: 'variable' as ExpenseType },
        { name: 'Demo Maliyeti', amount: formValues.demoCost || 0, type: 'fixed' as ExpenseType },
        { name: 'Web Sitesi', amount: formValues.websiteCost || 0, type: 'fixed' as ExpenseType },
        
        // Beklenmeyen giderler
        { 
          name: 'Beklenmeyen Giderler', 
          amount: (
            (formValues.personnelItems?.reduce((sum, item) => sum + item.monthlySalary * item.count * item.duration, 0) || 0) +
            (formValues.serverCost || 0) + 
            (formValues.domainCost || 0) + 
            (formValues.thirdPartyLicenses || 0) + 
            (formValues.dataStorageCost || 0) + 
            (formValues.backupCost || 0) +
            (formValues.accountingCost || 0) + 
            (formValues.officeCost || 0) * (formValues.officeMonths || 0) + 
            (formValues.hardwareCost || 0) +
            (formValues.advertisingBudget || 0) + 
            (formValues.salesRepCost || 0) + 
            (formValues.demoCost || 0) + 
            (formValues.websiteCost || 0)
          ) * (formValues.contingencyRate || 0) / 100,
          type: 'variable' as ExpenseType
        }
      ]);
    }
  }, [setValue, formValues]);

  // Gider tipleri bazında toplam hesapla
  const expenseSummary = React.useMemo(() => {
    if (!formValues.expenseTypes) return { fixed: 0, variable: 0, total: 0, fixedPercentage: 0, variablePercentage: 0 };
    
    const fixed = formValues.expenseTypes
      .filter((expense: ExpenseItem) => expense.type === 'fixed')
      .reduce((sum: number, expense: ExpenseItem) => sum + expense.amount, 0);
      
    const variable = formValues.expenseTypes
      .filter((expense: ExpenseItem) => expense.type === 'variable')
      .reduce((sum: number, expense: ExpenseItem) => sum + expense.amount, 0);
      
    const total = fixed + variable;
    return {
      fixed,
      variable,
      total,
      fixedPercentage: total > 0 ? (fixed / total) * 100 : 0,
      variablePercentage: total > 0 ? (variable / total) * 100 : 0
    };
  }, [formValues.expenseTypes]);

  // PieChart için veri
  const pieData = [
    { name: 'Sabit Giderler', value: expenseSummary.fixed },
    { name: 'Değişken Giderler', value: expenseSummary.variable }
  ];

  const COLORS = ['#0088FE', '#00C49F'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-base text-gray-800 mb-4">Sabit ve Değişken Giderler</h4>
            
            <div className="flex space-x-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg flex-1 border border-blue-100">
                <p className="text-xs text-gray-500 mb-1">Sabit Giderler</p>
                <p className="text-xl font-bold text-blue-700">
                  {formatCurrency(expenseSummary.fixed)}
                </p>
                <p className="text-sm text-blue-500 mt-1">
                  {expenseSummary.fixedPercentage?.toFixed(1) || '0.0'}% toplam giderin
                </p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg flex-1 border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Değişken Giderler</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(expenseSummary.variable)}
                </p>
                <p className="text-sm text-green-500 mt-1">
                  {expenseSummary.variablePercentage?.toFixed(1) || '0.0'}% toplam giderin
                </p>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 overflow-y-auto max-h-[500px]">
          <h4 className="font-medium text-base text-gray-800 mb-4">Gider Sınıflandırma</h4>
          <p className="text-sm text-gray-500 mb-4">
            Her gider kalemini uygun şekilde sınıflandırın. Sabit giderler satış hacmine göre değişmez, 
            değişken giderler ise satış hacmine bağlı olarak değişir.
          </p>
          
          <div className="space-y-3">
            {formValues.expenseTypes?.map((expense: ExpenseItem, index: number) => (
              <div 
                key={index} 
                className="p-3 border rounded-lg flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-800">{expense.name}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(expense.amount)}</p>
                </div>
                
                <div className="flex items-center space-x-1">
                  <label className={`
                    px-3 py-1 rounded-l-md flex items-center justify-center cursor-pointer text-sm
                    ${expense.type === 'fixed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}
                  `}>
                    <input
                      type="radio"
                      className="sr-only"
                      value="fixed"
                      checked={expense.type === 'fixed'}
                      onChange={() => {
                        const newExpenseTypes = [...(formValues.expenseTypes || [])];
                        if (newExpenseTypes[index]) newExpenseTypes[index].type = 'fixed';
                        setValue('expenseTypes', newExpenseTypes as any);
                      }}
                    />
                    <span>Sabit</span>
                  </label>
                  
                  <label className={`
                    px-3 py-1 rounded-r-md flex items-center justify-center cursor-pointer text-sm
                    ${expense.type === 'variable' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                  `}>
                    <input
                      type="radio"
                      className="sr-only"
                      value="variable"
                      checked={expense.type === 'variable'}
                      onChange={() => {
                        const newExpenseTypes = [...(formValues.expenseTypes || [])];
                        if (newExpenseTypes[index]) newExpenseTypes[index].type = 'variable';
                        setValue('expenseTypes', newExpenseTypes as any);
                      }}
                    />
                    <span>Değişken</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h5 className="font-medium text-base text-gray-800 mb-2">Sabit ve Değişken Giderler Hakkında</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h6 className="font-medium text-blue-700">Sabit Giderler</h6>
            <p className="text-gray-600 mt-1">
              Sabit giderler, üretim veya satış miktarından bağımsız olarak aynı kalan giderlerdir. 
              Örneğin: kira, sigorta, lisans ücretleri, sabit maaşlar vb.
            </p>
          </div>
          
          <div>
            <h6 className="font-medium text-green-700">Değişken Giderler</h6>
            <p className="text-gray-600 mt-1">
              Değişken giderler, üretim veya satış miktarına bağlı olarak değişen giderlerdir. 
              Örneğin: hammadde, komisyonlar, üretime bağlı personel maliyetleri vb.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

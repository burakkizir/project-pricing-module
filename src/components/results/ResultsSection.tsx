import React, { useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CurrencyCode, FormData } from '../ProjectPricingPage';

interface ResultsSectionProps {
  results: {
    personnelCost: number;
    technicalCost: number;
    managementCost: number;
    marketingCost: number;
    contingencyCost: number;
    totalCost: number;
    totalRevenue: number;
    profit: number;
    profitMargin: number;
    breakEvenSales: number;
    suggestedPriceWithVat: number;
    expenseBreakdown: {
      personnel: number;
      technical: number;
      management: number;
      marketing: number;
      contingency: number;
    };
  };
  currencyCode: CurrencyCode;
  language: string;
  formData: FormData; // PDF, Excel ve sunum için ihtiyaç duyulan tüm form verisi
}

// Helper function to format currency
const formatCurrency = (value: number, currencyCode: CurrencyCode, language: string): string => {
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

// Helper function to format percentage
const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

export const ResultsSection: React.FC<ResultsSectionProps> = ({ results, currencyCode, language, formData }) => {
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Data for pie chart
  const pieChartData = [
    { name: 'Personel', value: results.expenseBreakdown.personnel },
    { name: 'Teknik', value: results.expenseBreakdown.technical },
    { name: 'Yönetim', value: results.expenseBreakdown.management },
    { name: 'Pazarlama', value: results.expenseBreakdown.marketing },
    { name: 'Risk Payı', value: results.expenseBreakdown.contingency },
  ];

  // COLORS for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Data for line chart
  const lineChartData = [
    { name: '1. Ay', gider: results.totalCost / 12, gelir: results.totalRevenue / 12 },
    { name: '2. Ay', gider: (results.totalCost / 12) * 2, gelir: (results.totalRevenue / 12) * 2 },
    { name: '3. Ay', gider: (results.totalCost / 12) * 3, gelir: (results.totalRevenue / 12) * 3 },
    { name: '4. Ay', gider: (results.totalCost / 12) * 4, gelir: (results.totalRevenue / 12) * 4 },
    { name: '5. Ay', gider: (results.totalCost / 12) * 5, gelir: (results.totalRevenue / 12) * 5 },
    { name: '6. Ay', gider: (results.totalCost / 12) * 6, gelir: (results.totalRevenue / 12) * 6 },
    { name: '7. Ay', gider: (results.totalCost / 12) * 7, gelir: (results.totalRevenue / 12) * 7 },
    { name: '8. Ay', gider: (results.totalCost / 12) * 8, gelir: (results.totalRevenue / 12) * 8 },
    { name: '9. Ay', gider: (results.totalCost / 12) * 9, gelir: (results.totalRevenue / 12) * 9 },
    { name: '10. Ay', gider: (results.totalCost / 12) * 10, gelir: (results.totalRevenue / 12) * 10 },
    { name: '11. Ay', gider: (results.totalCost / 12) * 11, gelir: (results.totalRevenue / 12) * 11 },
    { name: '12. Ay', gider: results.totalCost, gelir: results.totalRevenue },
  ];

  return (
    <div className="space-y-4 sm:space-y-6" id="results-section" ref={resultsRef}>
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg sm:text-xl text-gray-900">Hesaplama Sonuçları</h3>
      </div>
      
      {/* Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
          <div className="text-xs sm:text-sm text-blue-600 font-medium">📦 Toplam Maliyet</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(results.totalCost, currencyCode, language)}</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg shadow-sm">
          <div className="text-xs sm:text-sm text-green-600 font-medium">💸 Toplam Gelir Tahmini</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(results.totalRevenue, currencyCode, language)}</div>
        </div>
        
        <div className={`${results.profit >= 0 ? 'bg-green-50' : 'bg-red-50'} p-4 rounded-lg shadow-sm`}>
          <div className="text-xs sm:text-sm text-purple-600 font-medium">💰 Kâr / Zarar</div>
          <div className={`text-xl sm:text-2xl font-bold ${results.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(results.profit, currencyCode, language)}
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-yellow-600 font-medium">🧾 Vergi Dahil Önerilen Satış Fiyatı</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(results.suggestedPriceWithVat, currencyCode, language)}</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
          <div className="text-xs sm:text-sm text-indigo-600 font-medium">⚖️ Başa Baş Satış Adedi</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {results.breakEvenSales.toFixed(0)}
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
          <div className="text-xs sm:text-sm text-indigo-600 font-medium">📅 Aylık Ortalama Kâr</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(results.profit / 12, currencyCode, language)}</div>
        </div>
      </div>
      
      {/* Expense Breakdown Pie Chart */}
      <div className="flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm w-full max-w-3xl mx-auto">
          <h4 className="text-xl font-medium text-center mb-4">Maliyet Dağılımı</h4>
          <ResponsiveContainer width="100%" height={320} className="text-sm">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => typeof value === 'number' ? `${value.toFixed(2)}%` : `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Revenue vs Expense Trend Chart */}
      <div className="mt-6">
        <h4 className="font-medium text-lg text-gray-800 mb-2">Yıllık Gelir - Gider Projeksiyonu</h4>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={lineChartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value, currencyCode, language) : `${value}`} />
              <Legend />
              <Line type="monotone" dataKey="gider" stroke="#FF8042" name="Gider" />
              <Line type="monotone" dataKey="gelir" stroke="#0088FE" name="Gelir" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Detailed Expense Breakdown */}
      <div className="mt-4 sm:mt-6">
        <h4 className="font-medium text-base sm:text-lg text-gray-800 mb-2">Detaylı Gider Dağılımı</h4>
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-2 sm:px-6 py-2 sm:py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gider Kalemi
                </th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yüzde
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Personel Giderleri</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(results.personnelCost, currencyCode, language)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatPercentage(results.expenseBreakdown.personnel)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Teknik Giderler</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(results.technicalCost, currencyCode, language)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatPercentage(results.expenseBreakdown.technical)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Yönetim ve Op. Giderleri</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(results.managementCost, currencyCode, language)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatPercentage(results.expenseBreakdown.management)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pazarlama ve Satış Giderleri</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(results.marketingCost, currencyCode, language)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatPercentage(results.expenseBreakdown.marketing)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Beklenmeyen Gider (Risk Payı)</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(results.contingencyCost, currencyCode, language)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatPercentage(results.expenseBreakdown.contingency)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">TOPLAM</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{formatCurrency(results.totalCost, currencyCode, language)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

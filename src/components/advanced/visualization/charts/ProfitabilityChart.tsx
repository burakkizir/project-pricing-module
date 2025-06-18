import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '../../../ProjectPricingPage';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell
} from 'recharts';

type ChartProps = {
  chartType: 'bar' | 'line' | 'area' | 'composed' | 'pie' | 'radar';
  colorTheme: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
  enableAnimations: boolean;
};

export const ProfitabilityChart: React.FC<ChartProps> = ({ 
  chartType = 'line', 
  colorTheme = 'blue', 
  enableAnimations = true 
}) => {
  const { watch } = useFormContext<FormData>();
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
  
  // Yüzde formatı için yardımcı fonksiyon
  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };
  
  // Renk temaları
  const COLOR_THEMES = {
    blue: ['#0088FE', '#4299E1', '#2B6CB0', '#2C5282', '#1A365D'],
    green: ['#00C49F', '#48BB78', '#38A169', '#2F855A', '#276749'],
    purple: ['#8884d8', '#9F7AEA', '#805AD5', '#6B46C1', '#553C9A'],
    orange: ['#FF8042', '#F6AD55', '#ED8936', '#DD6B20', '#C05621'],
    gray: ['#718096', '#4A5568', '#2D3748', '#1A202C', '#171923']
  };
  
  // Seçilen renk temasını kullan
  const COLORS = COLOR_THEMES[colorTheme];
  
  // Kârlılık hesaplamaları
  const profitabilityData = React.useMemo(() => {
    // Temel maliyetleri hesapla
    const baseCost = (
      (formValues.personnelItems?.reduce((sum, item) => sum + (item.monthlySalary * item.count * item.duration), 0) || 0) +
      (formValues.serverCost || 0) + (formValues.domainCost || 0) + (formValues.thirdPartyLicenses || 0) +
      (formValues.accountingCost || 0) + (formValues.officeCost || 0) * (formValues.officeMonths || 0) +
      (formValues.advertisingBudget || 0) + (formValues.salesRepCost || 0)
    );
    const subtotal = baseCost;
    const contingencyCost = subtotal * (formValues.contingencyRate || 0) / 100;
    
    const totalCost = subtotal + contingencyCost;
    
    // Gelir ve kâr hesaplamaları
    let oneTimeSalesRevenue = 0;
    let subscriptionRevenue = 0;
    
    if (formValues.salesModel === 'one_time' || formValues.salesModel === 'hybrid') {
      oneTimeSalesRevenue = (formValues.oneTimeSalesPrice || 0) * (formValues.plannedSalesCount || 0);
    }
    
    if (formValues.salesModel === 'subscription' || formValues.salesModel === 'hybrid') {
      subscriptionRevenue = (formValues.monthlySubscriptionFee || 0) * (formValues.estimatedUserCount || 0) * 12;
    }
    
    const totalRevenue = oneTimeSalesRevenue + subscriptionRevenue;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    // Satış sayısına göre kârlılık analizi
    const salesPointsData = [];
    const maxSales = Math.max(50, (formValues.plannedSalesCount || 0) * 2);
    const step = Math.max(1, Math.floor(maxSales / 10));
    
    // Kâr marjının değişimini analiz et
    for (let sales = 0; sales <= maxSales; sales += step) {
      let currentRevenue = 0;
      
      if (formValues.salesModel === 'one_time' || formValues.salesModel === 'hybrid') {
        currentRevenue += (formValues.oneTimeSalesPrice || 0) * sales;
      }
      
      if (formValues.salesModel === 'subscription' || formValues.salesModel === 'hybrid') {
        currentRevenue += subscriptionRevenue; // Abonelik geliri sabit kalır
      }
      
      const currentProfit = currentRevenue - totalCost;
      const currentProfitMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : -100;
      
      salesPointsData.push({
        sales,
        revenue: currentRevenue,
        cost: totalCost,
        profit: currentProfit,
        profitMargin: currentProfitMargin
      });
    }
    
    // Satış fiyatına göre kârlılık analizi
    const pricePointsData = [];
    const basePrice = formValues.salesModel === 'subscription' 
      ? formValues.monthlySubscriptionFee || 0
      : formValues.oneTimeSalesPrice || 0;
    const maxPrice = basePrice * 2;
    const priceStep = Math.max(basePrice / 10, 100);
    
    for (let price = 0; price <= maxPrice; price += priceStep) {
      let currentRevenue = 0;
      
      if (formValues.salesModel === 'one_time' || formValues.salesModel === 'hybrid') {
        currentRevenue += price * (formValues.plannedSalesCount || 0);
      }
      
      if (formValues.salesModel === 'subscription' || formValues.salesModel === 'hybrid') {
        if (formValues.salesModel === 'subscription') {
          currentRevenue += price * (formValues.estimatedUserCount || 0) * 12;
        } else {
          currentRevenue += subscriptionRevenue; // Hibrit modelde abonelik sabit kalır
        }
      }
      
      const currentProfit = currentRevenue - totalCost;
      const currentProfitMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : -100;
      
      pricePointsData.push({
        price,
        revenue: currentRevenue,
        cost: totalCost,
        profit: currentProfit,
        profitMargin: currentProfitMargin
      });
    }
    
    // Kâr için gereken minimum satış sayısı
    const breakEvenSalesCount = formValues.oneTimeSalesPrice && formValues.oneTimeSalesPrice > 0
      ? Math.ceil(totalCost / formValues.oneTimeSalesPrice)
      : 0;
    
    return {
      totalCost,
      totalRevenue,
      profit,
      profitMargin,
      breakEvenSalesCount,
      salesPointsData,
      pricePointsData
    };
  }, [formValues]);

  // Animasyon özelliklerini belirle
  const animationProps = enableAnimations ? {
    isAnimationActive: true,
    animationDuration: 1000
    // animationEasing kaldırıldı - TypeScript uyumluluğu için
  } : {
    isAnimationActive: false
  };

  // CustomTooltip bileşeni
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-sm">
          <p className="font-medium">Ay {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return <div />; // Boş div döndür - null yerine React element döndürmek gerekiyor
  };

  // chartType'a göre uygun grafik bileşenini render et
  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        // Kârlılık verileri için pasta grafik
        // profitabilityData nesne yapısını kullan
        // Ana kategorileri pasta grafik olarak göster
        const pieData = [
          { name: 'Gelir', value: profitabilityData.totalRevenue },
          { name: 'Maliyet', value: profitabilityData.totalCost },
          { name: 'Kâr', value: profitabilityData.profit > 0 ? profitabilityData.profit : 0 }
        ];
        
        return (
          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              {...animationProps}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
          </PieChart>
        );
      
      case 'radar':
        // Radar chart için dönüştür - n ayları radar grafik şeklinde göster
        // Line chart'a benzer bir görünüm olacak
        return (
          <RadarChart
            data={profitabilityData.salesPointsData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="sales" />
            <PolarRadiusAxis />
            <Radar name="Gelir" dataKey="revenue" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} {...animationProps} />
            <Radar name="Maliyet" dataKey="cost" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} {...animationProps} />
            <Radar name="Kâr" dataKey="profit" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.6} {...animationProps} />
          </RadarChart>
        );
            
      case 'line':
        return (
          <LineChart
            data={profitabilityData.salesPointsData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sales" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Gelir" 
              stroke={COLORS[0]} 
              activeDot={{ r: 8 }} 
              {...animationProps}
            />
            <Line 
              type="monotone" 
              dataKey="cost" 
              name="Maliyet" 
              stroke={COLORS[1]} 
              activeDot={{ r: 8 }} 
              {...animationProps}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              name="Kâr" 
              stroke={COLORS[2]} 
              activeDot={{ r: 8 }} 
              {...animationProps}
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart
            data={profitabilityData.salesPointsData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sales" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              name="Gelir" 
              fill={COLORS[0]}
              stroke={COLORS[0]}
              fillOpacity={0.6}
              {...animationProps}
            />
            <Area 
              type="monotone" 
              dataKey="cost" 
              name="Maliyet" 
              fill={COLORS[1]}
              stroke={COLORS[1]}
              fillOpacity={0.6}
              {...animationProps}
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              name="Kâr" 
              fill={COLORS[2]}
              stroke={COLORS[2]}
              fillOpacity={0.6}
              {...animationProps}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart
            data={profitabilityData.salesPointsData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sales" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="revenue" 
              name="Gelir" 
              fill={COLORS[0]}
              {...animationProps}
            />
            <Bar 
              dataKey="cost" 
              name="Maliyet" 
              fill={COLORS[1]}
              {...animationProps}
            />
            <Bar 
              dataKey="profit" 
              name="Kâr" 
              fill={COLORS[2]}
              {...animationProps}
            />
          </BarChart>
        );

      case 'composed':
        return (
          <ComposedChart
            data={profitabilityData.salesPointsData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sales" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="revenue" 
              name="Gelir" 
              fill={COLORS[0]}
              {...animationProps}
            />
            <Line 
              type="monotone" 
              dataKey="cost" 
              name="Maliyet" 
              stroke={COLORS[1]}
              {...animationProps}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              name="Kâr" 
              stroke={COLORS[2]}
              activeDot={{ r: 6 }}
              {...animationProps}
            />
          </ComposedChart>
        );
      
      default:
        return (
          <LineChart
            data={profitabilityData.salesPointsData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sales" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Gelir" 
              stroke={COLORS[0]} 
              activeDot={{ r: 8 }} 
              {...animationProps}
            />
            <Line 
              type="monotone" 
              dataKey="cost" 
              name="Maliyet" 
              stroke={COLORS[1]} 
              activeDot={{ r: 8 }} 
              {...animationProps}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              name="Kâr" 
              stroke={COLORS[2]} 
              activeDot={{ r: 8 }} 
              {...animationProps}
            />
          </LineChart>
        );
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-600">Toplam Maliyet</p>
          <p className="text-xl font-bold text-purple-900">{formatCurrency(profitabilityData.totalCost)}</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-600">Toplam Gelir</p>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(profitabilityData.totalRevenue)}</p>
        </div>
        
        <div className={`p-4 rounded-lg border ${
          profitabilityData.profit >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
        }`}>
          <p className={`text-sm ${profitabilityData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Net Kâr
          </p>
          <p className={`text-xl font-bold ${profitabilityData.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(profitabilityData.profit)}
          </p>
        </div>
        
        <div className={`p-4 rounded-lg border ${
          profitabilityData.profitMargin >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
        }`}>
          <p className={`text-sm ${profitabilityData.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Kâr Marjı
          </p>
          <p className={`text-xl font-bold ${profitabilityData.profitMargin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatPercentage(profitabilityData.profitMargin)}
          </p>
        </div>
      </div>
      
      {profitabilityData.breakEvenSalesCount > 0 && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-6">
          <p className="text-sm font-medium text-amber-800">
            Başabaş Noktası: {profitabilityData.breakEvenSalesCount} satış
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {formatCurrency(profitabilityData.totalCost)} maliyeti karşılamak için gereken minimum satış adedi.
          </p>
        </div>
      )}
      
      <div>
        <h5 className="font-medium text-sm text-gray-800 mb-4">Satış Miktarı - Kârlılık Analizi</h5>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

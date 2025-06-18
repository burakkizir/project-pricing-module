import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '../../../ProjectPricingPage';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart, 
  Line, 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

type ChartProps = {
  chartType: 'bar' | 'pie' | 'line' | 'radar';
  colorTheme: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
  enableAnimations: boolean;
};

export const CostBreakdownChart: React.FC<ChartProps> = ({ 
  chartType = 'pie', 
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
  
  // Maliyet hesaplamaları
  const costBreakdownData = React.useMemo(() => {
    // Personel maliyeti
    const personnelCost = formValues.personnelItems?.reduce((sum, item) => {
      return sum + (item.monthlySalary * item.count * item.duration);
    }, 0) || 0;
    
    // Teknik maliyetler
    const technicalCost = (formValues.serverCost || 0) + 
                         (formValues.domainCost || 0) + 
                         (formValues.thirdPartyLicenses || 0) + 
                         (formValues.dataStorageCost || 0) + 
                         (formValues.backupCost || 0);
    
    // Yönetim maliyetleri
    const managementCost = (formValues.accountingCost || 0) + 
                          (formValues.officeCost || 0) * (formValues.officeMonths || 0) + 
                          (formValues.hardwareCost || 0);
    
    // Pazarlama maliyetleri
    const marketingCost = (formValues.advertisingBudget || 0) + 
                         (formValues.salesRepCost || 0) + 
                         (formValues.demoCost || 0) + 
                         (formValues.websiteCost || 0) + 
                         (formValues.monthlyMarketingBudget || 0) * (formValues.projectDuration || 0);
    
    // Ekstra maliyetler
    const subtotal = personnelCost + technicalCost + managementCost + marketingCost;
    const contingencyCost = subtotal * (formValues.contingencyRate || 0) / 100;
    
    return [
      { name: 'Personel', value: personnelCost },
      { name: 'Teknik', value: technicalCost },
      { name: 'Yönetim', value: managementCost },
      { name: 'Pazarlama', value: marketingCost },
      { name: 'Beklenmeyen', value: contingencyCost }
    ].filter(item => item.value > 0);
  }, [formValues]);
  
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
  
  // Özel tooltip bileşeni
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-sm">
          <p className="font-medium">{label}</p>
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
  
  const totalCost = costBreakdownData.reduce((sum, item) => sum + item.value, 0);
  
  // Animasyon özelliklerini belirle
  const animationProps = enableAnimations ? {
    isAnimationActive: true,
    animationDuration: 1000
    // Not: animationEasing özelliği kaldırıldı çünkü TypeScript hatasına neden oluyor
    // Recharts AnimationTiming tipi gerektiriyor string yerine
  } : {
    isAnimationActive: false
  };

  const renderChart = () => {
    switch(chartType) {
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={costBreakdownData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              {...animationProps}
            >
              {costBreakdownData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );
      
      case 'bar':
        return (
          <BarChart
            data={costBreakdownData}
            layout="vertical"
            margin={{
              top: 5, right: 30, left: 70, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="value" 
              fill={COLORS[0]} 
              {...animationProps}
            >
              {costBreakdownData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart
            data={costBreakdownData}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={COLORS[0]} 
              {...animationProps}
            >
              {costBreakdownData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Line>
          </LineChart>
        );
        
      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={costBreakdownData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Radar 
              name="Maliyet" 
              dataKey="value" 
              stroke={COLORS[0]} 
              fill={COLORS[0]} 
              fillOpacity={0.6} 
              {...animationProps}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </RadarChart>
        );
      
      default:
        // Boş bir div döndür - null yerine her zaman geçerli bir React elementi döndürmek gerekiyor
        return <div />;
    }
  };

  return (
    <div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        {costBreakdownData.map((item, index) => (
          <div key={index} className="p-2 rounded-md border" style={{ borderColor: COLORS[index % COLORS.length] }}>
            <div className="text-xs font-medium text-gray-500">{item.name}</div>
            <div className="text-sm font-bold">{formatCurrency(item.value)}</div>
            <div className="text-xs text-gray-500">{((item.value / totalCost) * 100).toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

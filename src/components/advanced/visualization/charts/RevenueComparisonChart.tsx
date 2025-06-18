import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '../../../ProjectPricingPage';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
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

export const RevenueComparisonChart: React.FC<ChartProps> = ({ 
  chartType = 'bar', 
  colorTheme = 'blue', 
  enableAnimations = true 
}) => {
  const { watch } = useFormContext<FormData>();
  const formValues = watch();
  const currencyCode = watch('currencyCode');
  const language = watch('language');
  
  // Para birimi formatı için yardımcı fonksiyon
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
  
  // Aylık gelir hesaplamaları
  const revenueData = React.useMemo(() => {
    const projectDuration = formValues.projectDuration || 12;
    const data = [];
    
    // Aylık gelir hesapla
    let monthlySubscriptionRevenue = 0;
    let monthlyOneTimeRevenue = 0;
    
    if (formValues.salesModel === 'subscription' || formValues.salesModel === 'hybrid') {
      monthlySubscriptionRevenue = (formValues.monthlySubscriptionFee || 0) * (formValues.estimatedUserCount || 0);
    }
    
    if (formValues.salesModel === 'one_time' || formValues.salesModel === 'hybrid') {
      // Tek seferlik geliri aylara eşit dağıtıyoruz (gerçekte satış modelinize göre değişebilir)
      monthlyOneTimeRevenue = ((formValues.oneTimeSalesPrice || 0) * (formValues.plannedSalesCount || 0)) / projectDuration;
    }
    
    // Toplam gelir ve giderler
    const totalRevenue = (monthlySubscriptionRevenue * projectDuration) + (monthlyOneTimeRevenue * projectDuration);
    
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
    
    // Yönetim ve pazarlama maliyetleri
    const otherCosts = (formValues.accountingCost || 0) + 
                      (formValues.officeCost || 0) * (formValues.officeMonths || 0) +
                      (formValues.hardwareCost || 0) +
                      (formValues.advertisingBudget || 0) + 
                      (formValues.salesRepCost || 0) +
                      (formValues.websiteCost || 0);
    
    // Aylık maliyetler
    const monthlyPersonnelCost = personnelCost / projectDuration;
    const monthlyTechnicalCost = technicalCost / projectDuration;
    const monthlyOtherCosts = otherCosts / projectDuration;
    
    // Kümülatif gelir ve kar hesapla
    let cumulativeRevenue = 0;
    let cumulativeCost = 0;
    
    for (let i = 1; i <= projectDuration; i++) {
      const monthRevenue = monthlySubscriptionRevenue + monthlyOneTimeRevenue;
      const monthCost = monthlyPersonnelCost + monthlyTechnicalCost + monthlyOtherCosts;
      
      cumulativeRevenue += monthRevenue;
      cumulativeCost += monthCost;
      
      data.push({
        month: i,
        subscription: monthlySubscriptionRevenue,
        oneTime: monthlyOneTimeRevenue,
        totalRevenue: monthRevenue,
        cumulativeRevenue,
        cumulativeCost,
        cumulativeProfit: cumulativeRevenue - cumulativeCost
      });
    }
    
    return {
      monthlyData: data,
      totalRevenue,
      subscriptionRevenue: monthlySubscriptionRevenue * projectDuration,
      oneTimeRevenue: monthlyOneTimeRevenue * projectDuration
    };
  }, [formValues]);
  
  // Animasyon özelliklerini belirle
  const animationProps = enableAnimations ? {
    isAnimationActive: true,
    animationDuration: 1000
    // animationEasing kaldırıldı - recharts tiplerinde AnimationTiming gerekiyor
  } : {
    isAnimationActive: false
  };

  // CustomTooltip bileşeni
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

  // chartType'a göre uygun grafik bileşenini render et
  const renderChart = () => {
    switch(chartType) {
      case 'bar':
        return (
          <BarChart
            data={revenueData.monthlyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {formValues.salesModel === 'hybrid' || formValues.salesModel === 'subscription' ? (
              <Bar dataKey="subscription" name="Abonelik Geliri" fill={COLORS[0]} {...animationProps} />
            ) : null}
            {formValues.salesModel === 'hybrid' || formValues.salesModel === 'one_time' ? (
              <Bar dataKey="oneTime" name="Tek Seferlik Gelir" fill={COLORS[1]} {...animationProps} />
            ) : null}
            <Bar dataKey="totalRevenue" name="Toplam Aylık Gelir" fill={COLORS[2]} {...animationProps} />
          </BarChart>
        );
      
      case 'pie':
        // Pie chart için veriyi düzenle
        const pieData = [
          { name: 'Gelir', value: revenueData.monthlyData[0]?.totalRevenue || 0 },
          { name: 'Maliyet', value: revenueData.monthlyData[0]?.cumulativeCost || 0 },
          { name: 'Kâr', value: revenueData.monthlyData[0]?.cumulativeProfit || 0 }
        ];
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              {...animationProps}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );
      
      case 'line':
        return (
          <LineChart
            data={revenueData.monthlyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {formValues.salesModel === 'hybrid' || formValues.salesModel === 'subscription' ? (
              <Line type="monotone" dataKey="subscription" name="Abonelik Geliri" stroke={COLORS[0]} {...animationProps} />
            ) : null}
            {formValues.salesModel === 'hybrid' || formValues.salesModel === 'one_time' ? (
              <Line type="monotone" dataKey="oneTime" name="Tek Seferlik Gelir" stroke={COLORS[1]} {...animationProps} />
            ) : null}
            <Line type="monotone" dataKey="totalRevenue" name="Toplam Aylık Gelir" stroke={COLORS[2]} {...animationProps} />
          </LineChart>
        );

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={revenueData.monthlyData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="month" />
            <PolarRadiusAxis />
            {formValues.salesModel === 'hybrid' || formValues.salesModel === 'subscription' ? (
              <Radar name="Abonelik Geliri" dataKey="subscription" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} {...animationProps} />
            ) : null}
            {formValues.salesModel === 'hybrid' || formValues.salesModel === 'one_time' ? (
              <Radar name="Tek Seferlik Gelir" dataKey="oneTime" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} {...animationProps} />
            ) : null}
            <Radar name="Toplam Aylık Gelir" dataKey="totalRevenue" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.6} {...animationProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </RadarChart>
        );
      
      default:
        return (
          <BarChart
            data={revenueData.monthlyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            {formValues.salesModel === 'hybrid' || formValues.salesModel === 'subscription' ? (
              <Bar dataKey="subscription" name="Abonelik Geliri" fill={COLORS[0]} {...animationProps} />
            ) : null}
            {formValues.salesModel === 'hybrid' || formValues.salesModel === 'one_time' ? (
              <Bar dataKey="oneTime" name="Tek Seferlik Gelir" fill={COLORS[1]} {...animationProps} />
            ) : null}
            <Bar dataKey="totalRevenue" name="Toplam Aylık Gelir" fill={COLORS[2]} {...animationProps} />
          </BarChart>
        );
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-600">Toplam Gelir</p>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(revenueData.totalRevenue)}</p>
          <p className="text-xs text-blue-600 mt-1">{formValues.projectDuration || 12} ay boyunca</p>
        </div>
        
        {formValues.salesModel === 'hybrid' || formValues.salesModel === 'subscription' ? (
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <p className="text-sm text-green-600">Abonelik Geliri</p>
            <p className="text-xl font-bold text-green-900">{formatCurrency(revenueData.subscriptionRevenue)}</p>
            <p className="text-xs text-green-600 mt-1">
              {formatCurrency(formValues.monthlySubscriptionFee || 0)}/ay × {formValues.estimatedUserCount || 0} kullanıcı
            </p>
          </div>
        ) : null}
        
        {formValues.salesModel === 'hybrid' || formValues.salesModel === 'one_time' ? (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-600">Tek Seferlik Gelir</p>
            <p className="text-xl font-bold text-purple-900">{formatCurrency(revenueData.oneTimeRevenue)}</p>
            <p className="text-xs text-purple-600 mt-1">
              {formatCurrency(formValues.oneTimeSalesPrice || 0)} × {formValues.plannedSalesCount || 0} satış
            </p>
          </div>
        ) : null}
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6">
        <h5 className="font-medium text-sm text-gray-800 mb-2">Kümülatif Gelir ve Maliyet</h5>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueData.monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: 'Ay', position: 'insideBottomRight', offset: -5 }} />
              <YAxis 
                label={{ value: `Tutar (${currencyCode})`, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="cumulativeRevenue" name="Kümülatif Gelir" fill="#3b82f6" />
              <Bar dataKey="cumulativeCost" name="Kümülatif Maliyet" fill="#ef4444" />
              <Bar dataKey="cumulativeProfit" name="Kümülatif Kâr" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

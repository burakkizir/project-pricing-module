import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface PresentationData {
  projectName: string;
  costs: {
    personnel: number;
    technical: number;
    management: number;
    marketing: number;
    contingency: number;
    total: number;
  };
  salesModel: any;
  profitMargin: number;
}

export const PresentationPage: React.FC = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [data, setData] = useState<PresentationData | null>(null);

  // Renk paleti
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  useEffect(() => {
    // LocalStorage'dan sunum verilerini al
    const storedData = localStorage.getItem('presentationData');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  // Para birimi formatı için yardımcı fonksiyon
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Yüzde formatı için yardımcı fonksiyon
  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };
  
  // Pasta grafiği için veri
  const pieChartData = data ? [
    { name: 'Personel', value: data.costs.personnel },
    { name: 'Teknik', value: data.costs.technical },
    { name: 'Yönetim', value: data.costs.management },
    { name: 'Pazarlama', value: data.costs.marketing },
    { name: 'Risk Payı', value: data.costs.contingency },
  ] : [];

  // Çubuk grafiği için veri - karşılaştırmalı maliyetler
  const barChartData = data ? [
    { name: 'Personel', maliyet: data.costs.personnel },
    { name: 'Teknik', maliyet: data.costs.technical },
    { name: 'Yönetim', maliyet: data.costs.management },
    { name: 'Pazarlama', maliyet: data.costs.marketing },
    { name: 'Risk', maliyet: data.costs.contingency },
  ] : [];
  
  // Sonraki slayta geç
  const nextSlide = () => {
    setSlideIndex((prev) => (prev < 3 ? prev + 1 : prev));
  };
  
  // Önceki slayta dön
  const prevSlide = () => {
    setSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  // Tam ekran moduna geçiş
  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };
  
  // Veri yoksa yükleniyor mesajı göster
  if (!data) {
    return <div className="flex items-center justify-center h-screen">Sunum verileri yükleniyor...</div>;
  }

  // Slaytlar dizisi
  const slides = [
    // Slide 1: Proje Özeti
    <div key="slide-1" className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex flex-col justify-center items-center p-8">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{data.projectName}</h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-blue-800 mb-12">Proje Maliyet ve Kâr Analizi</h2>
      
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-3xl w-full">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="text-center">
            <h3 className="text-lg text-gray-500 mb-2">Toplam Maliyet</h3>
            <p className="text-3xl font-bold text-blue-700">{formatCurrency(data.costs.total)}</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg text-gray-500 mb-2">Tahmini Kâr Marjı</h3>
            <p className={`text-3xl font-bold ${data.profitMargin >= 20 ? 'text-green-600' : 'text-yellow-600'}`}>
              {formatPercentage(data.profitMargin)}
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Satış Modeli: {data.salesModel.model}</h3>
          <div className="grid grid-cols-2 gap-4">
            {'oneTimePrice' in data.salesModel && (
              <div>
                <p className="text-gray-600">Tek Seferlik Satış Fiyatı:</p>
                <p className="font-bold">{formatCurrency(data.salesModel.oneTimePrice)}</p>
              </div>
            )}
            {'monthlyFee' in data.salesModel && (
              <div>
                <p className="text-gray-600">Aylık Abonelik Ücreti:</p>
                <p className="font-bold">{formatCurrency(data.salesModel.monthlyFee)}</p>
              </div>
            )}
            {'targetSales' in data.salesModel && (
              <div>
                <p className="text-gray-600">Hedeflenen Satış Adedi:</p>
                <p className="font-bold">{data.salesModel.targetSales}</p>
              </div>
            )}
            {'userCount' in data.salesModel && (
              <div>
                <p className="text-gray-600">Tahmini Kullanıcı Sayısı:</p>
                <p className="font-bold">{data.salesModel.userCount}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    
    // Slide 2: Maliyet Dağılımı (Pasta Grafik)
    <div key="slide-2" className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex flex-col p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Maliyet Dağılımı</h1>
      
      <div className="bg-white rounded-xl shadow-xl p-6 flex-grow flex flex-col">
        <div className="flex-grow" style={{ minHeight: "500px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius="70%"
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-gray-600">Personel Maliyeti:</p>
            <p className="font-bold">{formatCurrency(data.costs.personnel)}</p>
            <p className="text-sm text-gray-500">{formatPercentage(data.costs.personnel / data.costs.total * 100)}</p>
          </div>
          <div>
            <p className="text-gray-600">Teknik Maliyetler:</p>
            <p className="font-bold">{formatCurrency(data.costs.technical)}</p>
            <p className="text-sm text-gray-500">{formatPercentage(data.costs.technical / data.costs.total * 100)}</p>
          </div>
          <div>
            <p className="text-gray-600">Yönetim Maliyetleri:</p>
            <p className="font-bold">{formatCurrency(data.costs.management)}</p>
            <p className="text-sm text-gray-500">{formatPercentage(data.costs.management / data.costs.total * 100)}</p>
          </div>
          <div>
            <p className="text-gray-600">Pazarlama Maliyetleri:</p>
            <p className="font-bold">{formatCurrency(data.costs.marketing)}</p>
            <p className="text-sm text-gray-500">{formatPercentage(data.costs.marketing / data.costs.total * 100)}</p>
          </div>
          <div>
            <p className="text-gray-600">Risk Payı:</p>
            <p className="font-bold">{formatCurrency(data.costs.contingency)}</p>
            <p className="text-sm text-gray-500">{formatPercentage(data.costs.contingency / data.costs.total * 100)}</p>
          </div>
          <div>
            <p className="text-gray-600">Toplam Maliyet:</p>
            <p className="font-bold">{formatCurrency(data.costs.total)}</p>
            <p className="text-sm text-gray-500">100%</p>
          </div>
        </div>
      </div>
    </div>,
    
    // Slide 3: Karşılaştırmalı Maliyetler (Bar Chart)
    <div key="slide-3" className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex flex-col p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Karşılaştırmalı Maliyet Analizi</h1>
      
      <div className="bg-white rounded-xl shadow-xl p-6 flex-grow flex flex-col">
        <div className="flex-grow" style={{ minHeight: "500px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="maliyet" fill="#8884d8">
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6">
          <p className="text-lg text-center">
            En yüksek maliyet kalemi: <span className="font-bold">{
              barChartData.reduce((prev, current) => (prev.maliyet > current.maliyet) ? prev : current).name
            }</span> ({
              formatPercentage(barChartData.reduce((prev, current) => (prev.maliyet > current.maliyet) ? prev : current).maliyet / data.costs.total * 100)
            })
          </p>
        </div>
      </div>
    </div>,
    
    // Slide 4: Sonuç ve Öneriler
    <div key="slide-4" className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex flex-col justify-center items-center p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Sonuç ve Öneriler</h1>
      
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-3xl w-full">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">Finansal Özet</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 mb-1">Toplam Maliyet:</p>
              <p className="text-2xl font-bold">{formatCurrency(data.costs.total)}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Tahmini Yıllık Gelir:</p>
              <p className="text-2xl font-bold">{formatCurrency(data.salesModel.yearlyRevenue || 0)}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">Kârlılık Durumu</h3>
          <div className={`p-4 rounded-lg ${data.profitMargin >= 15 ? 'bg-green-100' : data.profitMargin >= 0 ? 'bg-yellow-100' : 'bg-red-100'}`}>
            <p className="font-medium">
              {data.profitMargin >= 15 
                ? '✅ Proje finansal olarak kârlı görünüyor.' 
                : data.profitMargin >= 0 
                  ? '⚠️ Proje kârlı ancak risk barındırıyor.' 
                  : '❌ Proje mevcut koşullarda zarar edebilir.'}
            </p>
            <p className="mt-2">
              Kâr Marjı: 
              <span className={`font-bold ${
                data.profitMargin >= 15 ? 'text-green-700' : 
                data.profitMargin >= 0 ? 'text-yellow-700' : 
                'text-red-700'
              }`}> {formatPercentage(data.profitMargin)}</span>
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">Öneriler</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              {data.costs.personnel / data.costs.total > 0.6 
                ? 'Personel maliyetleri oldukça yüksek. Dış kaynak kullanımı değerlendirilebilir.' 
                : 'Personel maliyetleri dengeli görünüyor.'}
            </li>
            <li>
              {data.profitMargin < 10 
                ? 'Fiyatlandırma stratejisi gözden geçirilmeli, satış hedefleri yukarı çekilmeli.' 
                : 'Mevcut fiyatlandırma stratejisi uygun görünüyor.'}
            </li>
            <li>
              {data.costs.contingency / data.costs.total < 0.05 
                ? 'Risk payı için ayrılan bütçe artırılabilir.' 
                : 'Risk payı için ayrılan bütçe yeterli görünüyor.'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  ];

  return (
    <div className="relative h-screen bg-gray-100">
      {/* Geçerli slayt */}
      <div className="h-screen">
        {slides[slideIndex]}
      </div>
      
      {/* Navigasyon butonları */}
      <div className="absolute bottom-10 w-full flex justify-center items-center space-x-8">
        <button
          onClick={prevSlide}
          disabled={slideIndex === 0}
          className={`px-5 py-2 rounded-full bg-gray-800 text-white ${slideIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
        >
          ← Önceki
        </button>
        <div className="text-sm font-medium text-gray-600">
          {slideIndex + 1} / {slides.length}
        </div>
        <button
          onClick={nextSlide}
          disabled={slideIndex === slides.length - 1}
          className={`px-5 py-2 rounded-full bg-gray-800 text-white ${slideIndex === slides.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
        >
          Sonraki →
        </button>
      </div>
      
      {/* Tam ekran butonu */}
      <button
        onClick={enterFullScreen}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700"
        title="Tam Ekran"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
        </svg>
      </button>
    </div>
  );
};

export default PresentationPage;

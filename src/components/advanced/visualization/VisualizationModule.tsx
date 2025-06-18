import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '../../ProjectPricingPage';
import { CostBreakdownChart } from './charts/CostBreakdownChart';
import { RevenueComparisonChart } from './charts/RevenueComparisonChart';
import { ProfitabilityChart } from './charts/ProfitabilityChart';
import { toast } from 'react-toastify';

export const VisualizationModule: React.FC = () => {
  const { watch } = useFormContext<FormData>();
  const formValues = watch();
  const currencyCode = watch('currencyCode');
  const language = watch('language');
  
  const [activeTab, setActiveTab] = useState<'cost' | 'revenue' | 'profitability'>('cost');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'radar'>('bar');
  const [colorTheme, setColorTheme] = useState<'blue' | 'green' | 'purple' | 'orange' | 'gray'>('blue');
  const [enableAnimations, setEnableAnimations] = useState<boolean>(true);
  
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

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-base text-gray-800 mb-4">Kapsamlı Görselleştirme ve Raporlar</h4>
        
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'cost' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('cost')}
          >
            Maliyet Dağılımı
          </button>
          <button
            type="button"
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'revenue' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('revenue')}
          >
            Gelir Analizi
          </button>
          <button
            type="button"
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'profitability' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('profitability')}
          >
            Kârlılık Analizi
          </button>
        </div>
        
        <div className="py-2" id="visualization-content">
          {/* Tüm grafikleri her zaman render et, sadece görünürlüklerini CSS ile kontrol et */}
          <div style={{ display: activeTab === 'cost' ? 'block' : 'none' }}>
            <CostBreakdownChart 
              chartType={chartType} 
              colorTheme={colorTheme} 
              enableAnimations={enableAnimations} 
            />
          </div>
          
          <div style={{ display: activeTab === 'revenue' ? 'block' : 'none' }}>
            <RevenueComparisonChart 
              chartType={chartType} 
              colorTheme={colorTheme} 
              enableAnimations={enableAnimations} 
            />
          </div>
          
          <div style={{ display: activeTab === 'profitability' ? 'block' : 'none' }}>
            <ProfitabilityChart 
              chartType={chartType} 
              colorTheme={colorTheme} 
              enableAnimations={enableAnimations} 
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-base text-gray-800 mb-4">Raporlar ve Dışa Aktarma</h4>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Projenizin detaylı raporunu oluşturun veya verileri dışa aktarın.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  toast.info('Rapor hazırlanıyor...');
                  
                  // Görselleştirme bölümünü ve grafikleri yazdırma
                  const printWindow = window.open('', '_blank');
                  if (!printWindow) {
                    toast.error('Yazdırma penceresi açılamadı!');
                    return;
                  }
                  
                  const stats = document.getElementById('visualization-stats');
                  if (!stats) {
                    toast.error('Yazdırılacak içerik bulunamadı!');
                    return;
                  }
                  
                  // Aktif grafiği SVG olarak alma
                  let currentChart;
                  if (activeTab === 'cost') {
                    currentChart = document.querySelector('.cost-breakdown-container svg')?.outerHTML || '';
                  } else if (activeTab === 'revenue') {
                    currentChart = document.querySelector('.revenue-analysis-container svg')?.outerHTML || '';
                  } else if (activeTab === 'profitability') {
                    currentChart = document.querySelector('.profitability-analysis-container svg')?.outerHTML || '';
                  }
                  
                  // Proje verilerini topla
                  const personnelCost = formValues.personnelItems?.reduce((sum, item) => sum + (item.monthlySalary * item.count * item.duration), 0) || 0;
                  const technicalCost = (formValues.serverCost || 0) + (formValues.domainCost || 0) + (formValues.thirdPartyLicenses || 0);
                  const managementCost = (formValues.accountingCost || 0) + (formValues.officeCost || 0) * (formValues.officeMonths || 0);
                  const marketingCost = (formValues.advertisingBudget || 0) + (formValues.salesRepCost || 0);
                  const totalCost = personnelCost + technicalCost + managementCost + marketingCost;
                  
                  // Proje gelir verilerini al
                  const expectedSales = formValues.plannedSalesCount || 0;
                  const productPrice = formValues.oneTimeSalesPrice || 0;
                  const totalRevenue = expectedSales * productPrice;
                  const profit = totalRevenue - totalCost;
                  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
                  
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Proje Görselleştirme Raporu</title>
                        <style>
                          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                          h1 { color: #2563eb; margin-bottom: 15px; }
                          h2 { color: #4b5563; margin-top: 25px; margin-bottom: 15px; }
                          table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; }
                          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                          th { background-color: #f2f2f2; }
                          .chart-container { margin: 30px 0; max-width: 100%; overflow: hidden; }
                          .summary-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; margin: 20px 0; border-radius: 6px; }
                          .metric { margin-bottom: 10px; }
                          .metric-label { font-weight: 500; color: #64748b; }
                          .metric-value { font-weight: 600; color: #1e293b; }
                          .positive { color: #059669; }
                          .negative { color: #e11d48; }
                          footer { margin-top: 40px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                          @media print {
                            .page-break { page-break-before: always; }
                          }
                        </style>
                      </head>
                      <body>
                        <h1>Proje Görselleştirme Raporu</h1>
                        <div class="summary-box">
                          <div class="metric">
                            <span class="metric-label">Proje Adı:</span>
                            <span class="metric-value">${formValues.projectName || 'Tanımlanmamış'}</span>
                          </div>
                          <div class="metric">
                            <span class="metric-label">Toplam Maliyet:</span>
                            <span class="metric-value">${formatCurrency(totalCost)}</span>
                          </div>
                          <div class="metric">
                            <span class="metric-label">Tahmini Gelir:</span>
                            <span class="metric-value">${formatCurrency(totalRevenue)}</span>
                          </div>
                          <div class="metric">
                            <span class="metric-label">Beklenen Kâr:</span>
                            <span class="metric-value ${profit >= 0 ? 'positive' : 'negative'}">${formatCurrency(profit)}</span>
                          </div>
                          <div class="metric">
                            <span class="metric-label">Kâr Marjı:</span>
                            <span class="metric-value ${profitMargin >= 0 ? 'positive' : 'negative'}">${formatPercentage(profitMargin)}</span>
                          </div>
                        </div>
                        
                        <h2>Maliyet Dağılımı</h2>
                        <div class="chart-container">
                          ${currentChart}
                        </div>
                        <div>
                          ${stats.outerHTML}
                        </div>
                        
                        <div class="page-break"></div>
                        <h2>Detaylı Maliyet Analizi</h2>
                        <h3>Personel Giderleri</h3>
                        <table>
                          <thead>
                            <tr>
                              <th>Personel Pozisyonu</th>
                              <th>Aylık Maaş</th>
                              <th>Kişi Sayısı</th>
                              <th>Süre (Ay)</th>
                              <th>Toplam</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${formValues.personnelItems?.map(item => `
                              <tr>
                                <td>${item.role || 'Personel'}</td>
                                <td>${formatCurrency(item.monthlySalary)}</td>
                                <td>${item.count}</td>
                                <td>${item.duration}</td>
                                <td>${formatCurrency(item.monthlySalary * item.count * item.duration)}</td>
                              </tr>
                            `).join('') || ''}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colspan="4"><strong>Toplam Personel Maliyeti</strong></td>
                              <td><strong>${formatCurrency(personnelCost)}</strong></td>
                            </tr>
                          </tfoot>
                        </table>
                        
                        <footer>
                          <p>Rapor Tarihi: ${new Date().toLocaleDateString()}</p>
                          <p>Bu rapor, proje fiyatlandırma modülü kullanılarak otomatik olarak oluşturulmuştur.</p>
                        </footer>
                      </body>
                    </html>
                  `);
                  
                  printWindow.document.close();
                  setTimeout(() => {
                    printWindow.print();
                  }, 500);
                  
                  toast.success('PDF raporu başarıyla oluşturuldu!');
                }}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                PDF Raporu Oluştur
              </button>
              
              <button
                type="button"
                onClick={() => {
                  toast.info('Excel dosyası hazırlanıyor...');
                  
                  // Maliyet verilerini topla
                  const personnelCost = formValues.personnelItems?.reduce((sum: number, item: any) => sum + (item.monthlySalary * item.count * item.duration), 0) || 0;
                  const technicalCost = (formValues.serverCost || 0) + (formValues.domainCost || 0) + (formValues.thirdPartyLicenses || 0);
                  const managementCost = (formValues.accountingCost || 0) + (formValues.officeCost || 0) * (formValues.officeMonths || 0);
                  const marketingCost = (formValues.advertisingBudget || 0) + (formValues.salesRepCost || 0);
                  const totalCost = personnelCost + technicalCost + managementCost + marketingCost;
                  
                  // Gelir verilerini hesapla
                  const expectedSales = formValues.plannedSalesCount || 0;
                  const productPrice = formValues.oneTimeSalesPrice || 0;
                  const totalRevenue = expectedSales * productPrice;
                  const profit = totalRevenue - totalCost;
                  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
                  
                  // Excel verilerini oluştur
                  const data = [
                    ['Proje Fiyatlandırma ve Görselleştirme Raporu'],
                    [`Proje: ${formValues.projectName || 'Tanımlanmamış Proje'}`],
                    [`Rapor Tarihi: ${new Date().toLocaleDateString()}`],
                    [''],
                    ['1. FİNANSAL ÖZET'],
                    ['Metrik', 'Değer'],
                    ['Toplam Maliyet', formatCurrency(totalCost)],
                    ['Tahmini Gelir', formatCurrency(totalRevenue)],
                    ['Beklenen Kâr', formatCurrency(profit)],
                    ['Kâr Marjı', formatPercentage(profitMargin)],
                    ['Başabaş Satış Adedi', Math.ceil(totalCost / productPrice).toString()],
                    [''],
                    ['2. MALİYET DAĞILIMI'],
                    ['Maliyet Kalemleri', 'Tutar', 'Yüzde'],
                    ['Personel Maliyeti', formatCurrency(personnelCost), formatPercentage(personnelCost / totalCost * 100)],
                    ['Teknik Maliyetler', formatCurrency(technicalCost), formatPercentage(technicalCost / totalCost * 100)],
                    ['Yönetim Maliyetleri', formatCurrency(managementCost), formatPercentage(managementCost / totalCost * 100)],
                    ['Pazarlama Maliyetleri', formatCurrency(marketingCost), formatPercentage(marketingCost / totalCost * 100)],
                    ['Toplam', formatCurrency(totalCost), '100%'],
                    ['']
                  ];
                  
                  // Personel detaylarını ekle
                  if (formValues.personnelItems && formValues.personnelItems.length > 0) {
                    data.push(['3. PERSONEL DETAYLARI']);
                    data.push(['Pozisyon', 'Aylık Maaş', 'Kişi Sayısı', 'Süre (Ay)', 'Toplam']);
                    
                    formValues.personnelItems.forEach((item: any) => {
                      data.push([
                        item.title || 'Personel',
                        formatCurrency(item.monthlySalary),
                        item.count.toString(),
                        item.duration.toString(),
                        formatCurrency(item.monthlySalary * item.count * item.duration)
                      ]);
                    });
                  }
                  
                  // Excel dosyası oluşturma ve indirme (gelişmiş bir formatta)
                  // Üstünlük: Normal CSV'den daha iyi Excel uyumluluğu
                  const excelHeader = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Proje Raporu</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>table {border-collapse:collapse; border:1px solid #bbb; width:100%} td,th {border:1px solid #bbb; text-align:left; padding:8px;} th {background-color:#f2f2f2;}</style></head><body>';
                  
                  // Tablo formatında veriyi oluştur
                  let excelContent = excelHeader + '<table>';
                  data.forEach(row => {
                    excelContent += '<tr>';
                    row.forEach(cell => {
                      if (row === data[0] || row[0] === '1. FİNANSAL ÖZET' || row[0] === '2. MALİYET DAĞILIMI' || row[0] === '3. PERSONEL DETAYLARI') {
                        excelContent += `<th colspan="${data[0].length}" style="font-weight:bold;font-size:14pt;background-color:#e7e7e7;">${cell}</th>`;
                        return;
                      }
                      if (row[0] === 'Metrik' || row[0] === 'Maliyet Kalemleri' || row[0] === 'Pozisyon') {
                        excelContent += `<th style="font-weight:bold">${cell}</th>`;
                      } else {
                        excelContent += `<td>${cell}</td>`;
                      }
                    });
                    excelContent += '</tr>';
                  });
                  excelContent += '</table></body></html>';
                  
                  // HTML formatında Excel'e aktar
                  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
                  
                  // Dosya indirme bağlantısı oluşturma
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = 'proje_raporu.xls';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                  toast.success('Excel dosyası başarıyla oluşturuldu!');
                }}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Excel'e Aktar
              </button>
              
              <button
                type="button"
                onClick={() => {
                  toast.info('Sunum hazırlanıyor...');
                  
                  // Görselleştirme bölümünü için sunum oluşturma
                  const printWindow = window.open('', '_blank');
                  if (!printWindow) {
                    toast.error('Sunum penceresi açılamadı!');
                    return;
                  }
                  
                  // Aktif grafik SVG'sini yakala
                  let chartSvg = '';
                  const chartContainer = document.querySelector(`.tab-${activeTab} svg`);
                  if (chartContainer) {
                    chartSvg = chartContainer.outerHTML;
                  } else {
                    console.warn('Grafik SVG bulunamadı.');
                  }
                  
                  // Maliyet verilerini topla
                  const personnelCost = formValues.personnelItems?.reduce((sum, item) => sum + (item.monthlySalary * item.count * item.duration), 0) || 0;
                  const technicalCost = (formValues.serverCost || 0) + (formValues.domainCost || 0) + (formValues.thirdPartyLicenses || 0);
                  const managementCost = (formValues.accountingCost || 0) + (formValues.officeCost || 0) * (formValues.officeMonths || 0);
                  const marketingCost = (formValues.advertisingBudget || 0) + (formValues.salesRepCost || 0);
                  const totalCost = personnelCost + technicalCost + managementCost + marketingCost;
                  
                  // Gelir verilerini hesapla
                  const expectedSales = formValues.plannedSalesCount || 0;
                  const productPrice = formValues.oneTimeSalesPrice || 0;
                  const totalRevenue = expectedSales * productPrice;
                  const profit = totalRevenue - totalCost;
                  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
                  
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Görselleştirme Sunumu</title>
                        <style>
                          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }
                          .slide { page-break-after: always; padding: 40px; height: 85vh; border: 1px solid #e2e8f0; margin-bottom: 30px; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-radius: 8px; }
                          h1 { color: #1e40af; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                          h2 { color: #4b5563; margin-top: 30px; }
                          .chart-placeholder { height: 350px; background-color: #f0f9ff; border: 1px dashed #93c5fd; display: flex; align-items: center; justify-content: center; margin: 20px 0; font-style: italic; color: #6b7280; }
                          .chart-container { height: 350px; margin: 20px 0; overflow: visible; }
                          .chart-container svg { width: 100%; height: 100%; }
                          .summary-box { background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
                          .metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; }
                          .metric-card { background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; }
                          .metric-title { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
                          .metric-value { font-size: 18px; font-weight: bold; color: #1e3a8a; }
                          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #e2e8f0; padding-top: 15px; }
                          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                          th { background-color: #f8fafc; font-weight: 600; color: #4b5563; }
                        </style>
                      </head>
                      <body>
                        <div class="slide">
                          <h1>Proje Görselleştirme Sunumu</h1>
                          <h2>Finansal Özet</h2>
                          
                          <div class="summary-box">
                            <p><strong>Proje:</strong> ${formValues.projectName || 'Tanımlanmamış Proje'}</p>
                            <p><strong>Müşteri:</strong> ${formValues.clientName || 'Belirlenmedi'}</p>
                          </div>
                          
                          <div class="metrics-grid">
                            <div class="metric-card">
                              <div class="metric-title">Toplam Maliyet</div>
                              <div class="metric-value">${formatCurrency(totalCost)}</div>
                            </div>
                            
                            <div class="metric-card">
                              <div class="metric-title">Tahmini Gelir</div>
                              <div class="metric-value">${formatCurrency(expectedSales * productPrice)}</div>
                            </div>
                            
                            <div class="metric-card">
                              <div class="metric-title">Beklenen Kâr</div>
                              <div class="metric-value" style="color: ${(expectedSales * productPrice - totalCost) >= 0 ? '#047857' : '#dc2626'}">
                                ${formatCurrency(expectedSales * productPrice - totalCost)}
                              </div>
                            </div>
                            
                            <div class="metric-card">
                              <div class="metric-title">Kâr Marjı</div>
                              <div class="metric-value" style="color: ${profitMargin >= 0 ? '#047857' : '#dc2626'}">
                                ${formatPercentage(profitMargin)}
                              </div>
                            </div>
                          </div>
                          
                          <div class="footer">Sunum Tarihi: ${new Date().toLocaleDateString()}</div>
                        </div>
                        
                        <div class="slide">
                          <h1>Maliyet Dağılımı</h1>
                          ${chartSvg ? 
                            `<div class="chart-container">${chartSvg}</div>` : 
                            `<div class="chart-placeholder">[ Grafik görseli alınamadı ]</div>`
                          }
                          <table>
                            <tr>
                              <th>Maliyet Kalemi</th>
                              <th>Tutar</th>
                              <th>Yüzde</th>
                            </tr>
                            <tr>
                              <td>Personel</td>
                              <td>${formatCurrency(personnelCost)}</td>
                              <td>${formatPercentage(personnelCost / totalCost * 100)}</td>
                            </tr>
                            <tr>
                              <td>Teknik</td>
                              <td>${formatCurrency(technicalCost)}</td>
                              <td>${formatPercentage(technicalCost / totalCost * 100)}</td>
                            </tr>
                            <tr>
                              <td>Yönetim</td>
                              <td>${formatCurrency(managementCost)}</td>
                              <td>${formatPercentage(managementCost / totalCost * 100)}</td>
                            </tr>
                            <tr>
                              <td>Pazarlama</td>
                              <td>${formatCurrency(marketingCost)}</td>
                              <td>${formatPercentage(marketingCost / totalCost * 100)}</td>
                            </tr>
                          </table>
                        </div>
                        
                        <div class="slide">
                          <h1>Gelir Analizi</h1>
                          <h2>Satış ve Gelir Projeksiyonu</h2>
                          
                          <div class="summary-box">
                            <p><strong>Satış Modeli:</strong> ${formValues.salesModel === 'one_time' ? 'Tek Seferlik Satış' : 
                                                             formValues.salesModel === 'subscription' ? 'Abonelik' : 'Karma Model'}</p>
                          </div>
                          
                          <table>
                            <tr>
                              <th>Metrik</th>
                              <th>Değer</th>
                            </tr>
                            <tr>
                              <td>Planlanan Satış Adedi</td>
                              <td>${expectedSales}</td>
                            </tr>
                            <tr>
                              <td>Birim Satış Fiyatı</td>
                              <td>${formatCurrency(productPrice)}</td>
                            </tr>
                            <tr>
                              <td>Toplam Beklenen Gelir</td>
                              <td>${formatCurrency(totalRevenue)}</td>
                            </tr>
                            <tr>
                              <td>KDV Oranı</td>
                              <td>%${formValues.vatRate || 0}</td>
                            </tr>
                            <tr>
                              <td>Başabaş Noktası (Adet)</td>
                              <td>${totalCost > 0 ? Math.ceil(totalCost / productPrice) : 'N/A'}</td>
                            </tr>
                          </table>
                        </div>
                        
                        <div class="slide">
                          <h1>Karlılık Analizi</h1>
                          
                          <div class="summary-box">
                            <p><strong>Toplam Yatırım:</strong> ${formatCurrency(totalCost)}</p>
                            <p><strong>Beklenen Getiri:</strong> ${formatCurrency(profit)}</p>
                          </div>
                          
                          <div class="metrics-grid">
                            <div class="metric-card">
                              <div class="metric-title">Kar Marjı</div>
                              <div class="metric-value" style="color: ${profitMargin >= 0 ? '#047857' : '#dc2626'}">
                                ${formatPercentage(profitMargin)}
                              </div>
                            </div>
                            
                            <div class="metric-card">
                              <div class="metric-title">Yatırım Getirisi (ROI)</div>
                              <div class="metric-value" style="color: ${profit >= 0 ? '#047857' : '#dc2626'}">
                                ${profit > 0 ? formatPercentage((profit / totalCost) * 100) : '0%'}
                              </div>
                            </div>
                          </div>
                          
                          <h2>Risk Değerlendirmesi</h2>
                          <table>
                            <tr>
                              <th>Risk Tipi</th>
                              <th>Etki</th>
                              <th>Plan</th>
                            </tr>
                            <tr>
                              <td>Maliyet Artışı</td>
                              <td>${formatCurrency(totalCost * 0.1)} (%10)</td>
                              <td>Yeterli bütçe ayrılmalı</td>
                            </tr>
                            <tr>
                              <td>Satış Düşüşü</td>
                              <td>${formatCurrency(totalRevenue * 0.2)} (%20)</td>
                              <td>Alternatif pazarlama stratejileri</td>
                            </tr>
                            <tr>
                              <td>Proje Gecikmesi</td>
                              <td>${formatCurrency(personnelCost * 0.15)} (%15)</td>
                              <td>Proje yönetiminin sıkılaştırılması</td>
                            </tr>
                          </table>
                        </div>
                        
                        <script>
                          // Otomatik yazdırma işlemi
                          window.onload = () => {
                            // Yazdırma diyaloğunu açma
                            setTimeout(() => {
                              window.print();
                            }, 1000);
                          };
                        </script>
                      </body>
                    </html>
                  `);
                  
                  printWindow.document.close();
                  toast.success('Sunum başarıyla oluşturuldu!');
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Sunum Oluştur
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-base text-gray-800 mb-4">Veri Görselleştirme Ayarları</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grafik Türü
              </label>
              <select 
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={chartType}
                onChange={(e) => {
                  e.preventDefault();
                  setChartType(e.target.value as 'bar' | 'pie' | 'line' | 'radar');
                  toast.info(`Grafik türü değiştirildi: ${e.target.options[e.target.selectedIndex].text}`);
                }}
              >
                <option value="bar">Çubuk Grafik</option>
                <option value="pie">Pasta Grafik</option>
                <option value="line">Çizgi Grafik</option>
                <option value="radar">Radar Grafik</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Renk Teması
              </label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  className={`w-6 h-6 bg-blue-500 rounded-full ${colorTheme === 'blue' ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  onClick={() => {
                    setColorTheme('blue');
                    toast.info('Mavi renk teması uygulandı');
                  }}
                  aria-label="Mavi tema"
                ></button>
                <button 
                  type="button"
                  className={`w-6 h-6 bg-green-500 rounded-full ${colorTheme === 'green' ? 'ring-2 ring-offset-2 ring-green-500' : ''}`}
                  onClick={() => {
                    setColorTheme('green');
                    toast.info('Yeşil renk teması uygulandı');
                  }}
                  aria-label="Yeşil tema"
                ></button>
                <button 
                  type="button"
                  className={`w-6 h-6 bg-purple-500 rounded-full ${colorTheme === 'purple' ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}
                  onClick={() => {
                    setColorTheme('purple');
                    toast.info('Mor renk teması uygulandı');
                  }}
                  aria-label="Mor tema"
                ></button>
                <button 
                  type="button"
                  className={`w-6 h-6 bg-orange-500 rounded-full ${colorTheme === 'orange' ? 'ring-2 ring-offset-2 ring-orange-500' : ''}`}
                  onClick={() => {
                    setColorTheme('orange');
                    toast.info('Turuncu renk teması uygulandı');
                  }}
                  aria-label="Turuncu tema"
                ></button>
                <button 
                  type="button"
                  className={`w-6 h-6 bg-gray-500 rounded-full ${colorTheme === 'gray' ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
                  onClick={() => {
                    setColorTheme('gray');
                    toast.info('Gri renk teması uygulandı');
                  }}
                  aria-label="Gri tema"
                ></button>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableAnimations"
                className="mr-2"
                checked={enableAnimations}
                onChange={(e) => {
                  setEnableAnimations(e.target.checked);
                  toast.info(e.target.checked ? 'Grafik animasyonları etkinleştirildi' : 'Grafik animasyonları devre dışı bırakıldı');
                }}
              />
              <label htmlFor="enableAnimations" className="text-sm text-gray-700">
                Grafik animasyonlarını etkinleştir
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-base text-gray-800 mb-4">Özet Rapor</h4>
        
        <div className="overflow-x-auto">
          <table id="visualization-stats" className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Değer
                </th>
                <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yüzde
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Personel Maliyeti</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                  {formatCurrency(formValues.personnelItems?.reduce((sum, item) => sum + (item.monthlySalary * item.count * item.duration), 0) || 0)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                  %70
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Teknik Maliyetler</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                  {formatCurrency((formValues.serverCost || 0) + (formValues.domainCost || 0) + (formValues.thirdPartyLicenses || 0))}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                  %10
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Yönetim Maliyetleri</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                  {formatCurrency((formValues.accountingCost || 0) + (formValues.officeCost || 0) * (formValues.officeMonths || 0))}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                  %15
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Pazarlama Maliyetleri</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                  {formatCurrency((formValues.advertisingBudget || 0) + (formValues.salesRepCost || 0))}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                  %5
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Toplam
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(
                    (formValues.personnelItems?.reduce((sum, item) => sum + (item.monthlySalary * item.count * item.duration), 0) || 0) +
                    (formValues.serverCost || 0) + (formValues.domainCost || 0) + (formValues.thirdPartyLicenses || 0) +
                    (formValues.accountingCost || 0) + (formValues.officeCost || 0) * (formValues.officeMonths || 0) +
                    (formValues.advertisingBudget || 0) + (formValues.salesRepCost || 0)
                  )}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  %100
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

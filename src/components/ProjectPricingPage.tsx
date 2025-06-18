import React, { useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-toastify';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { PersonnelExpenses } from './expenses/PersonnelExpenses';
import { TechnicalExpenses } from './expenses/TechnicalExpenses';
import { ManagementExpenses } from './expenses/ManagementExpenses';
import { MarketingExpenses } from './expenses/MarketingExpenses';
import { ExtraExpenses } from './expenses/ExtraExpenses';
import { RevenueSection } from './revenue/RevenueSection';
import { ResultsSection } from './results/ResultsSection';
import { CurrencySettings } from './settings/CurrencySettings';
import { AdvancedFeatures } from './advanced/AdvancedFeatures';

// Define types
export type Role = 'developer' | 'ui_ux' | 'tester' | 'pm' | 'devops' | 'other';
export type SalesModel = 'one_time' | 'subscription' | 'hybrid';

export interface PersonnelItem {
  id: string;
  role: Role;
  monthlySalary: number;
  count: number;
  duration: number;
}

export type CurrencyCode = 'TRY' | 'USD' | 'EUR' | 'GBP';

export type ScenarioType = 'optimistic' | 'normal' | 'pessimistic';
export type ExpenseType = 'fixed' | 'variable';
export type ProjectDuration = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 18 | 24;

export interface FormData {
  // Personnel
  personnelItems: PersonnelItem[];
  
  // Technical
  serverCost: number;
  domainCost: number;
  thirdPartyLicenses: number;
  dataStorageCost: number;
  backupCost: number;
  
  // Management
  accountingCost: number;
  officeCost: number;
  officeMonths: number;
  hardwareCost: number;
  
  // Marketing
  advertisingBudget: number;
  salesRepCost: number;
  demoCost: number;
  websiteCost: number;
  
  // Extra
  contingencyRate: number;
  
  // Revenue
  plannedSalesCount: number;
  oneTimeSalesPrice: number;
  salesModel: SalesModel;
  estimatedUserCount: number;
  monthlySubscriptionFee: number;
  supportRevenue: number;
  vatRate: number;
  
  // Settings
  currencyCode: CurrencyCode;
  language: string;
  
  // Advanced Features - Cash Flow
  projectDuration: ProjectDuration;
  monthlyExpenses: Array<{
    month: number;
    personnelCost: number;
    technicalCost: number;
    managementCost: number;
    marketingCost: number;
    otherCost: number;
    revenue: number;
  }>;
  
  // Advanced Features - Currency
  currencyRates: Array<{
    code: CurrencyCode;
    rate: number; // 1 birim dövizin TL karşılığı
  }>;
  currencyRiskRate: number; // Kur artış riski yüzdesi
  
  // Advanced Features - Risk Scenarios
  scenarios: Array<{
    type: ScenarioType;
    name: string;
    personnelMultiplier: number;
    durationMultiplier: number;
    salesMultiplier: number;
    expensesMultiplier: number;
  }>;
  
  // Advanced Features - ROI
  targetROI: number; // Hedeflenen ROI yüzdesi
  
  // Advanced Features - Target Profit
  targetProfit: number; // Hedeflenen kâr tutarı
  
  // Advanced Features - Fixed/Variable Expenses
  expenseTypes: Array<{
    name: string;
    amount: number;
    type: ExpenseType;
  }>; // Her gider kaleminin adı, tutarı ve sabit/değişken olma durumu
  
  // Advanced Features - Delay Simulation
  delayMonths: number; // Proje gecikmesi (ay)
  overtimeRate: number; // Fazla mesai ücreti çarpanı
  
  // Advanced Features - Marketing & Licensing
  storeCommissionRate: number; // Uygulama mağazası komisyon oranı
  monthlyMarketingBudget: number; // Aylık pazarlama bütçesi
  
  // Advanced Features - Project History
  projectName: string;
  clientName: string;
  projectId: string;
  savedDate?: Date;
}

export const ProjectPricingPage: React.FC = () => {
  const methods = useForm<FormData>({
    defaultValues: {
      // Personnel
      personnelItems: [
        { id: '1', role: 'developer', monthlySalary: 40000, count: 2, duration: 6 },
        { id: '2', role: 'ui_ux', monthlySalary: 35000, count: 1, duration: 3 },
        { id: '3', role: 'tester', monthlySalary: 30000, count: 1, duration: 4 },
        { id: '4', role: 'pm', monthlySalary: 50000, count: 1, duration: 8 },
      ],
      
      // Technical
      serverCost: 10000,
      domainCost: 1000,
      thirdPartyLicenses: 5000,
      dataStorageCost: 3000,
      backupCost: 2000,
      
      // Management
      accountingCost: 5000,
      officeCost: 10000,
      officeMonths: 8,
      hardwareCost: 20000,
      
      // Marketing
      advertisingBudget: 15000,
      salesRepCost: 20000,
      demoCost: 5000,
      websiteCost: 10000,
      
      // Extra
      contingencyRate: 10,
      
      // Revenue
      plannedSalesCount: 100,
      oneTimeSalesPrice: 10000,
      salesModel: 'one_time',
      estimatedUserCount: 0,
      monthlySubscriptionFee: 0,
      supportRevenue: 0,
      vatRate: 20,
      
      // Settings
      currencyCode: 'TRY',
      language: 'tr',
      
      // Advanced Features - Cash Flow
      projectDuration: 12,
      monthlyExpenses: [],
      
      // Advanced Features - Currency
      currencyRates: [
        { code: 'TRY', rate: 1 },
        { code: 'USD', rate: 30.5 },
        { code: 'EUR', rate: 33.2 },
        { code: 'GBP', rate: 39.1 }
      ],
      currencyRiskRate: 10,
      
      // Advanced Features - Risk Scenarios
      scenarios: [
        {
          type: 'optimistic',
          name: 'İyimser',
          personnelMultiplier: 0.9,
          durationMultiplier: 0.8,
          salesMultiplier: 1.2,
          expensesMultiplier: 0.9
        },
        {
          type: 'normal',
          name: 'Normal',
          personnelMultiplier: 1,
          durationMultiplier: 1,
          salesMultiplier: 1,
          expensesMultiplier: 1
        },
        {
          type: 'pessimistic',
          name: 'Kötümser',
          personnelMultiplier: 1.2,
          durationMultiplier: 1.3,
          salesMultiplier: 0.8,
          expensesMultiplier: 1.1
        }
      ],
      
      // Advanced Features - ROI
      targetROI: 25,
      
      // Advanced Features - Target Profit
      targetProfit: 100000,
      
      // Advanced Features - Fixed/Variable Expenses
      expenseTypes: [
        { name: 'Server Maliyeti', amount: 10000, type: 'fixed' as ExpenseType },
        { name: 'Domain Maliyeti', amount: 1000, type: 'fixed' as ExpenseType },
        { name: 'Ofis Maliyeti', amount: 10000, type: 'fixed' as ExpenseType },
        { name: 'Personel Giderleri', amount: 0, type: 'variable' as ExpenseType },
        { name: 'Reklam Bütçesi', amount: 15000, type: 'variable' as ExpenseType }
      ],
      
      // Advanced Features - Delay Simulation
      delayMonths: 0,
      overtimeRate: 1.5,
      
      // Advanced Features - Marketing & Licensing
      storeCommissionRate: 30,
      monthlyMarketingBudget: 5000,
      
      // Advanced Features - Project History
      projectName: 'Yeni Proje',
      clientName: '',
      projectId: crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
    }
  });
  
  const { watch } = methods;
  const formValues = watch();
  
  // Calculate all costs
  const calculatedResults = useMemo(() => {
    // Personnel expenses
    const personnelCost = formValues.personnelItems.reduce((total, item) => {
      return total + (item.monthlySalary * item.count * item.duration);
    }, 0);
    
    // Technical expenses
    const technicalCost = 
      formValues.serverCost + 
      formValues.domainCost + 
      formValues.thirdPartyLicenses + 
      formValues.dataStorageCost + 
      formValues.backupCost;
    
    // Management expenses
    const managementCost = 
      formValues.accountingCost + 
      (formValues.officeCost * formValues.officeMonths) + 
      formValues.hardwareCost;
    
    // Marketing expenses
    const marketingCost = 
      formValues.advertisingBudget + 
      formValues.salesRepCost + 
      formValues.demoCost + 
      formValues.websiteCost;
    
    // Calculate total cost before contingency
    const subtotalCost = personnelCost + technicalCost + managementCost + marketingCost;
    
    // Extra expenses (contingency)
    const contingencyCost = subtotalCost * (formValues.contingencyRate / 100);
    
    // Total cost
    const totalCost = subtotalCost + contingencyCost;
    
    // Calculate revenue
    let totalRevenue = 0;
    
    if (formValues.salesModel === 'one_time' || formValues.salesModel === 'hybrid') {
      totalRevenue += formValues.oneTimeSalesPrice * formValues.plannedSalesCount;
    }
    
    if (formValues.salesModel === 'subscription' || formValues.salesModel === 'hybrid') {
      totalRevenue += formValues.monthlySubscriptionFee * formValues.estimatedUserCount * 12; // Annual
    }
    
    // Add support revenue
    totalRevenue += formValues.supportRevenue;
    
    // Calculate profit
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    // Calculate break-even
    const breakEvenSales = formValues.oneTimeSalesPrice > 0 
      ? Math.ceil(totalCost / formValues.oneTimeSalesPrice)
      : 0;
    
    // Calculate price with VAT
    const vatAmount = totalCost * (formValues.vatRate / 100);
    const totalWithVat = totalCost + vatAmount;
    
    return {
      personnelCost,
      technicalCost,
      managementCost,
      marketingCost,
      contingencyCost,
      totalCost,
      totalRevenue,
      profit,
      profitMargin,
      breakEvenSales,
      suggestedPriceWithVat: totalWithVat,
      expenseBreakdown: {
        personnel: (personnelCost / totalCost) * 100,
        technical: (technicalCost / totalCost) * 100,
        management: (managementCost / totalCost) * 100,
        marketing: (marketingCost / totalCost) * 100,
        contingency: (contingencyCost / totalCost) * 100
      }
    };
  }, [formValues]);
  
  // Local Storage'a kaydetme fonksiyonu
  const handleSaveToLocalStorage = () => {
    const savedData = {
      ...formValues,
      savedDate: new Date()
    };
    
    try {
      localStorage.setItem(`project-${formValues.projectId}`, JSON.stringify(savedData));
      toast.success('Simülasyon başarıyla kaydedildi!');
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      toast.error('Simülasyon kaydedilirken bir hata oluştu!');
    }
  };

  // PDF raporu oluştur
  const handleGeneratePDF = async () => {
    try {
      toast.info('PDF raporu oluşturuluyor...');
      
      // Tüm form içeriğini alan element
      const formElement = document.querySelector('form');
      if (!formElement) {
        toast.error('PDF için içerik bulunamadı!');
        return;
      }
      
      // Yazdırma penceresi açılıyor
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Yazdırma penceresi açılamadı!');
        return;
      }
      
      // HTML içeriğini yazdırma penceresine yazma
      printWindow.document.write(`
        <html>
          <head>
            <title>Proje Fiyatlandırma Raporu</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #2563eb; margin-bottom: 20px; }
              h2 { color: #4b5563; margin-top: 30px; }
              .section { margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
              th { background-color: #f1f5f9; font-weight: 500; }
              .card {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 16px;
                background-color: #f8fafc;
              }
              .summary { padding: 16px; background-color: #f0f9ff; border-radius: 8px; margin-top: 30px; }
              .footer { margin-top: 50px; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <h1>Proje Fiyatlandırma Raporu</h1>
            
            <div class="section">
              <h2>Proje Bilgileri</h2>
              <p><strong>Proje Adı:</strong> ${formValues.projectName}</p>
              <p><strong>Müşteri:</strong> ${formValues.clientName || 'Belirtilmemiş'}</p>
              <p><strong>Para Birimi:</strong> ${formValues.currencyCode}</p>
              <p><strong>Satış Modeli:</strong> ${formValues.salesModel === 'one_time' ? 'Tek Seferlik' : formValues.salesModel === 'subscription' ? 'Abonelik' : 'Hibrit'}</p>
              <p><strong>KDV Oranı:</strong> %${formValues.vatRate}</p>
              <p><strong>Risk Payı Oranı:</strong> %${formValues.contingencyRate}</p>
            </div>
            
            <div class="section">
              <h2>Personel Giderleri</h2>
              <table>
                <tr>
                  <th>Rol</th>
                  <th>Aylık Ücret</th>
                  <th>Kişi Sayısı</th>
                  <th>Süre (Ay)</th>
                  <th>Toplam</th>
                </tr>
                ${formValues.personnelItems.map(item => `
                <tr>
                  <td>${item.role === 'developer' ? 'Yazılım Geliştirici' : 
                      item.role === 'ui_ux' ? 'UI/UX Tasarımcı' : 
                      item.role === 'tester' ? 'Test Uzmanı' : 
                      item.role === 'pm' ? 'Proje Yöneticisi' : 
                      item.role === 'devops' ? 'DevOps Uzmanı' : 'Diğer'}</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(item.monthlySalary)}</td>
                  <td>${item.count}</td>
                  <td>${item.duration}</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(item.monthlySalary * item.count * item.duration)}</td>
                </tr>
                `).join('')}
                <tr>
                  <th colspan="4">Toplam Personel Giderleri</th>
                  <th>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(calculatedResults.personnelCost)}</th>
                </tr>
              </table>
            </div>
            
            <div class="section">
              <h2>Teknik Giderler</h2>
              <table>
                <tr>
                  <th>Gider Kalemi</th>
                  <th>Tutar</th>
                </tr>
                <tr>
                  <td>Server Maliyeti</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.serverCost)}</td>
                </tr>
                <tr>
                  <td>Domain Maliyeti</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.domainCost)}</td>
                </tr>
                <tr>
                  <td>Üçüncü Parti Lisanslar</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.thirdPartyLicenses)}</td>
                </tr>
                <tr>
                  <td>Veri Saklama Maliyeti</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.dataStorageCost)}</td>
                </tr>
                <tr>
                  <td>Yedekleme Maliyeti</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.backupCost)}</td>
                </tr>
                <tr>
                  <th>Toplam Teknik Giderler</th>
                  <th>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(calculatedResults.technicalCost)}</th>
                </tr>
              </table>
            </div>
            
            <div class="section">
              <h2>Yönetim Giderleri</h2>
              <table>
                <tr>
                  <th>Gider Kalemi</th>
                  <th>Tutar</th>
                </tr>
                <tr>
                  <td>Muhasebe Maliyeti</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.accountingCost)}</td>
                </tr>
                <tr>
                  <td>Ofis Maliyeti (${formValues.officeMonths} ay)</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.officeCost * formValues.officeMonths)}</td>
                </tr>
                <tr>
                  <td>Donanım Maliyeti</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.hardwareCost)}</td>
                </tr>
                <tr>
                  <th>Toplam Yönetim Giderleri</th>
                  <th>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(calculatedResults.managementCost)}</th>
                </tr>
              </table>
            </div>
            
            <div class="section">
              <h2>Pazarlama Giderleri</h2>
              <table>
                <tr>
                  <th>Gider Kalemi</th>
                  <th>Tutar</th>
                </tr>
                <tr>
                  <td>Reklam Bütçesi</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.advertisingBudget)}</td>
                </tr>
                <tr>
                  <td>Satış Temsilcileri Maliyeti</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.salesRepCost)}</td>
                </tr>
                <tr>
                  <td>Demo/Tanıtım Maliyeti</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.demoCost)}</td>
                </tr>
                <tr>
                  <td>Website Maliyeti</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.websiteCost)}</td>
                </tr>
                <tr>
                  <th>Toplam Pazarlama Giderleri</th>
                  <th>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(calculatedResults.marketingCost)}</th>
                </tr>
              </table>
            </div>
            
            <div class="section">
              <h2>Maliyet Özeti</h2>
              <table>
                <tr>
                  <th>Maliyet Kalemi</th>
                  <th>Tutar</th>
                  <th>Yüzde</th>
                </tr>
                <tr>
                  <td>Personel Giderleri</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(calculatedResults.personnelCost)}</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(calculatedResults.expenseBreakdown.personnel / 100)}</td>
                </tr>
                <tr>
                  <td>Teknik Giderler</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(calculatedResults.technicalCost)}</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(calculatedResults.expenseBreakdown.technical / 100)}</td>
                </tr>
                <tr>
                  <td>Yönetim Giderleri</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(calculatedResults.managementCost)}</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(calculatedResults.expenseBreakdown.management / 100)}</td>
                </tr>
                <tr>
                  <td>Pazarlama Giderleri</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(calculatedResults.marketingCost)}</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(calculatedResults.expenseBreakdown.marketing / 100)}</td>
                </tr>
                <tr>
                  <td>Risk Payı</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(calculatedResults.contingencyCost)}</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(calculatedResults.expenseBreakdown.contingency / 100)}</td>
                </tr>
                <tr>
                  <th>Toplam Maliyet</th>
                  <th>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(calculatedResults.totalCost)}</th>
                  <th>100%</th>
                </tr>
              </table>
            </div>
            
            <div class="section">
              <h2>Gelir Bilgileri</h2>
              <table>
                <tr>
                  <th>Gelir Kalemi</th>
                  <th>Detaylar</th>
                  <th>Tutar</th>
                </tr>
                ${formValues.salesModel === 'one_time' || formValues.salesModel === 'hybrid' ? `
                <tr>
                  <td>Tek Seferlik Satış</td>
                  <td>${formValues.plannedSalesCount} adet &times; ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.oneTimeSalesPrice)}</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.oneTimeSalesPrice * formValues.plannedSalesCount)}</td>
                </tr>` : ''}
                ${formValues.salesModel === 'subscription' || formValues.salesModel === 'hybrid' ? `
                <tr>
                  <td>Abonelik Geliri (Yıllık)</td>
                  <td>${formValues.estimatedUserCount} kullanıcı &times; ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.monthlySubscriptionFee)} &times; 12 ay</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.monthlySubscriptionFee * formValues.estimatedUserCount * 12)}</td>
                </tr>` : ''}
                ${formValues.supportRevenue > 0 ? `
                <tr>
                  <td>Destek Gelirleri</td>
                  <td>Destek paketleri ve bakım sözleşmeleri</td>
                  <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.supportRevenue)}</td>
                </tr>` : ''}
                <tr>
                  <th colspan="2">Toplam Beklenen Gelir</th>
                  <th>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(calculatedResults.totalRevenue)}</th>
                </tr>
              </table>
            </div>

            <div class="section">
              <h2>Risk Senaryoları</h2>
              <p>Proje için üç farklı senaryo analizi:</p>
              <table>
                <tr>
                  <th>Senaryo</th>
                  <th>Personel Çarpanı</th>
                  <th>Süre Çarpanı</th>
                  <th>Satış Çarpanı</th>
                  <th>Gider Çarpanı</th>
                </tr>
                ${formValues.scenarios.map(scenario => `
                <tr>
                  <td>${scenario.name}</td>
                  <td>${scenario.personnelMultiplier}</td>
                  <td>${scenario.durationMultiplier}</td>
                  <td>${scenario.salesMultiplier}</td>
                  <td>${scenario.expensesMultiplier}</td>
                </tr>
                `).join('')}
              </table>
              
              <div style="margin-top: 20px;">
                <p><strong>Gecikme Simülasyonu:</strong> ${formValues.delayMonths} ay</p>
                <p><strong>Fazla Mesai Ücret Çarpanı:</strong> ${formValues.overtimeRate}</p>
              </div>
            </div>

            <div class="section">
              <h2>Döviz ve Kur Riski</h2>
              <p><strong>Kur Artış Risk Oranı:</strong> %${formValues.currencyRiskRate}</p>
              <table>
                <tr>
                  <th>Döviz Kodu</th>
                  <th>Kur Değeri (TL Karşılığı)</th>
                </tr>
                ${formValues.currencyRates.map(rate => `
                <tr>
                  <td>${rate.code}</td>
                  <td>${rate.rate}</td>
                </tr>
                `).join('')}
              </table>
            </div>

            <div class="summary">
              <h2>Fiyatlandırma Önerisi</h2>
              <p><strong>Toplam Maliyet:</strong> ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(calculatedResults.totalCost)}</p>
              <p><strong>Beklenen Gelir:</strong> ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(calculatedResults.totalRevenue)}</p>
              <p><strong>KDV Dahil Maliyet:</strong> ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(calculatedResults.suggestedPriceWithVat)}</p>
              <p><strong>Kâr Marjı:</strong> ${new Intl.NumberFormat('tr-TR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(calculatedResults.profitMargin / 100)}</p>
              <p><strong>Başa Baş Satış Adedi:</strong> ${calculatedResults.breakEvenSales}</p>
              <p><strong>Hedeflenen ROI:</strong> %${formValues.targetROI}</p>
              <p><strong>Hedeflenen Kâr:</strong> ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: formValues.currencyCode }).format(formValues.targetProfit)}</p>
            </div>
            
            <div class="footer">
              <p>Rapor Tarihi: ${new Date().toLocaleDateString()}</p>
              <p>Bu rapor otomatik olarak oluşturulmuştur.</p>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Kısa bir gecikme ile yazdırma diyaloğunu aç
      setTimeout(() => {
        printWindow.print();
      }, 500);
      
      toast.success('PDF raporu başarıyla oluşturuldu!');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      toast.error('PDF oluşturulurken bir hata oluştu!');
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-3 sm:p-4 md:p-6 max-w-full overflow-hidden">
      <FormProvider {...methods}>
        <form>
          <div className="space-y-6">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">Yazılım Projesi Fiyatlama ve Finansal Planlama Modülü</h1>
            
            <CurrencySettings />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {/* Left Column - Expenses */}
              <div className="lg:col-span-1 space-y-2 sm:space-y-4">
                <h2 className="text-xl font-semibold text-gray-700">Gider Kalemleri</h2>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <PersonnelExpenses />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <TechnicalExpenses />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ManagementExpenses />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <MarketingExpenses />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ExtraExpenses />
                </div>
              </div>
              
              {/* Right Columns - Revenue and Results */}
              <div className="lg:col-span-2 space-y-2 sm:space-y-4">
                <h2 className="text-xl font-semibold text-gray-700">Gelir Unsurları</h2>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <RevenueSection />
                </div>
                
                <div className="bg-white p-4 rounded-lg border-2 border-blue-100 shadow">
                  <ResultsSection 
                    results={calculatedResults} 
                    currencyCode={formValues.currencyCode}
                    language={formValues.language}
                    formData={formValues}
                  />
                </div>
                
                <div className="bg-white p-4 rounded-lg border-2 border-blue-100 shadow">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Gelişmiş Özellikler</h2>
                  <AdvancedFeatures />
                </div>
                
                <div className="flex flex-wrap gap-2 sm:space-x-4 mt-4 sm:mt-8">
                  <button
                    type="button"
                    onClick={handleSaveToLocalStorage}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Simülasyon Kaydet
                  </button>
                  
                  <button 
                    type="button"
                    onClick={handleGeneratePDF}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    title="PDF Raporu Oluştur"
                  >
                    <DocumentTextIcon className="w-5 h-5 mr-1.5" /> PDF Rapor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FormData } from '../components/ProjectPricingPage';

// PDF raporu oluşturan fonksiyon
export const generatePDF = async (elementId: string, fileName: string = 'proje_rapor.pdf') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('PDF için yazdırılacak element bulunamadı');
    }
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 genişliği
    const pageHeight = 297; // A4 yüksekliği
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Çok sayfaya bölme
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('PDF oluşturmada hata:', error);
    return false;
  }
};

// Excel'e veri aktarma fonksiyonu
export const exportToExcel = (data: any, fileName: string = 'proje_verileri.xlsx') => {
  try {
    // Verileri Excel formatına dönüştürme
    const worksheet = XLSX.utils.json_to_sheet(formatDataForExcel(data));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Proje Verileri');
    
    // Excel dosyasını oluşturma ve indirme
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    saveAs(blob, fileName);
    return true;
  } catch (error) {
    console.error('Excel\'e aktarmada hata:', error);
    return false;
  }
};

// Excel için veri formatını ayarlama
const formatDataForExcel = (formData: FormData) => {
  // Personel verileri
  const personnelItems = formData.personnelItems.map((item, index) => ({
    'Kategori': 'Personel',
    'Alt Kategori': getRoleName(item.role),
    'Aylık Maliyet': item.monthlySalary,
    'Kişi Sayısı': item.count,
    'Süre (Ay)': item.duration,
    'Toplam': item.monthlySalary * item.count * item.duration
  }));

  // Teknik giderler
  const technicalItems = [
    { 'Kategori': 'Teknik', 'Alt Kategori': 'Server Maliyeti', 'Tutar': formData.serverCost || 0 },
    { 'Kategori': 'Teknik', 'Alt Kategori': 'Domain Maliyeti', 'Tutar': formData.domainCost || 0 },
    { 'Kategori': 'Teknik', 'Alt Kategori': 'Lisans Maliyeti', 'Tutar': formData.thirdPartyLicenses || 0 },
    { 'Kategori': 'Teknik', 'Alt Kategori': 'Veri Depolama', 'Tutar': formData.dataStorageCost || 0 },
    { 'Kategori': 'Teknik', 'Alt Kategori': 'Yedekleme Maliyeti', 'Tutar': formData.backupCost || 0 },
  ];

  // Yönetim giderleri
  const managementItems = [
    { 'Kategori': 'Yönetim', 'Alt Kategori': 'Muhasebe Maliyeti', 'Tutar': formData.accountingCost || 0 },
    { 'Kategori': 'Yönetim', 'Alt Kategori': 'Ofis Maliyeti', 'Aylık': formData.officeCost || 0, 'Süre': formData.officeMonths || 0, 'Toplam': (formData.officeCost || 0) * (formData.officeMonths || 0) },
    { 'Kategori': 'Yönetim', 'Alt Kategori': 'Donanım Maliyeti', 'Tutar': formData.hardwareCost || 0 },
  ];

  // Pazarlama giderleri
  const marketingItems = [
    { 'Kategori': 'Pazarlama', 'Alt Kategori': 'Reklam Bütçesi', 'Tutar': formData.advertisingBudget || 0 },
    { 'Kategori': 'Pazarlama', 'Alt Kategori': 'Satış Temsilcisi', 'Tutar': formData.salesRepCost || 0 },
    { 'Kategori': 'Pazarlama', 'Alt Kategori': 'Demo/Sunum Maliyeti', 'Tutar': formData.demoCost || 0 },
    { 'Kategori': 'Pazarlama', 'Alt Kategori': 'Web Sitesi Maliyeti', 'Tutar': formData.websiteCost || 0 },
  ];

  // Tüm verileri birleştirme
  return [
    ...personnelItems,
    ...technicalItems,
    ...managementItems,
    ...marketingItems,
    { 'Kategori': 'Risk Payı', 'Alt Kategori': `Risk Oranı (%${formData.contingencyRate || 0})`, 'Tutar': calculateContingency(formData) }
  ];
};

// Satış modeline göre sunum için veri hazırlama
export const prepareSlideData = (formData: FormData) => {
  // Toplam maliyetleri hesaplama
  const personnelCost = formData.personnelItems.reduce((sum, item) => sum + (item.monthlySalary * item.count * item.duration), 0);
  const technicalCost = (formData.serverCost || 0) + (formData.domainCost || 0) + (formData.thirdPartyLicenses || 0) + 
                       (formData.dataStorageCost || 0) + (formData.backupCost || 0);
  const managementCost = (formData.accountingCost || 0) + (formData.officeCost || 0) * (formData.officeMonths || 0) + 
                         (formData.hardwareCost || 0);
  const marketingCost = (formData.advertisingBudget || 0) + (formData.salesRepCost || 0) + 
                        (formData.demoCost || 0) + (formData.websiteCost || 0);
  const subtotal = personnelCost + technicalCost + managementCost + marketingCost;
  const contingency = subtotal * (formData.contingencyRate || 0) / 100;
  const totalCost = subtotal + contingency;
  
  // Satış modeli bilgilerini hazırlama
  let salesModelInfo;
  if (formData.salesModel === 'one_time') {
    salesModelInfo = {
      model: 'Tek Seferlik Satış',
      price: formData.oneTimeSalesPrice || 0,
      targetSales: formData.plannedSalesCount || 0,
      projectedRevenue: (formData.oneTimeSalesPrice || 0) * (formData.plannedSalesCount || 0),
    };
  } else if (formData.salesModel === 'subscription') {
    salesModelInfo = {
      model: 'Abonelik Modeli',
      monthlyFee: formData.monthlySubscriptionFee || 0,
      userCount: formData.estimatedUserCount || 0,
      yearlyRevenue: (formData.monthlySubscriptionFee || 0) * (formData.estimatedUserCount || 0) * 12,
    };
  } else { // hybrid
    salesModelInfo = {
      model: 'Hibrit Model',
      oneTimePrice: formData.oneTimeSalesPrice || 0,
      monthlyFee: formData.monthlySubscriptionFee || 0,
      targetSales: formData.plannedSalesCount || 0,
      userCount: formData.estimatedUserCount || 0,
      yearlyRevenue: (formData.oneTimeSalesPrice || 0) * (formData.plannedSalesCount || 0) + 
                     (formData.monthlySubscriptionFee || 0) * (formData.estimatedUserCount || 0) * 12,
    };
  }
  
  return {
    projectName: formData.projectName || 'Proje Adı',
    costs: {
      personnel: personnelCost,
      technical: technicalCost,
      management: managementCost,
      marketing: marketingCost,
      contingency,
      total: totalCost
    },
    salesModel: salesModelInfo,
    profitMargin: salesModelInfo.yearlyRevenue ? (salesModelInfo.yearlyRevenue - totalCost) / salesModelInfo.yearlyRevenue * 100 : 0
  };
};

// Rol isimlerini almak için yardımcı fonksiyon
const getRoleName = (role: string): string => {
  const roleMap: Record<string, string> = {
    'developer': 'Yazılımcı',
    'ui_ux': 'UI/UX',
    'tester': 'Testçi',
    'pm': 'Proje Müdürü',
    'devops': 'DevOps',
    'other': 'Diğer'
  };
  
  return roleMap[role] || role;
};

// Risk payını hesaplama
const calculateContingency = (formData: FormData): number => {
  // Toplam maliyetin hesaplanması
  const personnelCost = formData.personnelItems.reduce((sum, item) => sum + (item.monthlySalary * item.count * item.duration), 0);
  const technicalCost = (formData.serverCost || 0) + (formData.domainCost || 0) + (formData.thirdPartyLicenses || 0) + 
                       (formData.dataStorageCost || 0) + (formData.backupCost || 0);
  const managementCost = (formData.accountingCost || 0) + (formData.officeCost || 0) * (formData.officeMonths || 0) + 
                         (formData.hardwareCost || 0);
  const marketingCost = (formData.advertisingBudget || 0) + (formData.salesRepCost || 0) + 
                        (formData.demoCost || 0) + (formData.websiteCost || 0);
  const subtotal = personnelCost + technicalCost + managementCost + marketingCost;
  
  // Risk payının hesaplanması
  return subtotal * (formData.contingencyRate || 0) / 100;
};

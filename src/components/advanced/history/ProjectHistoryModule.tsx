import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '../../ProjectPricingPage';

interface ProjectHistory {
  id: string;
  date: string;
  clientName: string;
  projectName: string;
  totalCost: number;
  totalRevenue: number;
  profit: number;
  salesModel: string;
  oneTimeSalesPrice: number;
  monthlySubscriptionFee: number;
  currencyCode: string;
  language: string;
  projectDuration: number;
  formData: FormData;
}

export const ProjectHistoryModule: React.FC = () => {
  const { watch, setValue, getValues } = useFormContext<FormData>();
  const formValues = watch();
  const currencyCode = watch('currencyCode');
  const language = watch('language');
  
  const [savedProjects, setSavedProjects] = useState<ProjectHistory[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [clientNameInput, setClientNameInput] = useState('');
  const [projectNameInput, setProjectNameInput] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  // Para birimi formatı için yardımcı fonksiyon
  const formatCurrency = (value: number, code: string): string => {
    const localeMap: Record<string, string> = {
      'tr': 'tr-TR',
      'en': 'en-US'
    };
    
    const locale = localeMap[language] || 'tr-TR';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Tarihi formatla
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Local storage'dan kaydedilmiş projeleri yükle
  useEffect(() => {
    try {
      const savedProjectsStr = localStorage.getItem('pricingModuleProjects');
      if (savedProjectsStr) {
        const parsedProjects = JSON.parse(savedProjectsStr) as ProjectHistory[];
        setSavedProjects(parsedProjects);
      }
    } catch (error) {
      console.error('Kaydedilmiş projeler yüklenirken hata:', error);
    }
  }, []);
  
  // Toplam maliyet ve gelir hesaplama
  const calculateTotals = (projectData: FormData) => {
    // Personel maliyeti
    const personnelCost = projectData.personnelItems?.reduce((sum, item) => {
      return sum + (item.monthlySalary * item.count * item.duration);
    }, 0) || 0;
    
    // Teknik maliyetler
    const technicalCost = (projectData.serverCost || 0) + 
                         (projectData.domainCost || 0) + 
                         (projectData.thirdPartyLicenses || 0) + 
                         (projectData.dataStorageCost || 0) + 
                         (projectData.backupCost || 0);
    
    // Yönetim maliyetleri
    const managementCost = (projectData.accountingCost || 0) + 
                          (projectData.officeCost || 0) * (projectData.officeMonths || 0) + 
                          (projectData.hardwareCost || 0);
    
    // Pazarlama maliyetleri
    const marketingCost = (projectData.advertisingBudget || 0) + 
                         (projectData.salesRepCost || 0) + 
                         (projectData.demoCost || 0) + 
                         (projectData.websiteCost || 0);
    
    const subtotal = personnelCost + technicalCost + managementCost + marketingCost;
    const contingency = subtotal * (projectData.contingencyRate || 0) / 100;
    
    const totalCost = subtotal + contingency;
    
    // Gelir hesaplama
    let totalRevenue = 0;
    
    if (projectData.salesModel === 'one_time' || projectData.salesModel === 'hybrid') {
      totalRevenue += (projectData.oneTimeSalesPrice || 0) * (projectData.plannedSalesCount || 0);
    }
    
    if (projectData.salesModel === 'subscription' || projectData.salesModel === 'hybrid') {
      totalRevenue += (projectData.monthlySubscriptionFee || 0) * (projectData.estimatedUserCount || 0) * 12;
    }
    
    return {
      totalCost,
      totalRevenue,
      profit: totalRevenue - totalCost
    };
  };
  
  // Mevcut projeyi kaydet
  const saveCurrentProject = () => {
    if (!clientNameInput.trim()) {
      alert('Lütfen müşteri adı giriniz.');
      return;
    }
    
    if (!projectNameInput.trim()) {
      alert('Lütfen proje adı giriniz.');
      return;
    }
    
    try {
      const currentFormData = getValues();
      const { totalCost, totalRevenue, profit } = calculateTotals(currentFormData);
      
      const newProject: ProjectHistory = {
        id: `project-${Date.now()}`,
        date: new Date().toISOString(),
        clientName: clientNameInput,
        projectName: projectNameInput,
        totalCost,
        totalRevenue,
        profit,
        salesModel: currentFormData.salesModel,
        oneTimeSalesPrice: currentFormData.oneTimeSalesPrice || 0,
        monthlySubscriptionFee: currentFormData.monthlySubscriptionFee || 0,
        currencyCode: currentFormData.currencyCode,
        language: currentFormData.language,
        projectDuration: currentFormData.projectDuration || 12,
        formData: {...currentFormData}
      };
      
      const updatedProjects = [...savedProjects, newProject];
      setSavedProjects(updatedProjects);
      localStorage.setItem('pricingModuleProjects', JSON.stringify(updatedProjects));
      
      setClientNameInput('');
      setProjectNameInput('');
      
      alert(`"${projectNameInput}" projesi başarıyla kaydedildi!`);
    } catch (error) {
      console.error('Proje kaydedilirken hata:', error);
      alert('Proje kaydedilirken bir hata oluştu.');
    }
  };
  
  // Kaydedilmiş projeyi yükle
  const loadProject = (projectId: string) => {
    const project = savedProjects.find(p => p.id === projectId);
    if (!project) return;
    
    try {
      // Form verilerini yükle
      Object.entries(project.formData).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as any, value);
        }
      });
      
      setActiveProject(projectId);
      alert(`"${project.projectName}" projesi başarıyla yüklendi.`);
    } catch (error) {
      console.error('Proje yüklenirken hata:', error);
      alert('Proje yüklenirken bir hata oluştu.');
    }
  };
  
  // Projeyi sil
  const deleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
    setShowDeleteConfirmation(true);
  };
  
  // Silme işlemini onayla
  const confirmDelete = () => {
    if (!projectToDelete) return;
    
    try {
      const updatedProjects = savedProjects.filter(p => p.id !== projectToDelete);
      setSavedProjects(updatedProjects);
      localStorage.setItem('pricingModuleProjects', JSON.stringify(updatedProjects));
      
      if (activeProject === projectToDelete) {
        setActiveProject(null);
      }
      
      setShowDeleteConfirmation(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Proje silinirken hata:', error);
      alert('Proje silinirken bir hata oluştu.');
    }
  };
  
  // Projeleri müşteri adına göre grupla
  const groupedProjects = React.useMemo(() => {
    const grouped: Record<string, ProjectHistory[]> = {};
    
    savedProjects.forEach(project => {
      if (!grouped[project.clientName]) {
        grouped[project.clientName] = [];
      }
      grouped[project.clientName].push(project);
    });
    
    return grouped;
  }, [savedProjects]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-base text-gray-800 mb-4">Mevcut Projeyi Kaydet</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Müşteri Adı
            </label>
            <input
              type="text"
              value={clientNameInput}
              onChange={(e) => setClientNameInput(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              placeholder="Örn: ABC Şirketi"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proje Adı
            </label>
            <input
              type="text"
              value={projectNameInput}
              onChange={(e) => setProjectNameInput(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 px-3"
              placeholder="Örn: E-Ticaret Platformu v1"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveCurrentProject}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Projeyi Kaydet
          </button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-base text-gray-800 mb-4">Kaydedilmiş Projeler</h4>
        
        {Object.keys(groupedProjects).length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>Henüz kaydedilmiş proje bulunmuyor.</p>
            <p className="text-sm mt-1">Mevcut projeyi kaydetmek için yukarıdaki formu kullanın.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedProjects).map(([clientName, projects]) => (
              <div key={clientName} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h5 className="font-medium text-gray-800">{clientName}</h5>
                  <p className="text-xs text-gray-500">{projects.length} proje</p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {projects.map((project) => (
                    <div 
                      key={project.id} 
                      className={`p-4 hover:bg-gray-50 ${activeProject === project.id ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h6 className="font-medium text-gray-800">{project.projectName}</h6>
                        <span className="text-xs text-gray-500">{formatDate(project.date)}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500">Toplam Maliyet:</span>
                          <p className="font-medium">{formatCurrency(project.totalCost, project.currencyCode)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Toplam Gelir:</span>
                          <p className="font-medium">{formatCurrency(project.totalRevenue, project.currencyCode)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Kâr:</span>
                          <p className={`font-medium ${project.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(project.profit, project.currencyCode)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-2">
                        <button
                          type="button"
                          onClick={() => loadProject(project.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Yükle
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProject(project.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-base text-gray-800 mb-4">Proje Karşılaştırma</h4>
        
        {savedProjects.length < 2 ? (
          <div className="text-center py-6 text-gray-500">
            <p>Karşılaştırma için en az iki proje kaydetmeniz gerekmektedir.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri / Proje
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Maliyet
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Gelir
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kâr
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satış Modeli
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {savedProjects.map((project) => (
                  <tr key={project.id} className={activeProject === project.id ? 'bg-blue-50' : ''}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{project.clientName}</div>
                      <div className="text-xs text-gray-500">{project.projectName}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {formatCurrency(project.totalCost, project.currencyCode)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {formatCurrency(project.totalRevenue, project.currencyCode)}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${project.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(project.profit, project.currencyCode)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {project.salesModel === 'one_time' ? 'Tek Seferlik' : 
                       project.salesModel === 'subscription' ? 'Abonelik' : 'Karma'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      {project.oneTimeSalesPrice > 0 && (
                        <div>{formatCurrency(project.oneTimeSalesPrice, project.currencyCode)}</div>
                      )}
                      {project.monthlySubscriptionFee > 0 && (
                        <div className="text-gray-500">
                          {formatCurrency(project.monthlySubscriptionFee, project.currencyCode)}/ay
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Silme Onayı Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Projeyi Sil</h4>
            <p className="text-gray-600 mb-4">
              Bu projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

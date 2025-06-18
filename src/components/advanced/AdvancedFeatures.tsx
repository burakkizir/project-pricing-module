import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { CashFlowModule } from './cashflow/CashFlowModule';
import { CurrencyRatesModule } from './currency/CurrencyRatesModule';
import { ScenarioModule } from './scenarios/ScenarioModule';
import { ROIModule } from './roi/ROIModule';
import { TargetProfitModule } from './targetprofit/TargetProfitModule';
import { ExpenseTypeModule } from './expensetype/ExpenseTypeModule';
import { DelaySimulationModule } from './delay/DelaySimulationModule';
import { MarketingLicensingModule } from './marketing/MarketingLicensingModule';
import { ProjectHistoryModule } from './history/ProjectHistoryModule';
import { VisualizationModule } from './visualization/VisualizationModule';

interface Feature {
  id: string;
  name: string;
  description: string;
  component: React.ReactNode;
  enabled: boolean;
}

export const AdvancedFeatures: React.FC = () => {
  const [features, setFeatures] = React.useState<Feature[]>([
    {
      id: 'cash-flow',
      name: 'Zaman Bazlı Nakit Akışı',
      description: 'Aylara göre maliyet ve gelir planlaması',
      component: <CashFlowModule />,
      enabled: true
    },
    {
      id: 'currency',
      name: 'Döviz Destekli Harcama',
      description: 'Farklı para birimleri için kur oranları ve risk simülasyonu',
      component: <CurrencyRatesModule />,
      enabled: true
    },
    {
      id: 'scenarios',
      name: 'Risk Senaryoları',
      description: 'İyimser/Kötümser/Normal senaryolar ile farklı projeksiyonlar',
      component: <ScenarioModule />,
      enabled: true
    },
    {
      id: 'roi',
      name: 'Yatırım Geri Dönüşü (ROI)',
      description: 'ROI hesaplaması ve amortisman süresi analizi',
      component: <ROIModule />,
      enabled: true
    },
    {
      id: 'target-profit',
      name: 'Hedef Kâr Analizi',
      description: 'Hedef kâr tutarına göre fiyat ve satış adedi hesabı',
      component: <TargetProfitModule />,
      enabled: true
    },
    {
      id: 'expense-type',
      name: 'Sabit/Değişken Gider Ayrımı',
      description: 'Gider kalemlerinin sabit veya değişken olarak sınıflandırılması',
      component: <ExpenseTypeModule />,
      enabled: true
    },
    {
      id: 'delay',
      name: 'Gecikme Simülasyonu',
      description: 'Proje gecikmesi ve fazla mesai senaryosu',
      component: <DelaySimulationModule />,
      enabled: true
    },
    {
      id: 'marketing',
      name: 'Pazarlama ve Lisanslama',
      description: 'App Store, Play Store lisanslama ve pazarlama maliyetleri',
      component: <MarketingLicensingModule />,
      enabled: true
    },
    {
      id: 'project-history',
      name: 'Müşteri/Proje Kaydı',
      description: 'Projelerinizi kaydedin ve karşılaştırın',
      component: <ProjectHistoryModule />,
      enabled: true
    },
    {
      id: 'visualization',
      name: 'Raporlar ve Görselleştirme',
      description: 'Özel grafikler ve raporlar',
      component: <VisualizationModule />,
      enabled: true
    }
  ]);

  const toggleFeature = (id: string) => {
    setFeatures(features.map(feature => 
      feature.id === id ? { ...feature, enabled: !feature.enabled } : feature
    ));
  };

  return (
    <div className="my-4 sm:my-6 md:my-8 space-y-2 sm:space-y-4">
      <div className="border-b pb-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Gelişmiş Özellikler</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          İhtiyacınız olan özellikleri açın veya kapatın
        </p>
      </div>

      <div className="space-y-2">
        {features.map((feature) => (
          <Disclosure key={feature.id} as="div" className="text-left">
            {({ open }) => (
              <>
                <div className="flex items-center flex-wrap sm:flex-nowrap">
                  <Disclosure.Button className="flex justify-between w-full px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-left text-blue-900 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
                    <div className="flex-1 min-w-0">
                      <span className="block truncate font-semibold">{feature.name}</span>
                      <p className="text-xs text-blue-700 truncate">{feature.description}</p>
                    </div>
                    <ChevronUpIcon
                      className={`${
                        open ? 'transform rotate-180' : ''
                      } flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 text-blue-500 ml-1`}
                    />
                  </Disclosure.Button>
                  <div className="ml-2">
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={feature.enabled}
                        onChange={() => toggleFeature(feature.id)}
                        className="sr-only peer" 
                      />
                      <div className="relative w-8 sm:w-11 h-4 sm:h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 sm:peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 sm:after:h-5 after:w-3 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <Disclosure.Panel className="px-2 sm:px-4 pt-2 sm:pt-4 pb-2 text-xs sm:text-sm text-gray-500 overflow-x-auto">
                  <div className="max-w-full">
                    {feature.enabled && feature.component}
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        ))}
      </div>
    </div>
  );
};

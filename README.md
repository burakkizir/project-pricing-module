# Yazılım Projesi Fiyatlama ve Finansal Planlama Modülü

Bu modül, yazılım şirketlerinin projelerinin doğru şekilde fiyatlanması ve kâr-zarar durumunun planlanabilmesi için tasarlanmış kapsamlı bir finansal planlama aracıdır.

## Özellikler

- **Personel Giderleri:** Farklı rollere göre dinamik personel listesi oluşturma
- **Teknik Giderler:** Sunucu, domain, API lisansları vb. maliyetlerin hesaplanması
- **Yönetim ve Operasyonel Giderler:** Muhasebe, ofis kirası, donanım giderleri
- **Pazarlama ve Satış Giderleri:** Reklam, satış temsilcisi, tanıtım maliyetleri
- **Risk Payı:** Beklenmeyen giderler için ayarlanabilir oran
- **Gelir Modelleri:** Tek seferlik satış, abonelik modeli ve hibrit model destekleri
- **Otomatik Hesaplama:** Kâr marjı, break-even analizi, KDV dahil fiyat hesaplama
- **Görselleştirme:** Gider dağılımı grafikleri ve gelir-gider trend analizi
- **Veri Kaydetme:** LocalStorage üzerinde simülasyon kaydı
- **PDF Çıktısı:** Raporlama için PDF çıktısı alma seçeneği (yakında eklenecek)

## Kurulum

Projeyi yerel makinenizde çalıştırmak için:

1. Repoyu klonlayın ya da indirin
2. Gerekli bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. Uygulamayı başlatın:
   ```bash
   npm start
   ```

## Teknolojiler

- **React** - UI framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Stil kütüphanesi
- **React Hook Form** - Form yönetimi
- **Recharts** - Grafik ve veri görselleştirme
- **React Toastify** - Bildirim sistemi
- **LocalStorage** - Veri saklama

## Kullanım

1. Gider kalemlerini ilgili alanlara girin
2. Satış modelinizi ve gelir unsurlarınızı belirleyin
3. Sonuç bölümünde otomatik hesaplanan değerleri görüntüleyin
4. Dilediğiniz zaman simülasyonu kaydedin veya raporlayın

## Geliştirme

Bu proje, React ve TypeScript kullanılarak geliştirilmiştir. Projeyi geliştirmek için:

```bash
npm run build  # Üretim için build almak
npm test       # Testleri çalıştırmak için
```
#   p r o j e c t - p r i c i n g - m o d u l e  
 
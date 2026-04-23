# 📱 Borsa Takip - Android Uygulaması

Android WebView tabanlı BIST (Borsa İstanbul) hisse takip uygulaması. Canlı hisse fiyatları, grafikler ve analiz araçları.

## 🚀 Özellikler

- ✅ Canlı BIST hisse fiyatları (Yahoo Finance API)
- ✅ Favori hisse listesi
- ✅ İnteraktif grafikler (Chart.js)
- ✅ Yüzde değişim göstergeleri
- ✅ Mobil uyumlu tasarım
- ✅ Arama ve filtreleme
- ✅ Otomatik yenileme (30 saniye)

## 📸 Ekran Görüntüleri

![Ana Ekran](https://via.placeholder.com/300x600/4CAF50/FFFFFF?text=Borsa+Takip)
![Grafikler](https://via.placeholder.com/300x600/2196F3/FFFFFF?text=Hisse+Grafikleri)

## 🏗️ Teknik Detaylar

- **Platform**: Android
- **Mimari**: WebView + HTML/CSS/JS
- **API**: Yahoo Finance
- **Min SDK**: 21 (Android 5.0+)
- **Target SDK**: 34 (Android 14)

## 📁 Proje Yapısı

```
borsa-takip/
├── app/
│   ├── src/main/
│   │   ├── java/com/borsa/takip/MainActivity.kt
│   │   ├── res/layout/activity_main.xml
│   │   ├── res/values/strings.xml
│   │   ├── res/values/themes.xml
│   │   ├── AndroidManifest.xml
│   │   └── assets/
│   │       ├── index.html
│   │       ├── style.css
│   │       ├── script.js
│   │       └── Chart.js
├── build.gradle
└── settings.gradle
```

## 🚀 Kurulum

### 1. Android Studio ile:
```bash
git clone https://github.com/hakanerbasss/borsa-takip.git
cd borsa-takip
# Android Studio'da açın ve derleyin
```

### 2. APK İndirme:
[app-debug.apk](https://github.com/hakanerbasss/borsa-takip/releases)

### 3. Doğrudan Çalıştırma:
```bash
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

## 📊 API Kullanımı

Uygulama Yahoo Finance API'sini kullanır:

```javascript
// Hisse verisi çekme
const response = await fetch(
  `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.IS?interval=1d`
);
```

## 🎨 Tasarım

- **Renk Paleti**: Modern finansal arayüz
- **Responsive**: Tüm ekran boyutlarına uyumlu
- **Koyu/Açık Tema**: Sistem temasına uyum

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

MIT License - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👤 Yazar

**Hakan Erbaş**
- GitHub: [@hakanerbasss](https://github.com/hakanerbasss)

## 🙏 Teşekkürler

- Yahoo Finance API ekibi
- Chart.js geliştiricileri
- Tüm açık kaynak katkıda bulunanlar

---
⭐️ Projeyi beğendiyseniz yıldız vermeyi unutmayın!
document.addEventListener('DOMContentLoaded', () => {

  // --- METADATA VE VERİLER ---
  const automationData = [
      {
          id: 1,
          title: "E-commerce Order Tracking",
          description: "Automatically detects new orders, updates stock levels and sends notifications to customers.",
          category: "e-commerce",
          source: "ecommerceordertracker.json"
      },
       {
          id: 2,
          title: "N8n + DeepSeek + ElevenLabs — Voice Assistant",
          description: "Deepseek and Elevenlabs AI-powered voice assistant system",
          category: "AI",
          source: "elevenlabsvoiceassistant.json"
      },
     {
          id: 3,
          title: "Wise Order Otomation",
          description: "Wise foreign exchange transfer application automation",
          category: "Bussines",
          source: "wiseautomate.json"
      },
      
      {
          id: 4,
          title: "AirtableAI Agent project management",
          description: "AirtableAI accelerates teams' business operations and is an embedded artificial intelligence agent at an enterprise scale.",
          category: "Company Regulator",
          source: "airtablemanagement.json"
      },
      {
          id: 5,
          title: "Server Monitoring Reporting",
          description: "It periodically checks the health status of servers in the IT infrastructure and sends alerts in the event of a problem.",
          category: "IT Ops",
          source: "servermonitoringreporting.json"
      },
      {
          id: 6,
          title: "Yeni Satış Fırsatı Oluşturma",
          description: "Web sitesi formundan gelen potansiyel müşteri bilgilerini CRM sistemine otomatik olarak kaydeder.",
          category: "Sales",
          source: "jsons/new-lead-creation.json"
      },
      {
          id: 7,
          title: "Fatura ve Sözleşme Arşivleme",
          description: "Gelen e-postalardaki fatura ve sözleşme eklerini tarar, isimlendirir ve ilgili bulut klasörüne arşivler.",
          category: "Document Ops",
          source: "jsons/invoice-contract-archiver.json"
      },
      {
          id: 8,
          title: "Kripto Varlık Fiyat Uyarısı",
          description: "Belirlediğiniz kripto varlıkların fiyatı, belirlediğiniz seviyeye geldiğinde size bildirim gönderir.",
          category: "Crypto",
          source: "jsons/crypto-price-alert.json"
      },
      {
          id: 9,
          title: "Şirket İçi Yasal Düzenleme Takibi",
          description: "Resmi gazete ve ilgili yasal kaynakları tarayarak şirket regülasyonlarına ilişkin değişiklikleri bildirir.",
          category: "Company Regulator",
          source: "jsons/legal-regulation-tracker.json"
      },
      {
          id: 10,
          title: "Yazılım Build ve Test Süreci",
          description: "Kod deposuna yeni bir commit geldiğinde otomatik olarak build alır, testleri çalıştırır ve sonucu ekibe bildirir.",
          category: "Software",
          source: "jsons/ci-cd-build-test.json"
      },
      {
          id: 11,
          title: "Influencer Kampanya Raporlama",
          description: "Influencer pazarlama kampanyalarının etkileşim oranlarını ve geri dönüşlerini otomatik raporlar.",
          category: "Influencer",
          source: "jsons/influencer-campaign-report.json"
      },
      {
          id: 12,
          title: "Sosyal Medya İçerik Planlayıcı",
          description: "Belirlenen içerikleri ve görselleri, zamanlanmış tarihlerde sosyal medya platformlarında paylaşır.",
          category: "Marketing",
          source: "jsons/social-media-scheduler.json"
      },
     {
          id: 13,
          title: "AI Destekli Müşteri Destek Yanıtları",
          description: "Gelen destek taleplerini analiz eder ve sık sorulan soruları yapay zeka ile otomatik yanıtlar.",
          category: "AI",
          source: "jsons/ai-support-responder.json"
      },
  ];

  const categories = ["All", ...new Set(automationData.map(item => item.category))];

  // --- DOM Elementleri ---
  const searchInput = document.getElementById('search-input');
  const categoryFiltersContainer = document.getElementById('category-filters');
  const resultsContainer = document.getElementById('results-container');
  const noResultsMessage = document.getElementById('no-results');

  // --- FONKSİYONLAR ---

  const renderItems = (items) => {
      resultsContainer.innerHTML = '';
      if (items.length === 0) {
          noResultsMessage.classList.remove('hidden');
      } else {
          noResultsMessage.classList.add('hidden');
      }

      items.forEach(item => {
          const card = document.createElement('div');
          card.className = 'automation-card bg-gray-800 rounded-lg shadow-lg p-5 flex flex-col justify-between border border-gray-700';
          
          card.innerHTML = `
              <div>
                  <div class="flex justify-between items-start mb-3">
                      <h3 class="text-xl font-bold text-white">${item.title}</h3>
                      <span class="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">${item.category}</span>
                  </div>
                  <p class="text-gray-400 text-sm">${item.description}</p>
              </div>
              <button data-id="${item.id}" class="download-btn mt-6 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <i class="fas fa-download"></i>
                  JSON İndir
              </button>
          `;
          resultsContainer.appendChild(card);
      });
  };

  const renderCategoryFilters = () => {
      categories.forEach((category, index) => {
          const button = document.createElement('button');
          button.className = 'filter-btn capitalize px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors';
          if (index === 0) {
              button.classList.add('active');
          }
          button.textContent = category.replace('-', ' ');
          button.dataset.category = category;
          categoryFiltersContainer.appendChild(button);
      });
  };
  
  const filterAndSearch = () => {
      const searchTerm = searchInput.value.toLowerCase().trim();
      const activeCategory = document.querySelector('.filter-btn.active').dataset.category;

      const filteredData = automationData.filter(item => {
          const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
          const matchesSearch = item.title.toLowerCase().includes(searchTerm) || 
                                item.description.toLowerCase().includes(searchTerm) ||
                                item.category.toLowerCase().includes(searchTerm);
          return matchesCategory && matchesSearch;
      });

      renderItems(filteredData);
  };

  /**
   * DÜZELTİLMİŞ İNDİRME FONKSİYONU
   * Bu fonksiyon artık veriyi kendisi oluşturmak yerine, 'source' özelliğinde belirtilen
   * dosyayı direkt olarak indirmek için bir link oluşturur.
   * @param {number} id - İndirilecek otomasyonun ID'si.
   */
  const handleDownload = (id) => {
      const itemToDownload = automationData.find(item => item.id === parseInt(id));
      
      // Eğer öğe veya kaynak yolu bulunamazsa, hatayı konsola yaz ve işlemi durdur.
      if (!itemToDownload || !itemToDownload.source) {
          console.error('İndirilecek öğe veya kaynak yolu (source) bulunamadı:', id);
          return;
      }

      // Geçici bir link (<a>) elementi oluştur
      const a = document.createElement('a');
      
      // Linkin hedefini (href) doğrudan 'source' özelliğindeki dosya yolu olarak ayarla
      a.href = itemToDownload.source;

      // 'download' özelliği, tarayıcının dosyayı açmak yerine indirmesini sağlar.
      // Dosya adını yoldan otomatik olarak alabiliriz: "jsons/dosya.json" -> "dosya.json"
      a.download = itemToDownload.source.split('/').pop();

      // Linki sayfaya ekle, tıkla ve sonra tekrar kaldır.
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  // --- OLAY DİNLEYİCİLERİ ---
  
  searchInput.addEventListener('input', filterAndSearch);

  categoryFiltersContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
          categoryFiltersContainer.querySelector('.active').classList.remove('active');
          e.target.classList.add('active');
          filterAndSearch();
      }
  });

  resultsContainer.addEventListener('click', (e) => {
      const downloadButton = e.target.closest('.download-btn');
      if (downloadButton) {
          const itemId = downloadButton.dataset.id;
          handleDownload(itemId);
      }
  });

  // --- İLK ÇALIŞTIRMA ---
  renderCategoryFilters();
  renderItems(automationData);
});

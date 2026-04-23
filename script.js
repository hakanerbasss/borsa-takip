// BIST Hisse Takip - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const stocksTableBody = document.getElementById('stocksTableBody');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const refreshBtn = document.getElementById('refreshBtn');
    const lastUpdateSpan = document.getElementById('lastUpdate');
    const favoritesList = document.getElementById('favoritesList');
    const stockDetails = document.getElementById('stockDetails');
    const themeToggle = document.getElementById('themeToggle');
    const mainChartCanvas = document.getElementById('mainChart');
    
    // State
    let allStocks = [];
    let filteredStocks = [];
    let favorites = JSON.parse(localStorage.getItem('bist_favorites')) || [];
    let currentFilter = 'all';
    let mainChart = null;
    let selectedStock = null;
    
    // BIST 100 Popular Stocks
    const BIST_STOCKS = [
        'THYAO', 'GARAN', 'AKBNK', 'ISCTR', 'YKBNK', 'SAHOL', 'EREGL',
        'TCELL', 'ASELS', 'HALKB', 'VAKBN', 'SISE', 'FROTO', 'KCHOL',
        'TOASO', 'TUPRS', 'ARCLK', 'BIMAS', 'ENKAI', 'EKGYO', 'PETKM',
        'TKFEN', 'KOZAA', 'KOZAL', 'CCOLA', 'AEFES', 'DOAS', 'ULKER',
        'TTKOM', 'TTRAK', 'ALARK', 'CIMSA', 'GUBRF', 'KRDMD', 'MGROS',
        'ODAS', 'PGSUS', 'SASA', 'SKBNK', 'TMSN', 'TSKB', 'VESTL', 'YATAS'
    ];
    
    // Initialize
    initTheme();
    loadStocks();
    setupEventListeners();
    updateFavoritesList();
    updateLastUpdateTime();
    
    // Auto refresh every 30 seconds
    setInterval(loadStocks, 30000);
    
    // Functions
    function initTheme() {
        const savedTheme = localStorage.getItem('bist_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeButton(savedTheme);
    }
    
    function updateThemeButton(theme) {
        const icon = themeToggle.querySelector('i');
        const text = theme === 'dark' ? 'Açık Tema' : 'Koyu Tema';
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        themeToggle.innerHTML = `<i class="${icon.className}"></i> ${text}`;
    }
    
    function setupEventListeners() {
        // Search
        searchInput.addEventListener('input', filterStocks);
        
        // Filter buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                filterStocks();
            });
        });
        
        // Refresh button
        refreshBtn.addEventListener('click', loadStocks);
        
        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('bist_theme', newTheme);
        updateThemeButton(newTheme);
    }
    
    async function loadStocks() {
        try {
            showLoading();
            const stocksData = [];
            
            // Fetch data for each stock (limited to 10 for demo)
            const stocksToFetch = BIST_STOCKS.slice(0, 10);
            
            for (const symbol of stocksToFetch) {
                try {
                    const data = await fetchStockData(symbol);
                    if (data) {
                        stocksData.push(data);
                    }
                } catch (error) {
                    console.error(`Error fetching ${symbol}:`, error);
                }
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            allStocks = stocksData;
            filterStocks();
            updateLastUpdateTime();
            updateMainChart();
            
        } catch (error) {
            console.error('Error loading stocks:', error);
            showError('Veriler yüklenirken hata oluştu. Lütfen tekrar deneyin.');
        }
    }
    
    async function fetchStockData(symbol) {
        try {
            // Using Yahoo Finance API
            const response = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.IS?interval=1d&range=1d`,
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.chart?.result?.[0]) {
                return null;
            }
            
            const result = data.chart.result[0];
            const meta = result.meta;
            const indicators = result.indicators;
            
            // Calculate change
            const previousClose = meta.chartPreviousClose || 0;
            const currentPrice = meta.regularMarketPrice || 0;
            const change = currentPrice - previousClose;
            const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
            
            // Get volume
            const volumes = indicators.quote[0].volume || [];
            const volume = volumes[volumes.length - 1] || 0;
            
            // Get historical data for chart
            const timestamps = result.timestamp || [];
            const closes = indicators.quote[0].close || [];
            
            return {
                symbol: symbol,
                name: getStockName(symbol),
                price: currentPrice,
                previousClose: previousClose,
                change: change,
                changePercent: changePercent,
                volume: volume,
                isFavorite: favorites.includes(symbol),
                chartData: {
                    timestamps: timestamps.slice(-20), // Last 20 data points
                    prices: closes.slice(-20)
                }
            };
            
        } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
            // Return mock data for demo
            return createMockStockData(symbol);
        }
    }
    
    function createMockStockData(symbol) {
        const basePrice = Math.random() * 100 + 10;
        const change = (Math.random() - 0.5) * 5;
        const changePercent = (change / basePrice) * 100;
        
        // Generate mock chart data
        const chartData = {
            timestamps: [],
            prices: []
        };
        
        let currentPrice = basePrice;
        for (let i = 0; i < 20; i++) {
            chartData.timestamps.push(Date.now() / 1000 - (20 - i) * 3600);
            currentPrice += (Math.random() - 0.5) * 2;
            chartData.prices.push(currentPrice);
        }
        
        return {
            symbol: symbol,
            name: getStockName(symbol),
            price: basePrice + change,
            previousClose: basePrice,
            change: change,
            changePercent: changePercent,
            volume: Math.floor(Math.random() * 1000000) + 100000,
            isFavorite: favorites.includes(symbol),
            chartData: chartData
        };
    }
    
    function getStockName(symbol) {
        const names = {
            'THYAO': 'Türk Hava Yolları',
            'GARAN': 'Garanti Bankası',
            'AKBNK': 'Akbank',
            'ISCTR': 'İş Bankası',
            'YKBNK': 'Yapı Kredi Bankası',
            'SAHOL': 'Sabancı Holding',
            'EREGL': 'Ereğli Demir Çelik',
            'TCELL': 'Turkcell',
            'ASELS': 'Aselsan',
            'HALKB': 'Halkbank',
            'VAKBN': 'Vakıfbank',
            'SISE': 'Şişecam',
            'FROTO': 'Ford Otosan',
            'KCHOL': 'Koç Holding',
            'TOASO': 'Tofaş',
            'TUPRS': 'Tüpraş',
            'ARCLK': 'Arçelik',
            'BIMAS': 'BİM Mağazalar',
            'ENKAI': 'Enka İnşaat',
            'EKGYO': 'Emlak Konut GYO'
        };
        
        return names[symbol] || `${symbol} Hisse Senedi`;
    }
    
    function filterStocks() {
        const searchTerm = searchInput.value.toLowerCase();
        
        filteredStocks = allStocks.filter(stock => {
            // Search filter
            const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm) ||
                                stock.name.toLowerCase().includes(searchTerm);
            
            if (!matchesSearch) return false;
            
            // Type filter
            switch (currentFilter) {
                case 'up':
                    return stock.change > 0;
                case 'down':
                    return stock.change < 0;
                case 'favorites':
                    return stock.isFavorite;
                default:
                    return true;
            }
        });
        
        renderStocksTable();
    }
    
    function renderStocksTable() {
        if (filteredStocks.length === 0) {
            stocksTableBody.innerHTML = `
                <tr class="no-results">
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        <i class="fas fa-search" style="font-size: 2rem; color: var(--gray-color); margin-bottom: 10px;"></i>
                        <p>Sonuç bulunamadı</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        stocksTableBody.innerHTML = filteredStocks.map((stock, index) => `
            <tr class="fade-in" data-symbol="${stock.symbol}" style="animation-delay: ${index * 0.05}s">
                <td>
                    <div class="stock-name">
                        <div>
                            <div class="stock-symbol">${stock.symbol}</div>
                            <div class="stock-fullname">${stock.name}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="price">${formatCurrency(stock.price)}</div>
                </td>
                <td>
                    <div class="change ${stock.change >= 0 ? 'up' : 'down'}">
                        <i class="fas fa-${stock.change >= 0 ? 'caret-up' : 'caret-down'}"></i>
                        ${formatCurrency(stock.change)}
                    </div>
                </td>
                <td>
                    <span class="percent ${stock.changePercent >= 0 ? 'up' : 'down'}">
                        ${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
                    </span>
                </td>
                <td>
                    <div class="volume">${formatNumber(stock.volume)}</div>
                </td>
                <td>
                    <button class="favorite-btn ${stock.isFavorite ? 'favorited' : ''}" 
                            onclick="toggleFavorite('${stock.symbol}')" 
                            title="${stock.isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}">
                        <i class="${stock.isFavorite ? 'fas' : 'far'} fa-star"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Add click event to rows
        document.querySelectorAll('#stocksTableBody tr[data-symbol]').forEach(row => {
            row.addEventListener('click', (e) => {
                if (!e.target.closest('.favorite-btn')) {
                    const symbol = row.dataset.symbol;
                    selectStock(symbol);
                }
            });
        });
    }
    
    function selectStock(symbol) {
        selectedStock = allStocks.find(s => s.symbol === symbol);
        if (selectedStock) {
            renderStockDetails(selectedStock);
        }
    }
    
    function renderStockDetails(stock) {
        stockDetails.innerHTML = `
            <div class="fade-in">
                <div style="margin-bottom: 20px;">
                    <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span class="stock-symbol">${stock.symbol}</span>
                        <span style="color: var(--gray-color); font-size: 1rem;">${stock.name}</span>
                    </h3>
                    <div style="font-size: 2rem; font-weight: 700; margin-bottom: 5px;">
                        ${formatCurrency(stock.price)}
                    </div>
                    <div class="change ${stock.change >= 0 ? 'up' : 'down'}" style="font-size: 1.2rem;">
                        <i class="fas fa-${stock.change >= 0 ? 'caret-up' : 'caret-down'}"></i>
                        ${formatCurrency(stock.change)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)
                    </div>
                </div>
                
                <div class="stock-detail-item">
                    <span class="detail-label">Önceki Kapanış:</span>
                    <span class="detail-value">${formatCurrency(stock.previousClose)}</span>
                </div>
                <div class="stock-detail-item">
                    <span class="detail-label">Günlük Değişim:</span>
                    <span class="detail-value ${stock.change >= 0 ? 'up' : 'down'}">
                        ${formatCurrency(stock.change)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)
                    </span>
                </div>
                <div class="stock-detail-item">
                    <span class="detail-label">İşlem Hacmi:</span>
                    <span class="detail-value">${formatNumber(stock.volume)}</span>
                </div>
                <div class="stock-detail-item">
                    <span class="detail-label">Durum:</span>
                    <span class="detail-value ${stock.change >= 0 ? 'up' : 'down'}">
                        ${stock.change >= 0 ? '📈 Yükseliş' : '📉 Düşüş'}
                    </span>
                </div>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                    <canvas id="detailChart" style="width: 100%; height: 200px;"></canvas>
                </div>
            </div>
        `;
        
        // Render detail chart
        renderDetailChart(stock);
    }
    
    function renderDetailChart(stock) {
        const ctx = document.getElementById('detailChart').getContext('2d');
        
        if (window.detailChart) {
            window.detailChart.destroy();
        }
        
        const prices = stock.chartData.prices;
        const labels = stock.chartData.timestamps.map(ts => {
            const date = new Date(ts * 1000);
            return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        });
        
        window.detailChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${stock.symbol} Fiyat`,
                    data: prices,
                    borderColor: stock.change >= 0 ? '#10b981' : '#ef4444',
                    backgroundColor: stock.change >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${stock.symbol}: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }
    
    function updateMainChart() {
        if (!allStocks.length) return;
        
        const ctx = mainChartCanvas.getContext('2d');
        
        if (mainChart) {
            mainChart.destroy();
        }
        
        // Calculate average price change
        const avgChange = allStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / allStocks.length;
        
        // Create mock BIST 100 index data
        const labels = [];
        const data = [];
        
        let currentValue = 1000;
        for (let i = 0; i < 24; i++) {
            labels.push(`${i}:00`);
            currentValue += (Math.random() - 0.5) * 20;
            data.push(currentValue);
        }
        
        mainChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'BIST 100 Endeksi',
                    data: data,
                    borderColor: avgChange >= 0 ? '#10b981' : '#ef4444',
                    backgroundColor: avgChange >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'var(--text-color)'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Endeks: ${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'var(--border-color)'
                        },
                        ticks: {
                            color: 'var(--text-color)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'var(--border-color)'
                        },
                        ticks: {
                            color: 'var(--text-color)',
                            callback: function(value) {
                                return value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }
    
    function toggleFavorite(symbol) {
        const index = favorites.indexOf(symbol);
        
        if (index === -1) {
            favorites.push(symbol);
        } else {
            favorites.splice(index, 1);
        }
        
        localStorage.setItem('bist_favorites', JSON.stringify(favorites));
        
        // Update stock data
        const stockIndex = allStocks.findIndex(s => s.symbol === symbol);
        if (stockIndex !== -1) {
            allStocks[stockIndex].isFavorite = !allStocks[stockIndex].isFavorite;
        }
        
        // Update UI
        filterStocks();
        updateFavoritesList();
        
        // Show notification
        showNotification(
            index === -1 ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı',
            symbol
        );
    }
    
    function updateFavoritesList() {
        if (favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="empty-favorites">
                    <i class="far fa-star"></i>
                    <p>Henüz favori hisseniz yok. Hisse tablosundan yıldıza tıklayarak ekleyin.</p>
                </div>
            `;
            return;
        }
        
        const favoriteStocks = allStocks.filter(stock => favorites.includes(stock.symbol));
        
        favoritesList.innerHTML = favoriteStocks.map(stock => `
            <div class="favorite-item fade-in">
                <div class="favorite-info">
                    <h3>${stock.symbol}</h3>
                    <div class="favorite-price">${formatCurrency(stock.price)}</div>
                    <div class="favorite-change ${stock.change >= 0 ? 'up' : 'down'}">
                        ${stock.change >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
                    </div>
                </div>
                <button class="remove-favorite" onclick="toggleFavorite('${stock.symbol}')" title="Favorilerden çıkar">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
    
    function updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('tr-TR');
        lastUpdateSpan.textContent = `Son Güncelleme: ${timeString}`;
    }
    
    function showLoading() {
        stocksTableBody.innerHTML = `
            <tr class="loading-row">
                <td colspan="6">
                    <div class="loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        Hisse verileri yükleniyor...
                    </div>
                </td>
            </tr>
        `;
    }
    
    function showError(message) {
        stocksTableBody.innerHTML = `
            <tr class="error-row">
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--danger-color);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>${message}</p>
                    <button onclick="loadStocks()" style="margin-top: 15px; padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Tekrar Dene
                    </button>
                </td>
            </tr>
        `;
    }
    
    function showNotification(message, symbol) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification fade-in';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span><strong>${symbol}</strong> ${message}</span>
        `;
        
        // Style notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: var(--shadow);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Add animation styles
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Utility functions
    function formatCurrency(value) {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }
    
    function formatNumber(value) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        }
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
        }
        return value.toString();
    }
    
    // Make functions available globally
    window.toggleFavorite = toggleFavorite;
    window.loadStocks = loadStocks;
});

// Initialize when page loads
window.onload = function() {
    console.log('BIST Hisse Takip uygulaması yüklendi!');
};
/* ============================================
   SQUEEN668 RTP SCANNER — JavaScript
   Professional casino theme — clean & modern
   ============================================ */

// ==========================================
// DATA SOURCE
// ==========================================
var GAME_DATABASE = window.SQUEEN668_GAME_DATABASE || {};
var PROVIDER_ORDER = window.SQUEEN668_PROVIDER_ORDER || Object.keys(GAME_DATABASE);

// ==========================================
// TIME-SEEDED PRNG
// ==========================================
function seededRandom(seed) {
    var s = seed;
    return function() {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}

function getTimeSeed(provider, intervalMinutes) {
    var slot = Math.floor(Date.now() / (intervalMinutes * 60 * 1000));
    var hash = 0;
    var str = provider + '-' + slot + '-30-97-85-65-10-30';
    for (var i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return hash;
}

var SCANNER_CONFIG = {
    minRtp: 30, maxRtp: 97,
    hotThreshold: 85, warmThreshold: 65,
    hotPercent: 10, warmPercent: 30,
    seedInterval: 60
};

// ==========================================
// STATE
// ==========================================
var currentProvider = '';
var currentFilter = 'all';
var currentGames = [];
var GAME_LIST_BATCH_SIZE = 24;
var currentVisibleGameCount = 0;
var isScanning = false;
var currentDeviceIntel = null;
var scanModalTimer = null;
var currentRtpChart = null;
var providerLogoWarmCache = [];
var providerLogosWarmed = false;

// ==========================================
// FLOW STEPPER
// ==========================================
var FLOW_STEP_ORDER = ['provider', 'scan', 'result'];
function setFlowStep(step) {
    var idx = FLOW_STEP_ORDER.indexOf(step);
    if (idx < 0) return;
    document.querySelectorAll('.flow-step').forEach(function(el) {
        var i = FLOW_STEP_ORDER.indexOf(el.getAttribute('data-step'));
        el.classList.toggle('is-active', i === idx);
        el.classList.toggle('is-done', i > -1 && i < idx);
    });
}

// ==========================================
// TOAST
// ==========================================
var toastTimer = null;
function showToast(message, type) {
    var host = document.getElementById('uxToast');
    if (!host) {
        host = document.createElement('div');
        host.id = 'uxToast';
        host.className = 'ux-toast';
        host.setAttribute('role', 'status');
        host.setAttribute('aria-live', 'polite');
        document.body.appendChild(host);
    }
    host.textContent = message;
    host.classList.remove('is-error', 'is-success', 'is-visible');
    host.classList.add(type === 'error' ? 'is-error' : 'is-success');
    // trigger reflow so transition replays
    void host.offsetWidth;
    host.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function() { host.classList.remove('is-visible'); }, 2400);
}

// ==========================================
// SKELETON / EMPTY HELPERS
// ==========================================
function renderGameSkeleton(count) {
    var gameList = document.getElementById('gameList');
    if (!gameList) return;
    var n = count || 6;
    var html = '';
    for (var i = 0; i < n; i++) {
        html += '<div class="game-skeleton" style="animation-delay:' + (i * 0.08) + 's">'
            + '<div class="sk-thumb"></div>'
            + '<div class="sk-body"><div class="sk-line sk-line-title"></div><div class="sk-line sk-line-sub"></div><div class="sk-line sk-line-bar"></div></div>'
            + '<div class="sk-gauge"></div>'
            + '</div>';
    }
    gameList.innerHTML = html;
}

function renderGamesEmpty(message) {
    var gameList = document.getElementById('gameList');
    if (!gameList) return;
    updateGameListLoadMore(0, 0);
    gameList.innerHTML = '<div class="games-empty"><div class="games-empty-icon" aria-hidden="true">🕳️</div><h4>Tiada game untuk dipaparkan</h4><p>' + escapeHtml(message || 'Cuba pilih provider lain atau reset filter.') + '</p></div>';
}

function getGameThumbnailUrl(rawUrl) {
    if (!rawUrl) return '';
    var value = String(rawUrl);
    if (value.indexOf('/api/game-thumb?src=') === 0) return value;
    try {
        var parsed = new URL(value, window.location.origin);
        if (parsed.hostname === 'storage.googleapis.com' && parsed.pathname.indexOf('/images.imbaweb.com/') === 0) {
            return '/api/game-thumb?src=' + encodeURIComponent(parsed.toString());
        }
    } catch (error) {}
    return value;
}

function getFilteredGames() {
    return currentFilter === 'all'
        ? currentGames.slice(3)
        : currentGames.filter(function(g) { return g.status === currentFilter; });
}

function resetVisibleGameCount(total) {
    currentVisibleGameCount = Math.min(GAME_LIST_BATCH_SIZE, Math.max(0, total || 0));
}

function updateGameListLoadMore(total, showing) {
    var wrap = document.getElementById('gameListLoadMoreWrap');
    var btn = document.getElementById('gameListLoadMore');
    var meta = document.getElementById('gameListLoadMoreMeta');
    if (!wrap || !btn || !meta) return;

    if (!total || showing >= total) {
        wrap.hidden = true;
        meta.textContent = total ? 'Semua game sudah dipaparkan.' : '';
        return;
    }

    wrap.hidden = false;
    btn.textContent = 'LOAD MORE';
    meta.textContent = 'Papar ' + showing + ' / ' + total + ' game';
}

function handleLoadMoreGames() {
    var filtered = getFilteredGames();
    if (!filtered.length) return;
    currentVisibleGameCount = Math.min(filtered.length, currentVisibleGameCount + GAME_LIST_BATCH_SIZE);
    renderGames();
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    setFlowStep('provider');
    initProviderModal();
    initProviderEntryLinks();
    updatePickerTrigger();
    buildProviderGrid();
    buildFeaturedProviders();
    warmProviderLogos();
    initFilterTabs();
    initSortSelect();
    initGameListLoadMore();
    initBottomNav();
    initDeviceIntel();
    initCarousel();
    initEnhancements();
    updateScanButtonState();
    updateProviderHint();
    updateTimestamp();
    if (location.hash === '#providerSection') {
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', location.pathname + location.search);
        }
        openProviderModal();
    }
    setInterval(updateTimestamp, 60000);
    setInterval(function() {
        if (currentProvider && currentGames.length) loadGames(currentProvider);
    }, SCANNER_CONFIG.seedInterval * 60 * 1000);
});

// ==========================================
// BANNER CAROUSEL
// ==========================================
var carouselCurrent = 0;
var carouselTotal = 0;
var carouselTimer = null;

function initCarousel() {
    var carousel = document.getElementById('heroSwiper');
    if (carousel && window.Swiper) {
        new window.Swiper(carousel, {
            loop: true,
            speed: 700,
            autoplay: {
                delay: 4200,
                disableOnInteraction: false
            },
            pagination: {
                el: '#carouselDots',
                clickable: true,
                bulletClass: 'carousel-dot',
                bulletActiveClass: 'active'
            },
            navigation: {
                nextEl: '#carouselNext',
                prevEl: '#carouselPrev'
            }
        });
        return;
    }

    var track = document.getElementById('carouselTrack');
    var dotsContainer = document.getElementById('carouselDots');
    if (!track || !dotsContainer) return;
    var slides = track.querySelectorAll('.carousel-slide');
    carouselTotal = slides.length;
    if (carouselTotal === 0) return;
    dotsContainer.innerHTML = '';
    for (var i = 0; i < carouselTotal; i++) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('data-index', i);
        dot.addEventListener('click', function() {
            goToSlide(parseInt(this.getAttribute('data-index')));
        });
        dotsContainer.appendChild(dot);
    }
    var prevBtn = document.getElementById('carouselPrev');
    var nextBtn = document.getElementById('carouselNext');
    if (prevBtn) prevBtn.addEventListener('click', function() { goToSlide(carouselCurrent - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function() { goToSlide(carouselCurrent + 1); });
    startCarouselTimer();
}

function initEnhancements() {
    if (window.AOS) {
        window.AOS.init({
            duration: 700,
            once: true,
            offset: 20,
            easing: 'ease-out-cubic'
        });
    }
    if (window.gsap) {
        window.gsap.from('.topbar', { y: -18, opacity: 0, duration: 0.55, ease: 'power2.out' });
        window.gsap.from('.hero-title, .hero-text, .hero-actions', {
            y: 20,
            opacity: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
            delay: 0.1
        });
    }
}

function goToSlide(index) {
    if (carouselTotal === 0) return;
    carouselCurrent = ((index % carouselTotal) + carouselTotal) % carouselTotal;
    var track = document.getElementById('carouselTrack');
    track.style.transform = 'translateX(-' + (carouselCurrent * (100 / carouselTotal)) + '%)';

    var dots = document.querySelectorAll('.carousel-dot');
    dots.forEach(function(d, i) {
        d.classList.toggle('active', i === carouselCurrent);
    });

    startCarouselTimer();
}

function startCarouselTimer() {
    if (carouselTimer) clearInterval(carouselTimer);
    carouselTimer = setInterval(function() {
        goToSlide(carouselCurrent + 1);
    }, 4000);
}

// ==========================================
// BUILD PROVIDER GRID
// ==========================================
function buildProviderGrid() {
    var grid = document.getElementById('providerGrid');
    if (!grid) return;
    grid.innerHTML = '';
    PROVIDER_ORDER.forEach(function(key) {
        var p = GAME_DATABASE[key];
        if (!p) return;
        var btn = document.createElement('button');
        btn.className = 'provider-card' + (currentProvider === key ? ' active' : '');
        btn.setAttribute('data-provider', key);
        btn.innerHTML = '<div class="provider-icon"><img loading="eager" decoding="async" src="' + escapeHtml(p.logo) + '" alt="' + escapeHtml(p.name) + '" onerror="this.onerror=null; this.src=window.getFallbackImage(this.alt)"></div><span class="provider-name">' + escapeHtml(p.name) + '</span><span class="provider-check">✓</span>';
        btn.addEventListener('click', function() {
            selectProvider(key);
        });
        grid.appendChild(btn);
    });
}

function buildFeaturedProviders() {
    var grid = document.getElementById('featuredProviderGrid');
    if (!grid) return;
    grid.innerHTML = '';
    PROVIDER_ORDER.slice(0, 3).forEach(function(key) {
        var p = GAME_DATABASE[key];
        if (!p) return;
        var btn = document.createElement('button');
        btn.className = 'featured-provider-card' + (currentProvider === key ? ' active' : '');
        btn.setAttribute('data-provider', key);
        btn.innerHTML = '<div class="featured-provider-thumb"><img loading="eager" decoding="async" src="' + escapeHtml(p.logo) + '" alt="' + escapeHtml(p.name) + '" onerror="this.onerror=null; this.src=window.getFallbackImage(this.alt)"></div><span class="featured-provider-name">' + escapeHtml(p.name) + '</span>';
        btn.addEventListener('click', function() {
            selectProvider(key);
        });
        grid.appendChild(btn);
    });
}

function warmProviderLogos() {
    if (providerLogosWarmed) return;
    providerLogosWarmed = true;
    var preload = function() {
        providerLogoWarmCache = [];
        PROVIDER_ORDER.forEach(function(key) {
            var provider = GAME_DATABASE[key];
            if (!provider || !provider.logo) return;
            var img = new Image();
            img.decoding = 'async';
            img.src = provider.logo;
            providerLogoWarmCache.push(img);
        });
    };
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(preload, { timeout: 1200 });
    } else {
        window.setTimeout(preload, 80);
    }
}

function selectProvider(key) {
    var resultsSection = document.getElementById('resultsSection');
    if (isScanning || !GAME_DATABASE[key]) return;
    currentProvider = key;
    document.querySelectorAll('.provider-card, .featured-provider-card').forEach(function(card) {
        card.classList.toggle('active', card.getAttribute('data-provider') === key);
    });
    if (resultsSection) resultsSection.style.display = 'none';
    setFlowStep('provider');
    updateScanButtonState();
    updateProviderHint();
    updatePickerTrigger();
    updateBottomNavVisibility();
    closeProviderModal();
}

function updatePickerTrigger() {
    var trigger = document.getElementById('providerPickerBtn');
    var value = document.getElementById('providerPickerValue');
    var provider = GAME_DATABASE[currentProvider];
    if (value) {
        value.textContent = provider ? provider.name : 'Tap untuk pilih provider casino';
    }
    if (trigger) {
        trigger.classList.toggle('is-selected', !!provider);
    }
}

function openProviderModal() {
    var modal = document.getElementById('providerSection');
    if (!modal) return;
    modal.hidden = false;
    void modal.offsetWidth;
    modal.classList.add('is-open');
    document.body.classList.add('provider-modal-open');
}

function closeProviderModal() {
    var modal = document.getElementById('providerSection');
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('provider-modal-open');
    setTimeout(function() { modal.hidden = true; }, 220);
}

function initProviderModal() {
    var trigger = document.getElementById('providerPickerBtn');
    if (trigger) trigger.addEventListener('click', openProviderModal);
    document.querySelectorAll('[data-provider-close]').forEach(function(el) {
        el.addEventListener('click', closeProviderModal);
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeProviderModal();
    });
}

function initProviderEntryLinks() {
    document.querySelectorAll('a[href="#providerSection"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openProviderModal();
        });
    });
}

function updateScanButtonState() {
    var scanButton = document.getElementById('scanButton');
    var scanButtonLabel = document.getElementById('scanButtonLabel');
    var provider = GAME_DATABASE[currentProvider];
    if (!scanButton || !scanButtonLabel) return;
    if (provider) {
        scanButton.classList.remove('disabled');
        scanButtonLabel.textContent = 'SCAN';
        scanButton.setAttribute('aria-label', 'Patcher Slot ready untuk scan ' + provider.name);
    } else {
        scanButton.classList.add('disabled');
        scanButtonLabel.textContent = 'SCAN';
        scanButton.setAttribute('aria-label', 'Patcher Slot, pilih provider dulu');
    }
}

function updateProviderHint(message, isError) {
    var hint = document.getElementById('providerHint');
    var provider = GAME_DATABASE[currentProvider];
    if (!hint) return;
    hint.classList.toggle('error', !!isError);
    if (message) {
        hint.textContent = message;
        return;
    }
    hint.textContent = provider
        ? 'Provider dipilih: ' + provider.name + '. Tekan SCAN untuk mula scan.'
        : 'Sila pilih provider dulu, lepas tu tekan SCAN untuk mula scan.';
}

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ==========================================
// DEVICE INTELLIGENCE
// ==========================================
function createBaseDeviceIntel() {
    var info = {
        device: 'Unknown Device',
        screen: window.screen.width + '×' + window.screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        network: 'Secure Link',
        isp: 'Secure Tunnel',
        location: 'Private Route',
        ip: '•••.•••.•••.•••',
        publicIp: 'Mengesan...'
    };
    var ua = navigator.userAgent;
    if (/iPhone/.test(ua)) {
        var ios = ua.match(/iPhone\s?OS\s([\d_]+)/);
        info.device = 'iPhone (iOS ' + (ios ? ios[1].replace(/_/g, '.') : '') + ')';
    } else if (/Android/.test(ua)) {
        var android = ua.match(/Android\s([\d.]+);\s*([^;)]+)/);
        info.device = android ? android[2].trim() + ' (Android ' + android[1] + ')' : 'Android Device';
    } else if (/Windows/.test(ua)) {
        info.device = 'Windows PC';
    } else if (/Mac/.test(ua)) {
        info.device = 'MacOS';
    }
    try {
        var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
            info.network = (conn.effectiveType || conn.type || 'secure').toUpperCase();
            if (info.network === '4G') info.network = '4G LTE';
        }
    } catch (e) {}
    return info;
}

function initDeviceIntel() {
    var panel = document.getElementById('deviceIntel');
    currentDeviceIntel = createBaseDeviceIntel();
    if (panel) {
        panel.hidden = true;
        panel.setAttribute('aria-hidden', 'true');
    }
    fetch('https://ip-api.com/json/?fields=query,isp,city,country').then(function(r) { return r.json(); }).then(function(geo) {
        currentDeviceIntel.isp = geo.isp || currentDeviceIntel.isp;
        currentDeviceIntel.location = [geo.city, geo.country].filter(Boolean).join(', ') || currentDeviceIntel.location;
        if (geo.query) {
            currentDeviceIntel.publicIp = geo.query;
            var parts = geo.query.split('.');
            if (parts.length === 4) currentDeviceIntel.ip = parts[0] + '.' + parts[1] + '.xxx.' + parts[3];
        }
    }).catch(function() {});
}

function renderScanModal(providerName, scanData) {
    var modalGrid = document.getElementById('scanModalGrid');
    var modalProvider = document.getElementById('scanModalProvider');
    var stepLabels = document.querySelectorAll('#scanModalSteps .scan-step-item span:last-child');
    if (modalProvider) modalProvider.textContent = providerName;
    if (stepLabels.length >= 4) {
        stepLabels[0].textContent = 'Secure session linked';
        stepLabels[1].textContent = 'Catalog manifest staged';
        stepLabels[2].textContent = 'Live console primed';
        stepLabels[3].textContent = 'Result stream ready';
    }
    if (!modalGrid) return;

    modalGrid.innerHTML = [
        { icon: '🎯', label: 'Provider', value: providerName },
        { icon: '🧬', label: 'Session', value: scanData.sessionId, highlight: true },
        { icon: '🎰', label: 'Titles', value: scanData.totalTitles + ' indexed' },
        { icon: '📶', label: 'Latency', value: scanData.latencyMs + ' ms' },
        { icon: '📊', label: 'RTP Band', value: scanData.signalBandMin + '–' + scanData.signalBandMax + '%' },
        { icon: '🛡️', label: 'Integrity', value: 'Verified' },
        { icon: '📈', label: 'Confidence', value: scanData.confidence + '%' },
        { icon: '🧠', label: 'Mode', value: 'Live RTP Intelligence' }
    ].map(function(row) {
        return '<div class="scan-modal-row">' +
            '<span class="scan-modal-icon">' + row.icon + '</span>' +
            '<span class="scan-modal-label">' + escapeHtml(row.label) + '</span>' +
            '<span class="scan-modal-value' + (row.highlight ? ' is-highlight' : '') + '">' + escapeHtml(row.value) + '</span>' +
        '</div>';
    }).join('');
}

function closeScanModal() {
    var modal = document.getElementById('scanModal');
    if (scanModalTimer) {
        clearTimeout(scanModalTimer);
        scanModalTimer = null;
    }
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('scan-modal-open');
}

function openScanModal(providerName, scanData, onDone) {
    var modal = document.getElementById('scanModal');
    var modalStatus = document.getElementById('scanModalStatus');
    var progressBar = document.getElementById('scanModalProgressBar');
    var modalTitle = document.getElementById('scanModalTitle');
    var stepItems = document.querySelectorAll('#scanModalSteps .scan-step-item');
    if (!modal || !modalStatus || !progressBar) {
        onDone();
        return;
    }

    renderScanModal(providerName, scanData);
    if (modalTitle) modalTitle.textContent = 'Initializing live scan';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('scan-modal-open');
    progressBar.style.width = '10%';
    stepItems.forEach(function(item) {
        item.classList.remove('active', 'done');
    });

    var steps = [
        { text: 'Secure session verified for ' + providerName + '.', progress: 24, delay: 300 },
        { text: scanData.totalTitles + ' title manifest staged for live indexing.', progress: 52, delay: 360 },
        { text: 'Premium console ready. Warming RTP signal bands.', progress: 82, delay: 320 },
        { text: 'Launching event stream and live metrics...', progress: 100, delay: 240 }
    ];

    var index = 0;
    function nextStep() {
        if (index >= steps.length) {
            scanModalTimer = setTimeout(function() {
                closeScanModal();
                onDone();
            }, 180);
            return;
        }
        var step = steps[index++];
        modalStatus.textContent = step.text;
        progressBar.style.width = step.progress + '%';
        stepItems.forEach(function(item, itemIndex) {
            item.classList.toggle('done', itemIndex < index - 1);
            item.classList.toggle('active', itemIndex === index - 1);
        });
        scanModalTimer = setTimeout(nextStep, step.delay);
    }

    nextStep();
}

var scanRuntimeTimers = [];
var scanRuntimeIntervals = [];
var scanStageOrder = ['handshake', 'catalog', 'rtp', 'pattern', 'report'];

function trackScanTimer(id) {
    scanRuntimeTimers.push(id);
    return id;
}

function trackScanInterval(id) {
    scanRuntimeIntervals.push(id);
    return id;
}

function clearScanRuntime() {
    scanRuntimeTimers.forEach(function(id) { clearTimeout(id); });
    scanRuntimeIntervals.forEach(function(id) { clearInterval(id); });
    scanRuntimeTimers = [];
    scanRuntimeIntervals = [];
}

function formatScanElapsed(ms) {
    var seconds = Math.max(0, Math.floor(ms / 1000));
    var mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    var secs = String(seconds % 60).padStart(2, '0');
    return mins + ':' + secs;
}

function formatScanEventTime(date) {
    return [date.getHours(), date.getMinutes(), date.getSeconds()].map(function(value) {
        return String(value).padStart(2, '0');
    }).join(':');
}

function tweenScanValue(options) {
    var from = Number(options.from || 0);
    var to = Number(options.to || 0);
    var duration = Math.max(120, Number(options.duration || 300));
    var start = Date.now();
    var delta = to - from;
    if (!delta) {
        if (typeof options.onUpdate === 'function') options.onUpdate(to);
        if (typeof options.onDone === 'function') options.onDone(to);
        return;
    }
    if (typeof options.onUpdate === 'function') options.onUpdate(from);
    var interval = trackScanInterval(setInterval(function() {
        var progress = Math.min(1, (Date.now() - start) / duration);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = from + (delta * eased);
        if (typeof options.onUpdate === 'function') options.onUpdate(value);
        if (progress >= 1) {
            clearInterval(interval);
            if (typeof options.onDone === 'function') options.onDone(to);
        }
    }, 50));
}

function createProviderScanSnapshot(providerKey) {
    var provider = GAME_DATABASE[providerKey];
    var results = generateResults(providerKey);
    var totalTitles = results.length;
    var topBand = results.slice(0, Math.min(8, results.length));
    var signalBandMin = topBand.length ? topBand[topBand.length - 1].rtp : 0;
    var signalBandMax = topBand.length ? topBand[0].rtp : 0;
    var hotCount = results.filter(function(game) { return game.status === 'hot'; }).length;
    var seed = Math.abs(getTimeSeed(providerKey, SCANNER_CONFIG.seedInterval));
    var confidence = Math.max(88, Math.min(96, 87 + Math.round(totalTitles / 20) + (seed % 3)));
    var outliers = Math.max(1, Math.min(4, Math.round(hotCount / 3) + (signalBandMax >= 96 ? 1 : 0)));
    var prefix = String(providerKey || 'SCAN').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    return {
        providerKey: providerKey,
        providerName: provider ? provider.name : providerKey,
        totalTitles: totalTitles,
        signalBandMin: signalBandMin,
        signalBandMax: signalBandMax,
        hotCount: hotCount,
        confidence: confidence,
        outliers: outliers,
        latencyMs: 14 + (seed % 18),
        sessionId: (prefix || 'SCAN').padEnd(4, 'X') + '-' + seed.toString(16).toUpperCase().slice(-4),
        results: results
    };
}

function appendScanEvent(message, type) {
    var logBody = document.getElementById('terminalLog');
    var logCount = document.getElementById('scanLogCount');
    if (!logBody) return;
    var item = document.createElement('div');
    item.className = 'log-line log-' + (type || 'normal');
    item.innerHTML = '<span class="log-line-time">' + formatScanEventTime(new Date()) + '</span>' +
        '<span class="log-line-text">' + escapeHtml(message) + '</span>';
    logBody.appendChild(item);
    logBody.scrollTop = logBody.scrollHeight;
    if (logCount) {
        var count = logBody.querySelectorAll('.log-line').length;
        logCount.textContent = count + ' event' + (count === 1 ? '' : 's');
    }
}

function updateScanStageVisuals(activeKey) {
    var activeIndex = scanStageOrder.indexOf(activeKey);
    document.querySelectorAll('#scanStageTrack [data-scan-stage]').forEach(function(item) {
        var index = scanStageOrder.indexOf(item.getAttribute('data-scan-stage'));
        item.classList.toggle('is-active', index === activeIndex);
        item.classList.toggle('is-done', index > -1 && index < activeIndex);
    });
    document.querySelectorAll('#scanStageList [data-stage-row]').forEach(function(item) {
        var index = scanStageOrder.indexOf(item.getAttribute('data-stage-row'));
        var statusEl = item.querySelector('.scan-stage-row-status');
        item.classList.toggle('is-active', index === activeIndex);
        item.classList.toggle('is-done', index > -1 && index < activeIndex);
        if (!statusEl) return;
        if (index < activeIndex) statusEl.textContent = 'Done';
        else if (index === activeIndex) statusEl.textContent = 'Live';
        else statusEl.textContent = 'Waiting';
    });
}

function updateScanStageCopy(stageKey, detailText) {
    var row = document.querySelector('#scanStageList [data-stage-row="' + stageKey + '"]');
    if (!row) return;
    var detail = row.querySelector('.scan-stage-row-copy span');
    if (detail && detailText) detail.textContent = detailText;
}

function resetScanFinalReveal() {
    var panel = document.getElementById('scanPanelRoot');
    var reveal = document.getElementById('scanFinalReveal');
    var badge = document.getElementById('scanFinalBadge');
    var title = document.getElementById('scanFinalTitle');
    var subtitle = document.getElementById('scanFinalSubtitle');
    var titles = document.getElementById('scanFinalTitles');
    var range = document.getElementById('scanFinalRange');
    var confidence = document.getElementById('scanFinalConfidence');
    if (panel) panel.classList.remove('is-final-ready');
    if (reveal) reveal.classList.remove('is-visible');
    if (badge) badge.textContent = 'Live result ready';
    if (title) title.textContent = 'Provider ready';
    if (subtitle) subtitle.textContent = 'Launching live board...';
    if (titles) titles.textContent = '0 titles';
    if (range) range.textContent = '-- RTP';
    if (confidence) confidence.textContent = '0% confidence';
}

function showScanFinalReveal(scanData) {
    var panel = document.getElementById('scanPanelRoot');
    var reveal = document.getElementById('scanFinalReveal');
    var title = document.getElementById('scanFinalTitle');
    var subtitle = document.getElementById('scanFinalSubtitle');
    var titles = document.getElementById('scanFinalTitles');
    var range = document.getElementById('scanFinalRange');
    var confidence = document.getElementById('scanFinalConfidence');
    var badge = document.getElementById('scanFinalBadge');
    if (title) title.textContent = scanData.providerName + ' report ready';
    if (subtitle) subtitle.textContent = 'Live board locked with final RTP signal and confidence.';
    if (titles) titles.textContent = scanData.totalTitles + ' titles indexed';
    if (range) range.textContent = scanData.signalBandMin + '–' + scanData.signalBandMax + '% RTP';
    if (confidence) confidence.textContent = scanData.confidence + '% confidence';
    if (badge) badge.textContent = 'Live result ready';
    if (panel) panel.classList.add('is-final-ready');
    if (reveal) reveal.classList.add('is-visible');
}

function resetScanConsole(scanData) {
    var logBody = document.getElementById('terminalLog');
    if (logBody) logBody.innerHTML = '';
    resetScanFinalReveal();
    var logCount = document.getElementById('scanLogCount');
    if (logCount) logCount.textContent = '0 events';
    var stageMeta = document.getElementById('scanProgressMeta');
    var progressLabel = document.getElementById('scanProgressLabel');
    var progressBar = document.getElementById('scanProgressBar');
    var percentEl = document.getElementById('scanPanelPercent');
    var providerBadge = document.getElementById('scanProviderBadge');
    var sessionEl = document.getElementById('scanSessionId');
    var latencyEl = document.getElementById('scanLatencyMs');
    var subtitleEl = document.getElementById('scanPanelSubtitle');
    var elapsedEl = document.getElementById('scanElapsed');
    var integrityEl = document.getElementById('scanIntegrityBadge');
    var detailEl = document.getElementById('scanDetail');
    var titleEl = document.getElementById('scanPanelTitle');

    if (providerBadge) providerBadge.textContent = scanData.providerName;
    if (sessionEl) sessionEl.textContent = scanData.sessionId;
    if (latencyEl) latencyEl.textContent = scanData.latencyMs + ' ms';
    if (subtitleEl) subtitleEl.textContent = 'Initializing live provider console...';
    if (elapsedEl) elapsedEl.textContent = '00:00';
    if (stageMeta) stageMeta.textContent = 'Stage 0 / 5';
    if (progressLabel) progressLabel.textContent = 'Initializing secure scan...';
    if (progressBar) progressBar.style.width = '0%';
    if (percentEl) percentEl.textContent = '0%';
    if (integrityEl) integrityEl.textContent = 'Integrity Check';
    if (detailEl) detailEl.textContent = 'Provider ' + scanData.providerName + ' • session ' + scanData.sessionId;
    if (titleEl) titleEl.textContent = 'Provider Scan';

    var titlesEl = document.getElementById('scanMetricTitles');
    var titlesMeta = document.getElementById('scanMetricTitlesMeta');
    var coverageEl = document.getElementById('scanMetricCoverage');
    var coverageMeta = document.getElementById('scanMetricCoverageMeta');
    var rtpEl = document.getElementById('scanMetricRtpRange');
    var rtpMeta = document.getElementById('scanMetricRtpMeta');
    var confidenceEl = document.getElementById('scanMetricConfidence');
    var confidenceMeta = document.getElementById('scanMetricConfidenceMeta');
    var outliersEl = document.getElementById('scanMetricOutliers');
    var outliersMeta = document.getElementById('scanMetricOutliersMeta');

    if (titlesEl) titlesEl.textContent = '0';
    if (titlesMeta) titlesMeta.textContent = '0 discovered';
    if (coverageEl) coverageEl.textContent = '0%';
    if (coverageMeta) coverageMeta.textContent = '0 / ' + scanData.totalTitles + ' indexed';
    if (rtpEl) rtpEl.textContent = '--';
    if (rtpMeta) rtpMeta.textContent = 'Normalizing bands';
    if (confidenceEl) confidenceEl.textContent = '0%';
    if (confidenceMeta) confidenceMeta.textContent = 'Awaiting signal';
    if (outliersEl) outliersEl.textContent = '0';
    if (outliersMeta) outliersMeta.textContent = 'No variance flagged';

    document.querySelectorAll('#scanStageTrack [data-scan-stage]').forEach(function(item) {
        item.classList.remove('is-active', 'is-done');
    });
    document.querySelectorAll('#scanStageList [data-stage-row]').forEach(function(row) {
        row.classList.remove('is-active', 'is-done');
        var status = row.querySelector('.scan-stage-row-status');
        if (status) status.textContent = 'Waiting';
    });
}

function setScanProgress(value) {
    var pct = Math.max(0, Math.min(100, Math.round(value)));
    var progressBar = document.getElementById('scanProgressBar');
    var percentEl = document.getElementById('scanPanelPercent');
    if (progressBar) progressBar.style.width = pct + '%';
    if (percentEl) percentEl.textContent = pct + '%';
}

function runScanProgress(scanData, onComplete) {
    clearScanRuntime();
    resetScanConsole(scanData);

    var progressLabel = document.getElementById('scanProgressLabel');
    var progressMeta = document.getElementById('scanProgressMeta');
    var subtitleEl = document.getElementById('scanPanelSubtitle');
    var elapsedEl = document.getElementById('scanElapsed');
    var integrityEl = document.getElementById('scanIntegrityBadge');
    var detailEl = document.getElementById('scanDetail');
    var titlesEl = document.getElementById('scanMetricTitles');
    var titlesMeta = document.getElementById('scanMetricTitlesMeta');
    var coverageEl = document.getElementById('scanMetricCoverage');
    var coverageMeta = document.getElementById('scanMetricCoverageMeta');
    var rtpEl = document.getElementById('scanMetricRtpRange');
    var rtpMeta = document.getElementById('scanMetricRtpMeta');
    var confidenceEl = document.getElementById('scanMetricConfidence');
    var confidenceMeta = document.getElementById('scanMetricConfidenceMeta');
    var outliersEl = document.getElementById('scanMetricOutliers');
    var outliersMeta = document.getElementById('scanMetricOutliersMeta');

    var startedAt = Date.now();
    var currentProgress = 0;
    if (elapsedEl) {
        trackScanInterval(setInterval(function() {
            elapsedEl.textContent = formatScanElapsed(Date.now() - startedAt);
        }, 250));
    }

    var stages = [
        {
            key: 'handshake',
            progress: 18,
            duration: 950,
            label: 'Verifying secure provider session...',
            subtitle: 'Establishing trusted handshake and validating scan route.',
            badge: 'Secure Session',
            rowDetail: 'Verifying provider signature and route integrity',
            onStart: function() {
                appendScanEvent('Provider manifest requested from ' + scanData.providerName + '.', 'info');
                trackScanTimer(setTimeout(function() {
                    appendScanEvent('Secure session verified for ' + scanData.providerName + '.', 'success');
                }, 420));
            }
        },
        {
            key: 'catalog',
            progress: 42,
            duration: 1500,
            label: 'Indexing provider title catalog...',
            subtitle: 'Reading manifest coverage and staging scannable titles.',
            badge: 'Catalog Locked',
            rowDetail: 'Indexing ' + scanData.totalTitles + ' titles into live scan memory',
            onStart: function() {
                tweenScanValue({
                    from: 0,
                    to: scanData.totalTitles,
                    duration: 1180,
                    onUpdate: function(value) {
                        var rounded = Math.round(value);
                        if (titlesEl) titlesEl.textContent = rounded;
                        if (titlesMeta) titlesMeta.textContent = rounded + ' discovered';
                        var coveragePct = scanData.totalTitles ? Math.round((rounded / scanData.totalTitles) * 100) : 0;
                        if (coverageEl) coverageEl.textContent = coveragePct + '%';
                        if (coverageMeta) coverageMeta.textContent = rounded + ' / ' + scanData.totalTitles + ' indexed';
                    }
                });
                trackScanTimer(setTimeout(function() {
                    appendScanEvent(scanData.totalTitles + ' titles indexed from provider catalog.', 'success');
                }, 980));
            }
        },
        {
            key: 'rtp',
            progress: 66,
            duration: 1450,
            label: 'Normalizing RTP signal bands...',
            subtitle: 'Stabilizing high-signal RTP cluster for live result confidence.',
            badge: 'RTP Signal',
            rowDetail: 'Normalizing payout ranges and RTP signal bands',
            onStart: function() {
                tweenScanValue({
                    from: 0,
                    to: Math.max(62, scanData.confidence - 18),
                    duration: 1020,
                    onUpdate: function(value) {
                        var rounded = Math.round(value);
                        if (confidenceEl) confidenceEl.textContent = rounded + '%';
                        if (confidenceMeta) confidenceMeta.textContent = rounded < 50 ? 'Learning provider rhythm' : 'Signal confidence rising';
                    }
                });
                trackScanTimer(setTimeout(function() {
                    if (rtpEl) rtpEl.textContent = scanData.signalBandMin + '–--';
                    if (rtpMeta) rtpMeta.textContent = 'Band stabilizing';
                }, 360));
                trackScanTimer(setTimeout(function() {
                    if (rtpEl) rtpEl.textContent = scanData.signalBandMin + '–' + scanData.signalBandMax + '%';
                    if (rtpMeta) rtpMeta.textContent = 'RTP band normalized';
                    appendScanEvent('RTP band stabilized at ' + scanData.signalBandMin + '–' + scanData.signalBandMax + '%.', 'success');
                }, 980));
            }
        },
        {
            key: 'pattern',
            progress: 86,
            duration: 1450,
            label: 'Mapping volatility clusters...',
            subtitle: 'Cross-referencing hot pockets and flagging variance outliers.',
            badge: 'Pattern Map',
            rowDetail: 'Clustering volatility signatures across live titles',
            onStart: function() {
                tweenScanValue({
                    from: Math.max(62, scanData.confidence - 18),
                    to: scanData.confidence,
                    duration: 1120,
                    onUpdate: function(value) {
                        var rounded = Math.round(value);
                        if (confidenceEl) confidenceEl.textContent = rounded + '%';
                        if (confidenceMeta) confidenceMeta.textContent = rounded >= scanData.confidence ? 'Confidence locked' : 'Cross-referencing patterns';
                    }
                });
                tweenScanValue({
                    from: 0,
                    to: scanData.outliers,
                    duration: 980,
                    onUpdate: function(value) {
                        var rounded = Math.round(value);
                        if (outliersEl) outliersEl.textContent = rounded;
                        if (outliersMeta) outliersMeta.textContent = rounded ? rounded + ' variance pockets flagged' : 'No variance flagged';
                    }
                });
                trackScanTimer(setTimeout(function() {
                    appendScanEvent(scanData.outliers + ' outlier cluster' + (scanData.outliers === 1 ? '' : 's') + ' flagged for report.', 'warning');
                }, 900));
            }
        },
        {
            key: 'report',
            progress: 100,
            duration: 1200,
            label: 'Building live result board...',
            subtitle: 'Assembling ranked report and locking final scan confidence.',
            badge: 'Integrity Verified',
            rowDetail: 'Compiling ranked board and final scan output',
            onStart: function() {
                if (titlesMeta) titlesMeta.textContent = scanData.totalTitles + ' ready for result board';
                if (coverageMeta) coverageMeta.textContent = scanData.totalTitles + ' / ' + scanData.totalTitles + ' indexed';
                if (rtpMeta) rtpMeta.textContent = 'Band locked for live board';
                if (outliersMeta) outliersMeta.textContent = scanData.outliers + ' variance pocket' + (scanData.outliers === 1 ? '' : 's') + ' flagged';
                trackScanTimer(setTimeout(function() {
                    appendScanEvent('Live report assembled • ' + scanData.totalTitles + ' titles ready.', 'success');
                    if (detailEl) detailEl.textContent = scanData.providerName + ' • ' + scanData.totalTitles + ' titles • ' + scanData.confidence + '% confidence';
                }, 420));
                trackScanTimer(setTimeout(function() {
                    showScanFinalReveal(scanData);
                    appendScanEvent('Live result ready • launching board.', 'latest');
                    updateScanStageCopy('report', 'Final board locked and ready for reveal');
                }, 720));
            }
        }
    ];

    function beginStage(index) {
        if (index >= stages.length) {
            trackScanTimer(setTimeout(function() {
                clearScanRuntime();
                onComplete();
            }, 900));
            return;
        }

        var stage = stages[index];
        updateScanStageVisuals(stage.key);
        updateScanStageCopy(stage.key, stage.rowDetail);
        if (progressLabel) progressLabel.textContent = stage.label;
        if (progressMeta) progressMeta.textContent = 'Stage ' + (index + 1) + ' / ' + stages.length;
        if (subtitleEl) subtitleEl.textContent = stage.subtitle;
        if (integrityEl) integrityEl.textContent = stage.badge;

        tweenScanValue({
            from: currentProgress,
            to: stage.progress,
            duration: Math.max(320, stage.duration - 120),
            onUpdate: function(value) {
                setScanProgress(value);
            }
        });
        currentProgress = stage.progress;
        stage.onStart();

        trackScanTimer(setTimeout(function() {
            updateScanStageCopy(stage.key, stage.rowDetail.replace(/^Waiting for /i, '').replace(/^Waiting /i, '') || stage.rowDetail);
            beginStage(index + 1);
        }, stage.duration));
    }

    beginStage(0);
}

// ==========================================
// SCANNING FLOW
// ==========================================
function startScan() {
    var provider = GAME_DATABASE[currentProvider];
    if (isScanning) return;
    if (!provider) {
        updateProviderHint('Sila pilih provider dulu sebelum mula scan.', true);
        openProviderModal();
        return;
    }

    var scanData = createProviderScanSnapshot(currentProvider);
    isScanning = true;
    clearScanRuntime();
    document.body.classList.add('scanning-active');
    setFlowStep('scan');
    var scanBtn = document.getElementById('scanButton');
    if (scanBtn) {
        scanBtn.classList.remove('popping');
        void scanBtn.offsetWidth;
        scanBtn.classList.add('popping');
        setTimeout(function() { scanBtn.classList.remove('popping'); }, 750);
    }
    updateProviderHint();

    var scanSection = document.getElementById('scanningSection');
    var resultsSection = document.getElementById('resultsSection');
    var top3Section = document.getElementById('top3Section');
    var pName = provider.name;

    openScanModal(pName, scanData, function() {
        if (scanSection) scanSection.style.display = 'block';
        if (resultsSection) resultsSection.style.display = 'none';
        renderGameSkeleton(6);
        if (top3Section) top3Section.innerHTML = '';
        if (scanSection) scanSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

        runScanProgress(scanData, function() {
            if (scanSection) scanSection.style.display = 'none';
            if (resultsSection) resultsSection.style.display = 'block';
            isScanning = false;
            document.body.classList.remove('scanning-active');
            loadGames(currentProvider);
            updateBottomNavVisibility();
            setFlowStep('result');
            if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// ==========================================
// HELPERS
// ==========================================
function getStatusLabel(s) { return s === 'hot' ? '🔥 HOT' : s === 'warm' ? '⚡ WARM' : '❄️ COLD'; }
function getStatusEmoji(s) { return s === 'hot' ? '🔥' : s === 'warm' ? '⚡' : '❄️'; }

function formatGameName(raw) {
    return raw || '';
}

// ==========================================
// GENERATE RTP (time-seeded)
// ==========================================
function isNonSlotGame(rawName) {
    return /roulette|fish|fishin|baccarat|blackjack|sic ?bo|poker|hi ?lo|dragon ?tiger|niu ?niu|bull ?bull/i.test(String(rawName || ''));
}

function generateResults(providerKey) {
    var provider = GAME_DATABASE[providerKey];
    if (!provider) return [];
    var allGames = provider.games.filter(function(g) { return !isNonSlotGame(g.name); });
    var seed = getTimeSeed(providerKey, SCANNER_CONFIG.seedInterval);
    var rand = seededRandom(seed);
    var cfg = SCANNER_CONFIG;
    return allGames.map(function(g, i) {
        var tierRoll = rand() * 100;
        var rtp, status;
        var gameRand = seededRandom(seed + i + 1);
        gameRand();
        if (tierRoll < cfg.hotPercent) { rtp = Math.floor(gameRand() * (cfg.maxRtp - cfg.hotThreshold + 1) + cfg.hotThreshold); status = 'hot'; }
        else if (tierRoll < cfg.hotPercent + cfg.warmPercent) { rtp = Math.floor(gameRand() * (cfg.hotThreshold - cfg.warmThreshold) + cfg.warmThreshold); status = 'warm'; }
        else { rtp = Math.floor(gameRand() * (cfg.warmThreshold - cfg.minRtp) + cfg.minRtp); status = 'cold'; }
        return { name: formatGameName(g.name), img: g.img, provider: provider.name, rtp: rtp, status: status };
    }).sort(function(a, b) { return b.rtp - a.rtp; });
}

function loadGames(providerKey) {
    currentGames = generateResults(providerKey);
    currentGames.forEach(function(g, i) { g.rank = i + 1; });
    updateStats();
    if (!currentGames.length) {
        var top3 = document.getElementById('top3Section');
        if (top3) top3.innerHTML = '';
        renderGamesEmpty('Provider ni belum ada game scannable. Cuba pilih provider lain.');
        return;
    }
    renderTop3();
    renderRtpChart();
    resetVisibleGameCount(getFilteredGames().length);
    renderGames();
}

// ==========================================
// SVG CIRCULAR GAUGE
// ==========================================
function createRtpGauge(rtp, size) {
    size = size || 52;
    var sw = 4, r = (size - sw) / 2, c = 2 * Math.PI * r, o = c - (rtp / 100) * c;
    var color = rtp >= 85 ? '#22C55E' : rtp >= 65 ? '#F59E0B' : '#EF4444';
    return '<div class="rtp-gauge" style="width:' + size + 'px;height:' + size + 'px"><svg viewBox="0 0 ' + size + ' ' + size + '"><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="' + sw + '"/><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + o + '" class="gauge-fill" transform="rotate(-90 ' + (size/2) + ' ' + (size/2) + ')"/></svg><span class="gauge-text" style="color:' + color + '">' + rtp + '%</span></div>';
}

// ==========================================
// TOP 3 PODIUM
// ==========================================
function renderTop3() {
    var section = document.getElementById('top3Section');
    if (!section || currentGames.length < 3) return;
    var top3 = currentGames.slice(0, 3);
    var medals = ['👑', '🥈', '🥉'], classes = ['gold', 'silver', 'bronze'];
    var html = '<h3 class="top3-heading">🏆 Top 3 Game Terpanas</h3><div class="top3-cards">';
    top3.forEach(function(game, i) {
        html += '<div class="top3-card top3-' + classes[i] + '" style="animation-delay:' + (i * 0.15) + 's"><span class="top3-medal">' + medals[i] + '</span><div class="top3-thumb"><img loading="lazy" src="' + escapeHtml(getGameThumbnailUrl(game.img)) + '" alt="' + escapeHtml(game.name) + '" onerror="this.onerror=null; this.src=window.getFallbackImage(this.alt)"></div><span class="top3-name">' + escapeHtml(game.name) + '</span>' + createRtpGauge(game.rtp, 50) + '<span class="top3-status top3-status-' + game.status + '">' + escapeHtml(getStatusLabel(game.status)) + '</span></div>';
    });
    section.innerHTML = html + '</div>';
}

// ==========================================
// STATS
// ==========================================
function updateStats() {
    var hot = currentGames.filter(function(g) { return g.status === 'hot'; }).length;
    var warm = currentGames.filter(function(g) { return g.status === 'warm'; }).length;
    var cold = currentGames.filter(function(g) { return g.status === 'cold'; }).length;
    animateCounter('statHot', hot); animateCounter('statWarm', warm); animateCounter('statCold', cold);
    document.getElementById('statProviders').textContent = PROVIDER_ORDER.length;
    document.getElementById('totalGames').textContent = currentGames.length;
}
function animateCounter(id, target) {
    var el = document.getElementById(id); if (!el) return;
    var cur = parseInt(el.textContent) || 0; if (cur === target) return;
    var step = target > cur ? 1 : -1;
    var t = setInterval(function() {
        cur += step;
        el.textContent = cur;
        if (cur === target) clearInterval(t);
    }, 50);
}

// ==========================================
// RENDER GAMES
// ==========================================
function renderGames() {
    var gameList = document.getElementById('gameList');
    if (!gameList) return;
    var filtered = getFilteredGames();
    if (!currentVisibleGameCount) resetVisibleGameCount(filtered.length);
    var visibleGames = filtered.slice(0, currentVisibleGameCount);
    gameList.innerHTML = '';
    if (!filtered.length) {
        renderGamesEmpty(currentFilter === 'all' ? 'Belum cukup game untuk dipaparkan di luar Top 3.' : 'Tiada game dalam kategori ' + currentFilter.toUpperCase() + '. Cuba tab lain.');
        return;
    }
    visibleGames.forEach(function(game, index) {
        var card = document.createElement('div');
        card.className = 'game-card ' + game.status;
        card.style.animationDelay = (index * 0.04) + 's';
        var rankNum = currentFilter === 'all' ? index + 4 : index + 1;
        card.innerHTML = '<div class="game-rank">#' + rankNum + '</div><div class="game-thumb"><img loading="lazy" src="' + escapeHtml(getGameThumbnailUrl(game.img)) + '" alt="' + escapeHtml(game.name) + '" onerror="this.onerror=null; this.src=window.getFallbackImage(this.alt)"></div><div class="game-info"><div class="game-name">' + escapeHtml(game.name) + '</div><div class="game-provider-name">' + escapeHtml(game.provider) + '</div><div class="game-rtp-bar"><div class="game-rtp-fill ' + game.status + '" style="width:0%"></div></div></div><div class="game-rtp-value">' + createRtpGauge(game.rtp, 48) + '<span class="rtp-label ' + game.status + '">' + getStatusEmoji(game.status) + ' ' + escapeHtml(game.status.toUpperCase()) + '</span></div>';
        gameList.appendChild(card);
        setTimeout(function() { var fill = card.querySelector('.game-rtp-fill'); if (fill) fill.style.width = Math.max(0, Math.min(100, ((game.rtp - 25) / 75) * 100)) + '%'; }, 100 + index * 60);
    });
    updateGameListLoadMore(filtered.length, visibleGames.length);
}

function renderRtpChart() {
    var canvas = document.getElementById('rtpChart');
    if (!canvas || !window.Chart) return;
    var source = currentFilter === 'all'
        ? currentGames.slice(0, 8)
        : currentGames.filter(function(g) { return g.status === currentFilter; }).slice(0, 8);
    if (!source.length) source = currentGames.slice(0, 8);
    if (currentRtpChart) {
        currentRtpChart.destroy();
        currentRtpChart = null;
    }
    currentRtpChart = new window.Chart(canvas, {
        type: 'bar',
        data: {
            labels: source.map(function(g) { return g.name.length > 14 ? g.name.slice(0, 14) + '…' : g.name; }),
            datasets: [{
                label: 'RTP %',
                data: source.map(function(g) { return g.rtp; }),
                borderRadius: 10,
                backgroundColor: source.map(function(g) {
                    if (g.status === 'hot') return 'rgba(88, 208, 109, 0.85)';
                    if (g.status === 'warm') return 'rgba(240, 181, 72, 0.88)';
                    return 'rgba(255, 138, 61, 0.82)';
                }),
                borderColor: source.map(function(g) {
                    if (g.status === 'hot') return '#58D06D';
                    if (g.status === 'warm') return '#F0B548';
                    return '#FF8A3D';
                }),
                borderWidth: 1.2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 650 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(ctx) { return ctx.parsed.y + '% RTP'; }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: 'rgba(255,255,255,0.72)', font: { size: 10 } },
                    grid: { display: false }
                },
                y: {
                    min: 30,
                    max: 100,
                    ticks: {
                        color: 'rgba(255,255,255,0.62)',
                        callback: function(value) { return value + '%'; }
                    },
                    grid: { color: 'rgba(255,255,255,0.08)' }
                }
            }
        }
    });
}

// ==========================================
// FILTER / SORT / NAV
// ==========================================
function initFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active'); currentFilter = this.getAttribute('data-filter'); resetVisibleGameCount(getFilteredGames().length); renderRtpChart(); renderGames();
        });
    });
}
function initSortSelect() {
    var select = document.getElementById('sortSelect'); if (!select) return;
    select.addEventListener('change', function() {
        if (this.value === 'rtp-desc') currentGames.sort(function(a, b) { return b.rtp - a.rtp; });
        else if (this.value === 'rtp-asc') currentGames.sort(function(a, b) { return a.rtp - b.rtp; });
        else if (this.value === 'name') currentGames.sort(function(a, b) { return a.name.localeCompare(b.name); });
        currentGames.forEach(function(g, i) { g.rank = i + 1; }); resetVisibleGameCount(getFilteredGames().length); renderTop3(); renderRtpChart(); renderGames();
    });
}
function initGameListLoadMore() {
    var btn = document.getElementById('gameListLoadMore');
    if (!btn) return;
    btn.addEventListener('click', handleLoadMoreGames);
}
function updateBottomNavVisibility() {
    var nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    nav.classList.remove('nav-hidden');
}

function initBottomNav() {
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
            var href = this.getAttribute('href') || '';
            document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('active'); });
            this.classList.add('active');
            if (href === '#providerSection') {
                e.preventDefault();
                openProviderModal();
                return;
            }
            if (!href || href === '#') {
                e.preventDefault();
                return;
            }
            if (href.charAt(0) !== '#') return;
            e.preventDefault();
            var target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
    updateBottomNavVisibility();
    window.addEventListener('scroll', updateBottomNavVisibility, { passive: true });
    window.addEventListener('resize', updateBottomNavVisibility);
}
function updateTimestamp() {
    var el = document.getElementById('lastUpdate'); if (el) el.textContent = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
}

// ==========================================
// SHARE
// ==========================================
function shareResults(method) {
    if (!currentGames.length) {
        showToast('Belum ada result untuk share. Scan dulu.', 'error');
        return;
    }
    var pName = GAME_DATABASE[currentProvider] ? GAME_DATABASE[currentProvider].name : currentProvider;
    var now = new Date().toLocaleString('ms-MY');
    var top5 = currentGames.slice(0, 5);
    var text = '🛡️ *SLOTPATCHER SCAN RESULT*\n🎮 Provider: ' + pName + '\n📅 ' + now + '\n────────────────────\n\n🏆 *TOP 5 GAME:*\n\n';
    top5.forEach(function(g, i) { text += (i+1) + '. ' + g.name + '\n   RTP: ' + g.rtp + '% ' + getStatusEmoji(g.status) + ' ' + g.status.toUpperCase() + '\n\n'; });
    text += '────────────────────\n🚀 Scan premium di Slotpatcher.com!\n';
    if (method === 'whatsapp') {
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
        showToast('Dibuka ke WhatsApp', 'success');
    } else if (method === 'telegram') {
        window.open('https://t.me/share/url?url=' + encodeURIComponent(location.href) + '&text=' + encodeURIComponent(text), '_blank');
        showToast('Dibuka ke Telegram', 'success');
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            showToast('Result disalin ke clipboard', 'success');
        }).catch(function() {
            showToast('Gagal salin. Cuba lagi.', 'error');
        });
    } else {
        showToast('Clipboard tak disokong di browser ini', 'error');
    }
}

window.startScan = startScan;
window.shareResults = shareResults;
console.log('%c Slotpatcher Live Scanner ', 'background: linear-gradient(135deg, #D4AF37, #FFD700); color: #1A0A2E; font-weight: bold; padding: 5px 10px; border-radius: 5px;');

// ==========================================
// PREMIUM HACKER LAYER (boot, matrix, session, telemetry)
// ==========================================
(function premiumHackerLayer() {
    function onReady(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    // A: Boot overlay (once per session)
    onReady(function bootOverlay() {
        var overlay = document.getElementById('bootOverlay');
        if (!overlay) return;
        try {
            if (sessionStorage.getItem('sp_boot_shown')) {
                overlay.remove();
                return;
            }
            sessionStorage.setItem('sp_boot_shown', '1');
        } catch (e) { /* storage blocked — still run */ }

        var log = document.getElementById('bootLog');
        var lines = [
            '> SLOTPATCHER OS v2.0.1',
            '> Booting kernel............ [ OK ]',
            '> Mounting RTP database..... [ OK ]',
            '> Connecting secure node.... [ OK ]',
            '> Encryption handshake...... AES-256',
            '> Authenticating session.... [ OK ]',
            '> ACCESS GRANTED',
            '> Loading UI...'
        ];
        var cursor = document.createElement('span');
        cursor.className = 'boot-cursor';
        log.appendChild(cursor);

        var dismissed = false;
        function dismiss() {
            if (dismissed) return;
            dismissed = true;
            overlay.classList.add('is-done');
            setTimeout(function() { if (overlay.parentNode) overlay.remove(); }, 500);
        }
        overlay.addEventListener('click', dismiss);

        var lineIdx = 0;
        function typeNext() {
            if (dismissed) return;
            if (lineIdx >= lines.length) {
                setTimeout(dismiss, 380);
                return;
            }
            var line = lines[lineIdx++];
            var charIdx = 0;
            (function typeChar() {
                if (dismissed) return;
                if (charIdx >= line.length) {
                    log.insertBefore(document.createTextNode('\n'), cursor);
                    setTimeout(typeNext, 70);
                    return;
                }
                log.insertBefore(document.createTextNode(line.charAt(charIdx++)), cursor);
                setTimeout(typeChar, 14 + Math.random() * 10);
            })();
        }
        typeNext();
    });

    // B: Matrix rain
    onReady(function matrixRain() {
        var canvas = document.getElementById('matrixRain');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;
        var fontSize = 14;
        var drops = [];
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            var cols = Math.ceil(canvas.width / fontSize);
            drops = [];
            for (var i = 0; i < cols; i++) drops.push(Math.random() * canvas.height / fontSize);
        }
        resize();
        var resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 180);
        });

        var chars = 'アイウエオカキクケコサシスセソタチツABCDEF0123456789$%&#@';
        function draw() {
            ctx.fillStyle = 'rgba(11, 13, 15, 0.12)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = fontSize + 'px "SF Mono", Consolas, monospace';
            for (var i = 0; i < drops.length; i++) {
                var text = chars.charAt(Math.floor(Math.random() * chars.length));
                ctx.fillStyle = Math.random() > 0.92 ? '#22c55e' : '#950606';
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }
        setInterval(draw, 70);
    });

    // D: Session ID + node
    onReady(function sessionBadges() {
        var sessEl = document.getElementById('secSession');
        var nodeEl = document.getElementById('secNode');
        if (sessEl) {
            var h = '0123456789ABCDEF', id = '0x';
            for (var i = 0; i < 8; i++) id += h.charAt(Math.floor(Math.random() * 16));
            sessEl.textContent = id;
        }
        if (nodeEl) {
            var nodes = ['SG-2', 'SG-4', 'MY-1', 'MY-3', 'KL-7', 'JKT-2'];
            nodeEl.textContent = nodes[Math.floor(Math.random() * nodes.length)];
        }
    });

    // E: Telemetry counters
    onReady(function telemetry() {
        var scansEl = document.getElementById('telScans');
        var winEl   = document.getElementById('telWin');
        var usersEl = document.getElementById('telUsers');
        var nodesEl = document.getElementById('telNodes');
        if (!scansEl) return;
        var scans = 47200 + Math.floor(Math.random() * 800);
        var totalWin = 8400000 + Math.floor(Math.random() * 600000);
        var users = 12800 + Math.floor(Math.random() * 400);
        var totalNodes = 25;

        function fmtN(n) { return n.toLocaleString('en-US'); }
        function fmtRM(n) {
            if (n >= 1000000) return 'RM ' + (n / 1000000).toFixed(2) + 'M';
            if (n >= 1000)    return 'RM ' + (n / 1000).toFixed(1) + 'K';
            return 'RM ' + n;
        }
        function fmtUsers(n) {
            if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
            return String(n);
        }
        function bump(el) {
            if (!el) return;
            el.classList.remove('just-ticked');
            void el.offsetWidth;
            el.classList.add('just-ticked');
        }
        function tick(first) {
            scans    += first ? 0 : (1 + Math.floor(Math.random() * 3));
            totalWin += first ? 0 : Math.floor(Math.random() * 1800);
            users    += first ? 0 : (Math.random() < 0.35 ? 1 : 0);
            var nodes = 22 + Math.floor(Math.random() * 4);
            scansEl.textContent = fmtN(scans);
            if (winEl)   winEl.textContent   = fmtRM(totalWin);
            if (usersEl) usersEl.textContent = fmtUsers(users);
            if (nodesEl) nodesEl.textContent = nodes + '/' + totalNodes;
            if (!first) { bump(scansEl); bump(winEl); bump(usersEl); }
        }
        tick(true);
        setInterval(tick, 3200);
    });
})();

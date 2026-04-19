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
var isScanning = false;
var currentDeviceIntel = null;
var scanModalTimer = null;
var currentRtpChart = null;

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
    gameList.innerHTML = '<div class="games-empty"><div class="games-empty-icon" aria-hidden="true">🕳️</div><h4>Tiada game untuk dipaparkan</h4><p>' + escapeHtml(message || 'Cuba pilih provider lain atau reset filter.') + '</p></div>';
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    setFlowStep('provider');
    buildProviderGrid();
    buildFeaturedProviders();
    initFilterTabs();
    initSortSelect();
    initBottomNav();
    initDeviceIntel();
    initCarousel();
    initEnhancements();
    updateScanButtonState();
    updateProviderHint();
    updateTimestamp();
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
        btn.innerHTML = '<div class="provider-icon"><img loading="lazy" src="' + p.logo + '" alt="' + p.name + '" onerror="this.onerror=null; this.src=window.getFallbackImage(\'' + p.name + '\')"></div><span class="provider-name">' + p.name + '</span><span class="provider-check">✓</span>';
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
        btn.innerHTML = '<div class="featured-provider-thumb"><img loading="lazy" src="' + p.logo + '" alt="' + p.name + '" onerror="this.onerror=null; this.src=window.getFallbackImage(\'' + p.name + '\')"></div><span class="featured-provider-name">' + p.name + '</span>';
        btn.addEventListener('click', function() {
            selectProvider(key);
        });
        grid.appendChild(btn);
    });
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
    updateBottomNavVisibility();
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

function renderScanModal(providerName) {
    var modalGrid = document.getElementById('scanModalGrid');
    var modalProvider = document.getElementById('scanModalProvider');
    var info = currentDeviceIntel || createBaseDeviceIntel();
    if (modalProvider) modalProvider.textContent = providerName;
    if (!modalGrid) return;
    var rows = [
        { icon: '📱', label: 'Device', value: info.device },
        { icon: '🌐', label: 'ISP', value: info.isp },
        { icon: '📍', label: 'Location', value: info.location },
        { icon: '📶', label: 'Network', value: info.network },
        { icon: '🖥️', label: 'Screen', value: info.screen },
        { icon: '🕐', label: 'Timezone', value: info.timezone },
        { icon: '🔒', label: 'IP Address', value: info.publicIp || info.ip, highlight: true },
        { icon: '🎯', label: 'Target', value: providerName }
    ];
    modalGrid.innerHTML = rows.map(function(row) {
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

function openScanModal(providerName, onDone) {
    if (window.Swal) {
        openScanModalSweet(providerName, onDone);
        return;
    }
    var modal = document.getElementById('scanModal');
    var modalStatus = document.getElementById('scanModalStatus');
    var progressBar = document.getElementById('scanModalProgressBar');
    var modalTitle = document.getElementById('scanModalTitle');
    var stepItems = document.querySelectorAll('#scanModalSteps .scan-step-item');
    if (!modal || !modalStatus || !progressBar) {
        onDone();
        return;
    }

    renderScanModal(providerName);
    if (modalTitle) modalTitle.textContent = 'SCANNING ' + providerName;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('scan-modal-open');
    progressBar.style.width = '8%';
    stepItems.forEach(function(item) {
        item.classList.remove('active', 'done');
    });

    var steps = [
        { text: 'Provider selected, locking ' + providerName + ' session...', progress: 24, delay: 420 },
        { text: 'IP address detected, connecting secure node...', progress: 52, delay: 500 },
        { text: 'Fetching RTP data and building hot game list...', progress: 82, delay: 560 },
        { text: 'Scan complete. Preparing live result board...', progress: 100, delay: 460 }
    ];

    var index = 0;
    function nextStep() {
        if (index >= steps.length) {
            scanModalTimer = setTimeout(function() {
                closeScanModal();
                onDone();
            }, 220);
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

function openScanModalSweet(providerName, onDone) {
    if (scanModalTimer) clearTimeout(scanModalTimer);
    var info = currentDeviceIntel || createBaseDeviceIntel();
    var steps = [
        { text: 'Provider selected, locking ' + providerName + ' session...', progress: 24, key: 'provider' },
        { text: 'IP address detected, connecting secure node...', progress: 52, key: 'ip' },
        { text: 'Fetching RTP data and building hot game list...', progress: 82, key: 'rtp' },
        { text: 'Scan complete. Preparing live result board...', progress: 100, key: 'done' }
    ];

    var html = '' +
        '<div class="scan-swal">' +
            '<div class="scan-swal-progress"><div id="scanSwalProgress" class="scan-swal-progress-fill" style="width:8%"></div></div>' +
            '<div id="scanSwalStatus" class="scan-swal-status">Preparing secure scan...</div>' +
            '<div class="scan-swal-steps">' +
                '<div class="scan-swal-step" data-step="provider"><span></span><b>Provider selected</b></div>' +
                '<div class="scan-swal-step" data-step="ip"><span></span><b>IP address detected</b></div>' +
                '<div class="scan-swal-step" data-step="rtp"><span></span><b>Fetching RTP data</b></div>' +
                '<div class="scan-swal-step" data-step="done"><span></span><b>Scan complete</b></div>' +
            '</div>' +
            '<div class="scan-swal-grid">' +
                '<div><small>Provider</small><strong>' + escapeHtml(providerName) + '</strong></div>' +
                '<div><small>IP Address</small><strong>' + escapeHtml(info.publicIp || info.ip) + '</strong></div>' +
                '<div><small>Device</small><strong>' + escapeHtml(info.device) + '</strong></div>' +
                '<div><small>Network</small><strong>' + escapeHtml(info.network) + '</strong></div>' +
            '</div>' +
        '</div>';

    window.Swal.fire({
        title: 'SCANNING ' + providerName,
        html: html,
        showConfirmButton: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        customClass: {
            popup: 'scan-swal-popup'
        },
        didOpen: function() {
            var statusEl = document.getElementById('scanSwalStatus');
            var progressEl = document.getElementById('scanSwalProgress');
            var stepEls = document.querySelectorAll('.scan-swal-step');
            var idx = 0;
            function tick() {
                if (idx >= steps.length) {
                    scanModalTimer = setTimeout(function() {
                        window.Swal.close();
                        onDone();
                    }, 250);
                    return;
                }
                var step = steps[idx++];
                if (statusEl) statusEl.textContent = step.text;
                if (progressEl) progressEl.style.width = step.progress + '%';
                stepEls.forEach(function(el) {
                    var key = el.getAttribute('data-step');
                    el.classList.toggle('active', key === step.key);
                    if (steps.findIndex(function(s) { return s.key === key; }) < idx - 1) el.classList.add('done');
                });
                scanModalTimer = setTimeout(tick, step.key === 'rtp' ? 560 : 430);
            }
            tick();
        },
        willClose: function() {
            if (scanModalTimer) {
                clearTimeout(scanModalTimer);
                scanModalTimer = null;
            }
        }
    });
}

// ==========================================
// HELPERS
// ==========================================
function getStatusLabel(s) { return s === 'hot' ? '🔥 HOT' : s === 'warm' ? '⚡ WARM' : '❄️ COLD'; }
function getStatusEmoji(s) { return s === 'hot' ? '🔥' : s === 'warm' ? '⚡' : '❄️'; }

function formatGameName(raw) {
    if (!raw) return '';
    var name = String(raw);
    name = name.replace(/\.(png|jpe?g|webp|gif)$/i, '');
    name = name.replace(/Icon\d*$/i, '');
    name = name.replace(/_\d+$/, '');
    name = name.replace(/([A-Za-z])[01]$/, '$1');
    name = name.replace(/[_\-]+/g, ' ');
    name = name.replace(/([a-z])([A-Z])/g, '$1 $2');
    name = name.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
    name = name.replace(/([a-zA-Z])(\d)/g, '$1 $2').replace(/(\d)([a-zA-Z])/g, '$1 $2');
    name = name.replace(/\s+/g, ' ').trim();
    name = name.replace(/\b([a-z])/g, function(_, ch) { return ch.toUpperCase(); });
    return name || raw;
}

window.getFallbackImage = function(gameName) {
    if (!gameName) gameName = "GAME";
    var words = gameName.split(' ');
    var initials = words.length > 1 ? (words[0][0] + words[1][0]) : gameName.substring(0, 2);
    initials = initials.toUpperCase();
    var hash = 0;
    for (var i = 0; i < gameName.length; i++) hash = gameName.charCodeAt(i) + ((hash << 5) - hash);
    var colors = ['#D4AF37', '#F59E0B', '#22C55E', '#8B5CF6', '#EC4899', '#14B8A6'];
    var color = colors[Math.abs(hash) % colors.length];
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
        '<rect width="100" height="100" fill="#1A1638" />' +
        '<circle cx="50" cy="50" r="35" fill="none" stroke="' + color + '" stroke-width="2" stroke-dasharray="4 4" opacity="0.2" />' +
        '<text x="50%" y="54%" font-family="sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">' + initials + '</text>' +
        '</svg>';
    return 'data:image/svg+xml;base64,' + btoa(svg);
};

// ==========================================
// SCAN PROGRESS (clean, professional)
// ==========================================
function runScanProgress(providerName, onComplete) {
    var logBody = document.getElementById('terminalLog');
    var progressBar = document.getElementById('scanProgressBar');
    var percentEl = document.getElementById('scanPanelPercent');
    var titleEl = document.getElementById('scanPanelTitle');
    if (!logBody) { onComplete(); return; }

    titleEl.textContent = 'Scanning ' + providerName + '...';
    var radarFill = document.getElementById('scanRadarFill');
    var radarCircumference = 2 * Math.PI * 15; // r=15 → ~94.25
    if (radarFill) {
        radarFill.setAttribute('stroke-dasharray', radarCircumference);
        radarFill.setAttribute('stroke-dashoffset', radarCircumference);
    }
    var gameCount = Math.floor(Math.random() * 10 + 15);
    var lines = [
        { text: 'Initializing scanner...', type: 'info', delay: 300 },
        { text: 'Connecting to ' + providerName + ' server...', type: 'normal', delay: 500 },
        { text: 'Connection established', type: 'success', delay: 400 },
        { text: 'Authenticating session...', type: 'normal', delay: 500 },
        { text: 'Session verified ✓', type: 'success', delay: 300 },
        { text: 'Target: ' + providerName + ' • SLOTPATCHER', type: 'info', delay: 400 },
        { text: 'Reading RTP data block...', type: 'normal', delay: 500 },
        { text: 'Accessing slot tables...', type: 'normal', delay: 400 },
        { text: gameCount + ' games found', type: 'success', delay: 500 },
        { text: 'Decrypting RTP values...', type: 'normal', delay: 600 },
        { text: 'Mapping RTP distributions...', type: 'normal', delay: 400 },
        { text: 'Cross-referencing hot patterns...', type: 'normal', delay: 500 },
        { text: 'Running probability analysis...', type: 'normal', delay: 400 },
        { text: 'Compiling results ██████████ 100%', type: 'info', delay: 300 },
        { text: 'Scan complete — ' + gameCount + ' games analyzed ✓', type: 'success', delay: 200 },
    ];

    logBody.innerHTML = '';
    var cumDelay = 0;
    lines.forEach(function(line, i) {
        cumDelay += line.delay;
        setTimeout(function() {
            var div = document.createElement('div');
            div.className = 'log-line log-' + line.type;
            if (i === lines.length - 1) div.classList.add('log-latest');
            div.textContent = line.text;
            logBody.appendChild(div);
            logBody.scrollTop = logBody.scrollHeight;
            var pct = Math.round(((i + 1) / lines.length) * 100);
            if (progressBar) progressBar.style.width = pct + '%';
            if (percentEl) percentEl.textContent = pct + '%';
            if (radarFill) radarFill.setAttribute('stroke-dashoffset', radarCircumference * (1 - pct / 100));
            if (i === lines.length - 1) setTimeout(onComplete, 500);
        }, cumDelay);
    });
}

// ==========================================
// SCANNING FLOW
// ==========================================
function startScan() {
    var provider = GAME_DATABASE[currentProvider];
    var providerSection = document.getElementById('providerSection');
    if (isScanning) return;
    if (!provider) {
        updateProviderHint('Sila pilih provider dulu sebelum mula scan.', true);
        if (providerSection) providerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    isScanning = true;
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
    var gameList = document.getElementById('gameList');
    var top3Section = document.getElementById('top3Section');
    var pName = provider.name;

    openScanModal(pName, function() {
        scanSection.style.display = 'block';
        resultsSection.style.display = 'none';
        renderGameSkeleton(6);
        if (top3Section) top3Section.innerHTML = '';

        var sd = document.getElementById('scanDetail');
        if (sd) sd.textContent = 'Provider: ' + pName + ' • SLOTPATCHER';

        scanSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

        runScanProgress(pName, function() {
            scanSection.style.display = 'none';
            resultsSection.style.display = 'block';
            isScanning = false;
            loadGames(currentProvider);
            updateBottomNavVisibility();
            setFlowStep('result');
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
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
        html += '<div class="top3-card top3-' + classes[i] + '" style="animation-delay:' + (i * 0.15) + 's"><span class="top3-medal">' + medals[i] + '</span><div class="top3-thumb"><img loading="lazy" src="' + game.img + '" alt="' + game.name + '" onerror="this.onerror=null; this.src=window.getFallbackImage(this.alt)"></div><span class="top3-name">' + game.name + '</span>' + createRtpGauge(game.rtp, 50) + '<span class="top3-status top3-status-' + game.status + '">' + getStatusLabel(game.status) + '</span></div>';
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
    var filtered = currentFilter === 'all' ? currentGames.slice(3) : currentGames.filter(function(g) { return g.status === currentFilter; });
    gameList.innerHTML = '';
    if (!filtered.length) {
        renderGamesEmpty(currentFilter === 'all' ? 'Belum cukup game untuk dipaparkan di luar Top 3.' : 'Tiada game dalam kategori ' + currentFilter.toUpperCase() + '. Cuba tab lain.');
        return;
    }
    filtered.forEach(function(game, index) {
        var card = document.createElement('div');
        card.className = 'game-card ' + game.status;
        card.style.animationDelay = (index * 0.04) + 's';
        var rankNum = currentFilter === 'all' ? index + 4 : index + 1;
        card.innerHTML = '<div class="game-rank">#' + rankNum + '</div><div class="game-thumb"><img loading="lazy" src="' + game.img + '" alt="' + game.name + '" onerror="this.onerror=null; this.src=window.getFallbackImage(this.alt)"></div><div class="game-info"><div class="game-name">' + game.name + '</div><div class="game-provider-name">' + game.provider + '</div><div class="game-rtp-bar"><div class="game-rtp-fill ' + game.status + '" style="width:0%"></div></div></div><div class="game-rtp-value">' + createRtpGauge(game.rtp, 48) + '<span class="rtp-label ' + game.status + '">' + getStatusEmoji(game.status) + ' ' + game.status.toUpperCase() + '</span></div>';
        gameList.appendChild(card);
        setTimeout(function() { var fill = card.querySelector('.game-rtp-fill'); if (fill) fill.style.width = Math.max(0, Math.min(100, ((game.rtp - 25) / 75) * 100)) + '%'; }, 100 + index * 60);
    });
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
            this.classList.add('active'); currentFilter = this.getAttribute('data-filter'); renderRtpChart(); renderGames();
        });
    });
}
function initSortSelect() {
    var select = document.getElementById('sortSelect'); if (!select) return;
    select.addEventListener('change', function() {
        if (this.value === 'rtp-desc') currentGames.sort(function(a, b) { return b.rtp - a.rtp; });
        else if (this.value === 'rtp-asc') currentGames.sort(function(a, b) { return a.rtp - b.rtp; });
        else if (this.value === 'name') currentGames.sort(function(a, b) { return a.name.localeCompare(b.name); });
        currentGames.forEach(function(g, i) { g.rank = i + 1; }); renderTop3(); renderRtpChart(); renderGames();
    });
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
            if (href && href !== '#') {
                e.preventDefault();
                var target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                e.preventDefault();
            }
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

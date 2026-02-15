// Trade Notifier - Modified for KoGold styling
// Based on Trade Notifier by cooper (coollarper45)

(function () {
    'use strict';

    // Check if Trade Notifier is enabled
    const isEnabled = () => localStorage.getItem('kogold:tradeNotifier') === 'true';
    
    if (!isEnabled()) return;

    const BASE = 'https://www.pekora.zip';
    const EP_INBOUND = BASE + '/apisite/trades/v1/trades/inbound';
    const EP_COUNT = BASE + '/apisite/trades/v1/trades/inbound/count';
    const EP_DETAIL = BASE + '/apisite/trades/v1/trades';
    const EP_HEADSHOT = BASE + '/apisite/thumbnails/v1/users/avatar-headshot';
    const EP_ASSET_THUMB = BASE + '/apisite/thumbnails/v1/assets';
    const EP_KOL = 'https://kolimons.xyz/api/items';
    const EP_AUTH = BASE + '/apisite/users/v1/users/authenticated';
    const STORE_KEY = 'pekora_seen_trade_ids';
    const SETTINGS_KEY = 'pekora_tn_settings';
    const BLOCKED_KEY = 'pekora_tn_blocked';
    const AUTODECLINE_LOG_KEY = 'pekora_tn_autodecline_log';
    const SPAM_TRACKER_KEY = 'pekora_tn_spam_tracker';
    const SPAM_BLOCKED_KEY = 'pekora_tn_spam_blocked';
    const MAX_STORED = 500;
    const MAX_LOG = 100;

    const defaultSettings = {
        sound: true,
        desktop: true,
        toast: true,
        autoDeclineBlocked: true,
        antiSpam: true,
        spamMaxTrades: 3,
        spamTimeWindow: 60000,
        spamAutoBan: true,
        spamAutoBanThreshold: 5,
        spamDeclineDuplicates: true,
        spamMinValue: 0,
        pollInterval: 3000,
        toastDuration: 10000,
        toastHoverDelay: 3000
    };

    function loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) return Object.assign({}, defaultSettings, JSON.parse(raw));
        } catch {}
        return Object.assign({}, defaultSettings);
    }
    function saveSettings() {
        try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
    }
    function setSetting(key, val) {
        settings[key] = val;
        saveSettings();
    }

    function loadBlocked() {
        try { const raw = localStorage.getItem(BLOCKED_KEY); if (raw) return new Set(JSON.parse(raw)); } catch {}
        return new Set();
    }
    function saveBlocked() {
        try { localStorage.setItem(BLOCKED_KEY, JSON.stringify([...blockedUsers])); } catch {}
    }
    function loadBlockedNames() {
        try { const raw = localStorage.getItem(BLOCKED_KEY + '_names'); if (raw) return JSON.parse(raw); } catch {}
        return {};
    }
    function saveBlockedNames() {
        try { localStorage.setItem(BLOCKED_KEY + '_names', JSON.stringify(blockedNames)); } catch {}
    }
    function addBlocked(userId, username) {
        blockedUsers.add(userId);
        blockedNames[userId] = username || ('User ' + userId);
        saveBlocked();
        saveBlockedNames();
    }
    function removeBlocked(userId) {
        blockedUsers.delete(userId);
        delete blockedNames[userId];
        saveBlocked();
        saveBlockedNames();
    }
    function isBlocked(userId) { return blockedUsers.has(userId); }

    function loadAutoDeclineLog() {
        try { const raw = localStorage.getItem(AUTODECLINE_LOG_KEY); if (raw) return JSON.parse(raw); } catch {}
        return [];
    }
    function saveAutoDeclineLog() {
        if (autoDeclineLog.length > MAX_LOG) autoDeclineLog = autoDeclineLog.slice(-MAX_LOG);
        try { localStorage.setItem(AUTODECLINE_LOG_KEY, JSON.stringify(autoDeclineLog)); } catch {}
    }
    function logAutoDecline(tradeId, userId, username, reason) {
        autoDeclineLog.push({ tradeId, userId, username: username || 'Unknown', reason: reason || 'blocked', time: new Date().toISOString() });
        saveAutoDeclineLog();
    }

    function loadSpamTracker() {
        try { const raw = localStorage.getItem(SPAM_TRACKER_KEY); if (raw) return JSON.parse(raw); } catch {}
        return {};
    }
    function saveSpamTracker() {
        try { localStorage.setItem(SPAM_TRACKER_KEY, JSON.stringify(spamTracker)); } catch {}
    }
    function loadSpamBlocked() {
        try { const raw = localStorage.getItem(SPAM_BLOCKED_KEY); if (raw) return JSON.parse(raw); } catch {}
        return {};
    }
    function saveSpamBlocked() {
        try { localStorage.setItem(SPAM_BLOCKED_KEY, JSON.stringify(spamBanned)); } catch {}
    }
    function isSpamBanned(userId) { return !!spamBanned[userId]; }
    function addSpamBan(userId, username) {
        spamBanned[userId] = { username: username || 'User ' + userId, time: Date.now(), count: (spamBanned[userId] ? spamBanned[userId].count || 0 : 0) + 1 };
        saveSpamBlocked();
    }
    function removeSpamBan(userId) {
        delete spamBanned[userId];
        saveSpamBlocked();
    }
    function recordSpamTrade(userId, tradeId, username) {
        const now = Date.now();
        if (!spamTracker[userId]) spamTracker[userId] = { trades: [], username: username || 'User ' + userId };
        spamTracker[userId].username = username || spamTracker[userId].username;
        spamTracker[userId].trades.push({ id: tradeId, time: now });
        spamTracker[userId].trades = spamTracker[userId].trades.filter(function (t) { return now - t.time < settings.spamTimeWindow * 2; });
        saveSpamTracker();
    }
    function getRecentTradeCount(userId) {
        const now = Date.now();
        if (!spamTracker[userId]) return 0;
        return spamTracker[userId].trades.filter(function (t) { return now - t.time < settings.spamTimeWindow; }).length;
    }
    function isSpamming(userId) {
        return getRecentTradeCount(userId) >= settings.spamMaxTrades;
    }
    function getSpamTotal(userId) {
        if (!spamTracker[userId]) return 0;
        return spamTracker[userId].trades.length;
    }
    function isDuplicateTrade(det, userId) {
        if (!settings.spamDeclineDuplicates || !det || !det.offers) return false;
        const key = buildTradeFingerprint(det, userId);
        if (!tradeFingerprints[userId]) tradeFingerprints[userId] = [];
        const dominated = tradeFingerprints[userId].some(function (fp) { return fp === key; });
        tradeFingerprints[userId].push(key);
        if (tradeFingerprints[userId].length > 20) tradeFingerprints[userId] = tradeFingerprints[userId].slice(-20);
        return dominated;
    }
    function buildTradeFingerprint(det, userId) {
        if (!det || !det.offers) return '';
        let parts = [];
        for (const o of det.offers) {
            if (!o.user) continue;
            let items = [];
            if (o.userAssets) {
                items = o.userAssets.map(function (a) { return a.assetId + ':' + (a.serialNumber || 0); }).sort();
            }
            parts.push(o.user.id + '|' + items.join(',') + '|' + (o.robux || 0));
        }
        return parts.sort().join('||');
    }
    function isLowballTrade(det, userId) {
        if (settings.spamMinValue <= 0 || !det || !det.offers) return false;
        let theirValue = 0;
        for (const o of det.offers) {
            if (!o.user || o.user.id !== userId) continue;
            if (o.userAssets) {
                for (const a of o.userAssets) {
                    const k = getKol(a.assetId);
                    if (k) theirValue += k.value || k.rap || 0;
                    else if (a.recentAveragePrice) theirValue += a.recentAveragePrice;
                }
            }
            if (o.robux) theirValue += o.robux;
        }
        return theirValue < settings.spamMinValue;
    }

    let settings = loadSettings();
    let kolItems = {};
    let seen = loadSeen();
    let first = true;
    let panelOpen = false;
    let panelTrades = [];
    let panelDetails = {};
    let panelHeads = {};
    let assetThumbs = {};
    let csrfToken = null;
    let pollTimer = null;
    let blockedUsers = loadBlocked();
    let blockedNames = loadBlockedNames();
    let autoDeclineLog = loadAutoDeclineLog();
    let authUserId = null;
    let decliningTrades = new Set();
    let spamTracker = loadSpamTracker();
    let spamBanned = loadSpamBlocked();
    let tradeFingerprints = {};

    function playSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            function beep(freq, start, dur, vol) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine'; osc.frequency.value = freq;
                gain.gain.setValueAtTime(vol, ctx.currentTime + start);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + dur);
            }
            beep(880, 0, 0.15, 0.3); beep(1100, 0.12, 0.15, 0.25); beep(1320, 0.24, 0.2, 0.2);
        } catch {}
    }
    function playDeclineSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            function beep(freq, start, dur, vol) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine'; osc.frequency.value = freq;
                gain.gain.setValueAtTime(vol, ctx.currentTime + start);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + dur);
            }
            beep(440, 0, 0.12, 0.2); beep(330, 0.1, 0.15, 0.15);
        } catch {}
    }
    function playSpamSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            function beep(freq, start, dur, vol) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square'; osc.frequency.value = freq;
                gain.gain.setValueAtTime(vol, ctx.currentTime + start);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + dur);
            }
            beep(300, 0, 0.08, 0.15); beep(250, 0.07, 0.08, 0.12); beep(200, 0.14, 0.1, 0.1);
        } catch {}
    }

    function esc(s) { const d = document.createElement('div'); d.textContent = String(s != null ? s : ''); return d.innerHTML; }
    function loadSeen() { try { return new Set(JSON.parse(localStorage.getItem(STORE_KEY) || '[]')); } catch { return new Set(); } }
    function saveSeen(s) { let a = [...s]; if (a.length > MAX_STORED) a = a.slice(a.length - MAX_STORED); localStorage.setItem(STORE_KEY, JSON.stringify(a)); }

    function extractCsrf(headers) {
        if (!headers) return;
        const m = headers.match(/x-csrf-token:\s*([^\r\n]+)/i);
        if (m) csrfToken = m[1].trim();
        const c = headers.match(/set-cookie:.*rbxcsrf4=([^;\s]+)/i);
        if (c) document.cookie = 'rbxcsrf4=' + c[1] + '; path=/;';
    }
    function apiGet(url, creds) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.withCredentials = !!creds;
            xhr.onload = function() {
                extractCsrf(xhr.getAllResponseHeaders());
                if (xhr.status >= 200 && xhr.status < 300) {
                    try { resolve(JSON.parse(xhr.responseText)); } catch { reject(new Error('parse')); }
                } else reject(new Error('HTTP ' + xhr.status));
            };
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send();
        });
    }
    function apiPost(url, attempt) {
        attempt = attempt || 0;
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Content-Type', 'application/json');
            if (csrfToken) xhr.setRequestHeader('x-csrf-token', csrfToken);
            xhr.withCredentials = true;
            xhr.onload = function() {
                extractCsrf(xhr.getAllResponseHeaders());
                if (xhr.status === 403 && attempt < 3) return apiPost(url, attempt + 1).then(resolve).catch(reject);
                if (xhr.status >= 200 && xhr.status < 300) {
                    try { resolve(JSON.parse(xhr.responseText || '{}')); } catch { resolve({}); }
                } else {
                    let msg = 'HTTP ' + xhr.status;
                    try { const j = JSON.parse(xhr.responseText); if (j.errors && j.errors[0]) msg = j.errors[0].message; } catch {}
                    reject(new Error(msg));
                }
            };
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send('{}');
        });
    }
    async function seedCsrf() { try { await apiPost(BASE + '/apisite/trades/v1/trades/0/accept'); } catch {} }
    async function fetchAuth() { try { const j = await apiGet(EP_AUTH, true); if (j && j.id) authUserId = j.id; } catch {} }
    async function fetchKol() {
        try { const j = await apiGet(EP_KOL, false); if (Array.isArray(j)) { const m = {}; for (const it of j) m[it.assetId] = it; kolItems = m; } } catch {}
    }
    async function fetchInbound() {
        const all = []; let cursor = '';
        while (true) { const j = await apiGet(EP_INBOUND + '?cursor=' + encodeURIComponent(cursor), true); if (Array.isArray(j.data)) all.push(...j.data); if (j.nextPageCursor) cursor = j.nextPageCursor; else break; }
        return all;
    }
    async function fetchCount() { try { return (await apiGet(EP_COUNT, true)).count || 0; } catch { return 0; } }
    async function fetchDetail(id) { return await apiGet(EP_DETAIL + '/' + id, true); }
    async function fetchHeads(ids) {
        if (!ids.length) return {};
        const m = {};
        for (let i = 0; i < ids.length; i += 25) {
            const chunk = ids.slice(i, i + 25);
            try { const j = await apiGet(EP_HEADSHOT + '?userIds=' + chunk.join(',') + '&size=420x420&format=png', true); if (Array.isArray(j.data)) { for (const e of j.data) { if (e.state === 'Completed' && e.imageUrl) m[e.targetId] = e.imageUrl.startsWith('http') ? e.imageUrl : BASE + e.imageUrl; } } } catch {}
        }
        return m;
    }
    async function fetchAssetThumbs(assetIds) {
        if (!assetIds.length) return {};
        const m = {}; const needed = assetIds.filter(function (id) { return !assetThumbs[id]; });
        for (let i = 0; i < needed.length; i += 30) {
            const chunk = needed.slice(i, i + 30);
            try { const j = await apiGet(EP_ASSET_THUMB + '?assetIds=' + chunk.join(',') + '&format=png&size=420x420', true); if (Array.isArray(j.data)) { for (const e of j.data) { if (e.state === 'Completed' && e.imageUrl) { const url = e.imageUrl.startsWith('http') ? e.imageUrl : BASE + e.imageUrl; assetThumbs[e.targetId] = url; m[e.targetId] = url; } } } } catch {}
        }
        for (const id of assetIds) { if (assetThumbs[id]) m[id] = assetThumbs[id]; }
        return m;
    }
    function collectAssetIds(det) {
        const ids = [];
        if (det && Array.isArray(det.offers)) { for (const o of det.offers) { if (o.userAssets) { for (const a of o.userAssets) { if (a.assetId && ids.indexOf(a.assetId) === -1) ids.push(a.assetId); } } } }
        return ids;
    }

    async function autoDeclineTrade(tradeId, userId, username, reason) {
        if (decliningTrades.has(tradeId)) return;
        decliningTrades.add(tradeId);
        try {
            await apiPost(EP_DETAIL + '/' + tradeId + '/decline');
            logAutoDecline(tradeId, userId, username, reason);
            if (settings.sound) { if (reason === 'blocked') playDeclineSound(); else playSpamSound(); }
            showAutoDeclineToast(tradeId, userId, username, reason);
            console.log('[Trade Notifier] Auto-declined trade #' + tradeId + ' from ' + username + ' (ID: ' + userId + ') reason: ' + reason);
        } catch (e) {
            console.error('[Trade Notifier] Failed to auto-decline trade #' + tradeId + ':', e.message);
        } finally { decliningTrades.delete(tradeId); }
    }

    function reasonLabel(reason) {
        if (reason === 'blocked') return 'Blocked User';
        if (reason === 'spam') return 'Trade Spam';
        if (reason === 'spam-banned') return 'Spam Banned';
        if (reason === 'duplicate') return 'Duplicate Trade';
        if (reason === 'lowball') return 'Below Min Value';
        return reason || 'Unknown';
    }
    function reasonIcon(reason) {
        if (reason === 'blocked') return '⛔';
        if (reason === 'spam' || reason === 'spam-banned') return '🚫';
        if (reason === 'duplicate') return '🔁';
        if (reason === 'lowball') return '📉';
        return '⛔';
    }
    function reasonColor(reason) {
        if (reason === 'blocked') return '#ef5350';
        if (reason === 'spam' || reason === 'spam-banned') return '#ff7043';
        if (reason === 'duplicate') return '#ab47bc';
        if (reason === 'lowball') return '#e8c44a';
        return '#ef5350';
    }

    function showAutoDeclineToast(tradeId, userId, username, reason) {
        if (!settings.toast) return;
        injectCss();
        const el = document.createElement('div');
        el.className = 'tn';
        let timer = null;
        const head = panelHeads[userId] || '';
        const fb = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%23222%22 width=%221%22 height=%221%22/></svg>";
        const rc = reasonColor(reason);
        const ri = reasonIcon(reason);
        const rl = reasonLabel(reason);
        let extra = '';
        if (reason === 'spam' || reason === 'spam-banned') {
            const cnt = getRecentTradeCount(userId);
            extra = '<div class="nm" style="color:#ff7043">' + cnt + ' trades in ' + (settings.spamTimeWindow / 1000) + 's window</div>';
        }
        el.innerHTML =
            '<div class="tn-inner" style="border-color:' + rc + '33">' +
            (head ? '<img src="' + head + '" onerror="this.src=\'' + fb + '\'" class="tn-av">' : '<div class="tn-av-ph">' + ri + '</div>') +
            '<div class="tn-b">' +
            '<div class="tn-t" style="color:' + rc + '">' + ri + ' Auto-Declined</div>' +
            '<div class="nm">Trade #' + tradeId + ' from <strong>' + esc(username) + '</strong></div>' +
            '<div class="nm" style="color:' + rc + '">Reason: ' + rl + '</div>' +
            extra +
            '</div></div>';
        el.addEventListener('mouseenter', function () { if (timer) { clearTimeout(timer); timer = null; } });
        el.addEventListener('mouseleave', function () { timer = setTimeout(dismiss, settings.toastHoverDelay); });
        getContainer().appendChild(el);
        function dismiss() { el.classList.add('nout'); el.addEventListener('animationend', function () { el.remove(); }); }
        timer = setTimeout(dismiss, settings.toastDuration);
    }

    function ago(d) {
        const df = Date.now() - new Date(d); if (df < 0) return 'just now';
        const s = Math.floor(df / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), dy = Math.floor(h / 24);
        if (dy > 0) return dy + 'd ago'; if (h > 0) return h + 'h ago'; if (m > 0) return m + 'm ago'; return s + 's ago';
    }
    function until(d) {
        const df = new Date(d) - Date.now(); if (df <= 0) return 'Expired';
        const m = Math.floor(df / 60000), h = Math.floor(m / 60), dy = Math.floor(h / 24);
        if (dy > 0) return dy + 'd ' + (h % 24) + 'h'; if (h > 0) return h + 'h ' + (m % 60) + 'm'; return m + 'm';
    }
    function getKol(id) { return kolItems[id] || null; }

    function splitOffers(det, sid) {
        if (!det || !Array.isArray(det.offers)) return { sending: null, receiving: null };
        let sending = null, receiving = null;
        for (const o of det.offers) { if (!o.user) continue; if (o.user.id === sid) sending = o; else receiving = o; }
        return { sending, receiving };
    }
    function offerTotals(offer) {
        let tv = 0, tr = 0, robux = 0;
        if (offer && offer.userAssets) { for (const a of offer.userAssets) { const k = getKol(a.assetId); if (k) { tv += k.value || 0; tr += k.rap || 0; } else if (a.recentAveragePrice != null) tr += a.recentAveragePrice; } }
        if (offer && offer.robux > 0) robux = offer.robux;
        return { tv, tr, robux };
    }
    function demandColor(d) {
        if (!d) return '#888'; const l = d.toLowerCase();
        if (l === 'amazing') return '#4fc3f7'; if (l === 'great') return '#66bb6a'; if (l === 'good' || l === 'normal') return '#e8c44a'; if (l === 'low') return '#e07843'; if (l === 'terrible') return '#ef5350'; return '#888';
    }
    function demandBg(d) {
        if (!d) return 'rgba(136,136,136,.1)'; const l = d.toLowerCase();
        if (l === 'amazing') return 'rgba(79,195,247,.1)'; if (l === 'great') return 'rgba(102,187,106,.1)'; if (l === 'good' || l === 'normal') return 'rgba(232,196,74,.1)'; if (l === 'low') return 'rgba(224,120,67,.1)'; if (l === 'terrible') return 'rgba(239,83,80,.1)'; return 'rgba(136,136,136,.1)';
    }

    const ITEM_FB = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23222' width='1' height='1'/%3E%3C/svg%3E";

    function assetHtml(a) {
        const n = esc(a.name || 'Asset ' + a.assetId);
        const k = getKol(a.assetId);
        const thumb = assetThumbs[a.assetId] || ITEM_FB;
        let tags = '';
        if (k) {
            tags += '<span class="tt tt-v">Value ' + (k.value || 0).toLocaleString() + '</span>';
            tags += '<span class="tt tt-r">RAP ' + (k.rap || 0).toLocaleString() + '</span>';
            if (k.demand) tags += '<span class="tt" style="color:' + demandColor(k.demand) + ';background:' + demandBg(k.demand) + '">' + esc(k.demand) + '</span>';
        } else if (a.recentAveragePrice != null) {
            tags += '<span class="tt tt-r">RAP ' + a.recentAveragePrice.toLocaleString() + '</span>';
        }
        let ser = '';
        if (a.serialNumber != null) ser = '<span class="tt tt-s">#' + a.serialNumber + '</span>';
        return '<div class="ta"><img src="' + thumb + '" onerror="this.src=\'' + ITEM_FB + '\'" class="ta-img"><div class="ta-body"><span class="ta-n">' + n + '</span>' + ser + '<div class="ta-t">' + tags + '</div></div></div>';
    }
    function offerHtml(offer) {
        if (!offer) return '<span class="te">Nothing</span>';
        const p = [];
        if (offer.userAssets) for (const a of offer.userAssets) p.push(assetHtml(a));
        if (offer.robux > 0) p.push('<div class="ta ta-robux"><div class="ta-robux-icon">R$</div><div class="ta-body"><span class="ta-n trx">R$ ' + offer.robux.toLocaleString() + '</span></div></div>');
        if (!p.length) return '<span class="te">Nothing</span>';
        const v = offerTotals(offer);
        let tot = '<div class="ts">'; if (v.tv > 0) tot += '<span class="tt tt-v">Total Value ' + v.tv.toLocaleString() + '</span>'; if (v.tr > 0) tot += '<span class="tt tt-r">Total RAP ' + v.tr.toLocaleString() + '</span>'; if (v.robux > 0) tot += '<span class="tt trx-t">+ R$ ' + v.robux.toLocaleString() + '</span>'; tot += '</div>';
        return p.join('') + tot;
    }

    function injectBadge() {
        if (document.getElementById('tn-b')) return;
        const ul = document.querySelector('ul[class*="linkContainer"]'); if (!ul) return;
        const msg = ul.querySelector('li[class*="messagesContainer"]');
        const li = document.createElement('li'); li.id = 'tn-b';
        li.innerHTML = '<a id="tn-ba" href="javascript:void(0)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4L3 8m4-4l4 4M17 8v12l4-4m-4 4l-4-4"/></svg><span id="tn-bc"></span></a>';
        if (msg) msg.after(li); else ul.prepend(li);
        document.getElementById('tn-ba').addEventListener('click', function (e) { e.preventDefault(); togglePanel(); });
    }
    function updateBadge(c) {
        injectBadge(); const el = document.getElementById('tn-bc'); if (!el) return;
        el.textContent = c > 0 ? c : ''; el.style.display = c > 0 ? '' : 'none';
    }

    function injectCss() {
        if (document.getElementById('ts-kogold')) return;
        const s = document.createElement('style'); s.id = 'ts-kogold';
        s.textContent = `
            #tn-c { position: fixed; top: 16px; right: 16px; z-index: 999997; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
            .tn { pointer-events: auto; animation: ni .3s ease; max-width: 440px; min-width: 360px; width: 420px; transition: max-width .3s; padding: 4px; }
            .tn:hover { max-width: 520px; width: auto; }
            .tn.nout { animation: nout .25s ease forwards; }
            .tn-inner { display: flex; gap: 14px; background: #222222; border: 2px solid #555555; border-radius: 0px; padding: 14px 16px; font-family: -apple-system, system-ui, sans-serif; font-size: 13px; box-shadow: 0 0 30px rgba(0, 0, 0, 0.95); transition: border-color .2s; }
            .tn:hover .tn-inner { border-color: #ffd166; }
            .tn-av { width: 42px; height: 42px; border-radius: 50%; border: 2px solid #555555; flex-shrink: 0; object-fit: cover; align-self: start; transition: all .2s; }
            .tn-av-ph { width: 42px; height: 42px; border-radius: 50%; border: 2px solid #555555; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; background: #2a2a2a; align-self: start; }
            .tn:hover .tn-av { width: 50px; height: 50px; border-color: #ffd166; }
            .tn-b { display: flex; flex-direction: column; gap: 3px; min-width: 0; overflow: hidden; flex: 1; }
            .tn-t { font-weight: 600; font-size: 14px; color: #ffd166; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .nm { color: #888; font-size: 11px; }
            @keyframes ni { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes nout { to { opacity: 0; transform: translateX(40px); } }
            #tn-ba { display: flex; align-items: center; gap: 5px; text-decoration: none; color: #a0a0a0; transition: color .15s; cursor: pointer; }
            #tn-ba:hover { color: #ffd166; }
            #tn-bc { background: #ffd166; color: #222; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 8px; min-width: 14px; text-align: center; line-height: 1.3; font-family: -apple-system, system-ui, sans-serif; }
        `;
        document.head.appendChild(s);
    }

    function getContainer() {
        let c = document.getElementById('tn-c');
        if (!c) { c = document.createElement('div'); c.id = 'tn-c'; document.body.appendChild(c); }
        return c;
    }

    function togglePanel() { panelOpen = !panelOpen; }

    async function poll() {
        try {
            const trades = await fetchInbound();
            const count = await fetchCount();
            updateBadge(count);

            const cur = new Set(trades.map(function (t) { return t.id; }));
            let dirty = false;
            for (const id of [...seen]) { if (!cur.has(id)) { seen.delete(id); dirty = true; } }

            for (const t of trades) {
                const uid = t.user.id;
                const username = t.user.displayName || t.user.name || 'Unknown';

                if (settings.autoDeclineBlocked && isBlocked(uid) && !decliningTrades.has(t.id)) {
                    if (!blockedNames[uid] || blockedNames[uid] === 'User ' + uid) { blockedNames[uid] = username; saveBlockedNames(); }
                    autoDeclineTrade(t.id, uid, username, 'blocked');
                    continue;
                }

                if (settings.antiSpam && isSpamBanned(uid) && !decliningTrades.has(t.id)) {
                    autoDeclineTrade(t.id, uid, username, 'spam-banned');
                    continue;
                }
            }

            const fresh = trades.filter(function (t) { return !seen.has(t.id); });
            if (fresh.length) {
                const uids = [...new Set(fresh.map(function (t) { return t.user.id; }))];
                const heads = await fetchHeads(uids);
                Object.assign(panelHeads, heads);

                for (const t of fresh) {
                    seen.add(t.id);
                    if (first) continue;

                    const uid = t.user.id;
                    const username = t.user.displayName || t.user.name || 'Unknown';

                    if (settings.autoDeclineBlocked && isBlocked(uid)) continue;
                    if (settings.antiSpam && isSpamBanned(uid)) continue;

                    console.log('[Trade Notifier] New trade #' + t.id + ' from ' + username);
                }
                dirty = true;
            }
            if (dirty) saveSeen(seen);
            first = false;
        } catch (e) {
            console.error('[Trade Notifier] Poll error:', e);
        }
    }

    async function init() {
        if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
        injectCss(); 
        injectBadge();
        await seedCsrf();
        await Promise.all([fetchKol(), fetchAuth()]);
        poll();
        pollTimer = setInterval(poll, settings.pollInterval);
        setInterval(fetchKol, 300000);
        new MutationObserver(function () { injectBadge(); }).observe(document.body, { childList: true, subtree: true });
    }

    init();
})();

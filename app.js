(() => {
  'use strict';

  const STORAGE_KEY = 'xizuo-wedding-seating-v4';
  const PUBLIC_SITE_URL = 'https://reserve-serum-expense-warned.trycloudflare.com/lookup.html';
  const MAX_TABLES = 999;
  const MAX_GUESTS = 9999;
  let toastTimer = null;
  let lookupTimer = null;

  const THEMES = [
    { id: 1, name: '经典白绿花园', primary: '#A8B99A', secondary: '#66734A', accent: '#B08D57', base: '#F7F4ED' },
    { id: 2, name: '浪漫粉金', primary: '#F3C6C6', secondary: '#C97C84', accent: '#B76E79', base: '#E8D2A6' },
    { id: 3, name: '波西米亚大地', primary: '#C66A4A', secondary: '#B5793A', accent: '#D6A84B', base: '#E3D3B5' },
    { id: 4, name: '森系苔藓', primary: '#586B4C', secondary: '#7E9B76', accent: '#6B4F3A', base: '#B8B6A6' },
    { id: 5, name: '海军蓝', primary: '#1F2A44', secondary: '#8FA6B8', accent: '#C0C4C8', base: '#F3EFE6' },
    { id: 6, name: '酒红复古', primary: '#6E1F2A', secondary: '#8C2F39', accent: '#9A6B4F', base: '#B87A7A' },
    { id: 7, name: '薰衣草紫', primary: '#B9A7D6', secondary: '#D8C7E8', accent: '#8E9B8A', base: '#F2F0F4' },
    { id: 8, name: '摩洛哥宝石', primary: '#0F6B54', secondary: '#1F7A8C', accent: '#D98E04', base: '#9B1B30' },
    { id: 9, name: '黑金现代', primary: '#1C1C1C', secondary: '#C6A15B', accent: '#4A4A4A', base: '#F4F0E6' },
    { id: 10, name: '海滨海蓝', primary: '#2E6F9E', secondary: '#9BD3E6', accent: '#F08A7A', base: '#D9C7A7' }
  ];

  const els = {
    petalField: document.getElementById('petalField'),
    brandHome: document.getElementById('brandHome'),
    progressSteps: Array.from(document.querySelectorAll('.progress-step')),
    views: Array.from(document.querySelectorAll('.view')),
    guestTotal: document.getElementById('guestTotal'),
    tableTotal: document.getElementById('tableTotal'),
    formError: document.getElementById('formError'),
    calculateBtn: document.getElementById('calculateBtn'),
    resumeBtn: document.getElementById('resumeBtn'),
    previewStatus: document.getElementById('previewStatus'),
    averageNumber: document.getElementById('averageNumber'),
    averageCaption: document.getElementById('averageCaption'),
    previewTables: document.getElementById('previewTables'),
    previewBase: document.getElementById('previewBase'),
    previewLast: document.getElementById('previewLast'),
    formulaText: document.getElementById('formulaText'),
    previewFootnote: document.getElementById('previewFootnote'),
    assignedCount: document.getElementById('assignedCount'),
    expectedCount: document.getElementById('expectedCount'),
    assignmentHint: document.getElementById('assignmentHint'),
    assignmentProgress: document.getElementById('assignmentProgress'),
    assignmentPercent: document.getElementById('assignmentPercent'),
    tableSearch: document.getElementById('tableSearch'),
    tableResultCount: document.getElementById('tableResultCount'),
    tablesGrid: document.getElementById('tablesGrid'),
    emptyFilter: document.getElementById('emptyFilter'),
    batchImportBtn: document.getElementById('batchImportBtn'),
    clearNamesBtn: document.getElementById('clearNamesBtn'),
    nextButtonTitle: document.getElementById('nextButtonTitle'),
    nextButtonHint: document.getElementById('nextButtonHint'),
    goToSearchBtn: document.getElementById('goToSearchBtn'),
    lookupForm: document.getElementById('lookupForm'),
    guestSearch: document.getElementById('guestSearch'),
    quickNames: document.getElementById('quickNames'),
    quickNamesList: document.getElementById('quickNamesList'),
    lookupResult: document.getElementById('lookupResult'),
    lookupPlaceholder: document.getElementById('lookupPlaceholder'),
    overviewGrid: document.getElementById('overviewGrid'),
    backToSeatingBtn: document.getElementById('backToSeatingBtn'),
    qrTargetUrl: document.getElementById('qrTargetUrl'),
    qrCanvas: document.getElementById('qrCanvas'),
    qrRefreshBtn: document.getElementById('qrRefreshBtn'),
    copyQrBtn: document.getElementById('copyQrBtn'),
    downloadQrBtn: document.getElementById('downloadQrBtn'),
    copyQrLinkBtn: document.getElementById('copyQrLinkBtn'),
    qrStatus: document.getElementById('qrStatus'),
    batchDialog: document.getElementById('batchDialog'),
    batchForm: document.getElementById('batchForm'),
    batchDialogTitle: document.getElementById('batchDialogTitle'),
    batchDialogDesc: document.getElementById('batchDialogDesc'),
    batchNames: document.getElementById('batchNames'),
    batchCounter: document.getElementById('batchCounter'),
    batchConfirmBtn: document.getElementById('batchConfirmBtn'),
    dialogCloseBtn: document.getElementById('dialogCloseBtn'),
    dialogCancelBtn: document.getElementById('dialogCancelBtn'),
    nameFile: document.getElementById('nameFile'),
    excelFile: document.getElementById('excelFile'),
    importStatus: document.getElementById('importStatus'),
    chartImageFile: document.getElementById('chartImageFile'),
    chartPreviewWrap: document.getElementById('chartPreviewWrap'),
    chartPreviewImg: document.getElementById('chartPreviewImg'),
    chartRemoveBtn: document.getElementById('chartRemoveBtn'),
    chartStatus: document.getElementById('chartStatus'),
    chartDropTitle: document.getElementById('chartDropTitle'),
    chartCard: document.getElementById('chartCard'),
    chartImageDisplay: document.getElementById('chartImageDisplay'),
    chartFigure: document.getElementById('chartFigure'),
    imageLightbox: document.getElementById('imageLightbox'),
    lightboxImage: document.getElementById('lightboxImage'),
    lightboxClose: document.getElementById('lightboxClose'),
    themeGrid: document.getElementById('themeGrid'),
    themeConfirmBtn: document.getElementById('themeConfirmBtn'),
    themeNextTitle: document.getElementById('themeNextTitle'),
    confirmDialog: document.getElementById('confirmDialog'),
    confirmTitle: document.getElementById('confirmTitle'),
    confirmMessage: document.getElementById('confirmMessage'),
    toast: document.getElementById('toast')
  };

  const state = {
    totalGuests: 0,
    totalTables: 0,
    baseCapacity: 0,
    remainder: 0,
    tables: [],
    activeView: 1,
    tableFilter: '',
    batchTableId: null,
    isSharedLookup: false,
    shareId: null,
    chartImage: null,
    theme: 1
  };

  function createElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function padTableNumber(number) {
    return String(number);
  }

  function getTablePresentation(table) {
    if (table.isMain) return { code: '主', label: '主桌', title: '主桌' };
    const code = table.label || padTableNumber(table.number);
    return { code: code, label: '第 ' + code + ' 桌', title: '第 ' + code + ' 桌' };
  }

  function parsePositiveInteger(value) {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
  }

  function validateInputs() {
    const guests = parsePositiveInteger(els.guestTotal.value);
    const tables = parsePositiveInteger(els.tableTotal.value);

    if (guests === null) return { valid: false, message: '请输入有效的总人数。' };
    if (tables === null) return { valid: false, message: '请输入有效的总桌数。' };
    if (guests > MAX_GUESTS) return { valid: false, message: '总人数不能超过 ' + MAX_GUESTS + ' 人。' };
    if (tables > MAX_TABLES) return { valid: false, message: '总桌数不能超过 ' + MAX_TABLES + ' 桌。' };
    if (tables > guests) return { valid: false, message: '总桌数不能多于总人数，否则会出现无法安排的空桌。' };

    return { valid: true, guests: guests, tables: tables, message: '' };
  }

  function buildPlan(guests, tables) {
    const base = Math.floor(guests / tables);
    const remainder = guests % tables;
    const capacities = Array(tables).fill(base);
    if (remainder > 0) capacities[tables - 1] += remainder;
    return { guests: guests, tables: tables, base: base, remainder: remainder, capacities: capacities };
  }

  function getAssignedCount() {
    return state.tables.reduce((total, table) => total + table.names.length, 0);
  }

  function getExpectedCount() {
    return state.tables.reduce((total, table) => total + table.capacity, 0);
  }

  function formatAverage(guests, tables) {
    const value = guests / tables;
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add('show');
    toastTimer = window.setTimeout(() => els.toast.classList.remove('show'), 2400);
  }

  function askConfirm(title, message) {
    return new Promise((resolve) => {
      els.confirmTitle.textContent = title;
      els.confirmMessage.textContent = message;
      els.confirmDialog.returnValue = 'cancel';
      els.confirmDialog.addEventListener('close', () => resolve(els.confirmDialog.returnValue === 'confirm'), { once: true });
      els.confirmDialog.showModal();
    });
  }

  function initializePetals() {
    const count = window.innerWidth < 700 ? 16 : 30;
    for (let index = 0; index < count; index += 1) {
      const petal = createElement('span', 'petal');
      petal.style.setProperty('--petal-left', (2 + Math.random() * 96).toFixed(2) + '%');
      petal.style.setProperty('--fall-duration', (11 + Math.random() * 12).toFixed(2) + 's');
      petal.style.setProperty('--fall-delay', (-Math.random() * 20).toFixed(2) + 's');
      petal.style.setProperty('--petal-size', (8 + Math.random() * 10).toFixed(1) + 'px');
      petal.style.setProperty('--drift', (45 + Math.random() * 125).toFixed(0) + 'px');
      petal.style.setProperty('--spin', (180 + Math.random() * 430).toFixed(0) + 'deg');
      els.petalField.appendChild(petal);
    }
  }

  function resetPreview() {
    if (!els.previewStatus) return;
    els.previewStatus.textContent = '等待输入';
    els.previewStatus.classList.remove('ready');
    els.averageNumber.textContent = '--';
    els.averageCaption.textContent = '平均人数';
    els.previewTables.textContent = '--';
    els.previewBase.textContent = '--';
    els.previewLast.textContent = '--';
    els.formulaText.textContent = '输入人数与桌数后自动计算';
    els.previewFootnote.textContent = '余数固定并入最后一桌，不额外增加桌数。';
  }

  function updatePreview() {
    if (!els.previewStatus) return null;
    const validation = validateInputs();
    if (!validation.valid) {
      resetPreview();
      return null;
    }

    const plan = buildPlan(validation.guests, validation.tables);
    els.previewStatus.textContent = '方案已就绪';
    els.previewStatus.classList.add('ready');
    els.averageNumber.textContent = formatAverage(plan.guests, plan.tables);
    els.averageCaption.textContent = '平均人数 / 四舍五入显示';
    els.previewTables.textContent = String(plan.tables);
    els.previewBase.textContent = String(plan.base);
    els.previewLast.textContent = String(plan.capacities[plan.tables - 1]);

    if (plan.remainder === 0) {
      els.formulaText.textContent = plan.guests + ' ÷ ' + plan.tables + ' = ' + plan.base + '，每桌人数完全一致';
      els.previewFootnote.textContent = '人数可被桌数整除，每桌均为 ' + plan.base + ' 人。';
    } else {
      els.formulaText.textContent = plan.guests + ' ÷ ' + plan.tables + ' = ' + Math.floor(plan.guests / plan.tables) + ' 余 ' + plan.remainder + '；前 ' + (plan.tables - 1) + ' 桌各 ' + plan.base + ' 人，最后一桌 ' + plan.capacities[plan.tables - 1] + ' 人';
      els.previewFootnote.textContent = '余数 ' + plan.remainder + ' 人已并入最后一桌，总桌数仍为 ' + plan.tables + ' 桌。';
    }
    return plan;
  }

  function createTablesFromPlan(plan) {
    return plan.capacities.map((capacity, index) => ({
      id: 'table-' + (index + 1),
      number: index + 1,
      capacity: capacity,
      isRemainder: plan.remainder > 0 && index === plan.capacities.length - 1,
      names: []
    }));
  }

  function utf8ToBase64Url(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(index, index + chunkSize));
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function base64UrlToUtf8(value) {
    let base64 = String(value).replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new TextDecoder().decode(bytes);
  }

  function getShareBaseUrl() {
    const currentUrl = window.location.origin + window.location.pathname;
    const hostname = window.location.hostname;
    const isLocalAddress =
      window.location.protocol === 'file:' ||
      ['localhost', '127.0.0.1'].includes(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);
    if (isLocalAddress) return PUBLIC_SITE_URL;
    return /\/lookup\.html$/i.test(window.location.pathname) ? currentUrl : window.location.origin + '/lookup.html';
  }

  function buildShareUrl() {
    if (window.SHARE_URL_OVERRIDE) return String(window.SHARE_URL_OVERRIDE);
    const payload = {
      v: 1,
      g: state.totalGuests,
      t: state.totalTables,
      x: state.tables.map((table) => table.names.slice())
    };
    const shareUrl = new URL(getShareBaseUrl());
    shareUrl.searchParams.set('seat', utf8ToBase64Url(JSON.stringify(payload)));
    shareUrl.searchParams.set('step', '3');
    return shareUrl.toString();
  }

  function applySharedPayload(payload, allowV1) {
    if (payload && (payload.version === 2 || payload.v === 2) && Array.isArray(payload.tables)) {
      const normalizedTables = payload.tables.map((table, index) => {
        const names = Array.isArray(table.names)
          ? table.names.filter((name) => typeof name === 'string' && name.trim()).map((name) => name.trim())
          : [];
        const capacity = Math.max(Number(table.capacity) || 0, names.length, 1);
        const number = Number(table.number) || index + 1;
        return {
          id: String(table.id || 'table-' + (index + 1)),
          number: number,
          label: table.label ? String(table.label) : padTableNumber(number),
          capacity: capacity,
          isMain: Boolean(table.isMain),
          isImported: Boolean(table.isImported),
          isRemainder: false,
          names: names.slice(0, capacity)
        };
      }).sort((a, b) => {
        if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
        return a.number - b.number;
      });
      if (normalizedTables.length === 0) return false;
      const totalGuests = normalizedTables.reduce((sum, table) => sum + table.names.length, 0);
      state.totalGuests = totalGuests;
      state.totalTables = normalizedTables.length;
      state.shareId = payload.shareId ? String(payload.shareId) : null;
      state.baseCapacity = Math.floor(totalGuests / normalizedTables.length);
      state.remainder = totalGuests % normalizedTables.length;
      state.tables = normalizedTables;
    } else if (allowV1 && payload && payload.v === 1) {
      const guests = Number(payload.g);
      const tables = Number(payload.t);
      if (!Number.isInteger(guests) || !Number.isInteger(tables) || guests < 1 || tables < 1 || tables > guests) return false;
      const plan = buildPlan(guests, tables);
      if (!Array.isArray(payload.x) || payload.x.length !== tables) return false;
      state.totalGuests = guests;
      state.totalTables = tables;
      state.baseCapacity = plan.base;
      state.remainder = plan.remainder;
      state.tables = plan.capacities.map((capacity, index) => ({
        id: 'table-' + (index + 1),
        number: index + 1,
        label: padTableNumber(index + 1),
        capacity: capacity,
        isMain: false,
        isImported: false,
        isRemainder: plan.remainder > 0 && index === plan.capacities.length - 1,
        names: Array.isArray(payload.x[index])
          ? payload.x[index].filter((name) => typeof name === 'string' && name.trim()).map((name) => name.trim()).slice(0, capacity)
          : []
      }));
    } else {
      return false;
    }

    state.chartImage = (payload && typeof payload.chartImage === 'string' && payload.chartImage) ? payload.chartImage : null;
    state.theme = Number(payload.theme) || 1;
    applyTheme(state.theme);
    state.activeView = 4;
    state.isSharedLookup = window.SHARED_VIEW_MODE !== 'admin';
    document.body.classList.toggle('shared-lookup-mode', state.isSharedLookup);
    if (state.isSharedLookup) document.body.classList.add('theme-scope');
    els.guestTotal.value = String(state.totalGuests);
    els.tableTotal.value = String(state.totalTables);
    updatePreview();
    return true;
  }

  function loadSharedState() {
    if (window.SHARED_SEATING_DATA) {
      try {
        return applySharedPayload(window.SHARED_SEATING_DATA, false);
      } catch (error) {
        console.warn('无法读取导入的座位数据', error);
        return false;
      }
    }
    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get('seat') || (window.location.hash.startsWith('#seat=') ? window.location.hash.slice(6) : '');
    if (!shareToken) return false;
    try {
      const payload = JSON.parse(base64UrlToUtf8(shareToken));
      const loaded = applySharedPayload(payload, true);
      if (!loaded) return false;
      window.history.replaceState(null, '', window.location.origin + window.location.pathname);
      return true;
    } catch (error) {
      console.warn('无法读取二维码座位数据', error);
      return false;
    }
  }

  function setQrStatus(message, type) {
    els.qrStatus.textContent = message;
    els.qrStatus.classList.remove('is-warning', 'is-success', 'is-error');
    if (type) els.qrStatus.classList.add('is-' + type);
  }

  function renderQrCanvas(target) {
    if (typeof window.qrcode !== 'function') {
      setQrStatus('二维码组件加载失败，请刷新页面后重试。', 'error');
      return false;
    }
    try {
      const code = window.qrcode(0, 'L');
      code.addData(target);
      code.make();
      const moduleCount = code.getModuleCount();
      const canvasSize = 720;
      const quietZone = 4;
      const cellSize = Math.max(1, Math.floor(canvasSize / (moduleCount + quietZone * 2)));
      const actualSize = cellSize * (moduleCount + quietZone * 2);
      const canvas = els.qrCanvas;
      const context = canvas.getContext('2d');
      canvas.width = actualSize;
      canvas.height = actualSize;
      context.imageSmoothingEnabled = false;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, actualSize, actualSize);
      context.fillStyle = '#342b29';
      for (let row = 0; row < moduleCount; row += 1) {
        for (let column = 0; column < moduleCount; column += 1) {
          if (code.isDark(row, column)) {
            context.fillRect((column + quietZone) * cellSize, (row + quietZone) * cellSize, cellSize, cellSize);
          }
        }
      }
      canvas.dataset.target = target;
      return true;
    } catch (error) {
      console.warn('二维码生成失败', error);
      return false;
    }
  }

  function buildPayloadV2() {
    return {
      version: 2,
      source: '网站导入',
      totalGuests: state.totalGuests,
      totalTables: state.totalTables,
      shareId: state.shareId || null,
      chartImage: state.chartImage || null,
      theme: state.theme,
      tables: state.tables.map((table) => ({
        id: table.id,
        number: table.number,
        label: table.label || padTableNumber(table.number),
        capacity: table.capacity,
        isMain: Boolean(table.isMain),
        isImported: Boolean(table.isImported),
        names: table.names.slice()
      }))
    };
  }

  async function requestSharePage() {
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayloadV2())
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data && typeof data.shareUrl === 'string' && data.shareUrl) return data.shareUrl;
      return null;
    } catch (error) {
      return null;
    }
  }

  async function prepareQrShare() {
    if (state.isSharedLookup) return;
    if (state.tables.length === 0 || getAssignedCount() === 0) {
      setQrStatus('录入宾客姓名后即可生成座位查询二维码。', 'warning');
      return;
    }

    setQrStatus('正在生成座位查询二维码…', 'warning');

    const override = window.SHARE_URL_OVERRIDE ? String(window.SHARE_URL_OVERRIDE) : null;
    const shareUrl = override || await requestSharePage() || buildShareUrl();

    if (renderQrCanvas(shareUrl)) {
      els.qrTargetUrl.value = shareUrl;
      if (window.location.protocol === 'file:') {
        setQrStatus('二维码已生成。当前是本机文件地址，请通过局域网或公开网站链接打开后再生成可扫码二维码。', 'warning');
      } else if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        setQrStatus('二维码已生成。当前使用本机地址，手机无法直接访问，请改用局域网 IP 或公开网站链接。', 'warning');
      } else {
        setQrStatus('二维码已生成，扫码即可直接查询座位。', 'success');
      }
      return;
    }

    const fallback = getShareBaseUrl();
    els.qrTargetUrl.value = fallback;
    if (renderQrCanvas(fallback)) {
      setQrStatus('数据较多，已生成指向查询页的二维码。', 'warning');
    } else {
      setQrStatus('二维码生成失败，请复制查询链接或刷新页面后重试。', 'error');
    }
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand('copy');
      helper.remove();
      return copied;
    } catch (error) {
      return false;
    }
  }

  function downloadQrImage() {
    if (!els.qrCanvas.dataset.target) {
      return;
    }
    els.qrCanvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'xizuo-seat-query-qr.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      setQrStatus('二维码 PNG 已开始下载。', 'success');
    }, 'image/png');
  }

  function copyQrImageFallback() {
    const container = document.createElement('div');
    const image = document.createElement('img');
    container.contentEditable = 'true';
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    image.src = els.qrCanvas.toDataURL('image/png');
    image.alt = '座位查询二维码';
    container.appendChild(image);
    document.body.appendChild(container);

    let copied = false;
    try {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(container);
      selection.removeAllRanges();
      selection.addRange(range);
      copied = document.execCommand('copy');
      selection.removeAllRanges();
    } catch (error) {
      copied = false;
    }
    container.remove();
    return copied;
  }

  async function copyQrImage() {
    if (!els.qrCanvas.dataset.target || !els.qrCanvas.toBlob) {
      setQrStatus('请先生成二维码。', 'warning');
      return;
    }
    els.qrCanvas.toBlob(async (blob) => {
      if (!blob) {
        setQrStatus('二维码图片生成失败。', 'error');
        return;
      }
      let copied = false;
      if (navigator.clipboard && navigator.clipboard.write && typeof window.ClipboardItem === 'function') {
        try {
          await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
          copied = true;
        } catch (error) {
          copied = false;
        }
      }
      if (!copied) copied = copyQrImageFallback();

      if (copied) {
        setQrStatus('二维码图片已复制，可直接粘贴到微信或文档中。', 'success');
      } else {
        setQrStatus('浏览器未允许自动复制，请右键二维码选择“复制图片”，或点击“下载 PNG”。', 'warning');
      }
    }, 'image/png');
  }

  function saveState() {
    try {
      const payload = {
        version: 1,
        totalGuests: state.totalGuests,
        totalTables: state.totalTables,
        baseCapacity: state.baseCapacity,
        remainder: state.remainder,
        tables: state.tables,
        activeView: state.activeView,
        chartImage: state.chartImage || null,
        theme: state.theme
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (quotaError) {
        payload.chartImage = null;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    } catch (error) {
      console.warn('无法保存座位数据', error);
    }
  }

  function loadSavedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (!saved || !Array.isArray(saved.tables) || saved.tables.length === 0) return false;

      const restoredTables = saved.tables.map((savedTable, index) => {
        const names = Array.isArray(savedTable.names)
          ? savedTable.names.filter((name) => typeof name === 'string' && name.trim()).map((name) => name.trim())
          : [];
        const capacity = Math.max(Number(savedTable.capacity) || 0, names.length, 1);
        const number = Number(savedTable.number) || index + 1;
        return {
          id: String(savedTable.id || 'table-' + (index + 1)),
          number: number,
          label: savedTable.label ? String(savedTable.label) : String(number),
          capacity: capacity,
          isMain: Boolean(savedTable.isMain),
          isImported: Boolean(savedTable.isImported),
          isRemainder: Boolean(savedTable.isRemainder),
          names: names
        };
      }).sort((a, b) => {
        if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
        return a.number - b.number;
      });

      const totalGuests = restoredTables.reduce((sum, table) => sum + table.names.length, 0);
      state.totalGuests = totalGuests;
      state.totalTables = restoredTables.length;
      state.tables = restoredTables;
      state.baseCapacity = restoredTables.length ? Math.floor(totalGuests / restoredTables.length) : 0;
      state.remainder = restoredTables.length ? totalGuests % restoredTables.length : 0;
      state.chartImage = (saved.chartImage && typeof saved.chartImage === 'string') ? saved.chartImage : null;
      state.theme = Number(saved.theme) || 1;
      state.activeView = [1, 2, 3, 4].includes(saved.activeView) ? saved.activeView : 1;
      els.guestTotal.value = String(state.totalGuests);
      els.tableTotal.value = String(state.totalTables);
      updatePreview();
      return true;
    } catch (error) {
      console.warn('无法恢复座位数据', error);
      return false;
    }
  }

  function updateProgressNavigation() {
    const hasPlan = state.tables.length > 0;
    const hasNames = getAssignedCount() > 0;
    els.progressSteps.forEach((button) => {
      const target = Number(button.dataset.targetStep);
      button.disabled = (target === 2 && !hasPlan) || ((target === 3 || target === 4) && !hasNames);
      button.classList.toggle('is-active', target === state.activeView);
      button.classList.toggle('is-complete', target < state.activeView);
      if (target === state.activeView) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }

  function navigateTo(step, options) {
    const settings = options || {};
    const target = Number(step);
    if (target === 2 && state.tables.length === 0) {
      showToast('请先生成排桌方案');
      return;
    }
    if (target === 4 && getAssignedCount() === 0 && !settings.force) {
      showToast('请先录入至少一位宾客姓名');
      return;
    }

    state.activeView = target;
    els.views.forEach((view) => {
      const isActive = Number(view.dataset.view) === target;
      view.hidden = !isActive;
      view.classList.toggle('is-active', isActive);
    });
    document.body.classList.toggle('theme-scope', target === 4 || state.isSharedLookup);
    updateProgressNavigation();
    if (target === 2) renderSeating();
    if (target === 3) renderTheme();
    if (target === 4) renderLookup();
    saveState();
    if (settings.scroll !== false) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleCalculate() {
    els.formError.textContent = '';
    const validation = validateInputs();
    if (!validation.valid) {
      els.formError.textContent = validation.message;
      els.guestTotal.focus();
      updatePreview();
      return;
    }

    const plan = buildPlan(validation.guests, validation.tables);
    const planChanged = state.totalGuests !== plan.guests || state.totalTables !== plan.tables;
    const existingNames = getAssignedCount();

    if (planChanged && existingNames > 0) {
      const confirmed = await askConfirm('重新生成排桌方案？', '人数或桌数已改变，现有 ' + existingNames + ' 位宾客姓名将被清空。');
      if (!confirmed) return;
    }

    if (planChanged || state.tables.length === 0) {
      state.totalGuests = plan.guests;
      state.totalTables = plan.tables;
      state.baseCapacity = plan.base;
      state.remainder = plan.remainder;
      state.tables = createTablesFromPlan(plan);
    } else {
      state.baseCapacity = plan.base;
      state.remainder = plan.remainder;
    }

    els.resumeBtn.classList.add('is-hidden');
    renderSeating();
    navigateTo(2);
  }

  function resumeSavedPlan() {
    if (state.tables.length === 0) return;
    navigateTo(state.activeView > 1 ? state.activeView : 2);
  }

  if (els.excelFile) {
    els.excelFile.addEventListener('change', async () => {
      const file = els.excelFile.files && els.excelFile.files[0];
      els.excelFile.value = '';
      if (!file) return;
      if (els.importStatus) {
        els.importStatus.textContent = '正在读取文件…';
        els.importStatus.classList.remove('is-error');
      }
      try {
        const tables = await parseSeatingFile(file);
        if (!tables.length) throw new Error('未在文件中识别到桌号与姓名');
        applyImportedTables(tables);
        if (els.importStatus) {
          els.importStatus.textContent = '已导入「' + file.name + '」：' + state.totalGuests + ' 位宾客 / ' + state.totalTables + ' 桌';
        }
        els.resumeBtn.classList.add('is-hidden');
        renderSeating();
        updateProgressNavigation();
        saveState();
        navigateTo(3, { force: true, scroll: false });
        showToast('导入成功，已自动排桌并进入查询界面');
      } catch (error) {
        const message = error && error.message ? error.message : '文件格式无法识别';
        if (els.importStatus) {
          els.importStatus.textContent = '导入失败：' + message;
          els.importStatus.classList.add('is-error');
        }
        showToast('导入失败，请检查文件格式');
      }
    });
  }

  if (els.chartImageFile) {
    els.chartImageFile.addEventListener('change', () => {
      const file = els.chartImageFile.files && els.chartImageFile.files[0];
      els.chartImageFile.value = '';
      if (!file) return;
      if (!/^image\//.test(file.type)) {
        showToast('请选择图片文件');
        return;
      }
      if (file.size > 6 * 1024 * 1024) {
        showToast('图片过大，请选择 6MB 以内的图片');
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        state.chartImage = String(reader.result || '');
        renderChartImage();
        if (els.chartStatus) {
          els.chartStatus.textContent = '已添加座位表图片';
          els.chartStatus.classList.remove('is-error');
        }
        saveState();
      });
      reader.addEventListener('error', () => {
        showToast('图片读取失败');
      });
      reader.readAsDataURL(file);
    });

    if (els.chartRemoveBtn) {
      els.chartRemoveBtn.addEventListener('click', () => {
        state.chartImage = null;
        renderChartImage();
        if (els.chartStatus) {
          els.chartStatus.textContent = '';
        }
        saveState();
      });
    }
  }

  function openLightbox() {
    const src = (els.chartImageDisplay && els.chartImageDisplay.getAttribute('src')) || state.chartImage;
    if (!src) return;
    if (els.lightboxImage) els.lightboxImage.src = src;
    if (els.imageLightbox) {
      els.imageLightbox.classList.remove('is-hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (els.imageLightbox) {
      els.imageLightbox.classList.add('is-hidden');
      document.body.style.overflow = '';
    }
    if (els.lightboxImage) els.lightboxImage.removeAttribute('src');
  }

  if (els.chartFigure) els.chartFigure.addEventListener('click', openLightbox);
  if (els.lightboxClose) els.lightboxClose.addEventListener('click', closeLightbox);
  if (els.imageLightbox) {
    els.imageLightbox.addEventListener('click', (event) => {
      if (event.target === els.imageLightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });

  els.calculateBtn.addEventListener('click', handleCalculate);
  els.resumeBtn.addEventListener('click', resumeSavedPlan);
  els.guestTotal.addEventListener('input', () => {
    els.formError.textContent = '';
    updatePreview();
  });
  els.tableTotal.addEventListener('input', () => {
    els.formError.textContent = '';
    updatePreview();
  });
  els.guestTotal.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') els.tableTotal.focus();
  });
  els.tableTotal.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleCalculate();
  });
  els.brandHome.addEventListener('click', (event) => {
    event.preventDefault();
    navigateTo(1);
  });
  els.progressSteps.forEach((button) => {
    button.addEventListener('click', () => navigateTo(Number(button.dataset.targetStep)));
  });

  function parseNames(value) {
    if (!value) return [];
    return value
      .split(/[\n\r,，、;；\t]+/)
      .map((name) => name.trim().replace(/\s{2,}/g, ' '))
      .filter(Boolean);
  }

  function addNamesToTable(tableId, names) {
    const table = state.tables.find((item) => item.id === tableId);
    if (!table) return 0;
    const existing = new Set(table.names.map((name) => name.toLocaleLowerCase('zh-CN')));
    let added = 0;
    let duplicates = 0;
    let overflow = 0;

    parseNames(names).forEach((name) => {
      const key = name.toLocaleLowerCase('zh-CN');
      if (existing.has(key)) {
        duplicates += 1;
        return;
      }
      if (table.names.length >= table.capacity) {
        overflow += 1;
        return;
      }
      table.names.push(name);
      existing.add(key);
      added += 1;
    });

    if (added > 0) {
      saveState();
      renderSeating();
    }
    if (overflow > 0) showToast('已添加 ' + added + ' 人，本桌已满，另有 ' + overflow + ' 人未添加');
    else if (duplicates > 0 && added === 0) showToast('这些姓名已在本桌');
    else if (added > 0) showToast('已向第 ' + table.number + ' 桌添加 ' + added + ' 位宾客');
    return added;
  }

  function renameGuest(tableId, index, nextName) {
    const table = state.tables.find((item) => item.id === tableId);
    if (!table || !table.names[index]) return;
    const cleanName = nextName.trim().replace(/\s{2,}/g, ' ');
    if (!cleanName) {
      table.names.splice(index, 1);
      saveState();
      renderSeating();
      showToast('已移除该姓名');
      return;
    }

    const duplicate = table.names.some((name, nameIndex) => nameIndex !== index && name.toLocaleLowerCase('zh-CN') === cleanName.toLocaleLowerCase('zh-CN'));
    if (duplicate) {
      showToast('本桌已有相同姓名');
      renderSeating();
      return;
    }

    table.names[index] = cleanName;
    saveState();
    renderSeating();
  }

  function createNameChip(table, name, index) {
    const chip = createElement('span', 'name-chip');
    const input = createElement('input');
    input.type = 'text';
    input.value = name;
    input.setAttribute('aria-label', '编辑 ' + name);
    input.title = '点击即可修改姓名';
    const estimatedWidth = Math.min(102, Math.max(40, name.length * 15 + 8));
    input.style.width = estimatedWidth + 'px';

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        input.blur();
      }
      if (event.key === 'Escape') {
        input.value = name;
        input.blur();
      }
    });
    input.addEventListener('change', () => renameGuest(table.id, index, input.value));

    const removeButton = createElement('button', null, '×');
    removeButton.type = 'button';
    removeButton.setAttribute('aria-label', '移除 ' + name);
    removeButton.title = '移除';
    removeButton.addEventListener('click', () => {
      table.names.splice(index, 1);
      saveState();
      renderSeating();
      showToast('已移除 ' + name);
    });

    chip.appendChild(input);
    chip.appendChild(removeButton);
    return chip;
  }

  function createTableCard(table, animationIndex) {
    const card = createElement('article', 'table-card');
    card.dataset.tableId = table.id;
    card.style.animationDelay = Math.min(animationIndex * 0.035, 0.32) + 's';
    if (table.isRemainder) card.classList.add('remainder-card');
    if (table.names.length === table.capacity) card.classList.add('full-card');

    const header = createElement('header', 'table-card-head');
    const presentation = getTablePresentation(table);
    const numberBox = createElement('div', 'table-number');
    numberBox.appendChild(createElement('small', null, 'TABLE'));
    numberBox.appendChild(createElement('strong', null, presentation.code));
    numberBox.appendChild(createElement('span', null, table.isMain ? '桌' : '号桌'));

    const meta = createElement('div', 'table-meta');
    const type = createElement('span', 'table-type', table.isMain ? '主桌' : (table.isImported ? '宾客桌' : (table.isRemainder ? '余数桌' : '基础桌')));
    const count = createElement('p');
    count.appendChild(createElement('b', null, String(table.names.length)));
    count.appendChild(document.createTextNode(' / ' + table.capacity + ' 人'));
    meta.appendChild(type);
    meta.appendChild(count);
    header.appendChild(numberBox);
    header.appendChild(meta);

    const progress = createElement('div', 'seat-progress');
    const progressFill = createElement('span');
    progressFill.style.width = (table.capacity ? (table.names.length / table.capacity) * 100 : 0) + '%';
    progress.appendChild(progressFill);

    const namesList = createElement('div', 'names-list');
    if (table.names.length === 0) {
      const empty = createElement('div', 'empty-names');
      empty.appendChild(createElement('span', null, '＋'));
      empty.appendChild(document.createTextNode('等待录入宾客'));
      namesList.appendChild(empty);
    } else {
      table.names.forEach((name, index) => namesList.appendChild(createNameChip(table, name, index)));
    }

    const quickForm = createElement('form', 'quick-add');
    const quickInput = createElement('input');
    quickInput.type = 'text';
    quickInput.placeholder = table.names.length >= table.capacity ? '本桌已坐满' : '输入姓名后回车';
    quickInput.setAttribute('aria-label', '向第 ' + table.number + ' 桌添加姓名');
    quickInput.disabled = table.names.length >= table.capacity;
    const quickButton = createElement('button', null, '+');
    quickButton.type = 'submit';
    quickButton.title = '添加姓名';
    quickButton.disabled = quickInput.disabled;
    quickForm.appendChild(quickInput);
    quickForm.appendChild(quickButton);
    quickForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = quickInput.value;
      const added = addNamesToTable(table.id, value);
      if (added === 0 && value.trim()) quickInput.value = value;
      else quickInput.value = '';
      if (added > 0) quickInput.focus();
    });

    const bulkButton = createElement('button', 'card-bulk-button', '批量填入本桌');
    bulkButton.type = 'button';
    bulkButton.disabled = table.names.length >= table.capacity;
    bulkButton.addEventListener('click', () => openBatchDialog(table.id));

    card.appendChild(header);
    card.appendChild(progress);
    card.appendChild(namesList);
    card.appendChild(quickForm);
    card.appendChild(bulkButton);
    return card;
  }

  function updateSeatingSummary() {
    const assigned = getAssignedCount();
    const expected = getExpectedCount();
    const percent = expected > 0 ? Math.round((assigned / expected) * 100) : 0;
    els.assignedCount.textContent = String(assigned);
    els.expectedCount.textContent = String(expected);
    els.assignmentProgress.style.width = percent + '%';
    els.assignmentPercent.textContent = percent + '%';
    els.goToSearchBtn.disabled = assigned === 0;

    if (assigned === 0) {
      els.assignmentHint.textContent = '还未录入宾客姓名';
      els.nextButtonTitle.textContent = '请先安排宾客';
      els.nextButtonHint.textContent = '姓名录入后即可选择主题';
    } else if (assigned < expected) {
      els.assignmentHint.textContent = '还有 ' + (expected - assigned) + ' 个座位等待安排';
      els.nextButtonTitle.textContent = '座位仍在安排中';
      els.nextButtonHint.textContent = '仍可选择主题，也可继续补全 ' + (expected - assigned) + ' 位宾客';
    } else {
      els.assignmentHint.textContent = '所有宾客均已入席';
      els.nextButtonTitle.textContent = '宾客已全部入席';
      els.nextButtonHint.textContent = '可以进入主题选择';
    }
  }

  function renderTables() {
    const filter = state.tableFilter.trim().toLocaleLowerCase('zh-CN');
    const filtered = state.tables.filter((table) => {
      if (!filter) return true;
      const tableText = getTablePresentation(table).title + ' ' + table.number + ' 桌';
      const nameText = table.names.join(' ').toLocaleLowerCase('zh-CN');
      return tableText.toLocaleLowerCase('zh-CN').includes(filter) || nameText.includes(filter);
    });

    els.tablesGrid.innerHTML = '';
    filtered.forEach((table, index) => els.tablesGrid.appendChild(createTableCard(table, index)));
    els.tableResultCount.textContent = filter ? '显示 ' + filtered.length + ' / ' + state.tables.length + ' 桌' : '共 ' + state.tables.length + ' 桌';
    els.emptyFilter.classList.toggle('is-hidden', filtered.length > 0);
  }

  function renderSeating() {
    if (state.tables.length === 0) return;
    updateSeatingSummary();
    renderTables();
  }

  function fillAllTables(names) {
    const plan = buildPlan(state.totalGuests, state.totalTables);
    const expected = plan.capacities.reduce((sum, capacity) => sum + capacity, 0);
    const seen = new Set();
    const uniqueNames = [];

    parseNames(names).forEach((name) => {
      const key = name.toLocaleLowerCase('zh-CN');
      if (!seen.has(key)) {
        uniqueNames.push(name);
        seen.add(key);
      }
    });

    const accepted = uniqueNames.slice(0, expected);
    state.tables.forEach((table) => { table.names = []; });
    let cursor = 0;
    state.tables.forEach((table) => {
      while (table.names.length < table.capacity && cursor < accepted.length) {
        table.names.push(accepted[cursor]);
        cursor += 1;
      }
    });

    saveState();
    renderSeating();
    const duplicateCount = parseNames(names).length - uniqueNames.length;
    const overflowCount = uniqueNames.length - accepted.length;
    if (overflowCount > 0) showToast('已安排 ' + accepted.length + ' 位宾客，超出座位数的姓名已忽略');
    else if (duplicateCount > 0) showToast('已安排 ' + accepted.length + ' 位宾客，并忽略重复姓名');
    else showToast('已按顺序安排 ' + accepted.length + ' 位宾客');
  }

  function openBatchDialog(tableId) {
    state.batchTableId = tableId || null;
    els.batchNames.value = '';
    els.batchCounter.textContent = '已识别 0 个姓名';
    if (state.batchTableId) {
      const table = state.tables.find((item) => item.id === state.batchTableId);
      const remaining = table ? table.capacity - table.names.length : 0;
      els.batchDialogTitle.textContent = '批量填入第 ' + (table ? table.number : '') + ' 桌';
      els.batchDialogDesc.textContent = '每行一个姓名，也可使用逗号、顿号分隔。本桌还可安排 ' + remaining + ' 人。';
    } else {
      els.batchDialogTitle.textContent = '批量导入完整名单';
      els.batchDialogDesc.textContent = '系统将按桌号顺序自动安排，新的名单会覆盖当前所有姓名。每行一个姓名，也可使用逗号、顿号分隔。';
    }
    els.batchDialog.showModal();
    window.setTimeout(() => els.batchNames.focus(), 30);
  }

  function renderOverview() {
    els.overviewGrid.innerHTML = '';
    state.tables.forEach((table) => {
      const card = createElement('article', 'overview-card');
      const head = createElement('div', 'overview-card-head');
      head.appendChild(createElement('strong', null, getTablePresentation(table).title));
      const names = createElement('div', 'overview-names');
      if (table.names.length > 0) names.textContent = table.names.join(' · ');
      else names.appendChild(createElement('em', null, '尚未安排宾客'));
      card.appendChild(head);
      card.appendChild(names);
      els.overviewGrid.appendChild(card);
    });
  }

  els.tableSearch.addEventListener('input', () => {
    state.tableFilter = els.tableSearch.value;
    renderTables();
  });

  els.batchImportBtn.addEventListener('click', () => openBatchDialog(null));
  els.dialogCloseBtn.addEventListener('click', () => els.batchDialog.close());
  els.dialogCancelBtn.addEventListener('click', () => els.batchDialog.close());
  els.batchNames.addEventListener('input', () => {
    const count = parseNames(els.batchNames.value).length;
    els.batchCounter.textContent = '已识别 ' + count + ' 个姓名';
  });
  els.nameFile.addEventListener('change', () => {
    const file = els.nameFile.files && els.nameFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      els.batchNames.value = String(reader.result || '');
      els.batchCounter.textContent = '已识别 ' + parseNames(els.batchNames.value).length + ' 个姓名';
    });
    reader.readAsText(file, 'UTF-8');
    els.nameFile.value = '';
  });
  els.batchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const names = parseNames(els.batchNames.value);
    if (names.length === 0) {
      showToast('请先输入至少一个姓名');
      els.batchNames.focus();
      return;
    }
    if (state.batchTableId) addNamesToTable(state.batchTableId, els.batchNames.value);
    else fillAllTables(els.batchNames.value);
    els.batchDialog.close();
  });

  els.clearNamesBtn.addEventListener('click', async () => {
    if (getAssignedCount() === 0) {
      showToast('当前没有可清空的姓名');
      return;
    }
    const confirmed = await askConfirm('清空全部姓名？', '所有桌位的宾客姓名将被移除，桌数和每桌容量保持不变。');
    if (!confirmed) return;
    state.tables.forEach((table) => { table.names = []; });
    saveState();
    renderSeating();
    showToast('已清空全部姓名');
  });

  els.goToSearchBtn.addEventListener('click', async () => {
    const remaining = getExpectedCount() - getAssignedCount();
    if (remaining > 0) {
      const confirmed = await askConfirm('座位还未全部安排', '当前仍有 ' + remaining + ' 个空位。是否继续选择主题？');
      if (!confirmed) return;
    }
    navigateTo(3);
  });

  els.backToSeatingBtn.addEventListener('click', () => navigateTo(2));
  if (els.themeConfirmBtn) {
    els.themeConfirmBtn.addEventListener('click', () => {
      if (getAssignedCount() === 0) {
        showToast('请先录入至少一位宾客姓名');
        return;
      }
      navigateTo(4);
    });
  }

  function appendHighlighted(parent, name, query) {
    const lowerName = name.toLocaleLowerCase('zh-CN');
    const lowerQuery = query.toLocaleLowerCase('zh-CN');
    const index = lowerQuery ? lowerName.indexOf(lowerQuery) : -1;
    if (index < 0) {
      parent.appendChild(document.createTextNode(name));
      return;
    }
    parent.appendChild(document.createTextNode(name.slice(0, index)));
    parent.appendChild(createElement('mark', null, name.slice(index, index + query.length)));
    parent.appendChild(document.createTextNode(name.slice(index + query.length)));
  }

  function collectGuests() {
    const guests = [];
    state.tables.forEach((table) => {
      table.names.forEach((name, index) => guests.push({ name: name, table: table, index: index }));
    });
    return guests;
  }

  function isPlaceholderName(value) {
    const cleaned = String(value).replace(/\s+/g, '');
    return cleaned === '备' || cleaned === '备用' || cleaned === '空' || cleaned === '空桌';
  }

  function parseHeaderCell(value) {
    const text = value == null ? '' : String(value).trim();
    if (!text) return null;
    if (/主桌|主宾桌|主人桌/.test(text)) {
      const capMatch = text.match(/[（(]\s*(\d+)\s*[）)]/);
      return { kind: 'main', capacity: capMatch ? parseInt(capMatch[1], 10) : null };
    }
    const numMatch = text.match(/(\d+)/);
    if (!numMatch) return null;
    const number = parseInt(numMatch[1], 10);
    const capMatch = text.match(/[（(]\s*(\d+)\s*[）)]/);
    return { kind: 'number', number: number, capacity: capMatch ? parseInt(capMatch[1], 10) : null };
  }

  async function parseSeatingFile(file) {
    const buffer = await file.arrayBuffer();
    if (typeof window.XLSX === 'undefined') {
      throw new Error('导入组件未加载，请刷新页面后重试');
    }
    const workbook = window.XLSX.read(new Uint8Array(buffer), { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new Error('未在文件中找到工作表');
    const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true, blankrows: false });
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('文件内容为空');

    let columnCount = 0;
    rows.forEach((row) => {
      if (Array.isArray(row)) columnCount = Math.max(columnCount, row.length);
    });

    const columns = [];
    for (let col = 0; col < columnCount; col += 1) {
      const info = parseHeaderCell(rows[0] ? rows[0][col] : null);
      if (!info) continue;
      const names = [];
      for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
        const cell = rows[rowIndex] && rows[rowIndex][col];
        if (cell == null) continue;
        const name = String(cell).trim();
        if (!name || isPlaceholderName(name)) continue;
        names.push(name);
      }
      columns.push({ kind: info.kind, number: info.number, capacity: info.capacity, names: names });
    }

    const mainColumns = columns.filter((col) => col.kind === 'main');
    const numberColumns = columns
      .filter((col) => col.kind === 'number')
      .filter((col) => col.names.length > 0)
      .sort((a, b) => a.number - b.number);

    const tables = [];
    let idCounter = 0;
    if (mainColumns.length > 0) {
      const mergedNames = [];
      mainColumns.forEach((col) => mergedNames.push.apply(mergedNames, col.names));
      const explicitCapacity = mainColumns.map((col) => col.capacity).find((value) => value) || null;
      tables.push({
        id: 'table-' + (idCounter += 1),
        number: 1,
        label: '主桌',
        capacity: Math.max(explicitCapacity || 0, mergedNames.length, 1),
        isMain: true,
        isImported: true,
        isRemainder: false,
        names: mergedNames
      });
    }

    numberColumns.forEach((col) => {
      tables.push({
        id: 'table-' + (idCounter += 1),
        number: col.number,
        label: padTableNumber(col.number),
        capacity: Math.max(col.capacity || 0, col.names.length, 1),
        isMain: false,
        isImported: true,
        isRemainder: false,
        names: col.names
      });
    });

    return tables;
  }

  function applyImportedTables(tables) {
    state.totalGuests = tables.reduce((sum, table) => sum + table.names.length, 0);
    state.totalTables = tables.length;
    state.baseCapacity = state.totalTables > 0 ? Math.floor(state.totalGuests / state.totalTables) : 0;
    state.remainder = state.totalTables > 0 ? state.totalGuests % state.totalTables : 0;
    state.tables = tables;
    state.activeView = 3;
    state.isSharedLookup = false;
    document.body.classList.remove('shared-lookup-mode');
    els.guestTotal.value = String(state.totalGuests);
    els.tableTotal.value = String(state.totalTables);
  }

  function renderQuickNames() {
    if (!els.quickNames || !els.quickNamesList) return;
    const unique = [];
    const seen = new Set();
    collectGuests().forEach((guest) => {
      const key = guest.name.toLocaleLowerCase('zh-CN');
      if (!seen.has(key)) {
        unique.push(guest.name);
        seen.add(key);
      }
    });

    els.quickNamesList.innerHTML = '';
    unique.slice(0, 48).forEach((name) => {
      const button = createElement('button', 'quick-name', name);
      button.type = 'button';
      button.addEventListener('click', () => {
        els.guestSearch.value = name;
        performLookup(name);
      });
      els.quickNamesList.appendChild(button);
    });
    els.quickNames.classList.toggle('is-hidden', unique.length === 0);
    if (unique.length > 48) {
      const more = createElement('span', 'quick-name', '+' + (unique.length - 48));
      more.title = '姓名较多，直接输入查询更快';
      els.quickNamesList.appendChild(more);
    }
  }

  function celebrateSeat() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const symbols = ['❧', '✦', '·', '❦', '❁'];
    for (let index = 0; index < 18; index += 1) {
      const particle = createElement('span', null, symbols[index % symbols.length]);
      particle.style.position = 'fixed';
      particle.style.left = '50%';
      particle.style.top = '42%';
      particle.style.zIndex = '90';
      particle.style.pointerEvents = 'none';
      particle.style.color = index % 3 === 0 ? '#c5a46b' : '#cf9692';
      particle.style.fontSize = (10 + Math.random() * 13).toFixed(0) + 'px';
      particle.style.opacity = '0';
      document.body.appendChild(particle);
      const angle = (Math.PI * 2 * index) / 18 + Math.random() * 0.25;
      const distance = 70 + Math.random() * 115;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance - 25;
      const animation = particle.animate([
        { transform: 'translate(-50%, -50%) scale(0.4) rotate(0deg)', opacity: 0 },
        { transform: 'translate(calc(-50% + ' + x * 0.55 + 'px), calc(-50% + ' + y * 0.55 + 'px)) scale(1.1) rotate(80deg)', opacity: 0.95, offset: 0.42 },
        { transform: 'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + (y + 65) + 'px)) scale(0.7) rotate(180deg)', opacity: 0 }
      ], { duration: 950 + Math.random() * 420, easing: 'cubic-bezier(.18,.72,.26,1)' });
      animation.finished.then(() => particle.remove()).catch(() => particle.remove());
    }
  }

  function createResultCard(guest, query) {
    const table = guest.table;
    const card = createElement('article', 'result-found');
    const header = createElement('div', 'result-found-header');
    header.appendChild(createElement('span', null, '✓'));
    const headerCopy = createElement('p');
    headerCopy.appendChild(document.createTextNode('座位已确认 · '));
    const headerName = createElement('strong');
    appendHighlighted(headerName, guest.name, query);
    headerCopy.appendChild(headerName);
    header.appendChild(headerCopy);

    const presentation = getTablePresentation(table);
    const main = createElement('div', 'result-main');
    const seal = createElement('div', 'result-table-seal');
    seal.appendChild(createElement('small', null, 'TABLE'));
    seal.appendChild(createElement('strong', null, presentation.code));
    seal.appendChild(createElement('span', null, table.isMain ? '桌' : '号桌'));

    const copy = createElement('div', 'result-copy');
    const title = createElement('h2');
    title.appendChild(document.createTextNode('请前往'));
    title.appendChild(createElement('mark', null, table.isMain ? '主桌' : presentation.title));
    const description = createElement('p');
    description.appendChild(document.createTextNode('已为 '));
    const nameStrong = createElement('strong');
    appendHighlighted(nameStrong, guest.name, query);
    description.appendChild(nameStrong);
    description.appendChild(document.createTextNode(' 定位座位，愿您尽享佳宴。'));

    const tags = createElement('div', 'result-tags');
    tags.appendChild(createElement('span', null, table.isMain ? '主桌' : (table.isImported ? '宾客桌' : (table.isRemainder ? '余数桌' : '基础桌'))));
    copy.appendChild(title);
    copy.appendChild(description);
    copy.appendChild(tags);
    main.appendChild(seal);
    main.appendChild(copy);
    card.appendChild(header);
    card.appendChild(main);
    return card;
  }

  function performLookup(rawQuery, options) {
    const settings = options || {};
    const query = String(rawQuery || '').trim();
    if (!query) {
      els.lookupResult.classList.add('is-hidden');
      els.lookupPlaceholder.classList.remove('is-hidden');
      showToast('请输入需要查询的姓名');
      els.guestSearch.focus();
      return;
    }

    const normalized = query.toLocaleLowerCase('zh-CN');
    const matches = collectGuests()
      .filter((guest) => guest.name.toLocaleLowerCase('zh-CN').includes(normalized))
      .sort((a, b) => {
        const aExact = a.name.toLocaleLowerCase('zh-CN') === normalized ? 1 : 0;
        const bExact = b.name.toLocaleLowerCase('zh-CN') === normalized ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
        return a.table.number - b.table.number;
      });

    els.lookupResult.innerHTML = '';
    els.lookupPlaceholder.classList.add('is-hidden');
    els.lookupResult.classList.remove('is-hidden');

    if (matches.length === 0) {
      const empty = createElement('div', 'result-empty');
      empty.appendChild(createElement('div', 'empty-symbol', '未'));
      empty.appendChild(createElement('h2', null, '暂未找到「' + query + '」'));
      empty.appendChild(createElement('p', null, '请检查姓名是否输入正确，或返回座位安排页确认该宾客是否已经录入。'));
      els.lookupResult.appendChild(empty);
      return;
    }

    const resultList = createElement('div', 'result-matches');
    matches.slice(0, 12).forEach((guest) => resultList.appendChild(createResultCard(guest, query)));
    if (matches.length > 12) {
      const note = createElement('p', 'result-empty', '匹配结果较多，仅显示前 12 条，请输入更完整的姓名。');
      note.style.padding = '18px';
      resultList.appendChild(note);
    }
    els.lookupResult.appendChild(resultList);

    const exact = matches.some((guest) => guest.name.toLocaleLowerCase('zh-CN') === normalized);
    if (exact && matches.length === 1) celebrateSeat();
    if (settings.scroll !== false) {
      window.requestAnimationFrame(() => els.lookupResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    }
  }

  function renderChartImage() {
    const hasImage = Boolean(state.chartImage);
    if (els.chartPreviewWrap) els.chartPreviewWrap.classList.toggle('is-hidden', !hasImage);
    if (els.chartDropTitle) els.chartDropTitle.textContent = hasImage ? '点击更换座位表图片' : '点击选择座位表图片';
    if (els.chartCard) els.chartCard.classList.toggle('is-hidden', !hasImage);
    if (hasImage) {
      if (els.chartPreviewImg) els.chartPreviewImg.src = state.chartImage;
      if (els.chartImageDisplay) els.chartImageDisplay.src = state.chartImage;
    } else {
      if (els.chartPreviewImg) els.chartPreviewImg.removeAttribute('src');
      if (els.chartImageDisplay) els.chartImageDisplay.removeAttribute('src');
    }
  }

  function shadeColor(hex, percent) {
    const value = String(hex).replace('#', '');
    const num = parseInt(value, 16);
    const amount = Math.round(2.55 * percent);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function mixWithWhite(hex, ratio) {
    const value = String(hex).replace('#', '');
    const r0 = parseInt(value.slice(0, 2), 16);
    const g0 = parseInt(value.slice(2, 4), 16);
    const b0 = parseInt(value.slice(4, 6), 16);
    const r = Math.round(r0 + (255 - r0) * ratio);
    const g = Math.round(g0 + (255 - g0) * ratio);
    const b = Math.round(b0 + (255 - b0) * ratio);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function applyTheme(themeId) {
    const theme = THEMES.find((item) => item.id === Number(themeId)) || THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-primary-dark', shadeColor(theme.primary, -26));
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-base', theme.base);
    root.style.setProperty('--theme-bg', mixWithWhite(theme.base, 0.68));
    root.style.setProperty('--theme-soft', mixWithWhite(theme.primary, 0.85));
    return theme;
  }

  function renderTheme() {
    if (!els.themeGrid) return;
    els.themeGrid.innerHTML = '';
    THEMES.forEach((theme) => {
      const card = createElement('button', 'theme-card' + (state.theme === theme.id ? ' is-selected' : ''));
      card.type = 'button';
      const swatches = createElement('span', 'theme-swatches');
      [theme.primary, theme.secondary, theme.accent, theme.base].forEach((color) => {
        const dot = createElement('i');
        dot.style.background = color;
        swatches.appendChild(dot);
      });
      card.appendChild(swatches);
      card.appendChild(createElement('strong', null, theme.name));
      card.addEventListener('click', () => {
        state.theme = theme.id;
        applyTheme(theme.id);
        renderTheme();
        saveState();
        if (els.themeNextTitle) els.themeNextTitle.textContent = '已选择：' + theme.name;
      });
      els.themeGrid.appendChild(card);
    });
  }

  function renderLookup() {
    renderChartImage();
    renderOverview();
    prepareQrShare();
    els.lookupPlaceholder.classList.toggle('is-hidden', !els.lookupResult.classList.contains('is-hidden'));
  }

  els.lookupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    window.clearTimeout(lookupTimer);
    performLookup(els.guestSearch.value);
  });
  els.guestSearch.addEventListener('input', () => {
    window.clearTimeout(lookupTimer);
    const query = els.guestSearch.value.trim();
    if (!query) {
      els.lookupResult.classList.add('is-hidden');
      els.lookupPlaceholder.classList.remove('is-hidden');
      return;
    }
    lookupTimer = window.setTimeout(() => performLookup(query, { scroll: false }), 220);
  });
  els.qrRefreshBtn.addEventListener('click', () => {
    const target = els.qrTargetUrl.value.trim();
    if (!target) {
      setQrStatus('请输入需要写入二维码的网站链接。', 'warning');
      return;
    }
    if (renderQrCanvas(target)) {
      setQrStatus(target === buildShareUrl() ? '二维码已更新，并包含当前座位数据。' : '二维码已更新。', 'success');
    } else {
      setQrStatus('链接内容过长或格式不正确，无法生成二维码。', 'error');
    }
  });
  els.qrTargetUrl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') els.qrRefreshBtn.click();
  });
  els.copyQrBtn.addEventListener('click', copyQrImage);
  els.downloadQrBtn.addEventListener('click', downloadQrImage);
  els.copyQrLinkBtn.addEventListener('click', async () => {
    const link = els.qrTargetUrl.value.trim() || buildShareUrl();
    const copied = await copyText(link);
    if (copied) {
      setQrStatus('查询链接已复制。', 'success');
    } else {
      setQrStatus('复制失败，请手动选择链接复制。', 'warning');
      els.qrTargetUrl.focus();
      els.qrTargetUrl.select();
    }
  });
  window.addEventListener('beforeunload', saveState);

  initializePetals();
  applyTheme(state.theme || 1);
  const shared = loadSharedState();
  const restored = shared || loadSavedState();
  const isLookupEntry = /\/lookup\.html$/i.test(window.location.pathname);
  if (isLookupEntry) {
    state.isSharedLookup = true;
    document.body.classList.add('shared-lookup-mode');
    renderSeating();
    updateProgressNavigation();
    navigateTo(4, { scroll: false, force: true });
  } else if (restored) {
    renderSeating();
    updateProgressNavigation();
    if (state.activeView === 1) {
      navigateTo(1, { scroll: false });
      els.resumeBtn.classList.remove('is-hidden');
    } else {
      const target = state.activeView === 4 && getAssignedCount() === 0 ? 2 : state.activeView;
      navigateTo(target, { scroll: false });
    }
  } else {
    resetPreview();
    updateProgressNavigation();
  }
})();

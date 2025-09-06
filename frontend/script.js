const API_BASE = location.origin.replace(/\/$/, '');
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const ui = {
  doc: $('#doc'),
  mode: $('#mode'),
  length: $('#length'),
  sentences: $('#sentences'),
  run: $('#run'),
  preview: $('#preview'),
  tabs: $$('.tab'),
  panes: {
    summary: $('#tab-summary'), visuals: $('#tab-visuals'), compare: $('#tab-compare'), history: $('#tab-history'), about: $('#tab-about')
  },
  summary: $('#summary'),
  extractive: $('#extractive'),
  abstractive: $('#abstractive'),
  history: $('#history'),
  kpiOriginal: $('#kpi-original'),
  kpiSummary: $('#kpi-summary'),
  kpiCompression: $('#kpi-compression'),
  kpiReadtime: $('#kpi-readtime'),
  kpiSentences: $('#kpi-sentences'),
  segmented: $$('.segmented button'),
  upload: $('.upload'),
  file: $('#file'),
  download: $('#download')
};

const state = {
  inputMode: 'paste',
  results: null,
  charts: {}
};

// Tabs
ui.tabs.forEach(btn => btn.addEventListener('click', () => {
  ui.tabs.forEach(b => b.classList.toggle('active', b === btn));
  const tab = btn.dataset.tab;
  Object.entries(ui.panes).forEach(([k, el]) => el.classList.toggle('active', k === tab));
}));

// Segmented input mode
ui.segmented.forEach(b => b.addEventListener('click', () => {
  ui.segmented.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  state.inputMode = b.dataset.input;
  ui.upload.classList.toggle('hidden', state.inputMode !== 'upload');
  if (state.inputMode === 'sample') loadSample();
}));

// Preview sync
ui.doc.addEventListener('input', () => {
  ui.preview.textContent = ui.doc.value.slice(0, 4000);
  updateKPIs();
});

// File upload -> read client-side for preview; backend will handle supported types if you wire converters
ui.file.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.type.startsWith('text') || file.name.endsWith('.txt')) {
    const text = await file.text();
    ui.doc.value = text;
    ui.preview.textContent = text.slice(0, 4000);
    updateKPIs();
  } else if (/(\.pdf|\.docx)$/i.test(file.name)) {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(API_BASE + '/api/convert', { method: 'POST', body: fd });
      const json = await res.json();
      if (!json.ok) throw new Error(json.detail || 'Convert failed');
      const text = json.text || '';
      ui.doc.value = text;
      ui.preview.textContent = text.slice(0, 4000);
      updateKPIs();
    } catch (err) {
      console.error(err);
      alert('Failed to convert file. Please try another document.');
    }
  } else {
    alert('Unsupported file. Please upload .txt, .pdf, or .docx');
  }
});

function wordCount(s){ return s ? s.trim().split(/\s+/).filter(Boolean).length : 0; }
function sentenceCount(s){ return s ? s.split(/[.!?]+/).filter(x => x.trim()).length : 0; }
function readingTime(wordCount){ return Math.ceil(wordCount / 200); } // 200 words per minute

function updateKPIs(){
  const origText = ui.doc.value;
  const orig = wordCount(origText);
  const origSentences = sentenceCount(origText);
  const sum = wordCount((state.results?.abstractive || state.results?.extractive || ''));
  const comp = orig && sum ? Math.max(0, Math.round((1 - (sum/orig)) * 100)) : 0;
  const readTime = readingTime(orig);
  
  ui.kpiOriginal.textContent = orig.toLocaleString();
  ui.kpiSummary.textContent = sum.toLocaleString();
  ui.kpiCompression.textContent = comp + '%';
  ui.kpiReadtime.textContent = readTime + 'min';
  ui.kpiSentences.textContent = origSentences.toLocaleString();
}

ui.run.addEventListener('click', async () => {
  const text = ui.doc.value;
  if (!text || !text.trim()) return alert('Please paste or upload a document first.');
  ui.run.disabled = true; 
  ui.run.innerHTML = '<span class="pulsing">Summarizing…</span>';
  
  // Add progress bar
  const progressHtml = '<div class="progress-container"><div class="progress-bar"><div class="progress-fill"></div></div><div class="loading-text">Analyzing document...</div></div>';
  ui.run.insertAdjacentHTML('afterend', progressHtml);
  const progressFill = document.querySelector('.progress-fill');
  const loadingText = document.querySelector('.loading-text');
  
  // Simulate progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 90) progress = 90;
    progressFill.style.width = progress + '%';
  }, 200);
  
  try {
    const payload = {
      text,
      mode: ui.mode.value,
      length: ui.length.value,
      num_sentences: Number(ui.sentences.value || 3)
    };
    
    loadingText.textContent = 'Processing with ' + (ui.mode.value === 'abstractive' ? 'BART model...' : 'TF-IDF analysis...');
    
    const res = await fetch(API_BASE + '/api/summarize', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.ok) throw new Error('Request failed');
    
    // Complete progress
    clearInterval(progressInterval);
    progressFill.style.width = '100%';
    loadingText.textContent = 'Generating visualizations...';
    
    const data = json.data || {};
    state.results = data;
    // Summary tab
    const summaryText = data.abstractive || data.extractive || '';
    ui.summary.textContent = summaryText;
    // Compare tab
    ui.extractive.textContent = data.extractive || '';
    ui.abstractive.textContent = data.abstractive || '';
    // History append + persist
    const row = {
      timestamp: new Date().toLocaleString(),
      mode: ui.mode.value,
      length: ui.length.value,
      orig: wordCount(text),
      summary: wordCount(summaryText)
    };
    appendHistory(row);
    persistHistory(row);
    updateKPIs();
    refreshWordcloud(summaryText || text);
    updateCharts(text, summaryText);
    
    // Remove progress bar after a short delay
    setTimeout(() => {
      document.querySelector('.progress-container')?.remove();
    }, 1000);
    
  } catch (e) {
    clearInterval(progressInterval);
    document.querySelector('.progress-container')?.remove();
    console.error(e);
    alert('Error while summarizing. Check console/logs.');
  } finally {
    ui.run.disabled = false; 
    ui.run.textContent = 'Summarize';
  }
});

function appendHistory(row){
  const table = ui.history;
  if (!table.tHead){
    const thead = table.createTHead();
    const tr = thead.insertRow();
    ['Time','Mode','Length','Original','Summary'].forEach(h => tr.appendChild(Object.assign(document.createElement('th'), {textContent: h})));
    table.createTBody();
  }
  const tr = ui.history.tBodies[0].insertRow(0);
  const comp = row.orig && row.summary ? Math.max(0, Math.round((1 - (row.summary/row.orig)) * 100)) + '%' : '0%';
  [row.timestamp, row.mode, row.length, row.orig, row.summary, comp].slice(0,5).forEach(v => tr.appendChild(Object.assign(document.createElement('td'), {textContent: v})));
}

// Download summary
ui.download.addEventListener('click', () => {
  const text = ui.summary.textContent || '';
  const blob = new Blob([text], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {href: url, download: 'summary.txt'});
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

// History persistence
const HISTORY_KEY = 'legal_summarizer_history';
function persistHistory(row){
  const all = loadHistory();
  all.unshift(row);
  const capped = all.slice(0, 100);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(capped));
}
function loadHistory(){
  try{ return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }catch{ return []; }
}
function renderHistory(){
  const rows = loadHistory();
  ui.history.innerHTML = '';
  rows.forEach(r => appendHistory(r));
}
$('#clear-history').addEventListener('click', () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
});

// Sample loader
async function loadSample(){
  try{
    const res = await fetch(API_BASE + '/static/sample_document.txt');
    const text = await res.text();
    ui.doc.value = text;
    ui.preview.textContent = text.slice(0,4000);
    updateKPIs();
  }catch(e){ console.error(e); alert('Failed to load sample'); }
}

// Year
$('#year').textContent = new Date().getFullYear();

// Real wordcloud via API -> PNG
async function refreshWordcloud(text){
  if (!text) return;
  try{
    const res = await fetch(API_BASE + '/api/wordcloud', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('wordcloud failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const img = $('#wordcloudImg');
    img.src = url;
    img.onload = () => setTimeout(() => URL.revokeObjectURL(url), 2000);
  }catch(e){ console.error(e); }
}

// Chart Management
function initCharts() {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    layout: {
      padding: {
        top: 2,
        bottom: 2,
        left: 2,
        right: 2
      }
    },
    plugins: {
      legend: { 
        display: true, 
        labels: { 
          color: '#e5ecff',
          boxWidth: 8,
          padding: 4,
          font: { size: 9 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e5ecff',
        bodyColor: '#8b97b2',
        borderColor: 'rgba(124, 92, 255, 0.5)',
        borderWidth: 1
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        ticks: { 
          color: '#8b97b2',
          font: { size: 8 },
          maxTicksLimit: 4
        }, 
        grid: { color: 'rgba(255,255,255,0.05)' } 
      },
      x: { 
        ticks: { 
          color: '#8b97b2',
          font: { size: 8 },
          maxRotation: 0
        }, 
        grid: { color: 'rgba(255,255,255,0.05)' } 
      }
    }
  };

  // Text Analysis Chart
  const analysisCtx = $('#analysisChart');
  if (analysisCtx) {
    analysisCtx.style.maxHeight = '180px';
    analysisCtx.style.maxWidth = '100%';
    analysisCtx.width = 300;
    analysisCtx.height = 150;
    state.charts.analysis = new Chart(analysisCtx, {
      type: 'bar',
      data: {
        labels: ['Words', 'Sentences', 'Paras'],
        datasets: [{
          label: 'Count',
          data: [0, 0, 0],
          backgroundColor: 'rgba(124, 92, 255, 0.6)',
          borderColor: 'rgba(124, 92, 255, 1)',
          borderWidth: 1,
          borderRadius: 2
        }]
      },
      options: chartOptions
    });
  }

  // Compression Chart
  const compressionCtx = $('#compressionChart');
  if (compressionCtx) {
    compressionCtx.style.maxHeight = '180px';
    compressionCtx.style.maxWidth = '100%';
    compressionCtx.width = 300;
    compressionCtx.height = 150;
    state.charts.compression = new Chart(compressionCtx, {
      type: 'doughnut',
      data: {
        labels: ['Summary', 'Removed'],
        datasets: [{
          data: [0, 100],
          backgroundColor: ['rgba(0, 225, 255, 0.8)', 'rgba(139, 151, 178, 0.3)'],
          borderColor: ['rgba(0, 225, 255, 1)', 'rgba(139, 151, 178, 0.5)'],
          borderWidth: 1
        }]
      },
      options: {
        ...chartOptions,
        cutout: '65%',
        plugins: {
          ...chartOptions.plugins,
          legend: { 
            display: true, 
            position: 'bottom', 
            labels: { 
              color: '#e5ecff',
              boxWidth: 8,
              padding: 3,
              font: { size: 8 }
            }
          }
        }
      }
    });
  }

  // Comparison Chart
  const comparisonCtx = $('#comparisonChart');
  if (comparisonCtx) {
    comparisonCtx.style.maxHeight = '200px';
    comparisonCtx.style.maxWidth = '100%';
    comparisonCtx.width = 600;
    comparisonCtx.height = 180;
    state.charts.comparison = new Chart(comparisonCtx, {
      type: 'bar',
      data: {
        labels: ['Words', 'Sentences', 'Minutes'],
        datasets: [
          {
            label: 'Original',
            data: [0, 0, 0],
            backgroundColor: 'rgba(124, 92, 255, 0.6)',
            borderColor: 'rgba(124, 92, 255, 1)',
            borderWidth: 1,
            borderRadius: 2
          },
          {
            label: 'Summary',
            data: [0, 0, 0],
            backgroundColor: 'rgba(0, 225, 255, 0.6)',
            borderColor: 'rgba(0, 225, 255, 1)',
            borderWidth: 1,
            borderRadius: 2
          }
        ]
      },
      options: chartOptions
    });
  }
}

function updateCharts(originalText, summaryText) {
  if (!originalText) return;
  
  const origWords = wordCount(originalText);
  const origSentences = sentenceCount(originalText);
  const origParagraphs = originalText.split(/\n\s*\n/).filter(p => p.trim()).length;
  const origReadTime = readingTime(origWords);
  
  const sumWords = wordCount(summaryText || '');
  const sumSentences = sentenceCount(summaryText || '');
  const sumReadTime = readingTime(sumWords);
  
  const compressionRate = origWords > 0 ? Math.round((sumWords / origWords) * 100) : 0;

  // Update Analysis Chart
  if (state.charts.analysis) {
    state.charts.analysis.data.datasets[0].data = [origWords, origSentences, origParagraphs];
    state.charts.analysis.update();
  }

  // Update Compression Chart
  if (state.charts.compression) {
    state.charts.compression.data.datasets[0].data = [compressionRate, 100 - compressionRate];
    state.charts.compression.update();
  }

  // Update Comparison Chart
  if (state.charts.comparison) {
    state.charts.comparison.data.datasets[0].data = [origWords, origSentences, origReadTime];
    state.charts.comparison.data.datasets[1].data = [sumWords, sumSentences, sumReadTime];
    state.charts.comparison.update();
  }
}

// Initial render
renderHistory();

// Initialize charts when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait for Chart.js to be available
  if (typeof Chart !== 'undefined') {
    setTimeout(initCharts, 100);
  } else {
    // Fallback if Chart.js is not loaded yet
    const checkChart = setInterval(() => {
      if (typeof Chart !== 'undefined') {
        clearInterval(checkChart);
        initCharts();
      }
    }, 100);
  }
});

// Handle window resize for charts
window.addEventListener('resize', () => {
  Object.values(state.charts).forEach(chart => {
    if (chart) {
      chart.resize();
    }
  });
});

// Add function to ensure charts are properly sized when switching tabs
ui.tabs.forEach(btn => {
  const originalHandler = btn.onclick;
  btn.addEventListener('click', () => {
    setTimeout(() => {
      if (btn.dataset.tab === 'visuals') {
        Object.values(state.charts).forEach(chart => {
          if (chart) {
            chart.resize();
          }
        });
      }
    }, 100);
  });
});

// Force chart resize when visuals tab becomes active
const visualsTab = document.querySelector('[data-tab="visuals"]');
if (visualsTab) {
  visualsTab.addEventListener('click', () => {
    setTimeout(() => {
      Object.values(state.charts).forEach(chart => {
        if (chart && chart.canvas) {
          // Force strict size constraints
          const isFullWidth = chart.canvas.closest('.visual-card.full-width');
          const maxHeight = isFullWidth ? '200px' : '180px';
          
          chart.canvas.style.maxHeight = maxHeight;
          chart.canvas.style.maxWidth = '100%';
          chart.canvas.style.height = maxHeight;
          chart.canvas.style.width = '100%';
          
          // Force parent container sizing
          const container = chart.canvas.closest('.chart-container');
          if (container) {
            container.style.maxHeight = maxHeight;
            container.style.height = maxHeight;
          }
          
          chart.resize();
        }
      });
    }, 150);
  });
}

// Add periodic enforcement of chart sizes
setInterval(() => {
  if (document.querySelector('.tabpane[id="tab-visuals"].active')) {
    Object.values(state.charts).forEach(chart => {
      if (chart && chart.canvas) {
        const isFullWidth = chart.canvas.closest('.visual-card.full-width');
        const maxHeight = isFullWidth ? '200px' : '180px';
        
        if (chart.canvas.style.height !== maxHeight) {
          chart.canvas.style.maxHeight = maxHeight;
          chart.canvas.style.height = maxHeight;
          chart.resize();
        }
      }
    });
  }
}, 1000);

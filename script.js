// 全局变量
let videoStream = null;
let receiptList = [];
let isRealtimeMode = true;
let isScanning = false;
let scanInterval = null;
let lastDetectedData = null;

// DOM 元素
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const confirmBtn = document.getElementById('confirm-btn');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const resultSection = document.getElementById('result-section');
const previewImage = document.getElementById('preview-image');
const ocrText = document.getElementById('ocr-text');
const merchantInput = document.getElementById('merchant');
const dateInput = document.getElementById('date');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const saveBtn = document.getElementById('save-btn');
const exportBtn = document.getElementById('export-btn');
const receiptBody = document.getElementById('receipt-body');
const listCount = document.getElementById('list-count');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');
const realtimeModeBtn = document.getElementById('realtime-mode');
const manualModeBtn = document.getElementById('manual-mode');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const realtimeResult = document.getElementById('realtime-result');
const realtimeMerchant = document.getElementById('realtime-merchant');
const realtimeDate = document.getElementById('realtime-date');
const realtimeAmount = document.getElementById('realtime-amount');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadReceiptList();
    initCamera();
});

// 初始化摄像头
async function initCamera() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        video.srcObject = videoStream;
        
        // 视频加载完成后开始实时扫描
        video.onloadedmetadata = () => {
            if (isRealtimeMode) {
                startRealtimeScan();
            }
        };
    } catch (error) {
        console.log('摄像头不可用:', error);
        statusText.textContent = '摄像头不可用';
        statusDot.className = 'status-dot';
    }
}

// 切换到实时模式
function switchToRealtimeMode() {
    isRealtimeMode = true;
    realtimeModeBtn.classList.add('active');
    manualModeBtn.classList.remove('active');
    confirmBtn.style.display = 'none';
    captureBtn.style.display = 'none';
    startRealtimeScan();
}

// 切换到手动模式
function switchToManualMode() {
    isRealtimeMode = false;
    manualModeBtn.classList.add('active');
    realtimeModeBtn.classList.remove('active');
    stopRealtimeScan();
    realtimeResult.style.display = 'none';
    confirmBtn.style.display = 'none';
    captureBtn.style.display = 'flex';
}

// 开始实时扫描
function startRealtimeScan() {
    if (isScanning) return;
    
    isScanning = true;
    statusDot.className = 'status-dot scanning';
    statusText.textContent = '扫描中...';
    
    // 设置扫描间隔（每2秒扫描一次）
    scanInterval = setInterval(() => {
        if (isRealtimeMode && video.readyState === 4) {
            performRealtimeScan();
        }
    }, 2000);
}

// 停止实时扫描
function stopRealtimeScan() {
    isScanning = false;
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    statusDot.className = 'status-dot';
    statusText.textContent = '已停止';
}

// 执行实时扫描
async function performRealtimeScan() {
    try {
        // 截取视频帧
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        // 使用 Tesseract 进行快速OCR识别
        const result = await Tesseract.recognize(
            canvas,
            'chi_sim+eng',
            {
                tessedit_pageseg_mode: 'Auto',
                logger: () => {}
            }
        );
        
        const text = result.data.text;
        
        // 解析数据
        const parsedData = parseReceiptData(text);
        
        // 如果识别到有效数据
        if (parsedData.amount || parsedData.merchant) {
            // 更新实时结果显示
            updateRealtimeResult(parsedData);
            
            // 保存检测到的数据供确认保存使用
            lastDetectedData = parsedData;
            
            // 更新状态
            statusDot.className = 'status-dot detected';
            statusText.textContent = '已识别';
        } else {
            // 未识别到有效数据
            statusDot.className = 'status-dot scanning';
            statusText.textContent = '扫描中...';
        }
        
    } catch (error) {
        console.log('实时扫描错误:', error);
    }
}

// 更新实时结果显示
function updateRealtimeResult(data) {
    realtimeMerchant.textContent = data.merchant || '未知商家';
    realtimeDate.textContent = data.date || '-';
    realtimeAmount.textContent = data.amount ? `¥${data.amount}` : '-';
    
    realtimeResult.style.display = 'block';
    confirmBtn.style.display = 'block';
}

// 确认保存实时识别结果
function confirmRealtimeSave() {
    if (lastDetectedData) {
        // 填充表单
        merchantInput.value = lastDetectedData.merchant || '';
        dateInput.value = lastDetectedData.date || new Date().toISOString().split('T')[0];
        amountInput.value = lastDetectedData.amount || '';
        
        // 截取当前帧作为预览
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        previewImage.src = canvas.toDataURL('image/jpeg', 0.8);
        
        // 显示结果区域
        realtimeResult.style.display = 'none';
        confirmBtn.style.display = 'none';
        resultSection.style.display = 'block';
        
        // 停止实时扫描
        stopRealtimeScan();
        statusDot.className = 'status-dot';
        statusText.textContent = '已暂停';
    }
}

// 拍照
function capturePhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    processImage(imageDataUrl);
}

// 上传图片
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            processImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// 处理图片并识别
async function processImage(imageDataUrl) {
    showLoading('正在识别中...');
    
    try {
        previewImage.src = imageDataUrl;
        ocrText.textContent = '识别中...';
        
        const result = await Tesseract.recognize(
            imageDataUrl,
            'chi_sim+eng',
            {
                logger: (m) => console.log(m)
            }
        );
        
        const text = result.data.text;
        ocrText.textContent = text;
        
        const parsedData = parseReceiptData(text);
        
        merchantInput.value = parsedData.merchant;
        dateInput.value = parsedData.date || new Date().toISOString().split('T')[0];
        amountInput.value = parsedData.amount;
        
        resultSection.style.display = 'block';
        
    } catch (error) {
        console.error('识别失败:', error);
        ocrText.textContent = '识别失败，请重试或手动输入数据';
        resultSection.style.display = 'block';
    } finally {
        hideLoading();
    }
}

// 解析收据数据
function parseReceiptData(text) {
    // 解析日期
    const datePatterns = [
        /(\d{4})[\-/年](\d{1,2})[\-/月](\d{1,2})[日号]?/,
        /(\d{1,2})[\-/月](\d{1,2})[日号]?[\-/年]?(\d{4})?/,
        /(\d{4})(\d{2})(\d{2})/,
        /(\d{2})\/(\d{2})\/(\d{4})/
    ];
    
    let date = '';
    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            if (match[3] && match[3].length === 4) {
                date = `${match[3]}-${String(match[1]).padStart(2, '0')}-${String(match[2]).padStart(2, '0')}`;
            } else if (match[1].length === 4) {
                date = `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
            } else {
                date = `${new Date().getFullYear()}-${String(match[1]).padStart(2, '0')}-${String(match[2]).padStart(2, '0')}`;
            }
            break;
        }
    }
    
    // 解析金额
    const amountPatterns = [
        /(?:金额|合计|总计|实收|付款|¥|￥)\s*([\d,]+(?:\.\d{1,2})?)/i,
        /([\d,]+(?:\.\d{1,2})?)\s*(?:元|圆|¥|￥)/i,
        /(\d+\.\d{2})/
    ];
    
    let amount = '';
    for (const pattern of amountPatterns) {
        const match = text.match(pattern);
        if (match) {
            amount = match[1].replace(/,/g, '');
            break;
        }
    }
    
    // 解析商家名称
    const lines = text.split('\n').filter(line => line.trim());
    let merchant = '';
    if (lines.length > 0) {
        for (const line of lines.slice(0, 5)) {
            const trimmed = line.trim();
            if (trimmed.length > 2 && trimmed.length < 30 && 
                !trimmed.includes('电话') && !trimmed.includes('地址') &&
                !trimmed.includes('日期') && !trimmed.includes('金额')) {
                merchant = trimmed;
                break;
            }
        }
    }
    
    return { date, amount, merchant };
}

// 保存收据
function saveReceipt() {
    const receipt = {
        id: Date.now(),
        date: dateInput.value,
        merchant: merchantInput.value || '未知商家',
        amount: amountInput.value || '0',
        category: categorySelect.value,
        image: previewImage.src
    };
    
    receiptList.push(receipt);
    saveReceiptList();
    renderReceiptList();
    
    resultSection.style.display = 'none';
    merchantInput.value = '';
    dateInput.value = '';
    amountInput.value = '';
    categorySelect.value = '餐饮';
    
    // 如果是实时模式，重新开始扫描
    if (isRealtimeMode) {
        startRealtimeScan();
    }
    
    alert('保存成功！');
}

// 渲染收据列表
function renderReceiptList() {
    if (receiptList.length === 0) {
        receiptBody.innerHTML = '<tr><td colspan="5" class="empty">暂无数据</td></tr>';
        exportBtn.disabled = true;
    } else {
        receiptBody.innerHTML = receiptList.map(receipt => `
            <tr>
                <td>${receipt.date}</td>
                <td>${receipt.merchant}</td>
                <td>¥${receipt.amount}</td>
                <td>${receipt.category}</td>
                <td><button class="delete-btn" onclick="deleteReceipt(${receipt.id})">删除</button></td>
            </tr>
        `).join('');
        exportBtn.disabled = false;
    }
    listCount.textContent = receiptList.length;
}

// 删除收据
function deleteReceipt(id) {
    if (confirm('确定要删除这条记录吗？')) {
        receiptList = receiptList.filter(r => r.id !== id);
        saveReceiptList();
        renderReceiptList();
    }
}

// 导出 Excel
function exportToExcel() {
    if (receiptList.length === 0) return;
    
    const headers = ['日期', '商家名称', '金额', '类别'];
    const data = receiptList.map(r => [r.date, r.merchant, r.amount, r.category]);
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '收据记录');
    
    const filename = `收据记录_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
}

// 保存到本地存储
function saveReceiptList() {
    const dataToSave = receiptList.map(r => ({
        id: r.id,
        date: r.date,
        merchant: r.merchant,
        amount: r.amount,
        category: r.category
    }));
    localStorage.setItem('receiptList', JSON.stringify(dataToSave));
}

// 从本地存储加载
function loadReceiptList() {
    const saved = localStorage.getItem('receiptList');
    if (saved) {
        receiptList = JSON.parse(saved);
        renderReceiptList();
    }
}

// 显示加载提示
function showLoading(text) {
    loadingText.textContent = text;
    loadingOverlay.style.display = 'flex';
}

// 隐藏加载提示
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// 事件监听
realtimeModeBtn.addEventListener('click', switchToRealtimeMode);
manualModeBtn.addEventListener('click', switchToManualMode);
captureBtn.addEventListener('click', capturePhoto);
confirmBtn.addEventListener('click', confirmRealtimeSave);
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileUpload);
saveBtn.addEventListener('click', saveReceipt);
exportBtn.addEventListener('click', exportToExcel);

// 清理
window.addEventListener('beforeunload', () => {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
    stopRealtimeScan();
});
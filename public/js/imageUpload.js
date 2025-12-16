// ==================== 圖片上傳功能 - 徹底重構版本 ====================
let selectedFiles = [];

// 更新文件上傳顯示
function updateFileUploadDisplay() {
    const fileUpload = document.getElementById('imageUpload');
    if (!fileUpload) return;
    
    const uploadText = fileUpload.parentElement.querySelector('.upload-text');
    if (uploadText) {
        if (selectedFiles.length === 0) {
            uploadText.textContent = '點擊或拖拽上傳圖片';
        } else if (selectedFiles.length === 1) {
            uploadText.textContent = `已選擇: ${selectedFiles[0].name}`;
        } else {
            uploadText.textContent = `已選擇: ${selectedFiles.length} 張圖片`;
        }
    }
}

// 更新圖片預覽
function updateImagePreview() {
    const previewContainer = document.getElementById('imagePreviewContainer');
    if (!previewContainer) return;
    
    if (selectedFiles.length === 0) {
        previewContainer.style.display = 'none';
        return;
    }
    
    previewContainer.style.display = 'grid';
    previewContainer.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'image-preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                    <button class="remove-btn" onclick="removeImage(${index})" type="button">×</button>
                `;
                previewContainer.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        }
    });
}

// 移除圖片
function removeImage(index) {
    selectedFiles.splice(index, 1);
    
    // Update the file input
    const fileUpload = document.getElementById('imageUpload');
    if (fileUpload) {
        const dt = new DataTransfer();
        selectedFiles.forEach(file => dt.items.add(file));
        fileUpload.files = dt.files;
    }
    
    updateFileUploadDisplay();
    updateImagePreview();
}

// 初始化圖片上傳功能
function initImageUpload() {
    console.log('[initImageUpload] Starting initialization...');
    
    const uploadArea = document.getElementById('uploadArea');
    const imageUpload = document.getElementById('imageUpload');
    
    if (!uploadArea || !imageUpload) {
        console.warn('[initImageUpload] Upload elements not found');
        return false;
    }
    
    // 移除舊的事件監聽器
    const newUploadArea = uploadArea.cloneNode(true);
    uploadArea.parentNode.replaceChild(newUploadArea, uploadArea);
    
    const newImageUpload = document.getElementById('imageUpload');
    if (!newImageUpload) {
        console.error('[initImageUpload] Image upload input not found after clone');
        return false;
    }
    
    // 綁定文件選擇事件
    newImageUpload.addEventListener('change', function(e) {
        console.log('[Image Upload] Files selected:', e.target.files.length);
        
        const files = Array.from(e.target.files);
        
        // 限制最多5個文件
        if (files.length > 5) {
            alert('最多只能選擇5張圖片');
            files.splice(5);
            
            // 重置 input
            const dt = new DataTransfer();
            files.forEach(file => dt.items.add(file));
            e.target.files = dt.files;
        }
        
        selectedFiles = files;
        updateFileUploadDisplay();
        updateImagePreview();
        
        console.log('[Image Upload] Files processed:', selectedFiles.length);
    }, false);
    
    // 綁定上傳區域點擊事件 - 確保能打開文件選擇對話框
    newUploadArea.addEventListener('click', function(e) {
        // 不要阻止默認行為，讓點擊能正常工作
        console.log('[Image Upload] Upload area clicked');
        // 直接觸發文件輸入的點擊
        setTimeout(function() {
            newImageUpload.click();
        }, 10);
    }, false);
    
    // 也為上傳區域內的所有子元素添加點擊事件
    const uploadAreaChildren = newUploadArea.querySelectorAll('*');
    uploadAreaChildren.forEach(function(child) {
        child.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止冒泡，但不阻止默認行為
            console.log('[Image Upload] Child element clicked');
            setTimeout(function() {
                newImageUpload.click();
            }, 10);
        }, false);
    });
    
    // 設置拖拽上傳
    setupDragAndDropForUpload(newUploadArea, newImageUpload);
    
    console.log('[initImageUpload] Initialization complete');
    return true;
}

// 設置拖拽上傳功能
function setupDragAndDropForUpload(uploadArea, fileInput) {
    if (!uploadArea || !fileInput) return;
    
    // 阻止默認拖拽行為（只在拖拽區域內）
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    
    // 高亮拖拽區域
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, function() {
            uploadArea.classList.add('dragover');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, function() {
            uploadArea.classList.remove('dragover');
        }, false);
    });
    
    // 處理拖放文件
    uploadArea.addEventListener('drop', function(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            console.log('[Image Upload] Files dropped:', files.length);
            
            // 限制最多5個文件
            const fileArray = Array.from(files).slice(0, 5);
            selectedFiles = fileArray;
            
            // 更新文件 input
            const dt2 = new DataTransfer();
            fileArray.forEach(file => dt2.items.add(file));
            fileInput.files = dt2.files;
            
            updateFileUploadDisplay();
            updateImagePreview();
        }
    }, false);
}

// 多重初始化機制
function tryInitImageUpload() {
    if (initImageUpload()) {
        console.log('[tryInitImageUpload] Success');
    } else {
        console.log('[tryInitImageUpload] Failed, will retry');
        setTimeout(tryInitImageUpload, 100);
    }
}

// 立即嘗試初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(tryInitImageUpload, 10);
    });
} else {
    setTimeout(tryInitImageUpload, 10);
}

// 也嘗試在 window.load 時初始化
window.addEventListener('load', function() {
    setTimeout(tryInitImageUpload, 50);
});


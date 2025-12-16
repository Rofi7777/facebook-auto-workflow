// ==================== 導航功能 - 徹底重構版本 ====================
// 分頁切換函數
function switchPage(pageId) {
    console.log('[switchPage] Switching to page:', pageId);
    
    try {
        // 隱藏所有頁面
        const allPages = document.querySelectorAll('.page-content');
        allPages.forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });
        
        // 移除所有按鈕的 active 狀態
        const allButtons = document.querySelectorAll('.tab-btn');
        allButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 顯示選中的頁面
        const targetPage = document.getElementById(pageId);
        if (!targetPage) {
            console.error('[switchPage] Page not found:', pageId);
            return false;
        }
        
        targetPage.classList.add('active');
        targetPage.style.display = 'block';
        targetPage.style.visibility = 'visible';
        targetPage.style.opacity = '1';
        console.log('[switchPage] Page activated:', pageId);
        
        // 強制觸發重排，確保內容顯示
        targetPage.offsetHeight;
        
        // 設置對應按鈕為 active
        const targetBtn = document.querySelector(`.tab-btn[data-page="${pageId}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
            console.log('[switchPage] Button activated:', pageId);
        }
        
        // 如果切換到管理員頁面，初始化管理控制台
        if (pageId === 'page5' && typeof AdminConsole !== 'undefined') {
            AdminConsole.init();
        }
        
        // 滾動到頂部
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        return true;
    } catch (error) {
        console.error('[switchPage] Error:', error);
        return false;
    }
}

// 確保 switchPage 函數在全局作用域可訪問
window.switchPage = switchPage;

// 初始化導航按鈕
function initTabNavigation() {
    console.log('[initTabNavigation] Starting initialization...');
    
    const tabNavigation = document.getElementById('tabNavigation') || document.querySelector('.tab-navigation');
    if (!tabNavigation) {
        console.warn('[initTabNavigation] Tab navigation container not found');
        return false;
    }
    
    // 為每個按鈕直接綁定事件
    const buttons = tabNavigation.querySelectorAll('.tab-btn[data-page]');
    console.log('[initTabNavigation] Found buttons:', buttons.length);
    
    buttons.forEach(function(btn) {
        const pageId = btn.getAttribute('data-page');
        if (!pageId) return;
        
        // 移除舊的事件監聽器
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // 直接綁定點擊事件
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            console.log('[Tab Click] Button clicked:', pageId, newBtn);
            switchPage(pageId);
        }, false);
        
        console.log('[initTabNavigation] Button bound:', pageId);
    });
    
    // 也使用事件委托作為備用
    tabNavigation.addEventListener('click', function(e) {
        const btn = e.target.closest('.tab-btn[data-page]');
        if (btn) {
            const pageId = btn.getAttribute('data-page');
            if (pageId) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[Tab Click (Delegation)] Button clicked:', pageId);
                switchPage(pageId);
            }
        }
    }, true);
    
    console.log('[initTabNavigation] Initialization complete');
    return true;
}

// 多重初始化機制
function tryInitTabNavigation() {
    if (initTabNavigation()) {
        console.log('[tryInitTabNavigation] Success');
    } else {
        console.log('[tryInitTabNavigation] Failed, will retry');
        setTimeout(tryInitTabNavigation, 100);
    }
}

// 立即嘗試初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(tryInitTabNavigation, 10);
    });
} else {
    setTimeout(tryInitTabNavigation, 10);
}

// 也嘗試在 window.load 時初始化
window.addEventListener('load', function() {
    setTimeout(tryInitTabNavigation, 50);
});

// 如果登入後才顯示按鈕，在顯示時也初始化
if (typeof AuthManager !== 'undefined') {
    const originalUpdateUI = AuthManager.updateUI;
    AuthManager.updateUI = function(isLoggedIn, shouldSwitchPage) {
        if (originalUpdateUI) {
            originalUpdateUI.call(this, isLoggedIn, shouldSwitchPage);
        }
        if (isLoggedIn) {
            setTimeout(tryInitTabNavigation, 100);
        }
    };
}


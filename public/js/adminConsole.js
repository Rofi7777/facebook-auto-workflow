const AdminConsole = {
  currentTable: null,
  currentSchema: null,
  currentPage: 1,
  pageSize: 20,
  totalRows: 0,
  selectedRows: new Set(),
  tables: [],
  stats: null,

  async init() {
    // Check if AdminManager exists and isAdmin, or if admin tab is visible (user verified)
    const adminTab = document.getElementById('adminTabBtn');
    const isAdminVisible = adminTab && adminTab.style.display !== 'none';
    
    if (!isAdminVisible && (!AdminManager || !AdminManager.isAdmin)) {
      console.log('AdminConsole: Not admin, skipping init');
      return;
    }
    
    console.log('AdminConsole: Initializing...');
    await this.loadStats();
    await this.loadTables();
    this.setupEventListeners();
    console.log('AdminConsole: Initialized');
  },

  setupEventListeners() {
    const refreshBtn = document.getElementById('dbRefreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refresh());
    }

    const selectAllCheckbox = document.getElementById('selectAllRows');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
    }
  },

  async loadStats() {
    try {
      const response = await AuthManager.authFetch('/api/admin/db/stats');
      const data = await response.json();
      
      if (data.success && data.stats) {
        this.stats = data.stats;
        this.renderStats();
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  },

  renderStats() {
    const statsContainer = document.getElementById('dbStatsContainer');
    if (!statsContainer || !this.stats) return;

    const tableStats = Object.entries(this.stats.tables || {}).map(([name, count]) => `
      <div class="stat-card">
        <div class="stat-value">${typeof count === 'number' ? count.toLocaleString() : count}</div>
        <div class="stat-label">${name.replace(/_/g, ' ')}</div>
      </div>
    `).join('');

    statsContainer.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card stat-card-primary">
          <div class="stat-value">${this.stats.totalRecords?.toLocaleString() || 0}</div>
          <div class="stat-label">${t('db_total_records')}</div>
        </div>
        ${tableStats}
      </div>
    `;
  },

  async loadTables() {
    const tableList = document.getElementById('dbTableList');
    if (!tableList) return;

    tableList.innerHTML = '<div class="loading-text">載入中...</div>';

    try {
      const response = await AuthManager.authFetch('/api/admin/db/tables');
      const data = await response.json();

      if (data.success && data.tables) {
        this.tables = data.tables;
        this.renderTableList();
      } else {
        tableList.innerHTML = `<div class="error-text">${data.error || '載入失敗'}</div>`;
      }
    } catch (error) {
      console.error('Failed to load tables:', error);
      tableList.innerHTML = `<div class="error-text">載入失敗: ${error.message}</div>`;
    }
  },

  renderTableList() {
    const tableList = document.getElementById('dbTableList');
    if (!tableList) return;

    if (this.tables.length === 0) {
      tableList.innerHTML = '<div class="empty-text">沒有可用的資料表</div>';
      return;
    }

    tableList.innerHTML = this.tables.map(table => `
      <div class="db-table-item ${this.currentTable === table.table_name ? 'active' : ''}" 
           onclick="AdminConsole.selectTable('${table.table_name}')">
        <span class="table-icon">📋</span>
        <span class="table-name">${table.table_name}</span>
        ${table.row_count !== null ? `<span class="table-count">${table.row_count}</span>` : ''}
      </div>
    `).join('');
  },

  async selectTable(tableName) {
    this.currentTable = tableName;
    this.currentPage = 1;
    this.selectedRows.clear();
    
    this.renderTableList();
    
    await Promise.all([
      this.loadSchema(tableName),
      this.loadRows(tableName)
    ]);
  },

  async loadSchema(tableName) {
    try {
      const response = await AuthManager.authFetch(`/api/admin/db/tables/${tableName}/schema`);
      const data = await response.json();

      if (data.success) {
        this.currentSchema = data.columns;
        this.renderSchemaInfo();
      }
    } catch (error) {
      console.error('Failed to load schema:', error);
    }
  },

  renderSchemaInfo() {
    const schemaContainer = document.getElementById('dbSchemaInfo');
    if (!schemaContainer || !this.currentSchema) return;

    schemaContainer.innerHTML = `
      <div class="schema-header">
        <h4>📊 ${this.currentTable} 結構</h4>
        <span class="column-count">${this.currentSchema.length} 欄位</span>
      </div>
      <div class="schema-columns">
        ${this.currentSchema.map(col => `
          <div class="schema-column">
            <span class="col-name">${col.column_name}</span>
            <span class="col-type">${col.data_type}</span>
            ${col.is_nullable === 'NO' ? '<span class="col-required">必填</span>' : ''}
          </div>
        `).join('')}
      </div>
    `;
  },

  async loadRows(tableName) {
    const dataContainer = document.getElementById('dbDataContainer');
    if (!dataContainer) return;

    dataContainer.innerHTML = '<div class="loading-text">載入資料中...</div>';

    try {
      const response = await AuthManager.authFetch(
        `/api/admin/db/tables/${tableName}/rows?page=${this.currentPage}&pageSize=${this.pageSize}`
      );
      const data = await response.json();

      if (data.success) {
        this.totalRows = data.count || 0;
        this.renderDataTable(data.rows);
        this.renderPagination();
      } else {
        dataContainer.innerHTML = `<div class="error-text">${data.error || '載入失敗'}</div>`;
      }
    } catch (error) {
      console.error('Failed to load rows:', error);
      dataContainer.innerHTML = `<div class="error-text">載入失敗: ${error.message}</div>`;
    }
  },

  renderDataTable(rows) {
    const dataContainer = document.getElementById('dbDataContainer');
    if (!dataContainer) return;

    if (!rows || rows.length === 0) {
      dataContainer.innerHTML = `
        <div class="empty-data">
          <div class="empty-icon">📭</div>
          <div class="empty-text">此資料表沒有資料</div>
          ${AdminManager.isSuperAdmin ? `
            <button class="btn-add-row" onclick="AdminConsole.showInsertModal()">
              ➕ 新增記錄
            </button>
          ` : ''}
        </div>
      `;
      return;
    }

    const columns = this.currentSchema ? this.currentSchema.map(c => c.column_name) : Object.keys(rows[0]);
    const displayColumns = columns.slice(0, 8);

    dataContainer.innerHTML = `
      <div class="data-toolbar">
        <div class="toolbar-left">
          <span class="row-count">共 ${this.totalRows} 筆記錄</span>
          ${AdminManager.isSuperAdmin ? `
            <button class="btn-action btn-add" onclick="AdminConsole.showInsertModal()">➕ 新增</button>
            <button class="btn-action btn-delete" onclick="AdminConsole.deleteSelected()" 
                    id="deleteSelectedBtn" style="display: none;">🗑️ 刪除選中</button>
          ` : ''}
        </div>
        <div class="toolbar-right">
          <button class="btn-action btn-export" onclick="AdminConsole.exportTable('csv')">📤 CSV</button>
          <button class="btn-action btn-export" onclick="AdminConsole.exportTable('json')">📤 JSON</button>
        </div>
      </div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              ${AdminManager.isSuperAdmin ? '<th class="col-select"><input type="checkbox" id="selectAllRows" onchange="AdminConsole.toggleSelectAll(this.checked)"></th>' : ''}
              ${displayColumns.map(col => `<th>${col}</th>`).join('')}
              ${AdminManager.isSuperAdmin ? '<th class="col-actions">操作</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr data-id="${row.id || ''}">
                ${AdminManager.isSuperAdmin ? `
                  <td class="col-select">
                    <input type="checkbox" class="row-checkbox" value="${row.id || ''}" 
                           onchange="AdminConsole.toggleRowSelection('${row.id || ''}', this.checked)">
                  </td>
                ` : ''}
                ${displayColumns.map(col => `
                  <td class="cell-${this.getColumnType(col)}" title="${this.escapeHtml(this.formatCellValue(row[col]))}">
                    ${this.formatCellDisplay(row[col])}
                  </td>
                `).join('')}
                ${AdminManager.isSuperAdmin ? `
                  <td class="col-actions">
                    <button class="btn-icon btn-edit" onclick="AdminConsole.showEditModal('${row.id}')" title="編輯">✏️</button>
                    <button class="btn-icon btn-delete" onclick="AdminConsole.deleteRow('${row.id}')" title="刪除">🗑️</button>
                  </td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  getColumnType(columnName) {
    if (!this.currentSchema) return 'text';
    const col = this.currentSchema.find(c => c.column_name === columnName);
    if (!col) return 'text';
    
    const type = col.data_type.toLowerCase();
    if (type.includes('json')) return 'json';
    if (type.includes('timestamp') || type.includes('date')) return 'datetime';
    if (type.includes('uuid')) return 'uuid';
    if (type.includes('int') || type.includes('numeric')) return 'number';
    if (type.includes('bool')) return 'boolean';
    return 'text';
  },

  formatCellValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  },

  formatCellDisplay(value) {
    if (value === null || value === undefined) return '<span class="null-value">null</span>';
    
    if (typeof value === 'object') {
      const json = JSON.stringify(value);
      return `<span class="json-value">${this.escapeHtml(json.length > 50 ? json.substring(0, 50) + '...' : json)}</span>`;
    }
    
    const str = String(value);
    if (str.length > 100) {
      return this.escapeHtml(str.substring(0, 100) + '...');
    }
    
    return this.escapeHtml(str);
  },

  renderPagination() {
    const paginationContainer = document.getElementById('dbPagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(this.totalRows / this.pageSize);
    
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    paginationContainer.innerHTML = `
      <div class="pagination">
        <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                onclick="AdminConsole.goToPage(${this.currentPage - 1})">◀</button>
        ${pages.map(p => p === '...' 
          ? '<span class="page-dots">...</span>'
          : `<button class="page-btn ${p === this.currentPage ? 'active' : ''}" 
                     onclick="AdminConsole.goToPage(${p})">${p}</button>`
        ).join('')}
        <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                onclick="AdminConsole.goToPage(${this.currentPage + 1})">▶</button>
      </div>
    `;
  },

  goToPage(page) {
    this.currentPage = page;
    this.selectedRows.clear();
    this.loadRows(this.currentTable);
  },

  toggleSelectAll(checked) {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = checked;
      if (checked) {
        this.selectedRows.add(cb.value);
      } else {
        this.selectedRows.delete(cb.value);
      }
    });
    this.updateDeleteButton();
  },

  toggleRowSelection(rowId, checked) {
    if (checked) {
      this.selectedRows.add(rowId);
    } else {
      this.selectedRows.delete(rowId);
    }
    this.updateDeleteButton();
  },

  updateDeleteButton() {
    const btn = document.getElementById('deleteSelectedBtn');
    if (btn) {
      btn.style.display = this.selectedRows.size > 0 ? 'inline-block' : 'none';
      btn.textContent = `🗑️ 刪除選中 (${this.selectedRows.size})`;
    }
  },

  showInsertModal() {
    if (!this.currentSchema) return;
    
    const editableColumns = this.currentSchema.filter(col => 
      !col.column_default?.includes('gen_random_uuid') && 
      !col.column_default?.includes('now()')
    );

    const modal = document.createElement('div');
    modal.className = 'db-modal-overlay';
    modal.id = 'dbInsertModal';
    modal.innerHTML = `
      <div class="db-modal">
        <div class="db-modal-header">
          <h3>➕ 新增記錄到 ${this.currentTable}</h3>
          <button class="modal-close" onclick="AdminConsole.closeModal('dbInsertModal')">✕</button>
        </div>
        <div class="db-modal-body">
          <form id="insertForm">
            ${editableColumns.map(col => `
              <div class="form-field">
                <label>${col.column_name} ${col.is_nullable === 'NO' ? '<span class="required">*</span>' : ''}</label>
                <span class="field-type">${col.data_type}</span>
                ${this.getInputForColumn(col, '')}
              </div>
            `).join('')}
          </form>
        </div>
        <div class="db-modal-footer">
          <button class="btn-cancel" onclick="AdminConsole.closeModal('dbInsertModal')">取消</button>
          <button class="btn-submit" onclick="AdminConsole.submitInsert()">新增</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  },

  async showEditModal(rowId) {
    if (!this.currentSchema) return;

    try {
      const response = await AuthManager.authFetch(
        `/api/admin/db/tables/${this.currentTable}/rows?page=1&pageSize=1&id=${rowId}`
      );
      const data = await response.json();
      
      if (!data.success || !data.rows || data.rows.length === 0) {
        showNotification('無法載入記錄', 'error');
        return;
      }

      const row = data.rows[0];
      const editableColumns = this.currentSchema.filter(col => col.column_name !== 'id');

      const modal = document.createElement('div');
      modal.className = 'db-modal-overlay';
      modal.id = 'dbEditModal';
      modal.dataset.rowId = rowId;
      modal.innerHTML = `
        <div class="db-modal">
          <div class="db-modal-header">
            <h3>✏️ 編輯記錄</h3>
            <button class="modal-close" onclick="AdminConsole.closeModal('dbEditModal')">✕</button>
          </div>
          <div class="db-modal-body">
            <div class="form-field readonly">
              <label>id</label>
              <input type="text" value="${rowId}" readonly>
            </div>
            <form id="editForm">
              ${editableColumns.map(col => `
                <div class="form-field">
                  <label>${col.column_name}</label>
                  <span class="field-type">${col.data_type}</span>
                  ${this.getInputForColumn(col, row[col.column_name])}
                </div>
              `).join('')}
            </form>
          </div>
          <div class="db-modal-footer">
            <button class="btn-cancel" onclick="AdminConsole.closeModal('dbEditModal')">取消</button>
            <button class="btn-submit" onclick="AdminConsole.submitEdit()">儲存</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
    } catch (error) {
      console.error('Failed to load row for edit:', error);
      showNotification('載入失敗: ' + error.message, 'error');
    }
  },

  getInputForColumn(col, value) {
    const type = col.data_type.toLowerCase();
    const name = col.column_name;
    const required = col.is_nullable === 'NO' ? 'required' : '';
    
    let displayValue = value;
    if (typeof value === 'object' && value !== null) {
      displayValue = JSON.stringify(value, null, 2);
    } else if (value === null || value === undefined) {
      displayValue = '';
    }

    if (type.includes('json')) {
      return `<textarea name="${name}" class="input-json" ${required}>${this.escapeHtml(displayValue)}</textarea>`;
    }
    
    if (type.includes('text') && !type.includes('varchar')) {
      return `<textarea name="${name}" class="input-text" ${required}>${this.escapeHtml(displayValue)}</textarea>`;
    }
    
    if (type.includes('bool')) {
      return `
        <select name="${name}" class="input-select">
          <option value="true" ${value === true ? 'selected' : ''}>true</option>
          <option value="false" ${value === false ? 'selected' : ''}>false</option>
          ${col.is_nullable !== 'NO' ? '<option value="">null</option>' : ''}
        </select>
      `;
    }
    
    if (type.includes('timestamp') || type.includes('date')) {
      const dateValue = value ? new Date(value).toISOString().slice(0, 16) : '';
      return `<input type="datetime-local" name="${name}" class="input-datetime" value="${dateValue}" ${required}>`;
    }
    
    if (type.includes('int') || type.includes('numeric')) {
      return `<input type="number" name="${name}" class="input-number" value="${displayValue}" ${required}>`;
    }
    
    return `<input type="text" name="${name}" class="input-text" value="${this.escapeHtml(displayValue)}" ${required}>`;
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  },

  async submitInsert() {
    const form = document.getElementById('insertForm');
    if (!form) return;

    const formData = new FormData(form);
    const rowData = {};
    
    for (const [key, value] of formData.entries()) {
      if (value !== '') {
        const col = this.currentSchema.find(c => c.column_name === key);
        rowData[key] = this.parseFormValue(value, col);
      }
    }

    try {
      const response = await AuthManager.authFetch(`/api/admin/db/tables/${this.currentTable}/rows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rowData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('記錄新增成功', 'success');
        this.closeModal('dbInsertModal');
        await this.loadRows(this.currentTable);
        await this.loadStats();
      } else {
        showNotification('新增失敗: ' + (data.error || '未知錯誤'), 'error');
      }
    } catch (error) {
      console.error('Insert failed:', error);
      showNotification('新增失敗: ' + error.message, 'error');
    }
  },

  async submitEdit() {
    const modal = document.getElementById('dbEditModal');
    const form = document.getElementById('editForm');
    if (!modal || !form) return;

    const rowId = modal.dataset.rowId;
    const formData = new FormData(form);
    const rowData = {};
    
    for (const [key, value] of formData.entries()) {
      const col = this.currentSchema.find(c => c.column_name === key);
      rowData[key] = this.parseFormValue(value, col);
    }

    try {
      const response = await AuthManager.authFetch(`/api/admin/db/tables/${this.currentTable}/rows/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rowData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('記錄更新成功', 'success');
        this.closeModal('dbEditModal');
        await this.loadRows(this.currentTable);
      } else {
        showNotification('更新失敗: ' + (data.error || '未知錯誤'), 'error');
      }
    } catch (error) {
      console.error('Update failed:', error);
      showNotification('更新失敗: ' + error.message, 'error');
    }
  },

  parseFormValue(value, col) {
    if (!col) return value;
    
    const type = col.data_type.toLowerCase();
    
    if (value === '' && col.is_nullable !== 'NO') {
      return null;
    }
    
    if (type.includes('json')) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    
    if (type.includes('bool')) {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return null;
    }
    
    if (type.includes('int')) {
      return parseInt(value) || 0;
    }
    
    if (type.includes('numeric') || type.includes('float') || type.includes('double')) {
      return parseFloat(value) || 0;
    }
    
    return value;
  },

  async deleteRow(rowId) {
    if (!confirm('確定要刪除這筆記錄嗎？此操作無法復原。')) return;

    try {
      const response = await AuthManager.authFetch(`/api/admin/db/tables/${this.currentTable}/rows/${rowId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('記錄已刪除', 'success');
        await this.loadRows(this.currentTable);
        await this.loadStats();
      } else {
        showNotification('刪除失敗: ' + (data.error || '未知錯誤'), 'error');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      showNotification('刪除失敗: ' + error.message, 'error');
    }
  },

  async deleteSelected() {
    if (this.selectedRows.size === 0) return;
    
    if (!confirm(`確定要刪除選中的 ${this.selectedRows.size} 筆記錄嗎？此操作無法復原。`)) return;

    try {
      const response = await AuthManager.authFetch(`/api/admin/db/tables/${this.currentTable}/rows/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIds: Array.from(this.selectedRows) })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification(`已刪除 ${data.deletedCount} 筆記錄`, 'success');
        this.selectedRows.clear();
        await this.loadRows(this.currentTable);
        await this.loadStats();
      } else {
        showNotification('刪除失敗: ' + (data.error || '未知錯誤'), 'error');
      }
    } catch (error) {
      console.error('Bulk delete failed:', error);
      showNotification('刪除失敗: ' + error.message, 'error');
    }
  },

  async exportTable(format) {
    if (!this.currentTable) {
      showNotification('請先選擇一個資料表', 'warning');
      return;
    }

    try {
      const response = await AuthManager.authFetch(`/api/admin/db/tables/${this.currentTable}/export?format=${format}`);
      
      if (format === 'csv') {
        const text = await response.text();
        this.downloadFile(text, `${this.currentTable}_export.csv`, 'text/csv');
      } else {
        const data = await response.json();
        this.downloadFile(JSON.stringify(data, null, 2), `${this.currentTable}_export.json`, 'application/json');
      }
      
      showNotification(`已匯出 ${format.toUpperCase()} 檔案`, 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('匯出失敗: ' + error.message, 'error');
    }
  },

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async refresh() {
    if (this.currentTable) {
      await Promise.all([
        this.loadStats(),
        this.loadRows(this.currentTable)
      ]);
    } else {
      await this.loadStats();
      await this.loadTables();
    }
    showNotification('已重新整理', 'success');
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

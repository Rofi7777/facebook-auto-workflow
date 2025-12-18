/**
 * 图片上传组件
 * 处理文件选择（点击/拖拽）、文件预览、文件上传和上传进度显示
 */
class ImageUpload {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    this.options = {
      maxFiles: options.maxFiles || 5,
      maxSize: options.maxSize || 10 * 1024 * 1024, // 10MB
      acceptedTypes: options.acceptedTypes || ['image/jpeg', 'image/png', 'image/jpg'],
      showPreview: options.showPreview !== false,
      ...options
    };
    this.files = [];
    this.onUploadCallbacks = [];
    this.onProgressCallbacks = [];
    this.onChangeCallbacks = [];
    this.initialized = false;
  }

  /**
   * 初始化组件
   */
  init() {
    if (this.initialized || !this.container) {
      return;
    }

    // 查找或创建文件输入
    this.fileInput = this.container.querySelector('input[type="file"]');
    if (!this.fileInput) {
      this.fileInput = document.createElement('input');
      this.fileInput.type = 'file';
      this.fileInput.multiple = this.options.maxFiles > 1;
      this.fileInput.accept = this.options.acceptedTypes.join(',');
      this.fileInput.style.display = 'none';
      this.container.appendChild(this.fileInput);
    }

    // 查找或创建预览容器
    if (this.options.showPreview) {
      this.previewContainer = this.container.querySelector('.image-preview-container') ||
                              this.container.querySelector('#imagePreviewContainer');
      if (!this.previewContainer) {
        this.previewContainer = document.createElement('div');
        this.previewContainer.className = 'image-preview-container';
        this.previewContainer.id = 'imagePreviewContainer';
        this.previewContainer.style.display = 'grid';
        this.previewContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
        this.previewContainer.style.gap = '10px';
        this.previewContainer.style.marginTop = '10px';
        this.container.appendChild(this.previewContainer);
      }
    }

    // 设置上传区域样式
    this.container.style.cursor = 'pointer';
    this.container.style.position = 'relative';

    // 设置子元素pointer-events
    const children = this.container.querySelectorAll('*:not(input)');
    children.forEach(child => {
      child.style.pointerEvents = 'none';
    });

    // 绑定事件
    this.bindEvents();

    this.initialized = true;
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 点击上传区域
    this.container.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.fileInput.click();
    });

    // 文件选择
    this.fileInput.addEventListener('change', (e) => {
      this.handleFileSelect(e.target.files);
    });

    // 拖拽上传
    this.setupDragAndDrop();
  }

  /**
   * 设置拖拽上传
   */
  setupDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.container.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      this.container.addEventListener(eventName, () => {
        this.container.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      this.container.addEventListener(eventName, () => {
        this.container.classList.remove('dragover');
      }, false);
    });

    this.container.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileSelect(files);
      }
    }, false);
  }

  /**
   * 处理文件选择
   * @param {FileList} fileList - 文件列表
   */
  handleFileSelect(fileList) {
    const files = Array.from(fileList).filter(file => {
      // 检查文件类型
      if (!this.options.acceptedTypes.includes(file.type)) {
        console.warn(`[ImageUpload] File type not accepted: ${file.type}`);
        return false;
      }

      // 检查文件大小
      if (file.size > this.options.maxSize) {
        console.warn(`[ImageUpload] File too large: ${file.size}`);
        return false;
      }

      return true;
    });

    // 限制文件数量
    if (files.length > this.options.maxFiles) {
      files.splice(this.options.maxFiles);
      console.warn(`[ImageUpload] Too many files, keeping first ${this.options.maxFiles}`);
    }

    // 合并现有文件
    this.files = [...this.files, ...files].slice(0, this.options.maxFiles);

    // 更新文件输入
    const dt = new DataTransfer();
    this.files.forEach(file => dt.items.add(file));
    this.fileInput.files = dt.files;

    // 更新显示
    this.updateDisplay();
    this.updatePreview();

    // 触发变化事件
    this.triggerChange();
  }

  /**
   * 更新显示文本
   */
  updateDisplay() {
    const uploadText = this.container.querySelector('.upload-text');
    if (uploadText) {
      if (this.files.length === 0) {
        uploadText.textContent = this.options.uploadText || '点击或拖拽上传图片';
      } else if (this.files.length === 1) {
        uploadText.textContent = `已选择: ${this.files[0].name}`;
      } else {
        uploadText.textContent = `已选择: ${this.files.length} 张图片`;
      }
    }
  }

  /**
   * 更新预览
   */
  updatePreview() {
    if (!this.previewContainer || !this.options.showPreview) {
      return;
    }

    if (this.files.length === 0) {
      this.previewContainer.style.display = 'none';
      return;
    }

    this.previewContainer.style.display = 'grid';
    this.previewContainer.innerHTML = '';

    this.files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        previewItem.style.position = 'relative';
        previewItem.style.aspectRatio = '1';
        previewItem.style.overflow = 'hidden';
        previewItem.style.borderRadius = '8px';
        
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        previewItem.appendChild(img);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '×';
        removeBtn.type = 'button';
        removeBtn.style.cssText = `
          position: absolute;
          top: 5px;
          right: 5px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 0, 0, 0.8);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
        `;
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeFile(index);
        });
        previewItem.appendChild(removeBtn);

        this.previewContainer.appendChild(previewItem);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * 移除文件
   * @param {number} index - 文件索引
   */
  removeFile(index) {
    this.files.splice(index, 1);

    // 更新文件输入
    const dt = new DataTransfer();
    this.files.forEach(file => dt.items.add(file));
    this.fileInput.files = dt.files;

    this.updateDisplay();
    this.updatePreview();
    this.triggerChange();
  }

  /**
   * 获取文件列表
   * @returns {File[]} 文件数组
   */
  getFiles() {
    return [...this.files];
  }

  /**
   * 清空文件
   */
  clear() {
    this.files = [];
    this.fileInput.value = '';
    this.updateDisplay();
    this.updatePreview();
    this.triggerChange();
  }

  /**
   * 上传文件
   * @param {string} url - 上传URL
   * @param {Object} options - 上传选项
   * @returns {Promise} 上传结果
   */
  async upload(url, options = {}) {
    if (this.files.length === 0) {
      throw new Error('No files to upload');
    }

    if (window.ApiService) {
      if (this.files.length === 1) {
        return await window.ApiService.upload(url, this.files[0], 
          (progress) => this.triggerProgress(progress), options);
      } else {
        return await window.ApiService.uploadMultiple(url, this.files,
          (progress) => this.triggerProgress(progress), options);
      }
    } else {
      // 回退到FormData上传
      const formData = new FormData();
      this.files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        ...options
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    }
  }

  /**
   * 监听上传事件
   * @param {Function} callback - 回调函数
   */
  onUpload(callback) {
    this.onUploadCallbacks.push(callback);
  }

  /**
   * 监听进度事件
   * @param {Function} callback - 回调函数
   */
  onProgress(callback) {
    this.onProgressCallbacks.push(callback);
  }

  /**
   * 监听变化事件
   * @param {Function} callback - 回调函数
   */
  onChange(callback) {
    this.onChangeCallbacks.push(callback);
  }

  /**
   * 触发变化事件
   */
  triggerChange() {
    this.onChangeCallbacks.forEach(callback => {
      try {
        callback(this.files);
      } catch (error) {
        console.error('[ImageUpload] Error in change callback:', error);
      }
    });
  }

  /**
   * 触发进度事件
   * @param {number} progress - 进度百分比
   */
  triggerProgress(progress) {
    this.onProgressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('[ImageUpload] Error in progress callback:', error);
      }
    });
  }

  /**
   * 销毁组件
   */
  destroy() {
    this.files = [];
    this.onUploadCallbacks = [];
    this.onProgressCallbacks = [];
    this.onChangeCallbacks = [];
    this.initialized = false;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageUpload;
} else {
  window.ImageUpload = ImageUpload;
}

/**
 * API 调用封装
 * 统一处理 API 请求、自动添加认证 Token、统一错误处理
 */
class ApiService {
  constructor() {
    this.baseURL = '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * 获取认证头
   */
  getAuthHeaders() {
    if (window.AuthService) {
      return window.AuthService.getAuthHeaders();
    }
    return {};
  }

  /**
   * 构建请求头
   * @param {Object} customHeaders - 自定义请求头
   * @returns {Object} 请求头对象
   */
  buildHeaders(customHeaders = {}) {
    return {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      ...customHeaders
    };
  }

  /**
   * 处理响应
   * @param {Response} response - Fetch 响应对象
   * @returns {Promise} 解析后的数据
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    const isJSON = contentType && contentType.includes('application/json');

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      if (isJSON) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // 如果解析失败，使用默认错误消息
        }
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.response = response;
      throw error;
    }

    if (isJSON) {
      return await response.json();
    }

    return await response.text();
  }

  /**
   * GET 请求
   * @param {string} url - 请求URL
   * @param {Object} params - 查询参数
   * @param {Object} options - 额外选项
   * @returns {Promise} 响应数据
   */
  async get(url, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullURL = queryString ? `${this.baseURL}${url}?${queryString}` : `${this.baseURL}${url}`;

    try {
      const response = await fetch(fullURL, {
        method: 'GET',
        headers: this.buildHeaders(options.headers),
        ...options
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('[API] GET error:', error);
      throw error;
    }
  }

  /**
   * POST 请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 额外选项
   * @returns {Promise} 响应数据
   */
  async post(url, data = {}, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'POST',
        headers: this.buildHeaders(options.headers),
        body: JSON.stringify(data),
        ...options
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('[API] POST error:', error);
      throw error;
    }
  }

  /**
   * PUT 请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 额外选项
   * @returns {Promise} 响应数据
   */
  async put(url, data = {}, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'PUT',
        headers: this.buildHeaders(options.headers),
        body: JSON.stringify(data),
        ...options
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('[API] PUT error:', error);
      throw error;
    }
  }

  /**
   * DELETE 请求
   * @param {string} url - 请求URL
   * @param {Object} options - 额外选项
   * @returns {Promise} 响应数据
   */
  async delete(url, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'DELETE',
        headers: this.buildHeaders(options.headers),
        ...options
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('[API] DELETE error:', error);
      throw error;
    }
  }

  /**
   * 文件上传
   * @param {string} url - 请求URL
   * @param {File|FormData} file - 文件或FormData
   * @param {Function} onProgress - 进度回调
   * @param {Object} options - 额外选项
   * @returns {Promise} 响应数据
   */
  async upload(url, file, onProgress = null, options = {}) {
    const formData = file instanceof FormData ? file : new FormData();
    
    if (file instanceof File) {
      formData.append('file', file);
    }

    try {
      const xhr = new XMLHttpRequest();

      // 进度监听
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      return new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              resolve(xhr.responseText);
            }
          } else {
            let errorMessage = `HTTP ${xhr.status}: ${xhr.statusText}`;
            try {
              const errorData = JSON.parse(xhr.responseText);
              errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
              // 如果解析失败，使用默认错误消息
            }
            const error = new Error(errorMessage);
            error.status = xhr.status;
            reject(error);
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });

        // 设置请求头
        const headers = this.buildHeaders();
        Object.keys(headers).forEach(key => {
          if (key.toLowerCase() !== 'content-type') {
            xhr.setRequestHeader(key, headers[key]);
          }
        });

        xhr.open('POST', `${this.baseURL}${url}`);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('[API] Upload error:', error);
      throw error;
    }
  }

  /**
   * 多文件上传
   * @param {string} url - 请求URL
   * @param {File[]} files - 文件数组
   * @param {Function} onProgress - 进度回调
   * @param {Object} options - 额外选项
   * @returns {Promise} 响应数据
   */
  async uploadMultiple(url, files, onProgress = null, options = {}) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    return this.upload(url, formData, onProgress, options);
  }
}

// 创建单例实例
const apiService = new ApiService();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = apiService;
} else {
  window.ApiService = apiService;
}

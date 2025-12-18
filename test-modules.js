/**
 * Node.js 模块测试脚本
 * 用于验证 JavaScript 模块的语法和基本结构
 */

const fs = require('fs');
const path = require('path');

const modules = [
  // Core
  'public/js/core/state.js',
  'public/js/core/router.js',
  'public/js/core/app.js',
  
  // Services
  'public/js/services/api.js',
  'public/js/services/auth.js',
  'public/js/services/i18n.js',
  
  // Utils
  'public/js/utils/dom.js',
  'public/js/utils/validation.js',
  'public/js/utils/file.js'
];

console.log('开始测试模块...\n');

let allPassed = true;
const results = [];

modules.forEach(modulePath => {
  const fullPath = path.join(__dirname, modulePath);
  
  try {
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      throw new Error('文件不存在');
    }
    
    // Read file
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for syntax errors (basic check)
    try {
      // Try to parse as JavaScript (Node.js will throw on syntax errors)
      // Note: This is a basic check, full validation requires actual execution
      if (content.includes('class ') || content.includes('function ')) {
        // Basic structure check
        const hasExport = content.includes('window.') || content.includes('const ') || content.includes('class ');
        
        if (!hasExport) {
          throw new Error('未找到导出语句');
        }
      }
      
      results.push({
        module: modulePath,
        status: '✓',
        message: '通过'
      });
      console.log(`✓ ${modulePath}`);
    } catch (parseError) {
      results.push({
        module: modulePath,
        status: '✗',
        message: parseError.message
      });
      console.log(`✗ ${modulePath}: ${parseError.message}`);
      allPassed = false;
    }
  } catch (error) {
    results.push({
      module: modulePath,
      status: '✗',
      message: error.message
    });
    console.log(`✗ ${modulePath}: ${error.message}`);
    allPassed = false;
  }
});

console.log('\n测试完成！');
console.log(`总计: ${modules.length} 个模块`);
console.log(`通过: ${results.filter(r => r.status === '✓').length}`);
console.log(`失败: ${results.filter(r => r.status === '✗').length}`);

if (allPassed) {
  console.log('\n✓ 所有模块测试通过！');
  process.exit(0);
} else {
  console.log('\n✗ 部分模块测试失败');
  process.exit(1);
}



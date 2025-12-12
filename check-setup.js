#!/usr/bin/env node

/**
 * 快速检查脚本 - 验证环境配置和 Supabase 连接
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 检查环境配置...\n');

// 检查环境变量
const checks = {
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY,
  'GEMINI_API_KEY': process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_NEW,
  'PORT': process.env.PORT || '5000',
};

let allPassed = true;

console.log('📋 环境变量检查:');
Object.entries(checks).forEach(([key, value]) => {
  const status = value && value !== 'your_service_role_key_here' ? '✅' : '❌';
  const displayValue = key.includes('KEY') && value 
    ? `${value.substring(0, 20)}...` 
    : value || '(未设置)';
  
  console.log(`  ${status} ${key}: ${displayValue}`);
  
  if (!value || value === 'your_service_role_key_here') {
    allPassed = false;
  }
});

console.log('\n🔗 测试 Supabase 连接...\n');

if (checks.SUPABASE_URL && checks.SUPABASE_ANON_KEY) {
  try {
    const supabase = createClient(checks.SUPABASE_URL, checks.SUPABASE_ANON_KEY);
    
    // 测试连接
    supabase.from('user_interactions').select('count').limit(0)
      .then(({ error }) => {
        if (error && error.code === 'PGRST116') {
          console.log('⚠️  数据库表尚未创建');
          console.log('   请运行 database/user_learning_schema.sql 在 Supabase SQL Editor 中\n');
        } else if (error) {
          console.log(`❌ Supabase 连接错误: ${error.message}\n`);
        } else {
          console.log('✅ Supabase 连接成功！\n');
        }
        
        // 检查表是否存在
        checkTables(supabase);
      })
      .catch(err => {
        console.log(`❌ 连接失败: ${err.message}\n`);
      });
  } catch (error) {
    console.log(`❌ 初始化失败: ${error.message}\n`);
  }
} else {
  console.log('⚠️  无法测试连接：缺少 Supabase 配置\n');
}

async function checkTables(supabase) {
  const requiredTables = [
    'user_interactions',
    'user_preferences', 
    'user_feedback'
  ];
  
  console.log('📊 检查数据库表:');
  
  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(0);
      if (error && error.code === 'PGRST116') {
        console.log(`  ❌ ${table} - 表不存在`);
      } else {
        console.log(`  ✅ ${table} - 表存在`);
      }
    } catch (err) {
      console.log(`  ❌ ${table} - 检查失败: ${err.message}`);
    }
  }
  
  console.log('\n💡 提示:');
  if (!checks.SUPABASE_SERVICE_KEY || checks.SUPABASE_SERVICE_KEY === 'your_service_role_key_here') {
    console.log('  - 需要获取 SUPABASE_SERVICE_KEY:');
    console.log('    Supabase Dashboard → Settings → API → service_role key\n');
  }
  
  console.log('  - 创建数据库表:');
  console.log('    Supabase Dashboard → SQL Editor → 运行 database/user_learning_schema.sql\n');
}

console.log('\n✨ 检查完成！\n');


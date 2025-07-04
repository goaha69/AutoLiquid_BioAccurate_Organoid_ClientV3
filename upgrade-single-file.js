/**
 * 单文件Vue 2到Vue 3语法升级脚本（修正版）
 * 用于测试和验证升级逻辑的正确性
 */
const fs = require('fs');
const path = require('path');

// 目标文件路径
const TARGET_FILE = path.resolve(__dirname, 'src/components/spInput.vue');

// 处理v-model相关问题
function processVModelEmit(content) {
  // 替换 $emit('input', ...) 为 $emit('update:modelValue', ...)
  let newContent = content.replace(
    /\$emit\s*\(\s*['"]\s*input\s*['"]\s*,/g,
    "$emit('update:modelValue',"
  );
  
  return newContent;
}

// 处理props中的value改为modelValue (Vue 3的v-model默认prop)
function processVModelProps(content) {
  // 使用更精确的正则表达式来匹配props中的value定义
  // 支持多行模式和不同的缩进格式
  let newContent = content.replace(
    /(\s+)value:\s*\{([^}]*?)\}/gs,
    '$1modelValue: {$2}'
  );
  
  // 如果上面的替换成功了，再替换对应的引用
  if (newContent !== content) {
    // 替换data中的this.value为this.modelValue (只在组件内部)
    newContent = newContent.replace(
      /this\.value\b/g,
      'this.modelValue'
    );
    
    // 替换watch中的value为modelValue
    newContent = newContent.replace(
      /(watch:\s*\{[^}]*?)value\s*\(/g,
      '$1modelValue('
    );
  }
  
  return newContent;
}

// 处理生命周期钩子
function processLifecycleHooks(content) {
  let newContent = content.replace(/beforeDestroy\s*\(/g, 'beforeUnmount(');
  newContent = newContent.replace(/destroyed\s*\(/g, 'unmounted(');
  return newContent;
}

// 处理$listeners (Vue 3中已合并到$attrs)
function processListeners(content) {
  let newContent = content.replace(/v-on="\$listeners"/g, 'v-bind="$attrs"');
  newContent = newContent.replace(/\{\.\.\.\$listeners\}/g, '{...$attrs}');
  return newContent;
}

// 主处理函数
async function processFile() {
  try {
    console.log(`开始处理文件: ${TARGET_FILE}`);
    
    // 检查文件是否存在
    if (!fs.existsSync(TARGET_FILE)) {
      console.error(`文件不存在: ${TARGET_FILE}`);
      return;
    }
    
    // 读取文件内容
    const originalContent = fs.readFileSync(TARGET_FILE, 'utf8');
    let newContent = originalContent;
    
    console.log('=== 原始内容摘要 ===');
    const lines = originalContent.split('\n');
    console.log(`总行数: ${lines.length}`);
    console.log(`包含"$emit('input'"的行:`, lines.filter(line => line.includes("$emit('input'")).length);
    console.log(`包含"value:"的行:`, lines.filter(line => line.includes("value:")).length);
    console.log(`包含"this.value"的行:`, lines.filter(line => line.includes("this.value")).length);
    
    // 依次应用各种处理
    let changeCount = 0;
    
    const beforeEmit = newContent;
    newContent = processVModelEmit(newContent);
    if (beforeEmit !== newContent) {
      changeCount++;
      console.log(`✓ processVModelEmit: 有变化`);
    } else {
      console.log(`- processVModelEmit: 无变化`);
    }
    
    const beforeProps = newContent;
    newContent = processVModelProps(newContent);
    if (beforeProps !== newContent) {
      changeCount++;
      console.log(`✓ processVModelProps: 有变化`);
    } else {
      console.log(`- processVModelProps: 无变化`);
    }
    
    const beforeLifecycle = newContent;
    newContent = processLifecycleHooks(newContent);
    if (beforeLifecycle !== newContent) {
      changeCount++;
      console.log(`✓ processLifecycleHooks: 有变化`);
    } else {
      console.log(`- processLifecycleHooks: 无变化`);
    }
    
    const beforeListeners = newContent;
    newContent = processListeners(newContent);
    if (beforeListeners !== newContent) {
      changeCount++;
      console.log(`✓ processListeners: 有变化`);
    } else {
      console.log(`- processListeners: 无变化`);
    }
    
    // 检查是否有变化
    if (newContent !== originalContent) {
      console.log(`\n=== 总共发现 ${changeCount} 处变化 ===`);
      
      // 创建备份
      const backupPath = TARGET_FILE + '.backup2';
      fs.writeFileSync(backupPath, originalContent, 'utf8');
      console.log(`已创建备份: ${backupPath}`);
      
      // 写入新内容
      fs.writeFileSync(TARGET_FILE, newContent, 'utf8');
      console.log(`已更新文件: ${TARGET_FILE}`);
      
      // 显示具体变化（只显示有变化的行）
      console.log('\n=== 具体变化 ===');
      const originalLines = originalContent.split('\n');
      const newContentLines = newContent.split('\n');
      
      let changedLines = 0;
      for (let i = 0; i < Math.max(originalLines.length, newContentLines.length); i++) {
        const oldLine = originalLines[i] || '';
        const newLine = newContentLines[i] || '';
        
        if (oldLine !== newLine) {
          changedLines++;
          console.log(`第${i+1}行:`);
          console.log(`  原: ${oldLine}`);
          console.log(`  新: ${newLine}`);
          if (changedLines > 10) {
            console.log(`  ... (还有更多变化)`);
            break;
          }
        }
      }
    } else {
      console.log('文件内容无变化');
    }
    
  } catch (error) {
    console.error('处理文件时出错:', error);
  }
}

// 运行脚本
processFile().then(() => {
  console.log('处理完成');
}).catch(console.error);

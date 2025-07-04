/**
 * Vue 2到Vue 3语法全文件升级脚本（改进版）
 * 基于单文件测试验证后的升级逻辑
 */
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// 定义要扫描的目录
const DIRS_TO_SCAN = [
  path.resolve(__dirname, 'src/components'),
  path.resolve(__dirname, 'src/views')
];

// 限制处理的文件数量（用于测试，设为0表示处理所有文件）
const MAX_FILES_TO_PROCESS = 0;

// 扫描目录中的所有Vue文件
async function scanVueFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await scanVueFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.vue')) {
      files.push(fullPath);
    }
  }

  return files;
}

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

// 处理简单的slot语法（暂时跳过，避免破坏模板结构）
function processSlotSyntax(content) {
  // 暂时跳过slot处理，因为它太复杂，容易破坏模板结构
  // 后续需要更精确的AST解析来处理slot语法
  console.log('  跳过slot处理（需要人工处理）');
  return content;
}

// 处理其他常见的Vue 2到Vue 3迁移
function processOtherMigrations(content) {
  let newContent = content;
  
  // 注意：.sync 修饰符转换需要谨慎处理
  // 只有在组件明确支持 v-model:propName 时才转换
  // 大多数情况下应该转换为 :prop + @update:prop
  // 这里暂时跳过自动转换，需要人工处理
  if (content.includes('.sync=')) {
    console.warn('  ⚠️  发现.sync修饰符，需要手动转换为:prop + @update:prop');
  }
  
  // 处理 $children (Vue 3中已移除，需要警告)
  if (newContent.includes('$children')) {
    console.warn('  ⚠️  发现$children使用，需要手动处理');
  }
  
  // 处理 $scopedSlots (Vue 3中已合并到$slots)
  newContent = newContent.replace(
    /\$scopedSlots\b/g,
    '$slots'
  );
  
  return newContent;
}

// 检查文件是否包含需要手动处理的内容
function checkManualProcessingNeeded(content, filePath) {
  const issues = [];
  
  // 检查$on, $once, $off
  if (content.includes('$on(') || content.includes('$once(') || content.includes('$off(')) {
    issues.push('包含$on/$once/$off事件方法');
  }
  
  // 检查复杂的slot-scope
  if (content.includes('slot-scope')) {
    issues.push('包含slot-scope语法');
  }
  
  // 检查旧的slot语法
  if (content.includes('slot="') || content.includes("slot='")) {
    issues.push('包含旧的slot语法');
  }
  
  // 检查.sync语法
  if (content.includes('.sync=')) {
    issues.push('包含.sync修饰符');
  }
  
  // 检查$children
  if (content.includes('$children')) {
    issues.push('包含$children（Vue 3已移除）');
  }
  
  // 检查Vue.filter
  if (content.includes('Vue.filter') || content.includes('this.$options.filters')) {
    issues.push('包含过滤器语法');
  }
  
  if (issues.length > 0) {
    console.warn(`⚠️  ${path.relative(__dirname, filePath)} 需要手动处理: ${issues.join(', ')}`);
  }
  
  return issues;
}

// 处理单个文件
async function processFile(filePath) {
  try {
    const originalContent = await readFileAsync(filePath, 'utf8');
    let newContent = originalContent;
    let changeCount = 0;
    
    // 检查是否需要手动处理
    checkManualProcessingNeeded(originalContent, filePath);
    
    // 依次应用各种处理
    const beforeEmit = newContent;
    newContent = processVModelEmit(newContent);
    if (beforeEmit !== newContent) changeCount++;
    
    const beforeProps = newContent;
    newContent = processVModelProps(newContent);
    if (beforeProps !== newContent) changeCount++;
    
    const beforeLifecycle = newContent;
    newContent = processLifecycleHooks(newContent);
    if (beforeLifecycle !== newContent) changeCount++;
    
    const beforeListeners = newContent;
    newContent = processListeners(newContent);
    if (beforeListeners !== newContent) changeCount++;
    
    const beforeSlot = newContent;
    newContent = processSlotSyntax(newContent);
    if (beforeSlot !== newContent) changeCount++;
    
    const beforeVisible = newContent;
    newContent = processOtherMigrations(newContent);
    if (beforeVisible !== newContent) changeCount++;
    
    // 如果有变化，则写入文件
    if (newContent !== originalContent) {
      await writeFileAsync(filePath, newContent, 'utf8');
      console.log(`✓ 更新文件 (${changeCount}处变化): ${filePath}`);
      return true;
    } else {
      console.log(`- 无需更新: ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ 处理文件 ${filePath} 时出错:`, error.message);
    return false;
  }
}

// 主函数
async function main() {
  console.log('开始Vue 2到Vue 3语法升级...\n');
  
  let allFiles = [];
  for (const dir of DIRS_TO_SCAN) {
    if (fs.existsSync(dir)) {
      const files = await scanVueFiles(dir);
      allFiles.push(...files);
    } else {
      console.warn(`目录不存在: ${dir}`);
    }
  }

  console.log(`找到 ${allFiles.length} 个Vue文件，将处理${MAX_FILES_TO_PROCESS === 0 ? '所有' : '前 ' + Math.min(MAX_FILES_TO_PROCESS, allFiles.length)} 个文件\n`);

  // 限制文件数量用于测试
  const filesToProcess = MAX_FILES_TO_PROCESS === 0 ? allFiles : allFiles.slice(0, MAX_FILES_TO_PROCESS);

  let updatedCount = 0;
  let processedCount = 0;

  for (const file of filesToProcess) {
    processedCount++;
    console.log(`[${processedCount}/${filesToProcess.length}] 处理文件: ${path.relative(__dirname, file)}`);
    
    const wasUpdated = await processFile(file);
    if (wasUpdated) {
      updatedCount++;
    }
  }

  console.log(`\n=== 升级完成 ===`);
  console.log(`总共处理: ${processedCount} 个文件`);
  console.log(`成功更新: ${updatedCount} 个文件`);
  console.log(`无需更新: ${processedCount - updatedCount} 个文件`);
  
  if (updatedCount > 0) {
    console.log(`\n建议：`);
    console.log(`1. 检查git diff确认所有变化都是正确的`);
    console.log(`2. 运行应用测试功能是否正常`);
    console.log(`3. 对标记为需要手动处理的文件进行人工检查`);
  }
}

main().catch(console.error);

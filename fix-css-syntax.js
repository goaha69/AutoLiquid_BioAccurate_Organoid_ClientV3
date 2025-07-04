const fs = require('fs');
const path = require('path');

// 配置项目路径
const VUE3_PROJECT_PATH = 'c:/ChenDev/AutoLiquid_BioAccurate_Organoid_ClientV3';

// 修复Vue3语法错误和CSS选择器语法错误
function fixVue3Syntax(content) {
  let fixedContent = content;
  let fixCount = 0;
  
  // 修复CSS伪类选择器语法错误：button:hover ? not( : disabled) 应该是 button:hover:not(:disabled)
  const cssHoverNotRegex = /(\w+):hover\s*\?\s*not\(\s*:\s*disabled\)/g;
  const cssHoverNotMatches = fixedContent.match(cssHoverNotRegex);
  if (cssHoverNotMatches) {
    fixedContent = fixedContent.replace(cssHoverNotRegex, '$1:hover:not(:disabled)');
    fixCount += cssHoverNotMatches.length;
  }
  
  // 修复其他常见的CSS语法错误
  // 修复 style="color ? red" 应该是 style="color: red"
  const styleAttrRegex = /style="([^"]*?)(\w+)\s*\?\s*([^;"]+)/g;
  fixedContent = fixedContent.replace(styleAttrRegex, (match, before, prop, value) => {
    fixCount++;
    return `style="${before}${prop}: ${value}`;
  });
  
  // 修复属性名包含?的错误语法 如: :? 或 ?="xxx"
  const invalidAttrRegex = /(\s+)(\?+)(\s*=\s*"[^"]*")/g;
  const invalidAttrMatches = fixedContent.match(invalidAttrRegex);
  if (invalidAttrMatches) {
    fixedContent = fixedContent.replace(invalidAttrRegex, '');
    fixCount += invalidAttrMatches.length;
  }
  
  // 修复单独的?字符作为属性名
  const singleQuestionRegex = /(\s+)\?\s*(?=[>\s])/g;
  const singleQuestionMatches = fixedContent.match(singleQuestionRegex);
  if (singleQuestionMatches) {
    fixedContent = fixedContent.replace(singleQuestionRegex, ' ');
    fixCount += singleQuestionMatches.length;
  }
  
  // 修复Vue3中v-model语法错误
  const vModelRegex = /v-model:([^=\s]+)="([^"]+)"/g;
  fixedContent = fixedContent.replace(vModelRegex, (match, prop, value) => {
    if (prop === 'value') {
      return `v-model="${value}"`;
    }
    return match;
  });
  
  // 修复属性中的条件表达式语法错误
  const conditionalAttrRegex = /(\w+)\s*\?\s*([^:\s]+)\s*:\s*([^"\s>]+)/g;
  fixedContent = fixedContent.replace(conditionalAttrRegex, ':$1="$2 ? \'$2\' : \'$3\'"');
  
  return { content: fixedContent, fixCount };
}

// 递归处理目录下的Vue文件
async function processDirectory(dir) {
  const entries = fs.readdirSync(path.join(VUE3_PROJECT_PATH, dir));
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const fullVue3Path = path.join(VUE3_PROJECT_PATH, fullPath);
    const stat = fs.statSync(fullVue3Path);
    
    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.endsWith('.vue')) {
      await processVueFile(fullPath);
    }
  }
}

// 处理单个Vue文件
async function processVueFile(filePath) {
  const vue3FilePath = path.join(VUE3_PROJECT_PATH, filePath);
  
  try {
    const vue3Content = fs.readFileSync(vue3FilePath, 'utf8');
    
    // 执行Vue3语法修复
    const syntaxResult = fixVue3Syntax(vue3Content);
    
    // 如果有修复，写入文件
    if (syntaxResult.fixCount > 0) {
      fs.writeFileSync(vue3FilePath, syntaxResult.content, 'utf8');
      console.log(`✅ 修复文件: ${filePath} (修复了${syntaxResult.fixCount}个Vue3语法问题)`);
    }
  } catch (error) {
    console.error(`❌ 处理文件失败: ${filePath}`, error.message);
  }
}

// 主函数
async function main() {
  console.log('🔍 开始修复Vue3语法和CSS问题...');
  console.log(`📁 Vue3项目路径: ${VUE3_PROJECT_PATH}`);
  
  const startTime = Date.now();
  
  try {
    // 从src目录开始处理
    await processDirectory('src');
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n✨ Vue3语法和CSS修复完成！耗时: ${duration}秒`);
  } catch (error) {
    console.error('❌ 处理过程中发生错误:', error.message);
  }
}

// 运行脚本
main().catch(console.error);

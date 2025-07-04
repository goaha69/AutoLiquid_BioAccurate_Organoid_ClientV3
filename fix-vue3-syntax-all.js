const fs = require('fs');
const path = require('path');

// 配置项目路径
const VUE2_PROJECT_PATH = 'c:/ChenDev/AutoLiquid_BioAccurate_Organoid_Client';
const VUE3_PROJECT_PATH = 'c:/ChenDev/AutoLiquid_BioAccurate_Organoid_ClientV3';

// 统计信息
const stats = {
  scannedFiles:    stats.fixes.urlFormats += urlResult.fixCount;
    
    // 6. 修复CSS选择器语法错误
    const cssResult = fixCssSelectors(fixedContent);
    fixedContent = cssResult.content;
    totalFixes += cssResult.fixCount;
    stats.fixes.cssSelectors += cssResult.fixCount;
    
    // 如果有修复，写入文件ifiedFiles: 0,
  errors: 0,
  fixes: {
    htmlEntities: 0,
    closingTags: 0,
    selfClosingTags: 0,
    chinesesChars: 0,
    ternaryOperators: 0,
    urlFormats: 0,
    cssSelectors: 0
  }
};

// 修复HTML实体编码
function fixHtmlEntities(content) {
  const entityMap = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'"
  };
  
  let fixedContent = content;
  let fixCount = 0;
  
  Object.entries(entityMap).forEach(([entity, char]) => {
    const regex = new RegExp(entity, 'g');
    const matches = fixedContent.match(regex);
    if (matches) {
      fixedContent = fixedContent.replace(regex, char);
      fixCount += matches.length;
    }
  });
  
  return { content: fixedContent, fixCount };
}

// 修复标签闭合问题
function fixClosingTags(content) {
  let fixedContent = content;
  let fixCount = 0;
  
  // 修复不完整的闭合标签，如 </plus> 应该是 </plus-outlined>
  const incompleteClosingTagRegex = /<\/(\w+)>(?![\s\S]*<\/\1>)/g;
  fixedContent = fixedContent.replace(incompleteClosingTagRegex, (match, tag) => {
    // 在这里添加逻辑来找出正确的标签名
    if (tag === 'plus') {
      fixCount++;
      return '</plus-outlined>';
    }
    return match;
  });
  
  // 修复自闭合标签
  const selfClosingTagRegex = /<(\w+[\-\w]*)([^>]*?)\/>/g;
  fixedContent = fixedContent.replace(selfClosingTagRegex, (match, tag, attrs) => {
    // 检查是否是自闭合标签
    const selfClosingTags = ['input', 'img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
    if (selfClosingTags.includes(tag.toLowerCase())) {
      return match;
    }
    fixCount++;
    return `<${tag}${attrs}></${tag}>`;
  });
  
  return { content: fixedContent, fixCount };
}

// 修复三元操作符语法错误
function fixTernaryOperators(content) {
  let fixedContent = content;
  let fixCount = 0;
  
  // 修复形如 "condition : value : value" 的错误语法
  const ternaryErrorRegex = /(\w+(?:\.\w+)*(?:\([^)]*\))?|\([^)]+\))\s*:\s*([^:?\n]+?)\s*:\s*([^:?\n]+?)(?=\s*[;})\n])/g;
  fixedContent = fixedContent.replace(ternaryErrorRegex, (match, condition, trueValue, falseValue) => {
    // 检查是否真的是三元表达式的错误用法
    // 排除对象属性定义等情况
    const beforeMatch = fixedContent.substring(Math.max(0, fixedContent.indexOf(match) - 50), fixedContent.indexOf(match));
    const afterMatch = fixedContent.substring(fixedContent.indexOf(match) + match.length, fixedContent.indexOf(match) + match.length + 10);
    
    // 如果在return语句、赋值语句或函数调用中，很可能是三元表达式
    if (beforeMatch.includes('return') || beforeMatch.includes('=') || beforeMatch.includes('(')) {
      // 进一步检查是否不是对象属性或CSS等
      if (!beforeMatch.includes('{') || beforeMatch.lastIndexOf('{') < beforeMatch.lastIndexOf('return') || 
          beforeMatch.lastIndexOf('{') < beforeMatch.lastIndexOf('=')) {
        fixCount++;
        return `${condition} ? ${trueValue} : ${falseValue}`;
      }
    }
    return match;
  });
  
  return { content: fixedContent, fixCount };
}

// 通过与Vue2文件比较修复中文乱码
function fixChineseCharacters(vue3Content, vue2Content) {
  // 这个函数比较复杂，需要用到字符串比较和匹配算法
  // 简化实现：查找vue2中的中文短语，检查vue3中是否存在
  const chineseRegex = /[\u4e00-\u9fa5]+/g;
  const chinese2Matches = vue2Content.match(chineseRegex) || [];
  let fixedContent = vue3Content;
  let fixCount = 0;
  
  chinese2Matches.forEach(phrase => {
    if (!fixedContent.includes(phrase)) {
      // 寻找可能被破坏的位置
      const encodedPhrase = encodeURIComponent(phrase).replace(/%/g, '\\x');
      if (fixedContent.includes(encodedPhrase)) {
        fixedContent = fixedContent.replace(new RegExp(encodedPhrase, 'g'), phrase);
        fixCount++;
      }
    }
  });
  
  return { content: fixedContent, fixCount };
}

// 修复URL格式错误
function fixUrlFormats(content) {
  let fixedContent = content;
  let fixCount = 0;
  
  // 修复data URL格式错误：data ? image 应该是 data:image
  const dataUrlRegex = /data\s*\?\s*image/g;
  const dataUrlMatches = fixedContent.match(dataUrlRegex);
  if (dataUrlMatches) {
    fixedContent = fixedContent.replace(dataUrlRegex, 'data:image');
    fixCount += dataUrlMatches.length;
  }
  
  // 修复http URL格式错误：http : // 应该是 http://
  const httpUrlRegex = /http\s*:\s*\/\//g;
  const httpUrlMatches = fixedContent.match(httpUrlRegex);
  if (httpUrlMatches) {
    fixedContent = fixedContent.replace(httpUrlRegex, 'http://');
    fixCount += httpUrlMatches.length;
  }
  
  // 修复https URL格式错误：https : // 应该是 https://
  const httpsUrlRegex = /https\s*:\s*\/\//g;
  const httpsUrlMatches = fixedContent.match(httpsUrlRegex);
  if (httpsUrlMatches) {
    fixedContent = fixedContent.replace(httpsUrlRegex, 'https://');
    fixCount += httpsUrlMatches.length;
  }
  
  return { content: fixedContent, fixCount };
}

// 修复CSS选择器语法错误
function fixCssSelectors(content) {
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
  
  return { content: fixedContent, fixCount };
}

// 递归处理目录下的Vue文件
async function processDirectory(dir, relativePath = '') {
  const entries = fs.readdirSync(path.join(VUE3_PROJECT_PATH, dir));
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const fullVue3Path = path.join(VUE3_PROJECT_PATH, fullPath);
    const stat = fs.statSync(fullVue3Path);
    
    if (stat.isDirectory()) {
      await processDirectory(fullPath, path.join(relativePath, entry));
    } else if (entry.endsWith('.vue')) {
      await processVueFile(fullPath);
    }
  }
}

// 处理单个Vue文件
async function processVueFile(filePath) {
  const vue3FilePath = path.join(VUE3_PROJECT_PATH, filePath);
  const vue2FilePath = path.join(VUE2_PROJECT_PATH, filePath);
  
  try {
    stats.scannedFiles++;
    
    if (!fs.existsSync(vue2FilePath)) {
      console.log(`⚠️ Vue2对应文件不存在: ${filePath}`);
      return;
    }
    
    const vue3Content = fs.readFileSync(vue3FilePath, 'utf8');
    const vue2Content = fs.readFileSync(vue2FilePath, 'utf8');
    
    // 备份原文件到专门的备份目录
    const backupDir = path.join(VUE3_PROJECT_PATH, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const backupPath = path.join(backupDir, filePath.replace(/[\/\\]/g, '_') + '.backup');
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, vue3Content);
    }
    
    // 执行各种修复
    let fixedContent = vue3Content;
    let totalFixes = 0;
    
    // 1. 修复HTML实体编码
    const entityResult = fixHtmlEntities(fixedContent);
    fixedContent = entityResult.content;
    totalFixes += entityResult.fixCount;
    stats.fixes.htmlEntities += entityResult.fixCount;
    
    // 2. 修复标签闭合问题
    const tagResult = fixClosingTags(fixedContent);
    fixedContent = tagResult.content;
    totalFixes += tagResult.fixCount;
    stats.fixes.closingTags += tagResult.fixCount;
    
    // 3. 修复三元操作符语法错误
    const ternaryResult = fixTernaryOperators(fixedContent);
    fixedContent = ternaryResult.content;
    totalFixes += ternaryResult.fixCount;
    stats.fixes.ternaryOperators += ternaryResult.fixCount;
    
    // 4. 修复中文字符
    const chineseResult = fixChineseCharacters(fixedContent, vue2Content);
    fixedContent = chineseResult.content;
    totalFixes += chineseResult.fixCount;
    stats.fixes.chinesesChars += chineseResult.fixCount;
    
    // 5. 修复URL格式错误
    const urlResult = fixUrlFormats(fixedContent);
    fixedContent = urlResult.content;
    totalFixes += urlResult.fixCount;
    stats.fixes.urlFormats += urlResult.fixCount;
    
    // 6. 修复CSS选择器语法错误
    const cssResult = fixCssSelectors(fixedContent);
    fixedContent = cssResult.content;
    totalFixes += cssResult.fixCount;
    stats.fixes.cssSelectors += cssResult.fixCount;
    
    // 6. 修复CSS选择器语法错误
    const cssResult = fixCssSelectors(fixedContent);
    fixedContent = cssResult.content;
    totalFixes += cssResult.fixCount;
    stats.fixes.cssSelectors += cssResult.fixCount;
    
    // 如果有修复，写入文件
    if (totalFixes > 0) {
      fs.writeFileSync(vue3FilePath, fixedContent, 'utf8');
      stats.modifiedFiles++;
      console.log(`✅ 修复文件: ${filePath} (修复了${totalFixes}个问题)`);
    }
  } catch (error) {
    console.error(`❌ 处理文件失败: ${filePath}`, error.message);
    stats.errors++;
  }
}

// 主函数
async function main() {
  console.log('🔍 开始比较Vue2和Vue3项目文件并修复问题...');
  console.log(`📁 Vue2项目路径: ${VUE2_PROJECT_PATH}`);
  console.log(`📁 Vue3项目路径: ${VUE3_PROJECT_PATH}`);
  
  const startTime = Date.now();
  
  try {
    // 从src目录开始处理
    await processDirectory('src');
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n📊 修复统计:');
    console.log(`扫描文件数: ${stats.scannedFiles}`);
    console.log(`修复文件数: ${stats.modifiedFiles}`);
    console.log(`HTML实体修复: ${stats.fixes.htmlEntities}`);
    console.log(`标签闭合修复: ${stats.fixes.closingTags}`);
    console.log(`三元操作符修复: ${stats.fixes.ternaryOperators}`);
    console.log(`中文字符修复: ${stats.fixes.chinesesChars}`);
    console.log(`URL格式修复: ${stats.fixes.urlFormats}`);
    console.log(`CSS选择器修复: ${stats.fixes.cssSelectors}`);
    console.log(`错误数: ${stats.errors}`);
    console.log(`耗时: ${duration}秒`);
    
    if (stats.modifiedFiles > 0) {
      console.log('\n✨ 修复完成！');
      console.log('建议运行编译命令检查是否还有其他问题。');
    } else {
      console.log('\n✅ 未发现需要修复的问题！');
    }
  } catch (error) {
    console.error('❌ 处理过程中发生错误:', error.message);
  }
}

// 运行脚本
main().catch(console.error);
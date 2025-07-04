const fs = require('fs');
const path = require('path');

/**
 * 修复 Vue 文件中的字符串拼接错误和注释格式问题
 * 主要修复：
 * 1. 字符串拼接错误：'text + variable → 'text' + variable
 * 2. 注释格式问题：单行注释、多行注释格式不规范
 */

// 获取所有 Vue 文件
function getAllVueFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllVueFiles(filePath, fileList);
    } else if (file.endsWith('.vue')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 修复字符串拼接和注释格式的函数
function fixStringConcatAndComments(content) {
  let fixedContent = content;
  let changesMade = false;
  const fixes = [];

  // 1. 修复字符串拼接错误：'text + variable → 'text' + variable
  // 模式：查找形如 'text + variable 的情况
  const stringConcatPattern = /('[^']*?)\s*\+\s*([^'\s][^,\)\]\};\n]*)/g;
  let matches = [...fixedContent.matchAll(stringConcatPattern)];
  
  matches.forEach(match => {
    const fullMatch = match[0];
    const stringPart = match[1];
    const variablePart = match[2].trim();
    
    // 确保字符串部分是闭合的
    if (!stringPart.endsWith("'")) {
      const replacement = stringPart + "' + " + variablePart;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changesMade = true;
      fixes.push(`字符串拼接: ${fullMatch} → ${replacement}`);
    }
  });

  // 2. 修复未闭合字符串后跟加号的情况：'text + → 'text' +
  const unclosedStringPattern = /('[^']*?)\s*\+(?!\s*')/g;
  matches = [...fixedContent.matchAll(unclosedStringPattern)];
  
  matches.forEach(match => {
    const fullMatch = match[0];
    const stringPart = match[1];
    
    if (!stringPart.endsWith("'")) {
      const replacement = stringPart + "' +";
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changesMade = true;
      fixes.push(`未闭合字符串: ${fullMatch} → ${replacement}`);
    }
  });

  // 3. 修复特殊情况：消息拼接错误
  // 如：'授权失败 + res.message → '授权失败' + res.message
  const messagePattern = /('[^']*?(?:失败|成功|错误|异常|提示))\s*\+\s*([a-zA-Z_$][a-zA-Z0-9_$.]*)/g;
  matches = [...fixedContent.matchAll(messagePattern)];
  
  matches.forEach(match => {
    const fullMatch = match[0];
    const messagePart = match[1];
    const variablePart = match[2];
    
    if (!messagePart.endsWith("'")) {
      const replacement = messagePart + "' + " + variablePart;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changesMade = true;
      fixes.push(`消息拼接: ${fullMatch} → ${replacement}`);
    }
  });

  // 4. 修复注释格式问题
  
  // 4.1 修复单行注释前缺少空格：//comment → // comment
  const singleLineCommentPattern = /\/\/(?!\s)([^\n\r]*)/g;
  if (singleLineCommentPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(singleLineCommentPattern, '// $1');
    changesMade = true;
    fixes.push('修复单行注释格式');
  }

  // 4.2 修复多行注释格式：/* comment*/ → /* comment */
  const multiLineCommentPattern = /\/\*([^*].*?)\*\//g;
  matches = [...fixedContent.matchAll(multiLineCommentPattern)];
  
  matches.forEach(match => {
    const fullMatch = match[0];
    const commentContent = match[1].trim();
    
    if (!fullMatch.includes(' */') || !fullMatch.includes('/* ')) {
      const replacement = `/* ${commentContent} */`;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changesMade = true;
      fixes.push(`多行注释: ${fullMatch} → ${replacement}`);
    }
  });

  // 4.3 修复JSDoc注释格式问题
  // 修复 /** comment*/ → /** comment */
  const jsdocPattern = /\/\*\*([^*].*?)\*\//g;
  matches = [...fixedContent.matchAll(jsdocPattern)];
  
  matches.forEach(match => {
    const fullMatch = match[0];
    const commentContent = match[1].trim();
    
    if (!fullMatch.includes(' */')) {
      const replacement = `/** ${commentContent} */`;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changesMade = true;
      fixes.push(`JSDoc注释: ${fullMatch} → ${replacement}`);
    }
  });

  // 5. 修复模板字符串错误
  // 修复形如 `text + variable` → `text${variable}`
  const templateStringPattern = /`([^`]*?)\s*\+\s*([^`\s][^`]*)`/g;
  matches = [...fixedContent.matchAll(templateStringPattern)];
  
  matches.forEach(match => {
    const fullMatch = match[0];
    const textPart = match[1];
    const variablePart = match[2].trim();
    
    // 如果变量部分不包含复杂表达式，转换为模板字符串
    if (!/[+\-*/]/.test(variablePart)) {
      const replacement = `\`${textPart}\${${variablePart}}\``;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changesMade = true;
      fixes.push(`模板字符串: ${fullMatch} → ${replacement}`);
    }
  });

  // 6. 修复字符串中的HTML实体或特殊字符错误
  // 修复形如 'text&nbsp; → 'text&nbsp;'
  const htmlEntityPattern = /('[^']*?&[a-zA-Z]+;?)(?!['\w])/g;
  matches = [...fixedContent.matchAll(htmlEntityPattern)];
  
  matches.forEach(match => {
    const fullMatch = match[0];
    const stringPart = match[1];
    
    if (!stringPart.endsWith("'")) {
      const replacement = stringPart + "'";
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changesMade = true;
      fixes.push(`HTML实体: ${fullMatch} → ${replacement}`);
    }
  });

  return { content: fixedContent, changed: changesMade, fixes: fixes };
}

// 检查文件是否有语法错误的辅助函数
function hasStringConcatErrors(content) {
  // 检查是否有字符串拼接错误的模式
  const patterns = [
    /('[^']*?)\s*\+\s*[^'\s][^,\)\]\};\n]*/g,  // 'text + variable
    /('[^']*?(?:失败|成功|错误|异常|提示))\s*\+\s*[a-zA-Z_$]/g,  // 消息拼接错误
    /\/\/(?!\s)[^\n\r]*/g,  // 单行注释格式
    /\/\*[^*].*?\*\//g,     // 多行注释格式
  ];
  
  return patterns.some(pattern => pattern.test(content));
}

// 主函数
function main() {
  const viewsDir = path.join(__dirname, 'src', 'views');
  
  if (!fs.existsSync(viewsDir)) {
    console.error('❌ src/views 目录不存在');
    return;
  }
  
  console.log('🔍 扫描 src/views 目录中的 Vue 文件...');
  console.log('📝 检查字符串拼接错误和注释格式问题...');
  
  const vueFiles = getAllVueFiles(viewsDir);
  console.log(`📁 找到 ${vueFiles.length} 个 Vue 文件`);
  
  let fixedFilesCount = 0;
  let totalFixesCount = 0;
  const processedFiles = [];
  
  vueFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 检查是否有需要修复的错误
      if (hasStringConcatErrors(content)) {
        const result = fixStringConcatAndComments(content);
        
        if (result.changed) {
          // 备份原文件
          const backupPath = filePath + '.concat.backup';
          fs.writeFileSync(backupPath, content);
          
          // 写入修复后的内容
          fs.writeFileSync(filePath, result.content);
          
          fixedFilesCount++;
          totalFixesCount += result.fixes.length;
          
          const relativePath = path.relative(process.cwd(), filePath);
          console.log(`\n✅ 修复文件: ${relativePath}`);
          console.log(`   备份保存为: ${path.relative(process.cwd(), backupPath)}`);
          console.log(`   修复问题数: ${result.fixes.length}`);
          
          // 显示具体修复内容（限制显示数量）
          const maxShow = 5;
          result.fixes.slice(0, maxShow).forEach((fix, index) => {
            console.log(`   ${index + 1}. ${fix}`);
          });
          
          if (result.fixes.length > maxShow) {
            console.log(`   ... 还有 ${result.fixes.length - maxShow} 个修复`);
          }
          
          processedFiles.push({
            file: relativePath,
            fixCount: result.fixes.length,
            fixes: result.fixes
          });
        }
      }
    } catch (error) {
      console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    }
  });
  
  console.log('\n📊 修复结果汇总:');
  console.log(`- 扫描文件: ${vueFiles.length} 个`);
  console.log(`- 修复文件: ${fixedFilesCount} 个`);
  console.log(`- 总修复数: ${totalFixesCount} 个`);
  
  if (fixedFilesCount > 0) {
    console.log('\n📝 修复详情:');
    processedFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.file} (${file.fixCount} 个修复)`);
    });
    
    console.log('\n⚠️  注意事项:');
    console.log('- 原文件已备份为 .concat.backup 后缀');
    console.log('- 请检查修复结果后删除备份文件');
    console.log('- 建议运行 npm run serve 重新编译验证修复效果');
    console.log('- 如果修复有误，可以从备份文件恢复');
  } else {
    console.log('\n🎉 所有文件都没有发现需要修复的字符串拼接或注释格式错误');
  }
  
  // 生成修复报告
  if (processedFiles.length > 0) {
    const reportPath = path.join(__dirname, 'string-concat-fix-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalFiles: vueFiles.length,
      fixedFiles: fixedFilesCount,
      totalFixes: totalFixesCount,
      details: processedFiles
    }, null, 2));
    
    console.log(`\n📋 详细报告已保存到: ${path.relative(process.cwd(), reportPath)}`);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { fixStringConcatAndComments, getAllVueFiles, hasStringConcatErrors };

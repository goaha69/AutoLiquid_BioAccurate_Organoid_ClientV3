const fs = require('fs');
const path = require('path');

/**
 * 修复 Vue 文件中的语法错误脚本
 * 主要修复以下类型的错误：
 * 1. 未闭合字符串：'text? → 'text'
 * 2. 字符串连接错误：'text + var) → 'text' + var)
 * 3. 注释格式问题：行内注释和多行注释的格式修复
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

// 修复字符串的函数
function fixStringErrors(content) {
  let fixedContent = content;
  let changesMade = false;
  
  // 模式1: 修复形如 'text? 的未闭合字符串（在属性值中）
  const pattern1 = /(\s+\w+:\s*')([^']*?)\?$/gm;
  if (pattern1.test(content)) {
    fixedContent = fixedContent.replace(pattern1, "$1$2'");
    changesMade = true;
  }
  
  // 模式2: 修复形如 name: 'text? 的情况
  const pattern2 = /(\s*name:\s*')([^']*?)\?(\s*,?\s*$)/gm;
  if (pattern2.test(fixedContent)) {
    fixedContent = fixedContent.replace(pattern2, "$1$2'$3");
    changesMade = true;
  }
  
  // 模式3: 修复形如 source: 'text? 的情况
  const pattern3 = /(\s*source:\s*')([^']*?)\?(\s*,?\s*$)/gm;
  if (pattern3.test(fixedContent)) {
    fixedContent = fixedContent.replace(pattern3, "$1$2'$3");
    changesMade = true;
  }
  
  // 模式4: 修复形如 target: 'text? 的情况
  const pattern4 = /(\s*target:\s*')([^']*?)\?(\s*,?\s*$)/gm;
  if (pattern4.test(fixedContent)) {
    fixedContent = fixedContent.replace(pattern4, "$1$2'$3");
    changesMade = true;
  }
  
  // 模式5: 修复形如 title: 'text? 的情况
  const pattern5 = /(\s*title:\s*')([^']*?)\?(\s*,?\s*$)/gm;
  if (pattern5.test(fixedContent)) {
    fixedContent = fixedContent.replace(pattern5, "$1$2'$3");
    changesMade = true;
  }
  
  // 模式6: 修复形如 unit: '? 的情况（unit字段特殊处理）
  const pattern6 = /(\s*unit:\s*')\?\s*$/gm;
  if (pattern6.test(fixedContent)) {
    fixedContent = fixedContent.replace(pattern6, "$1个'");
    changesMade = true;
  }
  
  // 新增模式7: 修复字符串连接中的未闭合引号
  // 形如 'text + variable) → 'text' + variable)
  const pattern7 = /(\$message\.\w+\(')([^']*?)\s*\+\s*([^)]+)\)/g;
  if (pattern7.test(fixedContent)) {
    fixedContent = fixedContent.replace(pattern7, "$1$2' + $3)");
    changesMade = true;
  }
  
  // 新增模式8: 修复更通用的字符串连接错误
  // 形如 'text + variable) → 'text' + variable)
  const pattern8 = /('([^']*?)\s*\+\s*([^)]+))/g;
  const stringConcatMatches = [...fixedContent.matchAll(pattern8)];
  stringConcatMatches.forEach(match => {
    const fullMatch = match[0];
    const stringPart = match[2];
    const varPart = match[3];
    
    // 检查字符串是否已经正确闭合
    if (!stringPart.endsWith("'") && !fullMatch.includes("' +")) {
      const replacement = `'${stringPart}' + ${varPart}`;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changesMade = true;
    }
  });
  
  // 新增模式9: 修复行内注释格式问题
  // 形如 // 注释文本        代码 → // 注释文本\n        代码
  const pattern9 = /(\/\/\s*[^\/\n]*?)(\s{2,})([^\n]+)/g;
  if (pattern9.test(fixedContent)) {
    fixedContent = fixedContent.replace(pattern9, "$1\n$2$3");
    changesMade = true;
  }
  
  // 新增模式10: 修复多行注释格式问题
  // 形如 * 注释       */ → * 注释\n       */
  const pattern10 = /(\*\s*[^*\n]*?)(\s{2,})(\*\/)/g;
  if (pattern10.test(fixedContent)) {
    fixedContent = fixedContent.replace(pattern10, "$1\n$2$3");
    changesMade = true;
  }
  
  // 新增模式11: 修复JSDoc注释格式
  // 形如 * 文本       */ → * 文本\n       */
  const pattern11 = /(\*\s+[^*\n]+?)(\s{2,})(\*\/)/g;
  if (pattern11.test(fixedContent)) {
    fixedContent = fixedContent.replace(pattern11, "$1\n       $3");
    changesMade = true;
  }
  
  // 通用模式: 查找所有可能的未闭合字符串
  // 匹配形如 'something? 且后面跟着换行或逗号的情况
  const generalPattern = /('[^']*?)\?\s*([,\]\}\n])/g;
  const matches = [...fixedContent.matchAll(generalPattern)];
  
  if (matches.length > 0) {
    matches.forEach(match => {
      const fullMatch = match[0];
      const stringPart = match[1];
      const ending = match[2];
      const replacement = stringPart + "'" + ending;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changesMade = true;
    });
  }
  
  return { content: fixedContent, changed: changesMade };
}

// 主函数
function main() {
  const viewsDir = path.join(__dirname, 'src', 'views');
  
  if (!fs.existsSync(viewsDir)) {
    console.error('❌ src/views 目录不存在');
    return;
  }
  
  console.log('🔍 扫描 src/views 目录中的 Vue 文件...');
  
  const vueFiles = getAllVueFiles(viewsDir);
  console.log(`📁 找到 ${vueFiles.length} 个 Vue 文件`);
  
  let fixedFilesCount = 0;
  let totalErrorsFixed = 0;
  
  vueFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = fixStringErrors(content);
      
      if (result.changed) {
        // 备份原文件
        const backupPath = filePath + '.backup';
        fs.writeFileSync(backupPath, content);
        
        // 写入修复后的内容
        fs.writeFileSync(filePath, result.content);
        
        fixedFilesCount++;
        console.log(`✅ 修复文件: ${path.relative(process.cwd(), filePath)}`);
        console.log(`   备份保存为: ${path.relative(process.cwd(), backupPath)}`);
      }
    } catch (error) {
      console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    }
  });
  
  console.log('\n📊 修复结果:');
  console.log(`- 扫描文件: ${vueFiles.length} 个`);
  console.log(`- 修复文件: ${fixedFilesCount} 个`);
  
  if (fixedFilesCount > 0) {
    console.log('\n⚠️  注意: 原文件已备份为 .backup 后缀，请检查修复结果后删除备份文件');
    console.log('💡 建议: 运行修复后请重新编译项目以验证修复效果');
    console.log('\n🔧 修复的错误类型包括:');
    console.log('   - 未闭合字符串');
    console.log('   - 字符串连接错误');
    console.log('   - 注释格式问题');
  } else {
    console.log('\n🎉 所有文件都没有发现需要修复的语法错误');
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { fixStringErrors, getAllVueFiles };

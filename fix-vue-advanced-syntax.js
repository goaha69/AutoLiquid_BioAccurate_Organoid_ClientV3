const fs = require('fs');
const path = require('path');

/**
 * 增强版 Vue 文件语法错误修复脚本
 * 专门处理字符串连接和注释格式错误
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

// 修复高级语法错误
function fixAdvancedSyntaxErrors(content) {
  let fixedContent = content;
  let changesMade = false;
  let errorTypes = [];

  // 1. 修复字符串连接中的未闭合引号
  // 形如 this.$message.error('授权失败 + res.message) → this.$message.error('授权失败' + res.message)
  const stringConcatPattern = /(this\.\$message\.\w+\(')([^']*?)\s*\+\s*([^)]+)\)/g;
  const stringConcatMatches = [...fixedContent.matchAll(stringConcatPattern)];
  
  if (stringConcatMatches.length > 0) {
    stringConcatMatches.forEach(match => {
      const fullMatch = match[0];
      const prefix = match[1];
      const stringPart = match[2];
      const varPart = match[3];
      
      if (!stringPart.endsWith("'")) {
        const replacement = `${prefix}${stringPart}' + ${varPart})`;
        fixedContent = fixedContent.replace(fullMatch, replacement);
        changesMade = true;
        if (!errorTypes.includes('字符串连接错误')) {
          errorTypes.push('字符串连接错误');
        }
      }
    });
  }

  // 2. 修复更通用的字符串连接错误
  // 形如 'text + variable) → 'text' + variable)
  const generalStringPattern = /('[^']*?)\s*\+\s*([^)']+)\)/g;
  const generalMatches = [...fixedContent.matchAll(generalStringPattern)];
  
  generalMatches.forEach(match => {
    const fullMatch = match[0];
    const stringPart = match[1];
    const varPart = match[2];
    
    // 检查字符串是否未正确闭合
    if (!stringPart.endsWith("'") && stringPart.length > 1) {
      const replacement = `${stringPart}' + ${varPart})`;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changesMade = true;
      if (!errorTypes.includes('字符串连接错误')) {
        errorTypes.push('字符串连接错误');
      }
    }
  });

  // 3. 修复行内注释格式问题
  // 形如 // 获取机构树          this.getOrgTree() → // 获取机构树\n          this.getOrgTree()
  const inlineCommentPattern = /(\/\/\s*[^\/\n]+?)(\s{4,})([^\s\/][^\n]+)/g;
  if (inlineCommentPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(inlineCommentPattern, (match, comment, spaces, code) => {
      const indentation = spaces.substring(0, spaces.length - 2); // 保持适当的缩进
      return `${comment}\n${indentation}${code}`;
    });
    changesMade = true;
    if (!errorTypes.includes('行内注释格式')) {
      errorTypes.push('行内注释格式');
    }
  }

  // 4. 修复JSDoc注释格式问题
  // 形如 * 此角色已有数据列表       */ → * 此角色已有数据列表\n       */
  const jsdocPattern = /(\*\s+[^*\n]+?)(\s{4,})(\*\/)/g;
  if (jsdocPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(jsdocPattern, (match, content, spaces, end) => {
      const baseIndentation = '       '; // 标准的JSDoc缩进
      return `${content}\n${baseIndentation}${end}`;
    });
    changesMade = true;
    if (!errorTypes.includes('JSDoc注释格式')) {
      errorTypes.push('JSDoc注释格式');
    }
  }

  // 5. 修复多行注释中的格式问题
  // 形如 * 范围下拉框事 */ → * 范围下拉框事件\n       */
  const multilineCommentPattern = /(\*\s+[^*\n]*?)\s+(\*\/)/g;
  if (multilineCommentPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(multilineCommentPattern, (match, content, end) => {
      // 如果注释内容看起来不完整（如"范围下拉框事"），尝试补全
      let fixedComment = content;
      if (content.includes('事') && !content.includes('事件')) {
        fixedComment = content.replace('事', '事件');
      }
      return `${fixedComment}\n       ${end}`;
    });
    changesMade = true;
    if (!errorTypes.includes('多行注释格式')) {
      errorTypes.push('多行注释格式');
    }
  }

  // 6. 修复函数调用中的字符串错误
  // 检查所有函数调用中的字符串参数
  const functionCallPattern = /(\w+\(')([^']*?)(\s*\+\s*[^)]*)\)/g;
  const functionMatches = [...fixedContent.matchAll(functionCallPattern)];
  
  functionMatches.forEach(match => {
    const fullMatch = match[0];
    const prefix = match[1];
    const stringPart = match[2];
    const remaining = match[3];
    
    if (!stringPart.endsWith("'")) {
      const replacement = `${prefix}${stringPart}'${remaining})`;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changesMade = true;
      if (!errorTypes.includes('函数调用字符串错误')) {
        errorTypes.push('函数调用字符串错误');
      }
    }
  });

  return { 
    content: fixedContent, 
    changed: changesMade, 
    errorTypes: errorTypes 
  };
}

// 主函数
function main() {
  const viewsDir = path.join(__dirname, 'src', 'views');
  
  if (!fs.existsSync(viewsDir)) {
    console.error('❌ src/views 目录不存在');
    return;
  }
  
  console.log('🔍 扫描 src/views 目录中的 Vue 文件（高级语法错误修复）...');
  
  const vueFiles = getAllVueFiles(viewsDir);
  console.log(`📁 找到 ${vueFiles.length} 个 Vue 文件`);
  
  let fixedFilesCount = 0;
  let allErrorTypes = new Set();
  
  vueFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = fixAdvancedSyntaxErrors(content);
      
      if (result.changed) {
        // 备份原文件
        const backupPath = filePath + '.advanced.backup';
        fs.writeFileSync(backupPath, content);
        
        // 写入修复后的内容
        fs.writeFileSync(filePath, result.content);
        
        fixedFilesCount++;
        result.errorTypes.forEach(type => allErrorTypes.add(type));
        
        console.log(`✅ 修复文件: ${path.relative(process.cwd(), filePath)}`);
        console.log(`   错误类型: ${result.errorTypes.join(', ')}`);
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
    console.log('\n🔧 修复的错误类型:');
    Array.from(allErrorTypes).forEach(type => {
      console.log(`   - ${type}`);
    });
    console.log('\n⚠️  注意: 原文件已备份为 .advanced.backup 后缀');
    console.log('💡 建议: 运行修复后请重新编译项目以验证修复效果');
  } else {
    console.log('\n🎉 所有文件都没有发现需要修复的高级语法错误');
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { fixAdvancedSyntaxErrors, getAllVueFiles };

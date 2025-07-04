const fs = require('fs');
const path = require('path');

/**
 * 专门修复 src/views/experiment/expFlow 目录下 Vue 文件的语法错误脚本
 * 主要修复以下类型的错误：
 * 1. 字符串拼接错误：node.x' + node.w → node.x + node.w
 * 2. 循环变量拼接错误：i' + + → i++
 * 3. 赋值操作拼接错误：acc' + (char... → acc + (char...
 * 4. 模板字符串错误：{{ index' + 1}} → {{ index + 1}}
 */

// 获取 expFlow 目录下的所有 Vue 文件
function getExpFlowVueFiles() {
  const expFlowDir = path.join(__dirname, 'src', 'views', 'experiment', 'expFlow');
  const fileList = [];
  
  if (!fs.existsSync(expFlowDir)) {
    console.error('❌ src/views/experiment/expFlow 目录不存在');
    return fileList;
  }
  
  const files = fs.readdirSync(expFlowDir);
  files.forEach(file => {
    if (file.endsWith('.vue') && !file.includes('.backup')) {
      fileList.push(path.join(expFlowDir, file));
    }
  });
  
  return fileList;
}

// 修复字符串拼接错误的函数
function fixStringConcatErrors(content) {
  let fixedContent = content;
  let changesMade = false;
  const changes = [];
  
  // 模式1: 修复形如 node.x' + node.w 的错误
  const pattern1 = /(\w+(?:\.\w+)*)'(\s*\+\s*)/g;
  const matches1 = [...content.matchAll(pattern1)];
  if (matches1.length > 0) {
    matches1.forEach(match => {
      const fullMatch = match[0];
      const variable = match[1];
      const operator = match[2];
      const replacement = variable + operator;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changes.push(`${fullMatch} → ${replacement}`);
      changesMade = true;
    });
  }
  
  // 模式2: 修复形如 i' + + 的循环递增错误
  const pattern2 = /(\w+)'(\s*\+\s*\+)/g;
  const matches2 = [...fixedContent.matchAll(pattern2)];
  if (matches2.length > 0) {
    matches2.forEach(match => {
      const fullMatch = match[0];
      const variable = match[1];
      const replacement = variable + '++';
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changes.push(`${fullMatch} → ${replacement}`);
      changesMade = true;
    });
  }
  
  // 模式3: 修复形如 y' = 的赋值错误
  const pattern3 = /(\w+)'(\s*[+\-*\/]?=)/g;
  const matches3 = [...fixedContent.matchAll(pattern3)];
  if (matches3.length > 0) {
    matches3.forEach(match => {
      const fullMatch = match[0];
      const variable = match[1];
      const operator = match[2];
      const replacement = variable + operator;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changes.push(`${fullMatch} → ${replacement}`);
      changesMade = true;
    });
  }
  
  // 模式4: 修复模板字符串中的错误 {{ index' + 1}}
  const pattern4 = /\{\{\s*(\w+)'(\s*\+\s*[^}]+)\s*\}\}/g;
  const matches4 = [...fixedContent.matchAll(pattern4)];
  if (matches4.length > 0) {
    matches4.forEach(match => {
      const fullMatch = match[0];
      const variable = match[1];
      const expression = match[2];
      const replacement = `{{ ${variable}${expression} }}`;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changes.push(`${fullMatch} → ${replacement}`);
      changesMade = true;
    });
  }
  
  // 模式5: 修复属性绑定中的错误 :x="node.x' + node.w"
  const pattern5 = /(:[\w-]+="[^"]*?)(\w+)'(\s*\+[^"]*?")/g;
  const matches5 = [...fixedContent.matchAll(pattern5)];
  if (matches5.length > 0) {
    matches5.forEach(match => {
      const fullMatch = match[0];
      const prefix = match[1];
      const variable = match[2];
      const suffix = match[3];
      const replacement = prefix + variable + suffix;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changes.push(`错误的属性绑定: ${fullMatch} → ${replacement}`);
      changesMade = true;
    });
  }
  
  // 模式6: 修复字符串拼接中的多余引号 join(',')' + ")"
  const pattern6 = /(\w+\([^)]*\))'(\s*\+\s*)/g;
  const matches6 = [...fixedContent.matchAll(pattern6)];
  if (matches6.length > 0) {
    matches6.forEach(match => {
      const fullMatch = match[0];
      const methodCall = match[1];
      const operator = match[2];
      const replacement = methodCall + operator;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changes.push(`方法调用拼接: ${fullMatch} → ${replacement}`);
      changesMade = true;
    });
  }
  
  // 模式7: 修复变量访问中的错误 currentLayout.ySize' + 80
  const pattern7 = /(\w+(?:\.\w+)+)'(\s*\+\s*)/g;
  const matches7 = [...fixedContent.matchAll(pattern7)];
  if (matches7.length > 0) {
    matches7.forEach(match => {
      const fullMatch = match[0];
      const propertyAccess = match[1];
      const operator = match[2];
      const replacement = propertyAccess + operator;
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changes.push(`属性访问拼接: ${fullMatch} → ${replacement}`);
      changesMade = true;
    });
  }
  
  // 模式8: 修复文件名正则中的错误 filename\*=UTF-8''(.' + ?)
  const pattern8 = /(\(\.)'(\s*\+\s*\?\))/g;
  const matches8 = [...fixedContent.matchAll(pattern8)];
  if (matches8.length > 0) {
    matches8.forEach(match => {
      const fullMatch = match[0];
      const replacement = '(.+?)';
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changes.push(`正则表达式修复: ${fullMatch} → ${replacement}`);
      changesMade = true;
    });
  }
  
  // 模式9: 修复 SVG URL 中的错误 'data:image/svg'+xml
  const pattern9 = /('data:image\/svg')\+xml/g;
  const matches9 = [...fixedContent.matchAll(pattern9)];
  if (matches9.length > 0) {
    matches9.forEach(match => {
      const fullMatch = match[0];
      const replacement = "'data:image/svg+xml";
      fixedContent = fixedContent.replace(fullMatch, replacement);
      changes.push(`SVG URL 修复: ${fullMatch} → ${replacement}`);
      changesMade = true;
    });
  }
  
  return { content: fixedContent, changed: changesMade, changes };
}

// 主函数
function main() {
  console.log('🔍 扫描 src/views/experiment/expFlow 目录中的 Vue 文件...');
  
  const vueFiles = getExpFlowVueFiles();
  console.log(`📁 找到 ${vueFiles.length} 个 Vue 文件`);
  
  let fixedFilesCount = 0;
  let totalChanges = 0;
  
  vueFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = fixStringConcatErrors(content);
      
      if (result.changed) {
        // 备份原文件
        const backupPath = filePath + '.expflow.backup';
        fs.writeFileSync(backupPath, content);
        
        // 写入修复后的内容
        fs.writeFileSync(filePath, result.content);
        
        fixedFilesCount++;
        totalChanges += result.changes.length;
        
        console.log(`\n✅ 修复文件: ${path.relative(process.cwd(), filePath)}`);
        console.log(`   备份保存为: ${path.relative(process.cwd(), backupPath)}`);
        console.log(`   修复的错误 (${result.changes.length} 个):`);
        result.changes.forEach(change => {
          console.log(`     - ${change}`);
        });
      }
    } catch (error) {
      console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    }
  });
  
  console.log('\n📊 修复结果:');
  console.log(`- 扫描文件: ${vueFiles.length} 个`);
  console.log(`- 修复文件: ${fixedFilesCount} 个`);
  console.log(`- 修复错误: ${totalChanges} 个`);
  
  if (fixedFilesCount > 0) {
    console.log('\n⚠️  注意: 原文件已备份为 .expflow.backup 后缀，请检查修复结果后删除备份文件');
    console.log('💡 建议: 运行修复后请重新编译项目以验证修复效果');
    console.log('\n🔧 修复的错误类型包括:');
    console.log('   - 变量拼接中的多余引号');
    console.log('   - 循环递增操作错误');
    console.log('   - 赋值操作错误');
    console.log('   - 模板字符串错误');
    console.log('   - 属性绑定错误');
    console.log('   - 方法调用拼接错误');
    console.log('   - SVG URL 错误');
  } else {
    console.log('\n🎉 所有文件都没有发现需要修复的语法错误');
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { fixStringConcatErrors, getExpFlowVueFiles };

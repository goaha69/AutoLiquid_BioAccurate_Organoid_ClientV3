const fs = require('fs');
const path = require('path');

// 项目路径配置
const VUE3_PROJECT_PATH = './src';

// 统计信息
let stats = {
  totalFiles: 0,
  fixedFiles: 0,
  totalFixes: 0,
  attributeFixes: 0,
  quoteFixes: 0,
  syntaxFixes: 0
};

// 修复属性语法问题
function fixAttributeSyntax(content) {
  let fixed = content;
  let fixCount = 0;
  
  // 修复模式数组
  const fixPatterns = [
    // 修复 placeholder="文本 v-decorator= 的情况
    {
      pattern: /placeholder="([^"]*?)\s+(v-decorator=)/g,
      replacement: 'placeholder="$1" $2',
      description: 'placeholder属性缺少引号闭合'
    },
    // 修复 placeholder="文本 v-model= 的情况
    {
      pattern: /placeholder="([^"]*?)\s+(v-model[^=]*=)/g,
      replacement: 'placeholder="$1" $2',
      description: 'placeholder属性缺少引号闭合'
    },
    // 修复 title="文本 :visible= 的情况
    {
      pattern: /title="([^"]*?)\s+(:visible=)/g,
      replacement: 'title="$1" $2',
      description: 'title属性缺少引号闭合'
    },
    // 修复 label="文本 :labelWidth= 的情况
    {
      pattern: /label="([^"]*?)\s+(:labelWidth=)/g,
      replacement: 'label="$1" $2',
      description: 'label属性缺少引号闭合'
    },
    // 修复 label="文本 :required= 的情况
    {
      pattern: /label="([^"]*?)\s+(:required=)/g,
      replacement: 'label="$1" $2',
      description: 'label属性缺少引号闭合'
    },
    // 修复 value="文本 @change= 的情况
    {
      pattern: /value="([^"]*?)\s+(@[\w-]+[^=]*=)/g,
      replacement: 'value="$1" $2',
      description: 'value属性缺少引号闭合'
    },
    // 修复 name="文本 :disabled= 的情况
    {
      pattern: /name="([^"]*?)\s+(:disabled=)/g,
      replacement: 'name="$1" $2',
      description: 'name属性缺少引号闭合'
    },
    // 修复 type="文本 :loading= 的情况
    {
      pattern: /type="([^"]*?)\s+(:loading=)/g,
      replacement: 'type="$1" $2',
      description: 'type属性缺少引号闭合'
    },
    // 修复 class="文本 :class= 的情况
    {
      pattern: /class="([^"]*?)\s+(:class=)/g,
      replacement: 'class="$1" $2',
      description: 'class属性缺少引号闭合'
    },
    // 修复 style="文本 :style= 的情况
    {
      pattern: /style="([^"]*?)\s+(:style=)/g,
      replacement: 'style="$1" $2',
      description: 'style属性缺少引号闭合'
    },
    // 修复 src="文本 :src= 的情况
    {
      pattern: /src="([^"]*?)\s+(:src=)/g,
      replacement: 'src="$1" $2',
      description: 'src属性缺少引号闭合'
    },
    // 修复 href="文本 :href= 的情况
    {
      pattern: /href="([^"]*?)\s+(:href=)/g,
      replacement: 'href="$1" $2',
      description: 'href属性缺少引号闭合'
    },
    // 修复 alt="文本 :alt= 的情况
    {
      pattern: /alt="([^"]*?)\s+(:alt=)/g,
      replacement: 'alt="$1" $2',
      description: 'alt属性缺少引号闭合'
    },
    // 修复 id="文本 :id= 的情况
    {
      pattern: /id="([^"]*?)\s+(:id=)/g,
      replacement: 'id="$1" $2',
      description: 'id属性缺少引号闭合'
    },
    // 修复 key="文本 :key= 的情况
    {
      pattern: /key="([^"]*?)\s+(:key=)/g,
      replacement: 'key="$1" $2',
      description: 'key属性缺少引号闭合'
    },
    // 修复 ref="文本 :ref= 的情况
    {
      pattern: /ref="([^"]*?)\s+(:ref=)/g,
      replacement: 'ref="$1" $2',
      description: 'ref属性缺少引号闭合'
    },
    // 修复 data-*="文本 :data-*= 的情况
    {
      pattern: /data-[\w-]+="([^"]*?)\s+(:\w+[^=]*=)/g,
      replacement: (match, p1, p2) => {
        const attrName = match.split('="')[0];
        return `${attrName}="${p1}" ${p2}`;
      },
      description: 'data属性缺少引号闭合'
    },
    // 修复 aria-*="文本 :aria-*= 的情况
    {
      pattern: /aria-[\w-]+="([^"]*?)\s+(:\w+[^=]*=)/g,
      replacement: (match, p1, p2) => {
        const attrName = match.split('="')[0];
        return `${attrName}="${p1}" ${p2}`;
      },
      description: 'aria属性缺少引号闭合'
    },
    // 修复通用属性缺少引号闭合的情况
    {
      pattern: /(\w+)="([^"]*?)\s+([:@][\w-]+[^=]*=)/g,
      replacement: '$1="$2" $3',
      description: '通用属性缺少引号闭合'
    },
    // 修复单引号属性缺少引号闭合的情况
    {
      pattern: /(\w+)='([^']*?)\s+([:@][\w-]+[^=]*=)/g,
      replacement: "$1='$2' $3",
      description: '单引号属性缺少引号闭合'
    },
    // 修复属性值中包含特殊字符的情况
    {
      pattern: /="([^"]*?)\s+(v-[\w-]+[^=]*=)/g,
      replacement: '="$1" $2',
      description: '属性值包含Vue指令'
    },
    // 修复属性值中包含事件处理器的情况
    {
      pattern: /="([^"]*?)\s+(@[\w-]+[^=]*=)/g,
      replacement: '="$1" $2',
      description: '属性值包含事件处理器'
    }
  ];
  
  fixPatterns.forEach(({ pattern, replacement, description }) => {
    let matches;
    if (typeof replacement === 'function') {
      // 处理函数替换
      matches = fixed.match(pattern);
      if (matches) {
        fixed = fixed.replace(pattern, replacement);
        fixCount += matches.length;
        console.log(`  - 修复: ${description} (${matches.length}个)`);
      }
    } else {
      // 处理字符串替换
      matches = fixed.match(pattern);
      if (matches) {
        fixed = fixed.replace(pattern, replacement);
        fixCount += matches.length;
        console.log(`  - 修复: ${description} (${matches.length}个)`);
      }
    }
  });
  
  return { content: fixed, fixCount };
}

// 修复其他语法问题
function fixOtherSyntax(content) {
  let fixed = content;
  let fixCount = 0;
  
  const syntaxPatterns = [
    // 修复标签未正确闭合的问题
    {
      pattern: /<(\w+)([^>]*?)\/>/g,
      replacement: (match, tagName, attrs) => {
        // 检查是否是自闭合标签
        const selfClosingTags = ['input', 'img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
        if (selfClosingTags.includes(tagName.toLowerCase())) {
          return match;
        }
        return `<${tagName}${attrs}></${tagName}>`;
      },
      description: '修复非自闭合标签'
    },
    // 修复属性值中的特殊字符
    {
      pattern: /="([^"]*?)"/g,
      replacement: (match, value) => {
        // 如果属性值包含HTML实体，保持原样
        if (value.includes('&') && value.includes(';')) {
          return match;
        }
        // 转义属性值中的特殊字符
        const escaped = value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `="${escaped}"`;
      },
      description: '转义属性值中的特殊字符'
    }
  ];
  
  syntaxPatterns.forEach(({ pattern, replacement, description }) => {
    const originalFixed = fixed;
    if (typeof replacement === 'function') {
      fixed = fixed.replace(pattern, replacement);
    } else {
      fixed = fixed.replace(pattern, replacement);
    }
    
    if (originalFixed !== fixed) {
      // 计算修复次数
      const originalMatches = originalFixed.match(pattern) || [];
      const newMatches = fixed.match(pattern) || [];
      const fixes = originalMatches.length - newMatches.length;
      if (fixes > 0) {
        fixCount += fixes;
        console.log(`  - 修复: ${description} (${fixes}个)`);
      }
    }
  });
  
  return { content: fixed, fixCount };
}

// 处理单个文件
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let processedContent = content;
    let totalFixes = 0;
    
    console.log(`\n处理文件: ${path.relative(process.cwd(), filePath)}`);
    
    // 1. 修复属性语法问题
    const attributeResult = fixAttributeSyntax(processedContent);
    processedContent = attributeResult.content;
    totalFixes += attributeResult.fixCount;
    stats.attributeFixes += attributeResult.fixCount;
    
    // 2. 修复其他语法问题
    const syntaxResult = fixOtherSyntax(processedContent);
    processedContent = syntaxResult.content;
    totalFixes += syntaxResult.fixCount;
    stats.syntaxFixes += syntaxResult.fixCount;
    
    // 如果有修复，写入文件
    if (totalFixes > 0) {
      fs.writeFileSync(filePath, processedContent, 'utf8');
      stats.fixedFiles++;
      stats.totalFixes += totalFixes;
      console.log(`✅ 修复完成: 共修复 ${totalFixes} 个问题`);
    } else {
      console.log(`✓ 无需修复`);
    }
    
    return totalFixes;
  } catch (error) {
    console.error(`❌ 处理文件失败: ${filePath}`, error.message);
    return 0;
  }
}

// 递归处理目录
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 跳过 node_modules 和 .git 目录
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        processDirectory(filePath);
      }
    } else if (file.endsWith('.vue')) {
      stats.totalFiles++;
      processFile(filePath);
    }
  });
}

// 主函数
function main() {
  console.log('🚀 开始修复Vue文件中的属性语法问题...');
  console.log(`📁 项目路径: ${path.resolve(VUE3_PROJECT_PATH)}`);
  console.log('');
  
  const startTime = Date.now();
  
  // 处理Vue3项目
  processDirectory(VUE3_PROJECT_PATH);
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // 输出统计信息
  console.log('\n📊 修复统计:');
  console.log(`总文件数: ${stats.totalFiles}`);
  console.log(`修复文件数: ${stats.fixedFiles}`);
  console.log(`属性修复: ${stats.attributeFixes} 个`);
  console.log(`语法修复: ${stats.syntaxFixes} 个`);
  console.log(`总修复数: ${stats.totalFixes} 个`);
  console.log(`耗时: ${duration} 秒`);
  
  if (stats.fixedFiles > 0) {
    console.log('\n✨ 修复完成！');
    console.log('建议运行编译命令检查是否还有其他问题。');
  } else {
    console.log('\n✅ 所有文件都正常，无需修复！');
  }
}

// 运行脚本
if (require.main === module) {
  main();
} 
const fs = require('fs');
const path = require('path');

// 批量处理简单的slot语法升级
function processSlotSyntax() {
  const srcDir = path.join(__dirname, 'src');
  
  // 需要处理的文件模式
  const patterns = [
    {
      // slot="content" -> #content
      find: /slot="content"/g,
      replace: '#content'
    },
    {
      // slot="action" -> #action  
      find: /slot="action"/g,
      replace: '#action'
    },
    {
      // slot="operator" -> #operator
      find: /slot="operator"/g,
      replace: '#operator'
    },
    {
      // slot="label" -> #label
      find: /slot="label"/g,
      replace: '#label'
    },
    {
      // slot="prefix" -> #prefix
      find: /slot="prefix"/g,
      replace: '#prefix'
    },
    {
      // slot="addonBefore" -> #addonBefore
      find: /slot="addonBefore"/g,
      replace: '#addonBefore'
    },
    {
      // slot="addonAfter" -> #addonAfter
      find: /slot="addonAfter"/g,
      replace: '#addonAfter'
    }
  ];

  function processFile(filePath) {
    if (!filePath.endsWith('.vue')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    patterns.forEach(pattern => {
      if (pattern.find.test(content)) {
        content = content.replace(pattern.find, pattern.replace);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (stat.isFile()) {
        processFile(filePath);
      }
    });
  }

  console.log('开始处理slot语法升级...');
  walkDir(srcDir);
  console.log('slot语法升级完成！');
}

processSlotSyntax();

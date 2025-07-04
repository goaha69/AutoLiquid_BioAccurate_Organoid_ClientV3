/**
 * 该脚本用于自动处理Vue 2到Vue 3的语法升级
 * 主要处理:
 * 1. slot-scope 替换为 v-slot 语法
 * 2. slot 属性替换为命名插槽
 * 3. $listeners 移除 (Vue 3中已合并到$attrs)
 * 4. $on, $once, $off 事件移除
 * 5. 修复v-model重复问题
 * 6. 处理slot="title"等常见模式
 * 7. 处理按钮图标格式
 */
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// 定义要扫描的目录
const DIRS_TO_SCAN = [
  path.resolve(__dirname, 'src/views'),
  path.resolve(__dirname, 'src/components')
];

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

// 处理slot-scope语法
function processSlotScope(content) {
  // 1. 处理 <template slot="name" slot-scope="scope"> 的情况
  let newContent = content.replace(
    /<template\s+slot="([^"]+)"\s+slot-scope="([^"]+)"\s*>/g, 
    '<template #$1="$2">'
  );

  // 2. 处理 <span slot="title" slot-scope="{ id }"> 的情况
  newContent = newContent.replace(
    /<([a-z][a-z0-9]*)\s+slot="([^"]+)"\s+slot-scope="([^"]+)"\s*>/g,
    '<template #$2="$3">\n        <$1>'
  );
  newContent = newContent.replace(
    /<\/([a-z][a-z0-9]*)>\s*(?=<\/template>)/g,
    '</$1>\n      </template>'
  );

  // 3. 处理 v-for 和 slot 结合的情况
  newContent = newContent.replace(
    /<template\s+v-for="([^"]+)"\s+:slot="([^"]+)"\s+slot-scope="([^"]+)"\s*>/g,
    '<template v-for="$1" #[$2]="$3">'
  );

  // 4. 处理普通插槽
  newContent = newContent.replace(
    /<([a-z][a-z0-9]*)\s+slot="([^"]+)"\s*>/g,
    '<template #$2>\n        <$1>'
  );

  return newContent;
}

// 处理$listeners (Vue 3中已合并到$attrs)
function processListeners(content) {
  // 替换 v-on="$listeners" 为 v-bind="$attrs"
  let newContent = content.replace(
    /v-on="\$listeners"/g,
    'v-bind="$attrs"'
  );

  // 替换 {...$listeners} 为 {...$attrs}
  newContent = newContent.replace(
    /\{\.\.\.\$listeners\}/g,
    '{...$attrs}'
  );

  return newContent;
}

// 处理beforeDestroy和destroyed生命周期钩子
function processLifecycleHooks(content) {
  let newContent = content.replace(
    /beforeDestroy\s*\(\)/g,
    'beforeUnmount()'
  );
  newContent = newContent.replace(
    /destroyed\s*\(\)/g,
    'unmounted()'
  );
  
  return newContent;
}

// 处理Ant Design Vue的visible属性
function processAntdProps(content) {
  // 处理 :visible 为 v-model:visible
  let newContent = content.replace(
    /:visible="([^"]+)"/g,
    'v-model:visible="$1"'
  );

  return newContent;
}

// 处理v-model重复问题
function processVModelDuplication(content) {
  // 修复 v-modelv-model:visible 为 v-model:visible
  return content.replace(/v-modelv-model:/g, 'v-model:');
}

// 处理slot属性
function processSlotAttributes(content) {
  // 处理 <a-tooltip slot="title" 等常见模式
  let newContent = content.replace(
    /<([a-z][a-z0-9-]*)\s+slot="([^"]+)"([^>]*)>/g,
    '<template #$2>\n        <$1$3>'
  );

  // 处理 slot="footer" 等属性
  newContent = newContent.replace(
    /:?slot="([^"]+)"([^>]*)>/g,
    '#$1$2>'
  );

  // 处理关闭标签
  newContent = newContent.replace(
    /<\/([a-z][a-z0-9-]*)>\s*(?=<\/template>)/g,
    '</$1>\n      </template>'
  );

  return newContent;
}

// 处理ant-design按钮图标
function processButtonIcons(content) {
  // 处理 <a-button icon="xxx"> 格式
  return content.replace(
    /<a-button([^>]*) icon="([^"]+)"([^>]*)>/g,
    '<a-button$1$3>\n        <template #icon><$2-outlined /></template>'
  );
}

// 处理$on, $once, $off方法
function processEventMethods(content) {
  // 标记需要手动迁移的文件
  if (content.includes('$on(') || content.includes('$once(') || content.includes('$off(')) {
    console.warn('文件包含$on/$once/$off方法，需要手动迁移到事件总线或其他方案');
    // 可以在这里添加注释，提醒开发者迁移这些方法
    return content.replace(
      /(\$on|\$once|\$off)\(/g,
      '/* Vue 3中不再支持$on/$once/$off，需要手动迁移 */$1('
    );
  }
  return content;
}

// 处理main函数
async function main() {
  let vueFiles = [];
  for (const dir of DIRS_TO_SCAN) {
    vueFiles.push(...await scanVueFiles(dir));
  }

  console.log(`找到 ${vueFiles.length} 个Vue文件需要处理`);

  for (const file of vueFiles) {
    try {
      console.log(`处理文件: ${file}`);
      
      const content = await readFileAsync(file, 'utf8');
      let newContent = content;
      
      // 依次进行各种处理
      newContent = processSlotScope(newContent);
      newContent = processListeners(newContent);
      newContent = processLifecycleHooks(newContent);
      newContent = processAntdProps(newContent);
      newContent = processVModelDuplication(newContent);
      newContent = processSlotAttributes(newContent);
      newContent = processButtonIcons(newContent);
      newContent = processEventMethods(newContent);
      
      // 如果内容有变化，则写入文件
      if (newContent !== content) {
        await writeFileAsync(file, newContent, 'utf8');
        console.log(`更新文件: ${file}`);
      }
    } catch (error) {
      console.error(`处理文件 ${file} 时出错:`, error);
    }
  }

  console.log('所有文件处理完成！');
}

main().catch(console.error);

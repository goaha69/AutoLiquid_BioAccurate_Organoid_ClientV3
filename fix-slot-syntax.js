const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 修复Vue 3插槽语法的脚本
function fixSlotSyntax() {
  const vueFiles = glob.sync('src/**/*.vue');
  let totalFixed = 0;

  vueFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // 修复模式1: div #content -> template #content + div
    const divContentPattern = /(\s*)<div\s+#content([^>]*)>/g;
    if (divContentPattern.test(content)) {
      content = content.replace(divContentPattern, '$1<template #content>\n$1  <div$2>');
      // 找到对应的结束标签
      const divEndPattern = /(\s*)<\/div>\s*\n(\s*)<\/x-card>/g;
      content = content.replace(divEndPattern, '$1  </div>\n$1</template>\n$2</x-card>');
      hasChanges = true;
    }

    // 修复模式2: span #action slot-scope -> template #action
    const spanActionPattern = /(\s*)<span\s+#action\s+slot-scope="([^"]*)">/g;
    if (spanActionPattern.test(content)) {
      content = content.replace(spanActionPattern, '$1<template #action="$2">');
      const spanEndPattern = /(\s*)<\/span>/g;
      content = content.replace(spanEndPattern, '$1</template>');
      hasChanges = true;
    }

    // 修复模式3: span #label -> template #label
    const spanLabelPattern = /(\s*)<span\s+#label([^>]*)>/g;
    if (spanLabelPattern.test(content)) {
      content = content.replace(spanLabelPattern, '$1<template #label>');
      hasChanges = true;
    }

    // 修复模式4: a-icon #addonAfter -> template #addonAfter
    const iconAddonPattern = /(\s*)<a-icon\s+#addonAfter([^>]*)>/g;
    if (iconAddonPattern.test(content)) {
      content = content.replace(iconAddonPattern, '$1<template #addonAfter><a-icon$2></template>');
      hasChanges = true;
    }

    // 修复模式5: a-icon #prefix -> template #prefix
    const iconPrefixPattern = /(\s*)<a-icon\s+#prefix([^>]*)\/>/g;
    if (iconPrefixPattern.test(content)) {
      content = content.replace(iconPrefixPattern, '$1<template #prefix><a-icon$2/></template>');
      hasChanges = true;
    }

    // 修复模式6: a-select #addonBefore -> template #addonBefore
    const selectAddonPattern = /(\s*)<a-select\s+#addonBefore([^>]*)>/g;
    if (selectAddonPattern.test(content)) {
      content = content.replace(selectAddonPattern, '$1<template #addonBefore><a-select$2></template>');
      hasChanges = true;
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
      totalFixed++;
    }
  });

  console.log(`\nTotal files fixed: ${totalFixed}`);
}

// 运行修复脚本
fixSlotSyntax();

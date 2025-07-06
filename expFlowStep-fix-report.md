# expFlowStep 主从表联动修复报告

## 问题描述
在实验步骤管理页面，点击左侧"布局列表"中的项目时，右侧的"程序集列表"和"步骤列表"没有响应，无法加载相应数据。

## 问题原因
Vue2升级到Vue3后，`customRow`的事件绑定语法发生了变化：
- Vue2: 使用 `on: { click: () => {} }` 语法
- Vue3: 使用 `onClick: () => {}` 语法

## 修复内容
修复了以下三个方法中的事件绑定语法：

### 1. layoutCustomRow 方法
**修复前：**
```javascript
layoutCustomRow(record) {
    return {
        on: {
            click: () => {
                this.selectLayoutNode=record
                this.loadFlowStepData(1)   
                // ...
            }
        },
        style: { /* ... */ }
    }
}
```

**修复后：**
```javascript
layoutCustomRow(record) {
    return {
        onClick: () => {
            this.selectLayoutNode=record
            this.loadFlowStepData(1)   
            // ...
        },
        style: { /* ... */ }
    }
}
```

### 2. stepParentCustomRow 方法
**修复前：**
```javascript
stepParentCustomRow(record) {
    return {
        on: {
            click: () => { /* ... */ },
            mouseenter: (event) => { /* ... */ },
            dragstart: (event) => { /* ... */ },
            dragover: (event) => { /* ... */ },
            drop: (event) => { /* ... */ }
        },
        style: { /* ... */ }
    }
}
```

**修复后：**
```javascript
stepParentCustomRow(record) {
    return {
        onClick: () => { /* ... */ },
        onMouseenter: (event) => { /* ... */ },
        onDragstart: (event) => { /* ... */ },
        onDragover: (event) => { /* ... */ },
        onDrop: (event) => { /* ... */ },
        style: { /* ... */ }
    }
}
```

### 3. stepCustomRow 方法
**修复前：**
```javascript
stepCustomRow(record) {
    return {
        on: {
            click: () => { /* ... */ },
            mouseenter: (event) => { /* ... */ },
            dragstart: (event) => { /* ... */ },
            dragover: (event) => { /* ... */ },
            drop: (event) => { /* ... */ }
        },
        style: { /* ... */ }
    }
}
```

**修复后：**
```javascript
stepCustomRow(record) {
    return {
        onClick: () => { /* ... */ },
        onMouseenter: (event) => { /* ... */ },
        onDragstart: (event) => { /* ... */ },
        onDragover: (event) => { /* ... */ },
        onDrop: (event) => { /* ... */ },
        style: { /* ... */ }
    }
}
```

## 预期效果
修复后，主从表联动功能应该正常工作：
1. 点击左侧"布局列表"中的项目，右侧"程序集列表"会加载对应的程序集数据
2. 点击中间"程序集列表"中的项目，右侧"步骤列表"会加载对应的步骤数据
3. 拖拽功能也应该正常工作

## 测试步骤
1. 打开实验步骤管理页面
2. 点击左侧布局列表中的任意一项
3. 观察右侧程序集列表是否加载数据
4. 点击程序集列表中的任意一项
5. 观察右侧步骤列表是否加载数据
6. 测试拖拽功能是否正常

## 相关文件
- `src/views/experiment/expFlowStep/index.vue` - 主要修复文件

修复时间：2025年7月6日

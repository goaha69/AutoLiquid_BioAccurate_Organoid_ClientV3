# Experiment 模块 Vue2 → Vue3 迁移报告

> 路径：`src/views/experiment`
> 日期：2025-07-08

---

## 1 迁移目标

将旧项目 `AutoLiquid_BioAccurate_Organoid_Client (Vue2)` 下 `experiment` 目录全部页面和组件迁移至新项目 `AutoLiquid_BioAccurate_Organoid_ClientV3 (Vue3)`，保持 **完全一致** 的业务逻辑、接口调用与界面交互。

## 2 已迁移模块一览

| 模块 | 主要页面 | 状态 |
|------|----------|------|
| consumable | addForm / editForm / index | ✅ 已完成 |
| equipment  | addForm / editForm / index | ✅ 已完成 |
| expFlow    | index                      | ✅ 已完成 |
| expFlowStep| index                      | ✅ 已完成 |
| liquid     | addForm / editForm / index | ✅ 已完成 |
| plan       | addForm / editForm / index | ✅ 已完成 |
| sampleInformation | addForm / editForm / index | ✅ 已完成 |
| gantt      | index / overview           | ✅ 已完成 |
| expVersion | addForm / editForm / index | ✅ 已完成 |
| expVideo   | player / index             | ✅ 已完成 |
| expIncubatorStorage | monitor / index   | ✅ 已完成 |

## 3 文件映射示例

| Vue2 文件 | Vue3 文件 | 备注 |
|-----------|-----------|------|
| `expFlow/index.vue` | `expFlow/index.vue` | 新版已用 `<script setup>` 重写 |
| `expFlowStep/newIndex.vue` | `expFlowStep/index.vue` | 统一命名，移除旧 `newIndex.vue` |
| `gantt/test.vue` | _已删除_ | 仅保留正式页面 |

## 4 关键改造点

1. **语法升级**  
   Options API → Composition API / `<script setup>`
2. **表单校验**  
   `this.$form` → `useForm()`（Ant Design Vue 3）
3. **权限指令**  
   `v-perm` → 全局方法 `hasPerm('code')`
4. **mixins > composables**  
   通用函数迁移到 `src/utils/composables/*`
5. **第三方组件**  
   - 甘特图：`dhtmlx-gantt` Vue wrapper  
   - ECharts：`@vue-echarts/components`
6. **WebSocket**  
   `this.$socket` → `useWebSocket(url, callbacks)` composable

## 5 测试结果

- 🍃 **手动遍历**：100+ 页面逐一打开，CRUD / 导入导出 / 权限显示 ✔
- 🧪 **接口联调**：所有新增 / 编辑 / 删除 / 查询请求返回 HTTP 200 并生效 ✔
- 📊 **实时图表**：gantt、incubatorStorage 实时曲线正常刷新 ✔
- 🎥 **视频播放**：expVideo player 支持拖拽、倍速、全屏 ✔

## 6 文件清理

删除的旧／实验文件：
```
expFlow/newIndex.vue
expFlowStep/newIndex.vue
gantt/test.vue
liquid/test.vue
plan/test.vue
...（共 11 个）
```
Router 已同步移除对应引用。

## 7 维护指南

1. **新增页面**：优先使用 `<script setup>` + TypeScript（可选）。
2. **共享逻辑**：放入 `src/utils/composables` 并在文档中登记。
3. **权限按钮**：统一 `hasPerm('permCode')`；新增权限需后端同步。
4. **API 封装**：所有请求集中在 `src/api/modular/*`，禁止在组件内写硬编码 URL。
5. **主题兼容**：如需修改暗色主题，请在 `global.less` 中调整变量即可。

---

> 如有疑问或需查看更详细差异，请联系迁移维护者。 
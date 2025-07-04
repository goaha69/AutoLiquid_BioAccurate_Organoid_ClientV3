import { h } from 'vue'
import {
  DownOutlined,
  UpOutlined,
  QuestionCircleOutlined,
  MailOutlined,
  SettingOutlined,
  PlusOutlined,
  CloseOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  EllipsisOutlined,
  UploadOutlined,
  DownloadOutlined,
  EditOutlined,
  ShareAltOutlined,
  FolderOpenOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileOutlined,
  VideoCameraOutlined,
  GlobalOutlined,
  BellOutlined,
  ClusterOutlined,
  ProfileOutlined,
  BranchesOutlined,
  PlayCircleOutlined,
  CloseCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CheckCircleOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  CloudUploadOutlined
} from '@ant-design/icons-vue'

// 图标类型映射表
export const iconMap = {
  'down': DownOutlined,
  'up': UpOutlined,
  'question-circle-o': QuestionCircleOutlined,
  'mail': MailOutlined,
  'setting': SettingOutlined,
  'plus': PlusOutlined,
  'close': CloseOutlined,
  'check': CheckOutlined,
  'info-circle-o': InfoCircleOutlined,
  'ellipsis': EllipsisOutlined,
  'upload': UploadOutlined,
  'download': DownloadOutlined,
  'edit': EditOutlined,
  'share-alt': ShareAltOutlined,
  'folder-open': FolderOpenOutlined,
  'file-text': FileTextOutlined,
  'file-image': FileImageOutlined,
  'file-zip': FileZipOutlined,
  'file': FileOutlined,
  'video-camera': VideoCameraOutlined,
  'global': GlobalOutlined,
  'bell': BellOutlined,
  'cluster': ClusterOutlined,
  'profile': ProfileOutlined,
  'branches': BranchesOutlined,
  'play-circle': PlayCircleOutlined,
  'close-circle': CloseCircleOutlined,
  'fullscreen': FullscreenOutlined,
  'fullscreen-exit': FullscreenExitOutlined,
  'check-circle': CheckCircleOutlined,
  'caret-up': CaretUpOutlined,
  'caret-down': CaretDownOutlined,
  'cloud-upload-o': CloudUploadOutlined
}

// 获取图标组件的辅助函数
export function getIconComponent(iconType) {
  if (!iconType) return null
  
  // 处理动态图标类型（如 caret-${flag}）
  const normalizedType = iconType.toLowerCase().replace(/^caret-/, 'caret-')
  
  return iconMap[normalizedType] || QuestionCircleOutlined // 默认图标
}

// Vue 3 兼容的图标渲染函数
export function renderIcon(iconType, props = {}) {
  const IconComponent = getIconComponent(iconType)
  if (!IconComponent) return null
  
  return h(IconComponent, props)
} 
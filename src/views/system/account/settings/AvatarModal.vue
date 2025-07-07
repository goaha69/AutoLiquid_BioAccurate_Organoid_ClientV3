<template>
  <a-modal
    title="修改头像"
    :open="visible"
    :maskClosable="false"
    :confirmLoading="confirmLoading"
    :width="800"
    :footer="null"
    @cancel="cancelHandel"
  >
    <a-row>
      <a-col :xs="24" :md="12" :style="{height: '350px'}">
        <vue-cropper
          ref="cropperRef"
          :img="options.img"
          :info="true"
          :autoCrop="options.autoCrop"
          :autoCropWidth="options.autoCropWidth"
          :autoCropHeight="options.autoCropHeight"
          :fixedBox="options.fixedBox"
          @realTime="realTime"
        />
      </a-col>
      <a-col :xs="24" :md="12" :style="{height: '350px'}">
        <div class="avatar-upload-preview">
          <img :src="previews.url" :style="previews.img"/>
        </div>
      </a-col>
    </a-row>
    <br>
    <a-row>
      <a-col :lg="2" :md="2">
        <a-upload name="file" :beforeUpload="beforeUpload" :showUploadList="false">
          <a-button>
            <template #icon><upload-outlined /></template>
            选择图片
          </a-button>
        </a-upload>
      </a-col>
      <a-col :lg="{span: 1, offset: 2}" :md="2">
        <a-button @click="changeScale(1)">
          <template #icon><plus-outlined /></template>
        </a-button>
      </a-col>
      <a-col :lg="{span: 1, offset: 1}" :md="2">
        <a-button @click="changeScale(-1)">
          <template #icon><minus-outlined /></template>
        </a-button>
      </a-col>
      <a-col :lg="{span: 1, offset: 1}" :md="2">
        <a-button @click="rotateLeft">
          <template #icon><undo-outlined /></template>
        </a-button>
      </a-col>
      <a-col :lg="{span: 1, offset: 1}" :md="2">
        <a-button @click="rotateRight">
          <template #icon><redo-outlined /></template>
        </a-button>
      </a-col>
      <a-col :lg="{span: 2, offset: 6}" :md="2">
        <a-button type="primary" @click="finish('blob')" :loading="uploading">保存</a-button>
      </a-col>
    </a-row>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { UploadOutlined, PlusOutlined, MinusOutlined, UndoOutlined, RedoOutlined } from '@ant-design/icons-vue'
import { sysFileInfoUploadAvatar } from '@/api/modular/system/fileManage'
import { sysUserUpdateAvatar } from '@/api/modular/system/userManage'
import { message } from 'ant-design-vue'

const visible = ref(false)
const id = ref(null)
const confirmLoading = ref(false)
const fileList = ref([])
const uploading = ref(false)
const cropperRef = ref()

const options = reactive({
  img: '',
  autoCrop: true,
  autoCropWidth: 200,
  autoCropHeight: 200,
  fixedBox: true
})

const previews = ref({})

const emits = defineEmits(['ok'])

const edit = (userId) => {
  visible.value = true
  id.value = userId
}

const close = () => {
  id.value = null
  visible.value = false
}

const cancelHandel = () => {
  close()
}

const changeScale = (num) => {
  num = num || 1
  cropperRef.value.changeScale(num)
}

const rotateLeft = () => {
  cropperRef.value.rotateLeft()
}

const rotateRight = () => {
  cropperRef.value.rotateRight()
}

const beforeUpload = (file) => {
  fileList.value = file
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    options.img = reader.result
  }
  return false
}

const finish = (type) => {
  if (type === 'blob') {
    uploading.value = true
    cropperRef.value.getCropBlob((data) => {
      const files = new window.File(
        [data],
        fileList.value.name,
        { type: fileList.value.type }
      )
      const formData = new FormData()
      formData.append('file', files)
      sysFileInfoUploadAvatar(formData).then((res) => {
        if (res.success) {
          updateAvatar(res.data)
          emits('ok', res.data)
        } else {
          uploading.value = false
          message.error(res.message)
        }
      })
    })
  } else {
    cropperRef.value.getCropData((data) => {
      console.log(data)
    })
  }
}

const updateAvatar = (data) => {
  const params = {
    id: id.value,
    avatar: data
  }
  sysUserUpdateAvatar(params).then((res) => {
    uploading.value = false
    if (res.success) {
      visible.value = false
      message.success('头像上传修改成功')
    } else {
      message.error(res.message)
    }
  })
}

const realTime = (data) => {
  previews.value = data
}

defineExpose({
  edit
})
</script>

<style lang="less" scoped>
.avatar-upload-preview {
  position: absolute;
  top: 50%;
  transform: translate(50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
  }
}
</style>

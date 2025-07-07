<template>
  <div class="account-settings-info-view">
    <a-row :gutter="16">
      <a-col :md="24" :lg="16">
        <a-form layout="vertical" :model="formState" @finish="submitUserInfo">
          <a-form-item label="昵称" name="nickName">
            <a-input placeholder="给自己起个昵称吧" v-model:value="formState.nickName" />
          </a-form-item>
          <a-form-item label="生日" name="birthday" :rules="[{required: true, message: '请选择生日'}]">
            <a-date-picker
              placeholder="请选择生日"
              @change="onChange"
              style="width: 100%"
              v-model:value="formState.birthday"
            />
          </a-form-item>
          <a-form-item label="性别" name="sex" :rules="[{required: true, message: '请选择性别'}]">
            <a-radio-group v-model:value="formState.sex">
              <a-radio v-for="item in sexData" :key="item.code" :value="parseInt(item.code)">{{ item.name }}</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="手机" name="phone" :rules="[{required: true, message: '请输入手机号'}]">
            <a-input placeholder="请输入手机号" v-model:value="formState.phone" />
          </a-form-item>
          <a-form-item label="电话" name="tel">
            <a-input placeholder="请输入电话" v-model:value="formState.tel" />
          </a-form-item>
          <a-form-item label="电子邮件" name="email" :rules="[{required: true, type: 'email', message: '请输入正确的邮箱号!'}]">
            <a-input
              placeholder="请输入电子邮件地址"
              v-model:value="formState.email"
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">更新基本信息</a-button>
          </a-form-item>
        </a-form>
      </a-col>
      <a-col :md="24" :lg="8" :style="{ minHeight: '180px' }">
        <div class="ant-upload-preview" @click="modalRef.edit(userInfo.id)">
          <cloud-upload-outlined class="upload-icon" />
          <div class="mask">
            <plus-outlined />
          </div>
          <img :src="option.img" @error="loadError"/>
        </div>
      </a-col>
    </a-row>

    <avatar-modal ref="modalRef" @ok="setavatar" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import AvatarModal from './AvatarModal.vue'
import { PlusOutlined, CloudUploadOutlined } from '@ant-design/icons-vue'
import moment from 'moment'
import { sysUserUpdateInfo } from '@/api/modular/system/userManage'
import { sysFileInfoPreview } from '@/api/modular/system/fileManage'
import { message } from 'ant-design-vue'

const store = useStore()
const modalRef = ref()

const formState = reactive({
  nickName: '',
  birthday: null,
  sex: null,
  phone: '',
  tel: '',
  email: ''
})

const sexData = ref([])
const birthdayString = ref('')

const option = reactive({
  img: '/avatar2.jpg',
  info: true,
  size: 1,
  outputType: 'jpeg',
  canScale: false,
  autoCrop: true,
  autoCropWidth: 180,
  autoCropHeight: 180,
  fixedBox: true,
  fixed: true,
  fixedNumber: [1, 1]
})

const userInfo = computed(() => store.getters.userInfo)

const loadError = (event) => {
  const img = event.target
  img.src = '/avatar2.jpg'
  img.onerror = null
}

const initUserInfo = () => {
  setTimeout(() => {
    if (userInfo.value) {
      formState.nickName = userInfo.value.nickName
      formState.birthday = userInfo.value.birthday ? moment(userInfo.value.birthday, 'YYYY-MM-DD') : null
      formState.sex = userInfo.value.sex
      formState.email = userInfo.value.email
      formState.phone = userInfo.value.phone
      formState.tel = userInfo.value.tel
      
      birthdayString.value = userInfo.value.birthday ? moment(userInfo.value.birthday).format('YYYY-MM-DD') : ''

      if (userInfo.value.avatar) {
        sysFileInfoPreview({
          id: userInfo.value.avatar
        }).then((res) => {
          console.log('预览结果', res)
          option.img = window.URL.createObjectURL(new Blob([res]))
        }).catch((err) => {
          message.error('预览错误: ' + err.message)
        })
      }
    }
    getSexData()
  }, 100)
}

const onChange = (date, dateString) => {
  birthdayString.value = dateString
}

const submitUserInfo = (values) => {
  values.birthday = birthdayString.value
  values.id = userInfo.value.id
  sysUserUpdateInfo(values).then((res) => {
    if (res.success) {
      message.success('个人信息更新成功')
      store.dispatch('GetInfo')
    } else {
      message.error(res.message)
    }
  })
}

const getSexData = () => {
  // Mock sex data - replace with actual dict data call
  sexData.value = [
    { code: '1', name: '男' },
    { code: '2', name: '女' }
  ]
}

const setavatar = (url) => {
  sysFileInfoPreview({
    id: url
  }).then((res) => {
    option.img = window.URL.createObjectURL(new Blob([res]))
  }).catch((err) => {
    message.error('预览错误: ' + err.message)
  })
  store.dispatch('GetInfo')
}

onMounted(() => {
  initUserInfo()
})
</script>

<style lang="less" scoped>
.avatar-upload-wrapper {
  height: 200px;
  width: 100%;
}

.ant-upload-preview {
  position: relative;
  margin: 0 auto;
  width: 100%;
  max-width: 180px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;

  .upload-icon {
    position: absolute;
    top: 0;
    right: 10px;
    font-size: 1.4rem;
    padding: 0.5rem;
    background: rgba(222, 221, 221, 0.7);
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }

  .mask {
    opacity: 0;
    position: absolute;
    background: rgba(0, 0, 0, 0.4);
    cursor: pointer;
    transition: opacity 0.4s;

    &:hover {
      opacity: 1;
    }

    i {
      font-size: 2rem;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -1rem;
      margin-top: -1rem;
      color: #d6d6d6;
    }
  }

  img,
  .mask {
    width: 100%;
    max-width: 180px;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
  }
}
</style>

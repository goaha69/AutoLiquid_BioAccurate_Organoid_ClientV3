<template>
  <a-card :bordered="false">
    <a-spin :spinning="confirmLoading">
      <a-tabs v-model:activeKey="activeKey" @change="tabsCallback">
        <a-tab-pane key="1" tab="发送邮件" v-if="hasPerm('email:sendEmail')">
          <a-form ref="form1Ref" :model="form1" :rules="rules1" :label-col="{ flex: '80px' }">
            <a-form-item label="收件邮箱" name="to">
              <a-input v-model:value="form1.to" placeholder="请输入收件邮箱" />
            </a-form-item>
            <a-form-item label="邮件标题" name="title">
              <a-input v-model:value="form1.title" placeholder="请输入邮件标题" />
            </a-form-item>
            <a-form-item label="邮件内容" name="content">
              <a-textarea v-model:value="form1.content" :rows="4" placeholder="请输入邮件内容" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleSubmit1" :loading="confirmLoading">发送</a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="2" tab="发送Html邮件" v-if="hasPerm('email:sendEmailHtml')">
          <a-form ref="form2Ref" :model="form2" :rules="rules2" :label-col="{ flex: '80px' }">
            <a-form-item label="收件邮箱" name="to">
              <a-input v-model:value="form2.to" placeholder="请输入收件邮箱" />
            </a-form-item>
            <a-form-item label="邮件标题" name="title">
              <a-input v-model:value="form2.title" placeholder="请输入邮件标题" />
            </a-form-item>
            <a-form-item label="邮件内容" name="content">
              <div style="border: 1px solid #ccc">
                <Toolbar
                  style="border-bottom: 1px solid #ccc"
                  :editor="editorRef"
                  :defaultConfig="toolbarConfig"
                  mode="default"
                />
                <Editor
                  style="height: 500px; overflow-y: hidden"
                  v-model="form2.content"
                  :defaultConfig="editorConfig"
                  mode="default"
                  @onCreated="handleCreated"
                />
              </div>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleSubmit2" :loading="confirmLoading">发送</a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </a-card>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount, shallowRef } from 'vue';
import { emailSendEmail, emailSendEmailHtml } from '@/api/modular/system/emailManage';
import { sysFileInfoUpload } from '@/api/modular/system/fileManage';
import { message } from 'ant-design-vue';
import { hasPerm } from '@/utils/permission/index';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';

const activeKey = ref('1');
const confirmLoading = ref(false);

// Form 1
const form1Ref = ref();
const form1 = reactive({
  to: '',
  title: '',
  content: '',
});
const rules1 = {
  to: [{ required: true, type: 'email', message: '请输入正确的邮箱!' }],
  title: [{ required: true, message: '请输入邮件标题!' }],
  content: [{ required: true, message: '请输入邮件内容!' }],
};

const handleSubmit1 = () => {
  form1Ref.value.validate().then(() => {
    confirmLoading.value = true;
    emailSendEmail(form1)
      .then((res) => {
        if (res.success) {
          message.success('发送成功');
          form1Ref.value.resetFields();
        } else {
          message.error('发送失败：' + res.message);
        }
      })
      .finally(() => {
        confirmLoading.value = false;
      });
  });
};

// Form 2
const form2Ref = ref();
const form2 = reactive({
  to: '',
  title: '',
  content: '',
});
const rules2 = {
  to: [{ required: true, type: 'email', message: '请输入正确的邮箱!' }],
  title: [{ required: true, message: '请输入邮件标题!' }],
  content: [{ required: true, message: '请输入邮件内容!' }],
};

const editorRef = shallowRef();
const toolbarConfig = {};
const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      async customUpload(file, insertFn) {
        const formData = new FormData();
        formData.append('file', file);
        sysFileInfoUpload(formData).then((res) => {
          if (res.success) {
            insertFn(process.env.VUE_APP_API_BASE_URL + '/sysFileInfo/preview?id=' + res.data, '', '');
          } else {
            message.error('上传失败：' + res.message);
          }
        });
      },
    },
  },
};

const handleCreated = (editor) => {
  editorRef.value = editor;
};

const handleSubmit2 = () => {
  form2Ref.value.validate().then(() => {
    if (!form2.content || form2.content === '<p><br></p>') {
      message.error('请填写邮件内容');
      return;
    }
    confirmLoading.value = true;
    emailSendEmailHtml(form2)
      .then((res) => {
        if (res.success) {
          message.success('发送成功');
          form2Ref.value.resetFields();
          editorRef.value.clear();
        } else {
          message.error('发送失败：' + res.message);
        }
      })
      .finally(() => {
        confirmLoading.value = false;
      });
  });
};

const tabsCallback = (key) => {
  if (key === '1') {
    form2Ref.value.resetFields();
    if (editorRef.value) {
      editorRef.value.clear();
    }
  } else if (key === '2') {
    form1Ref.value.resetFields();
  }
};

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

<style lang="less" scoped>
.table-operator {
  margin-bottom: 18px;
}
button {
  margin-right: 8px;
}
</style>

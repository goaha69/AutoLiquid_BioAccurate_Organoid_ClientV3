<template>
  <a-modal
    title="编辑文章"
    :width="1000"
    :footer="null"
    :open="visible"
    @cancel="handleCancel"
  >
    <a-spin :spinning="formLoading">
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item name="id" style="display: none;">
          <a-input v-model:value="form.id" />
        </a-form-item>
        <a-form-item label="标题" name="title">
          <a-input v-model:value="form.title" placeholder="请输入标题" />
        </a-form-item>
        <a-form-item label="类型" name="type">
          <a-radio-group v-model:value="form.type">
            <a-radio-button v-for="item in typeDictTypeDropDown" :key="item.code" :value="item.code">
              {{ item.value }}
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="内容" name="content">
          <div style="border: 1px solid #ccc">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              mode="default"
            />
            <Editor
              style="height: 500px; overflow-y: hidden"
              v-model="form.content"
              :defaultConfig="editorConfig"
              mode="default"
              @onCreated="handleCreated"
            />
          </div>
        </a-form-item>
        <a-divider />
        <a-form-item>
          <div style="text-align: right;">
            <a-button type="primary" @click="handleSubmit">确认</a-button>
            <a-button style="margin-left: 8px" @click="handleCancel">取消</a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount, shallowRef, defineExpose, defineEmits, nextTick } from 'vue';
import { sysArticleEdit, sysArticleDetail } from '@/api/modular/system/articleManage';
import { sysDictTypeDropDown } from '@/api/modular/system/dictManage';
import { sysFileInfoUploadEditor } from '@/api/modular/system/fileManage';
import { message } from 'ant-design-vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';

const labelCol = {
  xs: { span: 24 },
  sm: { span: 3 },
};
const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 18 },
};

const visible = ref(false);
const formLoading = ref(true);
const typeDictTypeDropDown = ref([]);
const formRef = ref();
const form = reactive({
  id: '',
  title: '',
  type: undefined,
  content: '',
});

const rules = {
  title: [{ required: true, message: '请输入标题!' }],
  type: [{ required: true, message: '请选择类型' }],
  content: [{ required: true, message: '请输入内容' }],
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
        sysFileInfoUploadEditor(formData).then((res) => {
          if (res.success) {
            insertFn(process.env.VUE_APP_API_BASE_URL + '/' + res.data, '', '');
          } else {
            message.error('编辑器上传图片失败：' + res.message);
          }
        });
      },
    },
  },
};

const handleCreated = (editor) => {
  editorRef.value = editor;
};

const emit = defineEmits(['ok']);

const edit = (record) => {
  visible.value = true;
  formLoading.value = true;
  loadDictData();
  loadArticleDetail(record.id);
};

const loadDictData = () => {
  sysDictTypeDropDown({ code: 'article_type' }).then((res) => {
    typeDictTypeDropDown.value = res.data;
  });
};

const loadArticleDetail = (id) => {
  sysArticleDetail({ id }).then((res) => {
    Object.assign(form, res.data);
    form.type = String(form.type); // Ensure type is a string for radio group
    nextTick(() => {
      if (editorRef.value) {
        editorRef.value.setHtml(res.data.content);
      }
    });
    formLoading.value = false;
  });
};

const handleSubmit = () => {
  formRef.value.validate().then(() => {
    if (!form.content || form.content === '<p><br></p>') {
      message.error('请填写内容');
      return;
    }
    formLoading.value = true;
    const params = { ...form, type: parseInt(form.type) };
    sysArticleEdit(params)
      .then((res) => {
        if (res.success) {
          message.success('编辑成功');
          emit('ok');
          handleCancel();
        } else {
          message.error('编辑失败：' + res.message);
        }
      })
      .finally(() => {
        formLoading.value = false;
      });
  });
};

const handleCancel = () => {
  if (editorRef.value) {
    editorRef.value.clear();
  }
  formRef.value.resetFields();
  visible.value = false;
};

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

defineExpose({
  edit,
});
</script>

<style scoped>
.subButton {
  float: right;
}
.subForm-item {
  margin-bottom: 0px;
}
</style>

<template>
  <div class="blog-rich-editor">
    <Toolbar
      class="blog-rich-editor__toolbar"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      mode="default"
    />
    <Editor
      v-model="valueHtml"
      class="blog-rich-editor__content"
      :defaultConfig="editorConfig"
      mode="default"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css';
import { onBeforeUnmount, shallowRef, ref, watch } from 'vue';
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { ElNotification } from 'element-plus';
import { uploadFile } from '@/api/modules/system/upload';
import type { IUploadResult } from '@/api/interface/system/upload';

interface Props {
  modelValue: string;
  /** 编辑器高度，默认 400px */
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  height: '400px'
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef<IDomEditor | null>(null);

// 内容 html
const valueHtml = ref(props.modelValue || '');

watch(
  () => props.modelValue,
  val => {
    if (val !== valueHtml.value) {
      valueHtml.value = val || '';
    }
  }
);

// 工具栏配置（按需精简）
const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ['fullScreen']
};

// 编辑器配置
const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入文章内容，支持直接粘贴图片...',
  MENU_CONF: {}
};

// 图片上传配置：使用系统的 /sys-file/upload 接口，dirTag 固定为 blog
// @ts-ignore
editorConfig.MENU_CONF!['uploadImage'] = {
  async customUpload(file: File, insertFn: (url: string, alt?: string, href?: string) => void) {
    try {
      const { data } = await uploadFile({ file, dirTag: 'blog' });
      const res = data as IUploadResult;
      if (!res || !res.url) {
        throw new Error('上传结果为空');
      }
      insertFn(res.url, res.filename, res.url);
      ElNotification({
        title: '提示',
        message: '图片上传成功',
        type: 'success'
      });
    } catch (error) {
      console.error('富文本图片上传失败：', error);
      ElNotification({
        title: '提示',
        message: '图片上传失败，请重试',
        type: 'error'
      });
    }
  }
};

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor;
};

const handleChange = (editor: IDomEditor) => {
  const html = editor.getHtml();
  emit('update:modelValue', html);
};

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

<style scoped>
.blog-rich-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.blog-rich-editor__toolbar {
  border-bottom: 1px solid #e4e7ed;
}

.blog-rich-editor__content {
  min-height: 200px;
  height: v-bind('props.height');
  padding: 0 10px;
}
</style>


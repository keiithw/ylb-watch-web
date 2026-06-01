<template>
  <div class="upload-box">
    <el-upload
      :id="uuid"
      :class="['upload', self_disabled ? 'disabled' : '', drag ? 'no-border' : '']"
      :multiple="false"
      :disabled="self_disabled"
      :show-file-list="false"
      :auto-upload="true"
      :http-request="handleHttpUpload"
      :before-upload="beforeUpload"
      :drag="drag"
      :accept="fileType.join(',')"
    >
      <template v-if="imageUrl">
        <img 
          v-if="!imageLoadError"
          :src="imageUrl" 
          class="upload-image" 
          alt="图片预览"
          @error="handleImageError"
          @load="handleImageLoad"
        />
        <div v-else class="image-error-placeholder">
          <el-icon><Picture /></el-icon>
          <span>图片加载失败</span>
        </div>
        <div class="upload-handle" @click.stop>
          <div v-if="!self_disabled" class="handle-icon" @click="editImg">
            <el-icon><Edit /></el-icon>
            <span>编辑</span>
          </div>
          <div class="handle-icon" @click="imgViewVisible = true">
            <el-icon><ZoomIn /></el-icon>
            <span>查看</span>
          </div>
          <div v-if="!self_disabled" class="handle-icon" @click="deleteImg">
            <el-icon><Delete /></el-icon>
            <span>删除</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="upload-empty">
          <slot name="empty">
            <el-icon><Plus /></el-icon>
          </slot>
        </div>
      </template>
    </el-upload>
    <div class="el-upload__tip">
      <slot name="tip" />
    </div>
    <el-image-viewer v-if="imgViewVisible" :url-list="[imageUrl]" @close="imgViewVisible = false" />
  </div>
</template>

<script setup lang="ts" name="UploadImg">
import { ref, computed, inject } from 'vue';
import { generateUUID } from '@/utils';
import { uploadFile } from '@/api/modules/system/upload';
import { ElNotification, formContextKey, formItemContextKey } from 'element-plus';
import type { UploadProps, UploadRequestOptions } from 'element-plus';
import type { IUploadResult } from '@/api/interface/system/upload';

interface UploadFileProps {
  imageUrl: string; // 图片地址 ==> 必传
  fileInfo?: IUploadResult; // 文件信息 ==> 非必传
  api?: (params: any) => Promise<any>; // 上传图片的 api 方法，一般项目上传都是同一个 api 方法，在组件里直接引入即可 ==> 非必传
  drag?: boolean; // 是否支持拖拽上传 ==> 非必传（默认为 true）
  disabled?: boolean; // 是否禁用上传组件 ==> 非必传（默认为 false）
  fileSize?: number; // 图片大小限制 ==> 非必传（默认为 5M）
  fileType?: File.ImageMimeType[]; // 图片类型限制 ==> 非必传（默认为 ["image/jpeg", "image/png", "image/gif"]）
  height?: string; // 组件高度 ==> 非必传（默认为 150px）
  width?: string; // 组件宽度 ==> 非必传（默认为 150px）
  borderRadius?: string; // 组件边框圆角 ==> 非必传（默认为 8px）
  dir?: string; // 上传图片的目录 ==> 非必传（默认为 img）
}

// 接受父组件参数
const props = withDefaults(defineProps<UploadFileProps>(), {
  imageUrl: '',
  fileInfo: null,
  drag: true,
  disabled: false,
  fileSize: 5,
  fileType: () => ['image/jpeg', 'image/png', 'image/gif'],
  height: '150px',
  width: '150px',
  borderRadius: '8px',
  dir: 'img'
});

// 生成组件唯一id
const uuid = ref('id-' + generateUUID());

// 查看图片
const imgViewVisible = ref(false);
// 图片加载状态
const imageLoadError = ref(false);
// 防止重复上传 - 使用文件对象引用和 Promise 锁机制
const uploadingFiles = new Set<File>();
let uploadingPromise: Promise<any> | null = null;
// 获取 el-form 组件上下文
const formContext = inject(formContextKey, void 0);
// 获取 el-form-item 组件上下文
const formItemContext = inject(formItemContextKey, void 0);
// 判断是否禁用上传和删除
const self_disabled = computed(() => {
  return props.disabled || formContext?.disabled;
});

// 生成文件唯一标识
const getFileId = (file: File): string => {
  return `${file.name}_${file.size}_${file.lastModified}`;
};

/**
 * @description 图片上传
 * @param options upload 所有配置项
 * */
const emit = defineEmits<{
  'update:imageUrl': [value: string];
  change: [value: IUploadResult];
}>();

const handleHttpUpload = async (options: UploadRequestOptions) => {
  const file = options.file;
  const fileId = getFileId(file);
  console.log('[handleHttpUpload] 开始处理上传:', file.name, '文件ID:', fileId, '当前上传文件数:', uploadingFiles.size, '当前上传Promise:', uploadingPromise ? '存在' : 'null');
  
  // 使用文件对象引用检查是否正在上传（最严格的检查）
  if (uploadingFiles.has(file)) {
    console.warn('[handleHttpUpload] 该文件对象正在上传中，忽略重复请求:', file.name);
    return;
  }
  
  // 如果已经有其他文件在上传，也直接返回
  if (uploadingPromise) {
    console.warn('[handleHttpUpload] 有其他文件正在上传中，忽略重复请求:', file.name);
    return;
  }
  
  // 立即添加到上传集合中
  uploadingFiles.add(file);
  
  // 创建上传 Promise 并立即保存，防止并发调用
  uploadingPromise = (async () => {
    try {
      console.log('[handleHttpUpload] 开始上传文件:', file.name, '时间戳:', Date.now());
      console.log('[handleHttpUpload] 调用 uploadFile API 前');
      const uploadPromise = uploadFile({ file: file, dirTag: props.dir });
      console.log('[handleHttpUpload] 调用 uploadFile API 后，等待响应...');
      const { data } = await uploadPromise;
      console.log('[handleHttpUpload] 上传成功:', data, '时间戳:', Date.now());
      emit('update:imageUrl', data.url);
      emit('change', data);
      // 调用 el-form 内部的校验方法（可自动校验）
      formItemContext?.prop && formContext?.validateField([formItemContext.prop as string]);
      // 显示成功通知
      ElNotification({
        title: '温馨提示',
        message: '图片上传成功！',
        type: 'success'
      });
      return data;
    } catch (error) {
      console.error('[handleHttpUpload] 上传失败:', error);
      // 显示错误通知
      ElNotification({
        title: '温馨提示',
        message: '图片上传失败，请您重新上传！',
        type: 'error'
      });
      throw error;
    } finally {
      // 清除上传状态
      uploadingFiles.delete(file);
      uploadingPromise = null;
    }
  })();
  
  try {
    const data = await uploadingPromise;
    // 手动调用成功回调
    options.onSuccess(data);
  } catch (error) {
    options.onError(error as any);
  }
};

/**
 * @description 删除图片
 * */
const deleteImg = () => {
  emit('update:imageUrl', '');
  emit('change', null);
};

/**
 * @description 编辑图片
 * */
const editImg = () => {
  const dom = document.querySelector(`#${uuid.value} .el-upload__input`);
  dom && dom.dispatchEvent(new MouseEvent('click'));
};

/**
 * @description 文件上传之前判断
 * @param rawFile 选择的文件
 * */
const beforeUpload: UploadProps['beforeUpload'] = rawFile => {
  const fileId = getFileId(rawFile);
  console.log('[beforeUpload] 文件选择:', rawFile.name, '当前上传文件数:', uploadingFiles.size, '当前上传Promise:', uploadingPromise ? '存在' : 'null', '新文件ID:', fileId);
  
  // 使用文件对象引用检查是否正在上传
  if (uploadingFiles.has(rawFile)) {
    console.warn('[beforeUpload] 该文件对象正在上传中，阻止重复上传:', rawFile.name);
    return false;
  }
  
  // 检查是否有其他文件正在上传（防止并发上传）
  if (uploadingPromise) {
    console.warn('[beforeUpload] 有其他文件正在上传中，请等待完成');
    ElNotification({
      title: '温馨提示',
      message: '有文件正在上传中，请等待完成后再上传！',
      type: 'warning'
    });
    return false;
  }
  
  // 文件类型和大小验证
  const imgSize = rawFile.size / 1024 / 1024 < props.fileSize;
  const imgType = props.fileType.includes(rawFile.type as File.ImageMimeType);
  
  if (!imgType) {
    ElNotification({
      title: '温馨提示',
      message: '上传图片不符合所需的格式！',
      type: 'warning'
    });
    return false;
  }
  
  if (!imgSize) {
    setTimeout(() => {
      ElNotification({
        title: '温馨提示',
        message: `上传图片大小不能超过 ${props.fileSize}M！`,
        type: 'warning'
      });
    }, 0);
    return false;
  }
  
  // 验证通过
  console.log('[beforeUpload] 验证通过，允许上传:', fileId);
  return true;
};

// 注意：当使用 http-request 时，成功和错误处理都在 handleHttpUpload 中通过 options.onSuccess 和 options.onError 处理
// 不再需要单独的 uploadSuccess 和 uploadError 回调，避免重复触发
</script>

<style scoped lang="scss">
.is-error {
  .upload {
    :deep(.el-upload),
    :deep(.el-upload-dragger) {
      border: 1px dashed var(--el-color-danger) !important;
      &:hover {
        border-color: var(--el-color-primary) !important;
      }
    }
  }
}
:deep(.disabled) {
  .el-upload,
  .el-upload-dragger {
    cursor: not-allowed !important;
    background: var(--el-disabled-bg-color);
    border: 1px dashed var(--el-border-color-darker) !important;
    &:hover {
      border: 1px dashed var(--el-border-color-darker) !important;
    }
  }
}
.upload-box {
  .no-border {
    :deep(.el-upload) {
      border: none !important;
    }
  }
  :deep(.upload) {
    .el-upload {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: v-bind(width);
      height: v-bind(height);
      overflow: hidden;
      border: 1px dashed var(--el-border-color-darker);
      border-radius: v-bind(borderRadius);
      transition: var(--el-transition-duration-fast);
      &:hover {
        border-color: var(--el-color-primary);
        .upload-handle {
          opacity: 1;
        }
      }
      .el-upload-dragger {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        background-color: transparent;
        border: 1px dashed var(--el-border-color-darker);
        border-radius: v-bind(borderRadius);
        &:hover {
          border: 1px dashed var(--el-color-primary);
        }
      }
      .el-upload-dragger.is-dragover {
        background-color: var(--el-color-primary-light-9);
        border: 2px dashed var(--el-color-primary) !important;
      }
      .upload-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .upload-empty {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        line-height: 30px;
        color: var(--el-color-info);
        .el-icon {
          font-size: 28px;
          color: var(--el-text-color-secondary);
        }
      }
      .upload-handle {
        position: absolute;
        top: 0;
        right: 0;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        cursor: pointer;
        background: rgb(0 0 0 / 60%);
        opacity: 0;
        transition: var(--el-transition-duration-fast);
        .handle-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 6%;
          color: aliceblue;
          .el-icon {
            margin-bottom: 40%;
            font-size: 130%;
            line-height: 130%;
          }
          span {
            font-size: 85%;
            line-height: 85%;
          }
        }
      }
    }
  }
  .el-upload__tip {
    line-height: 18px;
    text-align: center;
  }
}
</style>

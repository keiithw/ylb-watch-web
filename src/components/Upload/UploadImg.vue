<template>
  <div class="upload-wrapper" @click="handleClick">
    <el-upload
      class="avatar-uploader"
      action="#"
      :http-request="handleUpload"
      :before-upload="beforeUpload"
      accept="image/jpeg,image/jpg,image/png,image/gif"
      :show-file-list="false"
    >
      <img v-if="imageUrl" :src="imageUrl" class="avatar" />
      <el-icon v-else class="avatar-uploader-icon">
        <Plus />
      </el-icon>
    </el-upload>
    <div class="upload-tip">支持jpg/jpeg/png/gif格式，大小不超过5MB</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { uploadFile } from '@/api/modules/system/upload';
import type { UploadRequestOptions } from 'element-plus';

interface Props {
  imageUrl?: string;
  width?: string;
  height?: string;
  dirTag?: string; // 上传目录标签
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: '',
  width: '146px',
  height: '146px',
  dirTag: 'blog' // 默认使用 blog 目录
});

const emit = defineEmits<{
  'update:imageUrl': [value: string];
}>();

// 测试点击事件
const handleClick = () => {
  console.log('UploadImg 组件被点击');
};

// 文件上传前的验证
const beforeUpload = (file: File) => {
  // 文件类型验证
  const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type);
  if (!isValidType) {
    ElMessage.error('图片只能是jpg/jpeg/png/gif格式!');
    return false;
  }
  
  // 文件大小限制: 5MB
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!');
    return false;
  }
  
  return true;
};

// 处理图片上传
const handleUpload = async (options: UploadRequestOptions) => {
  const { file } = options;
  
  if (!file) {
    console.error('没有选择文件');
    return;
  }
  
  console.log('开始上传文件:', file.name, file.type, file.size);
  
  try {
    // 使用正确的上传API（uploadFile 会自动处理 FormData）
    const res = await uploadFile({ 
      file: file as any, 
      dirTag: props.dirTag || 'blog' 
    });
    
    console.log('上传响应:', res);
    
    if (res && res.data && res.data.url) {
      // 更新图片URL
      emit('update:imageUrl', res.data.url);
      ElMessage.success('图片上传成功');
    } else {
      console.error('上传响应数据异常:', res);
      ElMessage.error('图片上传失败');
    }
  } catch (error: any) {
    console.error('图片上传失败:', error);
    const errorMsg = error?.response?.data?.message || error?.message || '图片上传失败，请重试';
    ElMessage.error(errorMsg);
  }
};
</script>

<style scoped>
.upload-wrapper {
  width: v-bind(width);
}

.avatar-uploader {
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: v-bind(height);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader :deep(.el-upload) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style> 
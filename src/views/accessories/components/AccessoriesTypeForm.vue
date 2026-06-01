<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { FormInstance, FormRules } from 'element-plus';
import { createAccessoriesTypeApi, updateAccessoriesTypeApi } from '@/api/modules/accessories/accessoriesType';

// 表单引用
const formRef = ref();

// 对话框可见性
const dialogVisible = ref(false);

// 是否为编辑模式
const isEdit = ref(false);

// 表单数据
const formData = reactive({
  id: undefined,
  typeName: ''
});

// 表单规则
const rules = reactive({
  typeName: [
    { required: true, message: '请输入配件类型名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ]
});

// 回调函数
let getTableListFn = null;

// 接收参数
const acceptParams = (params) => {
  formData.id = undefined;
  formData.typeName = '';
  isEdit.value = Boolean(params.row);
  getTableListFn = params.getTableList;
  
  // 直接使用后端数据
  if (params.row) {
    formData.id = params.row.id;
    formData.typeName = params.row.typeName || '';
  }
  
  dialogVisible.value = true;
  nextTick(() => formRef.value?.clearValidate());
};

// 重置表单
const resetForm = () => {
  formData.id = undefined;
  formData.typeName = '';
  isEdit.value = false;
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    // 使用正确的API和数据
    const api = isEdit.value ? updateAccessoriesTypeApi : createAccessoriesTypeApi;
    const res = await api(formData);
    
    if (res?.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
      dialogVisible.value = false;
      getTableListFn?.();
    } else {
      ElMessage.error(res?.msg || '操作失败');
    }
  } catch (error) {
    console.error('表单提交失败:', error);
  }
};

// 对外暴露方法
defineExpose({
  acceptParams
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑配件类型' : '新增配件类型'"
    width="500px"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="类型名称" prop="typeName">
        <el-input v-model="formData.typeName" placeholder="请输入配件类型名称" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </template>
  </el-dialog>
</template> 
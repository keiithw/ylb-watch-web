<template>
  <el-drawer
    v-model="drawerVisible"
    :title="drawerProps.title"
    :size="600"
    :destroy-on-close="true"
    direction="rtl"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="right"
      :validate-on-rule-change="false"
    >
      <el-form-item label="配件类型" prop="typeId">
        <el-select v-model="formData.typeId" placeholder="请选择配件类型" clearable filterable style="width: 100%">
          <el-option
            v-for="item in typeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标签名称" prop="tagName">
        <el-input v-model="formData.tagName" placeholder="请输入标签名称" maxlength="20" show-word-limit clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { getAllAccessoriesTypeListApi } from '@/api/modules/accessories/accessoriesType';
import type { IAccessoriesType } from '@/api/interface/accessories/accessoriesType';
import type { IAccessoriesTag } from '@/api/interface/accessories/accessoriesTag';
import { getAccessoriesTagDetailApi } from '@/api/modules/accessories/accessoriesTag';

// 接收参数
interface DrawerProps {
  title: string;
  row?: any;
  api: (params: any) => Promise<any>;
  getTableList?: () => void;
}

// drawer状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: '',
  api: () => Promise.resolve()
});

// 配件类型选项
const typeOptions = ref<IAccessoriesType.Row[]>([]);

// 获取配件类型列表
const getTypeOptions = async () => {
  try {
    const res = await getAllAccessoriesTypeListApi();
    typeOptions.value = res.data.rows || [];
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  getTypeOptions();
});

// 表单数据
const formRef = ref<FormInstance>();
const formData = reactive<IAccessoriesTag.CreateParams>({
  typeId: undefined as unknown as number,
  tagName: ''
});

// 表单校验规则
const formRules = reactive<FormRules>({
  typeId: [{ required: true, message: '请选择配件类型', trigger: 'change' }],
  tagName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
});

// 提交loading
const submitLoading = ref(false);

// 接收参数
const acceptParams = async (params: DrawerProps) => {
  drawerProps.value = params;
  drawerVisible.value = true;
  
  // 重置表单数据
  formData.typeId = undefined as unknown as number;
  formData.tagName = '';
  
  // 如果是编辑模式，则获取详情数据
  if (params.row && params.row.id) {
    try {
      loading.value = true;
      // 先获取详情数据
      const res = await getAccessoriesTagDetailApi(params.row.id);
      const detailData = res.data;
      
      // 填充表单数据
      formData.typeId = detailData.typeId;
      formData.tagName = detailData.tagName;
    } catch (error) {
      console.error('获取标签详情失败:', error);
      ElMessage.error('获取标签详情失败');
    } finally {
      loading.value = false;
    }
  }
};

// 提交
const handleSubmit = async () => {
  await formRef.value?.validate();
  try {
    submitLoading.value = true;
    const params = { ...formData };
    
    // 处理id参数（区分新增和编辑）
    if (drawerProps.value.row && drawerProps.value.row.id) {
      (params as IAccessoriesTag.UpdateParams).id = drawerProps.value.row.id;
    }
    
    await drawerProps.value.api(params);
    ElMessage.success('操作成功');
    drawerVisible.value = false;
    // 刷新表格
    drawerProps.value.getTableList?.();
  } catch (error) {
    console.error(error);
  } finally {
    submitLoading.value = false;
  }
};

defineExpose({
  acceptParams
});
</script> 
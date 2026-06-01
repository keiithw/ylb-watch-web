<template>
  <el-drawer
    v-model="drawerVisible"
    :title="drawerTitle"
    direction="rtl"
    size="500px"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="配件名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入配件名称" />
      </el-form-item>

      <el-form-item label="配件类型" prop="accessoriesTypeId">
        <el-select
          v-model="formData.accessoriesTypeId"
          placeholder="请选择配件类型"
          style="width: 100%"
          @change="handleTypeChange"
        >
          <el-option
            v-for="item in typeList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="配件标签" prop="accessoriesTagId">
        <el-select
          v-model="formData.accessoriesTagId"
          placeholder="请选择配件标签"
          style="width: 100%"
          :disabled="!formData.accessoriesTypeId"
        >
          <el-option
            v-for="item in tagList"
            :key="item.id"
            :label="item.tagName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="配件价格" prop="price">
        <el-input-number
          v-model="formData.price"
          :precision="2"
          :step="0.1"
          :min="0"
          style="width: 100%"
          placeholder="请输入配件价格"
        />
      </el-form-item>

      <el-form-item label="默认配件" prop="isDefault">
        <el-radio-group v-model="formData.isDefault">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="配件图片">
        <el-upload
          class="avatar-uploader"
          :http-request="handleUpload"
          accept=".jpg,.jpeg,.png,.gif"
          :show-file-list="false"
        >
          <img v-if="formData.pictureUrl" :src="formData.pictureUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
        <div class="upload-tip">支持jpg/jpeg/png/gif格式，大小不超过5MB</div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import {
  createAccessoriesApi,
  updateAccessoriesApi,
} from "@/api/modules/accessories/accessories";
import { getAllAccessoriesTypeListApi } from "@/api/modules/accessories/accessoriesType";
import { getAllAccessoriesTagsApi, getAccessoriesTagListApi, getAccessoriesTagListByTypeApi } from "@/api/modules/accessories/accessoriesTag";
import { useUserStore } from "@/stores/modules/user";
import { uploadFileApi } from '@/api/modules/system/file';

// 表单引用
const formRef = ref();

// 抽屉可见性
const drawerVisible = ref(false);

// 抽屉标题
const drawerTitle = ref("");

// 类型列表
const typeList = ref([]);

// 标签列表
const tagList = ref([]);

// 表单加载状态
const formLoading = ref(false);

// 获取用户store
const userStore = useUserStore();

// 上传请求头
const uploadHeaders = computed(() => {
  return {
    Authorization: userStore.token
  };
});

// 表单数据
const formData = reactive({
  id: undefined,
  name: "",
  accessoriesTypeId: undefined,
  accessoriesTagId: undefined,
  price: undefined,
  pictureUrl: "",
  isDefault: 0,
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入配件名称", trigger: "blur" }],
  accessoriesTypeId: [{ required: true, message: "请选择配件类型", trigger: "change" }],
  accessoriesTagId: [{ required: true, message: "请选择配件标签", trigger: "change" }],
  price: [{ required: true, message: "请输入配件价格", trigger: "blur" }],
};

// 回调函数
let getTableListFn = null;

// 获取所有标签列表
const getAllTags = async () => {
  try {
    console.log("获取所有标签");
    // 使用 getAllAccessoriesTagsApi 获取所有标签（设置足够大的 pageSize）
    const res = await getAllAccessoriesTagsApi();

    console.log("所有标签API响应:", res);

    if (res && res.data) {
      if (res.data.rows) {
        tagList.value = res.data.rows;
      } else if (Array.isArray(res.data)) {
        tagList.value = res.data;
      } else {
        tagList.value = [];
      }
    } else {
      tagList.value = [];
    }
  } catch (error) {
    console.error("获取所有标签列表失败:", error);
    tagList.value = [];
  }
};

// 获取配件类型列表
const getTypeList = async () => {
  try {
    // 使用 getAllAccessoriesTypeListApi 获取所有配件类型（设置足够大的 pageSize）
    const res = await getAllAccessoriesTypeListApi();
    if (res && res.data) {
      // 处理可能的不同数据结构
      if (Array.isArray(res.data)) {
        typeList.value = res.data;
      } else if (res.data.rows) {
        typeList.value = res.data.rows;
      } else {
        typeList.value = [];
      }
    } else {
      typeList.value = [];
    }
  } catch (error) {
    console.error("获取配件类型列表失败:", error);
    typeList.value = [];
  }
};

// 根据类型ID获取标签列表
const getTagListByTypeId = async (typeId) => {
  if (!typeId) {
    tagList.value = [];
    return;
  }
  
  try {
    console.log("根据类型获取标签:", typeId);
    // 使用 getAccessoriesTagListByTypeApi 获取指定类型的所有标签（设置了足够大的 pageSize）
    const res = await getAccessoriesTagListByTypeApi(typeId);

    console.log("标签API响应:", res);

    if (res && res.data) {
      if (res.data.rows) {
        tagList.value = res.data.rows;
      } else if (Array.isArray(res.data)) {
        tagList.value = res.data;
      } else {
        tagList.value = [];
      }
    } else {
      tagList.value = [];
    }
  } catch (error) {
    console.error("获取标签列表失败:", error);
    tagList.value = [];
  }
};

// 处理类型变化
const handleTypeChange = async (typeId) => {
  // 清空已选标签
  formData.accessoriesTagId = undefined;

  // 根据类型获取标签
  await getTagListByTypeId(typeId);
};

// 接收参数
const acceptParams = async (params) => {
  drawerTitle.value = params.title || "配件";
  getTableListFn = params.getTableList;

  // 重置表单
  resetForm();

  // 加载类型列表
  await getTypeList();

  // 加载所有标签列表
  await getAllTags();

  // 如果是编辑模式，加载数据
  if (params.row) {
    const row = params.row;

    // 填充表单数据
    formData.id = row.id;
    formData.name = row.name || "";
    formData.accessoriesTypeId = row.accessoriesTypeId;
    formData.price = row.price !== undefined ? Number(row.price) : undefined;
    formData.pictureUrl = row.pictureUrl || "";
    formData.isDefault = row.isDefault !== undefined ? Number(row.isDefault) : 0;

    // 加载标签列表
    if (formData.accessoriesTypeId) {
      console.log("编辑模式，加载标签列表:", formData.accessoriesTypeId);
      await getTagListByTypeId(formData.accessoriesTypeId);
      formData.accessoriesTagId = row.accessoriesTagId;
    }
  }

  // 打开抽屉
  drawerVisible.value = true;
};

// 重置表单
const resetForm = () => {
  // 重置表单数据
  formData.id = undefined;
  formData.name = "";
  formData.accessoriesTypeId = undefined;
  formData.accessoriesTagId = undefined;
  formData.price = undefined;
  formData.pictureUrl = "";
  formData.isDefault = 0;

  // 清除验证
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  try {
    // 表单验证
    await formRef.value.validate();

    formLoading.value = true;

    // 选择API
    const api = formData.id ? updateAccessoriesApi : createAccessoriesApi;

    // 提交表单
    const res = await api(formData);

    if (res && (res.code === 200 || res.code === "0000")) {
      ElMessage.success(formData.id ? "修改成功" : "添加成功");
      drawerVisible.value = false;

      // 刷新表格
      if (typeof getTableListFn === "function") {
        getTableListFn();
      }
    } else {
      ElMessage.error((res && (res.msg || res.message)) || "操作失败");
    }
  } catch (error) {
    console.error("提交表单失败:", error);
    ElMessage.error("提交表单失败");
  } finally {
    formLoading.value = false;
  }
};

// 处理图片上传
const handleUpload = async (options) => {
  const { file } = options;
  
  if (!file) return;
  
  // 文件类型验证
  const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type);
  if (!isValidType) {
    ElMessage.error('图片只能是jpg/jpeg/png/gif格式!');
    return;
  }
  
  // 文件大小限制: 5MB
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!');
    return;
  }
  
  try {
    // 创建FormData
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('dirTag', 'accessories'); // 指定目录标签
    
    // 使用封装的上传API
    const res = await uploadFileApi(uploadFormData);
    
    console.log('上传响应:', res);
    
    if (res && res.code === '0000' && res.data && res.data.url) {
      // 设置图片URL
      formData.pictureUrl = res.data.url;
      ElMessage.success('图片上传成功');
    } else {
      ElMessage.error('图片上传失败');
    }
  } catch (error) {
    console.error('图片上传失败:', error);
    ElMessage.error('图片上传失败');
  }
};

// 组件挂载时加载所有标签
onMounted(() => {
  getAllTags();
});

// 暴露方法
defineExpose({
  acceptParams,
});
</script>

<style scoped>
.avatar-uploader {
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 146px;
  height: 146px;
  line-height: 146px;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 146px;
  height: 146px;
  line-height: 146px;
  text-align: center;
}

.avatar {
  width: 146px;
  height: 146px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>

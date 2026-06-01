<template>
  <el-dialog
    v-model="dialogVisible"
    title="配件类型管理"
    width="900px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <div class="accessories-type-container">
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-input
          v-model="searchKey"
          placeholder="请输入类型名称搜索"
          clearable
          style="width: 250px"
          @clear="getTypeList"
          @keyup.enter="getTypeList"
        >
          <template #append>
            <el-button :icon="Search" @click="getTypeList" />
          </template>
        </el-input>
        <div class="right-buttons">
          <el-button type="primary" :icon="CirclePlus" @click="openAddEdit('新增配件类型')">
            新增类型
          </el-button>
          <el-button :icon="Refresh" @click="getTypeList">刷新</el-button>
        </div>
      </div>

      <!-- 类型列表 -->
      <el-table
        v-loading="loading"
        :data="typeList"
        border
        style="width: 100%"
        highlight-current-row
        row-key="id"
      >
        <el-table-column type="index" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="类型名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="x" label="X坐标" width="100" align="center" />
        <el-table-column prop="y" label="Y坐标" width="100" align="center" />
        <el-table-column prop="createTime" label="创建时间" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="EditPen" @click="openAddEdit('编辑配件类型', row)">
              编辑
            </el-button>
            <el-button type="success" link :icon="Collection" @click="openTagManager(row)">
              管理标签
            </el-button>
            <el-button type="primary" link :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 编辑表单弹框 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="formTitle"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
        label-position="right"
      >
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入配件类型名称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="X坐标" prop="x">
          <el-input-number v-model="formData.x" :min="0" :step="1" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Y坐标" prop="y">
          <el-input-number v-model="formData.y" :min="0" :step="1" controls-position="right" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 标签管理弹框 -->
    <el-dialog
      v-model="tagDialogVisible"
      :title="`管理 [${currentType.name || ''}] 的标签`"
      width="700px"
      append-to-body
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <div class="tag-manager-container">
        <div class="tag-toolbar">
          <el-button type="primary" :icon="CirclePlus" @click="openTagAddEdit('新增标签')">
            新增标签
          </el-button>
          <el-button :icon="Refresh" @click="getTagList">刷新</el-button>
        </div>
        
        <el-table
          v-loading="tagLoading"
          :data="tagList"
          border
          style="width: 100%"
          row-key="id"
        >
          <el-table-column type="index" width="60" align="center" />
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="tagName" label="标签名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间" min-width="160" show-overflow-tooltip />
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link :icon="EditPen" @click="openTagAddEdit('编辑标签', row)">
                编辑
              </el-button>
              <el-button type="primary" link :icon="Delete" @click="handleTagDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 标签编辑表单 -->
      <el-dialog
        v-model="tagFormDialogVisible"
        :title="tagFormTitle"
        width="500px"
        append-to-body
        :close-on-click-modal="false"
        :destroy-on-close="true"
      >
        <el-form
          ref="tagFormRef"
          :model="tagFormData"
          :rules="tagFormRules"
          label-width="80px"
          label-position="right"
        >
          <el-form-item label="标签名称" prop="tagName">
            <el-input v-model="tagFormData.tagName" placeholder="请输入标签名称" maxlength="200" show-word-limit />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="tagFormDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleTagSubmit" :loading="tagSubmitLoading">确定</el-button>
        </template>
      </el-dialog>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue';
import { ElMessage, ElMessageBox, ElButton } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Search, CirclePlus, Refresh, EditPen, Delete, Collection } from '@element-plus/icons-vue';
import { useAccessoriesTagStore } from '@/stores/accessoriesTagStore';
import {
  getAccessoriesTypeListApi,
  createAccessoriesTypeApi,
  updateAccessoriesTypeApi,
  removeAccessoriesTypeApi,
  getAccessoriesTypeDetailApi
} from '@/api/modules/accessories/accessoriesType';
import {
  getAccessoriesTagListByTypeApi,
  createAccessoriesTagApi,
  updateAccessoriesTagApi,
  removeAccessoriesTagApi
} from '@/api/modules/accessories/accessoriesTag';
import type { IAccessoriesType } from '@/api/interface/accessories/accessoriesType';
import type { IAccessoriesTag } from '@/api/interface/accessories/accessoriesTag';
import { useHandleData } from '@/hooks/useHandleData';
import ProTable from '@/components/ProTable/index.vue';
import AccessoriesTypeForm from './AccessoriesTypeForm.vue';

// 获取标签存储
const tagStore = useAccessoriesTagStore();

// 对话框状态
const dialogVisible = ref(false);

// 列表数据
const loading = ref(false);
const typeList = ref<IAccessoriesType.Row[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchKey = ref('');

// 表单对话框
const formDialogVisible = ref(false);
const formTitle = ref('');
const formRef = ref<FormInstance>();
const formData = reactive<IAccessoriesType.CreateParams & { id?: number }>({
  name: '',
  x: 0,
  y: 0
});
const submitLoading = ref(false);

// 标签管理相关
const tagDialogVisible = ref(false);
const tagLoading = ref(false);
const tagList = ref<IAccessoriesTag.Row[]>([]);
const currentType = reactive<{ id: number; name: string }>({ id: 0, name: '' });

// 标签表单对话框
const tagFormDialogVisible = ref(false);
const tagFormTitle = ref('');
const tagFormRef = ref<FormInstance>();
const tagFormData = reactive<{ id?: number; typeId: number; tagName: string }>({
  typeId: 0,
  tagName: ''
});
const tagSubmitLoading = ref(false);

// 表格引用
const proTableRef = ref();
const typeFormRef = ref();

// 表格列配置
const columns = [
  { prop: 'id', label: 'ID', width: 100 },
  { prop: 'typeName', label: '类型名称' },
  { prop: 'createTime', label: '创建时间', width: 180 },
  { 
    prop: 'operation', 
    label: '操作', 
    fixed: 'right', 
    width: 220,
    render: (scope) => {
      return [
        h(ElButton, {
          type: 'primary',
          link: true,
          onClick: () => openEditForm(scope.row),
          style: 'margin-right: 8px'
        }, { default: () => [
          h(EditPen, { style: 'margin-right: 5px' }),
          '编辑'
        ]}),
        h(ElButton, {
          type: 'primary',
          link: true,
          onClick: () => handleDelete(scope.row),
          style: 'margin-left: 8px'
        }, { default: () => [
          h(Delete, { style: 'margin-right: 5px' }),
          '删除'
        ]})
      ];
    }
  }
];

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入配件类型名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  x: [
    { required: true, message: '请输入X坐标', trigger: 'blur' }
  ],
  y: [
    { required: true, message: '请输入Y坐标', trigger: 'blur' }
  ]
};

// 标签表单验证规则
const tagFormRules: FormRules = {
  tagName: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
  ]
};

// 处理删除
const { confirmDelete } = useHandleData();

// 打开对话框
const open = () => {
  dialogVisible.value = true;
  getTypeList();
};

// 获取配件类型列表
const getTypeList = async () => {
  try {
    loading.value = true;
    const params: IAccessoriesType.Query = {
      page: currentPage.value,
      limit: pageSize.value, // 后端使用 limit 而不是 pageSize
      name: searchKey.value || undefined
    };
    
    const res = await getAccessoriesTypeListApi(params);
    typeList.value = res.data.rows || [];
    total.value = res.data.total || 0;
  } catch (error) {
    console.error('获取配件类型列表失败:', error);
    ElMessage.error('获取配件类型列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  getTypeList();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  getTypeList();
};

// 打开添加/编辑表单
const openAddEdit = async (title: string, row?: IAccessoriesType.Row) => {
  formTitle.value = title;
  formDialogVisible.value = true;
  
  // 重置表单
  formData.id = undefined;
  formData.name = '';
  formData.x = 0;
  formData.y = 0;
  
  // 如果是编辑模式，则获取详情数据
  if (row && row.id) {
    try {
      loading.value = true;
      // 调用详情接口
      const res = await getAccessoriesTypeDetailApi(row.id);
      const detailData = res.data;
      
      // 填充表单数据
      formData.id = detailData.id;
      formData.name = detailData.name;
      formData.x = detailData.x;
      formData.y = detailData.y;
    } catch (error) {
      console.error('获取配件类型详情失败:', error);
      ElMessage.error('获取配件类型详情失败');
    } finally {
      loading.value = false;
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    try {
      submitLoading.value = true;
      
      if (formData.id) {
        // 更新
        await updateAccessoriesTypeApi({
          id: formData.id,
          name: formData.name,
          x: formData.x,
          y: formData.y
        });
        ElMessage.success('更新成功');
      } else {
        // 新增
        await createAccessoriesTypeApi({
          name: formData.name,
          x: formData.x,
          y: formData.y
        });
        ElMessage.success('新增成功');
      }
      
      formDialogVisible.value = false;
      getTypeList();
    } catch (error) {
      console.error('保存失败:', error);
      ElMessage.error('保存失败');
    } finally {
      submitLoading.value = false;
    }
  });
};

// 处理删除
const handleDelete = async (row: IAccessoriesType.Row) => {
  if (!row || !row.id) return;
  
  try {
    await confirmDelete({
      message: `确定要删除类型 "${row.name || ''}" 吗？`,
      api: () => removeAccessoriesTypeApi({ ids: [row.id] }),
      callback: () => {
        if (proTableRef.value) {
          proTableRef.value.getTableList();
        }
      }
    });
  } catch (error) {
    console.error('删除类型出错:', error);
  }
};

// ==== 标签管理相关函数 ====

// 打开标签管理
const openTagManager = (row: IAccessoriesType.Row) => {
  currentType.id = row.id;
  currentType.name = row.name;
  tagDialogVisible.value = true;
  getTagList();
};

// 获取标签列表
const getTagList = async () => {
  if (!currentType.id) return;
  
  try {
    tagLoading.value = true;
    const res = await getAccessoriesTagListByTypeApi(currentType.id);
    // 使用分页结果中的rows字段
    tagList.value = res.data.rows || [];
  } catch (error) {
    console.error('获取标签列表失败:', error);
    ElMessage.error('获取标签列表失败');
  } finally {
    tagLoading.value = false;
  }
};

// 打开添加/编辑标签表单
const openTagAddEdit = (title: string, row?: IAccessoriesTag.Row) => {
  tagFormTitle.value = title;
  tagFormDialogVisible.value = true;
  
  // 重置表单
  tagFormData.id = undefined;
  tagFormData.typeId = currentType.id;
  tagFormData.tagName = '';
  
  // 如果是编辑模式，则填充数据
  if (row) {
    tagFormData.id = row.id;
    tagFormData.typeId = row.typeId;
    tagFormData.tagName = row.tagName;
  }
};

// 提交标签表单
const handleTagSubmit = async () => {
  if (!tagFormRef.value) return;
  
  await tagFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    try {
      tagSubmitLoading.value = true;
      
      if (tagFormData.id) {
        // 更新
        const res = await updateAccessoriesTagApi({
          id: tagFormData.id,
          typeId: tagFormData.typeId,
          tagName: tagFormData.tagName
        });
        ElMessage.success('更新标签成功');
        
        // 更新标签存储
        if (res.data) {
          tagStore.addOrUpdateTag(res.data);
        }
      } else {
        // 新增
        const res = await createAccessoriesTagApi({
          typeId: tagFormData.typeId,
          tagName: tagFormData.tagName
        });
        ElMessage.success('新增标签成功');
        
        // 更新标签存储
        if (res.data) {
          tagStore.addOrUpdateTag(res.data);
        }
      }
      
      tagFormDialogVisible.value = false;
      getTagList();
    } catch (error) {
      console.error('保存标签失败:', error);
      ElMessage.error('保存标签失败');
    } finally {
      tagSubmitLoading.value = false;
    }
  });
};

// 处理标签删除
const handleTagDelete = (row: IAccessoriesTag.Row) => {
  ElMessageBox.confirm(`确定要删除标签"${row.tagName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await removeAccessoriesTagApi({ ids: [row.id] });
      ElMessage.success('删除标签成功');
      
      // 从标签存储中移除
      tagStore.removeTag(row.id);
      
      getTagList();
    } catch (error) {
      console.error('删除标签失败:', error);
      ElMessage.error('删除标签失败');
    }
  }).catch(() => {});
};

// 打开编辑表单
const openEditForm = (row) => {
  if (!typeFormRef.value) return;
  
  typeFormRef.value.acceptParams({
    row,
    getTableList: () => {
      if (proTableRef.value) {
        proTableRef.value.getTableList();
      }
    }
  });
};

// 暴露方法给父组件
defineExpose({
  open
});
</script>

<style scoped>
.accessories-type-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.right-buttons {
  display: flex;
  gap: 8px;
}

.tag-manager-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tag-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
</style> 
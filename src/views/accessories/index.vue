<template>
  <div class="accessories-container">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getAccessoriesListApi"
      :search-config="searchConfig"
      :init-param="{ pageNum: 1, pageSize: 10 }"
      @selection-change="handleSelectionChange"
    >
      <!-- 表格上方按钮 -->
      <template #tableHeader>
        <el-button type="primary" @click="openAddEdit('新增配件')">
          <el-icon><CirclePlus /></el-icon>新增配件
        </el-button>
        <el-button type="primary" @click="openTypeManager">
          <el-icon><Management /></el-icon>配件类型管理
        </el-button>
        <el-button type="danger" :disabled="!selectedRows.length" @click="batchDelete">
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
      </template>
    </ProTable>

    <!-- 配件新增/编辑抽屉 -->
    <AccessoriesForm ref="accessoriesFormRef" />

    <!-- 配件类型管理 -->
    <AccessoriesTypeDialog ref="accessoriesTypeDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue';
import { ElMessage, ElImage, ElTag, ElButton, ElMessageBox } from 'element-plus';
import { CirclePlus, Delete, EditPen, Management } from '@element-plus/icons-vue';
import { useHandleData } from '@/hooks/useHandleData';
import ProTable from '@/components/ProTable/index.vue';
import AccessoriesForm from './components/AccessoriesForm.vue';
import AccessoriesTypeDialog from './components/AccessoriesTypeDialog.vue';
import { getAccessoriesListApi, removeAccessoriesApi, deleteAccessoriesApi, batchDeleteAccessoriesApi } from '@/api/modules/accessories/accessories';
import { getAllAccessoriesTypeListApi } from '@/api/modules/accessories/accessoriesType';
import type { ColumnProps } from '@/components/ProTable/interface';

// 引用
const accessoriesTypeDialogRef = ref();
const accessoriesFormRef = ref();
const proTableRef = ref();

// 获取表格操作方法
const { confirmDelete } = useHandleData();

// 选中的行
const selectedRows = ref([]);

// 类型映射缓存
const typeMap = ref({});

// 初始化类型映射
const initTypeMap = async () => {
  try {
    console.log('开始获取配件类型数据...');
    // 使用 getAllAccessoriesTypeListApi 获取所有配件类型（设置足够大的 pageSize）
    const res = await getAllAccessoriesTypeListApi();
    console.log('获取配件类型API响应:', res);
    
    if (res && res.data) {
      const types = Array.isArray(res.data) ? res.data : (res.data.rows || []);
      console.log('配件类型原始数据:', types);
      
      // 创建新的映射对象
      const newMap = {};
      
      // 遍历并添加到映射
      types.forEach(type => {
        if (type && type.id) {
          const typeName = type.name || type.typeName || `类型${type.id}`;
          newMap[type.id] = typeName;
          console.log(`添加映射: ID ${type.id} -> 名称 "${typeName}"`);
        }
      });
      
      // 替换整个映射对象
      typeMap.value = newMap;
      console.log('类型映射初始化完成:', typeMap.value);
    }
  } catch (error) {
    console.error('初始化类型映射失败:', error);
  }
};

// 初始化
onMounted(() => {
  console.log('组件已挂载，初始化类型映射');
  initTypeMap();
});

// 表格列配置
const columns = [
  { type: 'selection', fixed: 'left', width: 80 },
  { prop: 'id', label: 'ID', width: 120, search: { el: 'input' } },
  { prop: 'name', label: '配件名称', search: { el: 'input' } },
  { 
    prop: 'accessoriesTypeId', 
    label: '配件类型',
    render: (scope) => {
      if (!scope.row) return h('span', '-');
      const typeId = scope.row.accessoriesTypeId;
      let typeName = typeMap.value[typeId] || scope.row.accessoriesTypeName || `未知类型(ID:${typeId})`;
      return h('span', typeName);
    }
  },
  { prop: 'accessoriesTagName', label: '配件标签' },
  { 
    prop: 'pictureUrl', 
    label: '配件图片', 
    width: 120, 
    render: (scope) => {
      if (!scope.row || !scope.row.pictureUrl) return h('span', '暂无图片');
      return h(ElImage, {
        style: 'width: 50px; height: 50px',
        src: scope.row.pictureUrl,
        previewSrcList: [scope.row.pictureUrl],
        fit: 'cover',
        'preview-teleported': true
      });
    }
  },
  { 
    prop: 'status', 
    label: '状态', 
    width: 100,
    render: (scope) => {
      if (!scope.row) return h('span', '-');
      const status = scope.row.status;
      const type = status === 1 ? 'success' : 'danger';
      const text = status === 1 ? '启用' : '禁用';
      return h(ElTag, { type }, text);
    }
  },
  { 
    prop: 'operation', 
    label: '操作', 
    fixed: 'right', 
    width: 180,
    render: (scope) => {
      return [
        h(ElButton, {
          type: 'primary',
          link: true,
          onClick: () => openAddEdit('编辑配件', scope.row)
        }, [
          h(EditPen, { style: 'margin-right: 5px' }),
          '编辑'
        ]),
        h(ElButton, {
          type: 'danger',
          link: true,
          onClick: () => deleteAccessories(scope.row)
        }, [
          h(Delete, { style: 'margin-right: 5px' }),
          '删除'
        ])
      ];
    }
  }
];

// 搜索配置
const searchConfig = {
  keyBtn: true,
  showSearchLabel: true
};

// 处理表格选择
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

// 打开新增/编辑表单
const openAddEdit = (title, row) => {
  if (!accessoriesFormRef.value) return;
  
  // 如果是编辑，确保类型名称正确
  if (row && row.accessoriesTypeId) {
    // 使用typeMap提供类型名称
    row.accessoriesTypeName = typeMap.value[row.accessoriesTypeId] || row.accessoriesTypeName;
  }
  
  accessoriesFormRef.value.acceptParams({
    title,
    row,
    getTableList: () => {
      if (proTableRef.value) {
        proTableRef.value.getTableList();
      }
    }
  });
};

// 打开配件类型管理弹框
const openTypeManager = () => {
  if (!accessoriesTypeDialogRef.value) return;
  accessoriesTypeDialogRef.value.open();
  
  // 配件类型更新后，重新获取类型映射
  setTimeout(() => {
    initTypeMap();
  }, 1000);
};

// 删除配件
const deleteAccessories = async (row: any) => {
  ElMessageBox.confirm(`确定要删除配件 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteAccessoriesApi({ ids: [row.id] });
      if (res && (res.code === 200 || res.code === '0000')) {
        ElMessage.success('删除成功');
        // 刷新表格
        proTableRef.value.getTableList();
      } else {
        ElMessage.error((res && (res.msg || res.message)) || '删除失败');
      }
    } catch (error) {
      console.error('删除配件失败:', error);
      ElMessage.error('删除失败');
    }
  }).catch(() => {});
};

// 批量删除
const batchDelete = async (rows: any[]) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个配件吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.id);
      const res = await deleteAccessoriesApi({ ids });
      if (res && (res.code === 200 || res.code === '0000')) {
        ElMessage.success('批量删除成功');
        // 刷新表格
        proTableRef.value.getTableList();
      } else {
        ElMessage.error((res && (res.msg || res.message)) || '批量删除失败');
      }
    } catch (error) {
      console.error('批量删除配件失败:', error);
      ElMessage.error('批量删除失败');
    }
  }).catch(() => {});
};
</script>

<style scoped>
.accessories-container {
  padding: 20px;
}
</style> 
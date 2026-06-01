<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="配件标签管理"
      :columns="columns"
      :search-columns="searchColumns"
      :request-api="getAccessoriesTagListApi"
      :init-param="{ pageNum: 1, pageSize: 10 }"
      row-key="id"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button type="primary" v-auth="'w.accessories.tag.create'" :icon="CirclePlus" @click="openAddEdit('新增配件标签')">
          新增
        </el-button>
        <el-button
          v-auth="'w.accessories.tag.remove'"
          type="danger"
          :icon="Delete"
          plain
          :disabled="!scope.isSelected"
          @click="batchDelete(scope.selectedListIds)"
        >
          批量删除
        </el-button>
      </template>
      <!-- 表格操作 -->
      <template #operation="{ row }">
        <el-button v-auth="'w.accessories.tag.update'" type="primary" link :icon="EditPen" @click="openAddEdit('编辑配件标签', row)">
          编辑
        </el-button>
        <el-button v-auth="'w.accessories.tag.remove'" type="primary" link :icon="Delete" @click="deleteInfo(row)">
          删除
        </el-button>
      </template>
    </ProTable>
    <!-- 抽屉表单 -->
    <TagForm ref="tagFormRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CirclePlus, Delete, EditPen } from '@element-plus/icons-vue';
import { useHandleData } from '@/hooks/useHandleData';
import ProTable from '@/components/ProTable/index.vue';
import TagForm from './components/TagForm.vue';
import { getAccessoriesTagListApi, createAccessoriesTagApi, updateAccessoriesTagApi, removeAccessoriesTagApi } from '@/api/modules/accessories/accessoriesTag';
import type { ColumnProps } from '@/components/ProTable/interface';
import type { SearchProps } from '@/components/ProTable/interface';
import type { IAccessoriesTag } from '@/api/interface/accessories/accessoriesTag';

// 表格配置项
const columns: ColumnProps<IAccessoriesTag.Row>[] = [
  { type: 'selection', width: 80 },
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'accessoriesTypeName', label: '配件类型' },
  { prop: 'tagName', label: '标签名称' },
  { prop: 'createTime', label: '创建时间' },
  { prop: 'operation', label: '操作', width: 180, fixed: 'right' }
];

// 搜索条件项
const searchColumns: SearchProps[] = [
  { prop: 'typeId', label: '配件类型', el: 'select', options: [], api: true, apiUrl: '/w-accessories-type', labelKey: 'name', valueKey: 'id' },
  { prop: 'tagName', label: '标签名称', el: 'input' },
  {
    prop: 'createTime',
    label: '创建时间',
    el: 'date-picker',
    span: 2,
    props: {
      type: 'datetimerange',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];

const proTableRef = ref<InstanceType<typeof ProTable>>();
const tagFormRef = ref<InstanceType<typeof TagForm>>();

// 打开新增/编辑弹窗
const openAddEdit = (title: string, row?: IAccessoriesTag.Row) => {
  tagFormRef.value?.acceptParams({
    title,
    row: row ? { ...row } : undefined,
    api: row && row.id ? updateAccessoriesTagApi : createAccessoriesTagApi,
    getTableList: proTableRef.value?.getTableList
  });
};

// 删除信息
const deleteInfo = async (params: IAccessoriesTag.Row) => {
  await useHandleData(removeAccessoriesTagApi, { ids: [params.id] }, `删除【${params.tagName}】标签`);
  proTableRef.value?.getTableList();
};

// 批量删除信息
const batchDelete = async (ids: (string | number)[]) => {
  await useHandleData(removeAccessoriesTagApi, { ids }, '删除所选标签');
  proTableRef.value?.clearSelection();
  proTableRef.value?.getTableList();
};
</script> 
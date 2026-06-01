<template>
  <el-drawer
    v-model="drawerVisible"
    :title="drawerProps.title"
    :size="1000"
    :destroy-on-close="true"
    direction="rtl"
    :close-on-click-modal="false"
    @open="onDrawerOpen"
  >
    <div class="accessories-config-container" v-loading="loading">
      <!-- 顶部操作栏 -->
      <div class="action-bar">
        <el-button type="primary" @click="openSelectDialog">添加配件类型</el-button>
      </div>

      <!-- 配件类型表格 -->
      <el-table :data="accessoriesTypeList" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="配件类型名称" min-width="150">
          <template #default="scope">
            <!-- 打印 scope 和 row 的信息 -->
            <div>
              {{ scope.row && scope.row.name ? scope.row.name : scope.row.accessoriesTypeName }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="editCoordinates(row)"
              >设置坐标</el-button
            >
            <el-button type="danger" link @click="removeAccessoriesType(row)"
              >移除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 选择配件类型弹窗 -->
      <el-dialog
        v-model="selectDialogVisible"
        title="选择配件类型"
        width="800px"
        destroy-on-close
        :close-on-click-modal="false"
      >
        <div style="margin-bottom: 15px">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入配件类型名称搜索"
            clearable
            style="width: 300px"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
        <el-table
          :data="allAccessoriesTypeList"
          border
          @selection-change="handleSelectionChange"
          :max-height="500"
          v-loading="searchLoading"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="配件类型名称" min-width="150" />
        </el-table>
        <template #footer>
          <el-button @click="selectDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmSelectAccessoriesType"
            :loading="confirmLoading"
            >确定</el-button
          >
        </template>
      </el-dialog>

      <!-- 坐标编辑弹窗 -->
      <el-dialog
        v-model="coordDialogVisible"
        title="设置坐标"
        width="400px"
        destroy-on-close
        :close-on-click-modal="false"
      >
        <el-form :model="coordForm" label-width="80px">
          <el-form-item label="配件类型">{{ coordForm.name }}</el-form-item>
          <el-form-item label="X坐标">
            <el-input-number v-model="coordForm.x" :precision="2" :step="0.1" />
          </el-form-item>
          <el-form-item label="Y坐标">
            <el-input-number v-model="coordForm.y" :precision="2" :step="0.1" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="coordDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmEditCoordinates"
            :loading="coordLoading"
            >确定</el-button
          >
        </template>
      </el-dialog>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import {
  getProductAccessoriesTypeListApi,
  createProductAccessoriesTypeApi,
  removeProductAccessoriesTypeApi,
  updateProductAccessoriesTypeCoordApi,
} from "@/api/modules/product/productAccessoriesType";
import { getAllAccessoriesTypeListApi, getAccessoriesTypeListApi } from "@/api/modules/accessories/accessoriesType";
import type { IAccessoriesType } from "@/api/interface/accessories/accessoriesType";
import type { IProductAccessoriesType } from "@/api/interface/product/productAccessoriesType";

// 接收参数
interface DrawerProps {
  title: string;
  productId: number;
}

// drawer状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  productId: 0,
});

// 数据加载
const loading = ref(false);
const accessoriesTypeList = ref<IProductAccessoriesType.Row[]>([]);

// 选择配件类型弹窗
const selectDialogVisible = ref(false);
const allAccessoriesTypeList = ref<IAccessoriesType.Row[]>([]);
const selectedTypes = ref<IAccessoriesType.Row[]>([]);
const confirmLoading = ref(false);
const searchKeyword = ref("");
const searchLoading = ref(false);

// 坐标编辑弹窗
const coordDialogVisible = ref(false);
const coordForm = reactive({
  id: 0,
  name: "",
  x: 0,
  y: 0,
});
const coordLoading = ref(false);

// 类型映射
const typeMap = ref({
  1: "表带",
  2: "表盘",
  3: "表壳",
  4: "指针",
});

// 获取类型名称
const getTypeName = (typeId) => {
  return typeMap.value[typeId] || `未知类型(ID:${typeId})`;
};

// 处理后的配件类型列表
const processedAccessoriesTypeList = computed(() => {
  return accessoriesTypeList.value.map((item) => {
    console.log("处理配件类型:", item);
    const typeName = getTypeName(item.accessoriesTypeId);
    return {
      ...item,
      accessoriesTypeName: typeName,
    };
  });
});

// 抽屉打开时触发
const onDrawerOpen = async () => {
  console.log("抽屉打开，立即获取配件类型数据");
  try {
    const res = await getAllAccessoriesTypeListApi();
    console.log("获取所有配件类型响应:", res);

    if (res && res.data && res.data.rows) {
      const types = res.data.rows;
      console.log("配件类型原始数据:", types);

      // 更新映射
      types.forEach((type) => {
        if (type && type.id) {
          typeMap.value[type.id] = type.name;
          console.log(`添加映射: ID ${type.id} -> 名称 "${type.name}"`);
        }
      });
      console.log("类型映射更新完成:", typeMap.value);
    }
  } catch (error) {
    console.error("获取配件类型数据失败:", error);
  }
};

// 接收参数
const acceptParams = async (params: DrawerProps) => {
  console.log("acceptParams被调用，参数:", params);
  drawerProps.value = params;
  drawerVisible.value = true;

  // 获取商品关联的配件类型
  getAccessoriesTypeList();
};

// 获取配件类型列表
const getAccessoriesTypeList = async () => {
  try {
    loading.value = true;

    // 先获取所有配件类型
    const typeRes = await getAllAccessoriesTypeListApi();
    console.log("获取所有配件类型响应:", typeRes);

    if (typeRes && typeRes.data && typeRes.data.rows) {
      const types = typeRes.data.rows;

      // 更新映射
      types.forEach((type) => {
        if (type && type.id) {
          typeMap.value[type.id] = type.name;
        }
      });
      console.log("类型映射更新完成:", typeMap.value);
    }

    // 获取商品关联的配件类型
    const res = await getProductAccessoriesTypeListApi({
      productId: drawerProps.value.productId,
    });

    console.log("获取商品配件类型列表响应:", res);
    accessoriesTypeList.value = res.data.rows || [];

    // 打印每一行的结构
    accessoriesTypeList.value.forEach((row, index) => {
      console.log(`第 ${index + 1} 行数据:`, row);
      console.log(`第 ${index + 1} 行属性:`, Object.keys(row));
    });
  } catch (error) {
    console.error("获取商品配件类型列表失败:", error);
    ElMessage.error("获取配件类型列表失败");
  } finally {
    loading.value = false;
  }
};

// 打开选择配件类型弹窗
const openSelectDialog = async () => {
  selectDialogVisible.value = true;
  selectedTypes.value = [];
  searchKeyword.value = "";

  try {
    await loadAccessoriesTypeList();
  } catch (error) {
    console.error(error);
    ElMessage.error("获取所有配件类型失败");
  }
};

// 加载配件类型列表（支持搜索）
const loadAccessoriesTypeList = async () => {
  try {
    searchLoading.value = true;
    
    // 如果有搜索关键字，使用带搜索参数的API
    if (searchKeyword.value && searchKeyword.value.trim()) {
      const params: IAccessoriesType.Query = {
        page: 1,
        limit: 1000, // 设置足够大以获取所有数据
        name: searchKeyword.value.trim(),
      };
      const res = await getAccessoriesTypeListApi(params);
      allAccessoriesTypeList.value = res.data.rows || [];
    } else {
      // 没有搜索关键字时，使用 getAllAccessoriesTypeListApi 获取所有数据
      const res = await getAllAccessoriesTypeListApi();
      allAccessoriesTypeList.value = res.data.rows || [];
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("获取配件类型列表失败");
  } finally {
    searchLoading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  loadAccessoriesTypeList();
};

// 表格选择变化
const handleSelectionChange = (selection: IAccessoriesType.Row[]) => {
  selectedTypes.value = selection;
};

// 确认选择的配件类型
const confirmSelectAccessoriesType = async () => {
  if (selectedTypes.value.length === 0) {
    ElMessage.warning("请至少选择一个配件类型");
    return;
  }

  try {
    confirmLoading.value = true;
    // 过滤出已关联的配件类型ID
    const existTypeIds = accessoriesTypeList.value.map((item) => item.id);
    // 过滤出新选择的未关联的配件类型
    const newSelectTypes = selectedTypes.value.filter(
      (item) => !existTypeIds.includes(item.id)
    );

    if (newSelectTypes.length === 0) {
      ElMessage.warning("选择的配件类型已全部关联");
      selectDialogVisible.value = false;
      return;
    }

    // 添加新的关联
    for (const type of newSelectTypes) {
      await createProductAccessoriesTypeApi({
        productId: drawerProps.value.productId,
        accessoriesTypeId: type.id,
      });
    }

    ElMessage.success("添加成功");
    selectDialogVisible.value = false;
    getAccessoriesTypeList();
  } catch (error) {
    console.error(error);
    ElMessage.error("添加配件类型关联失败");
  } finally {
    confirmLoading.value = false;
  }
};

// 移除配件类型
const removeAccessoriesType = (row: IProductAccessoriesType.Row) => {
  const typeName = getTypeName(row.accessoriesTypeId);
  ElMessageBox.confirm(`确认移除配件类型 "${typeName}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      loading.value = true;
      await removeProductAccessoriesTypeApi({
        ids: [row.id],
      });
      ElMessage.success("移除成功");
      getAccessoriesTypeList();
    } catch (error) {
      console.error(error);
      ElMessage.error("移除配件类型失败");
    } finally {
      loading.value = false;
    }
  });
};

// 编辑坐标
const editCoordinates = (row: IProductAccessoriesType.Row) => {
  coordForm.id = row.id;
  coordForm.name = getTypeName(row.accessoriesTypeId);
  coordForm.x = row.x || 0;
  coordForm.y = row.y || 0;
  coordDialogVisible.value = true;
};

// 确认编辑坐标
const confirmEditCoordinates = async () => {
  try {
    coordLoading.value = true;
    // 修改为使用标准更新API
    await updateProductAccessoriesTypeCoordApi({
      id: coordForm.id,
      productId: drawerProps.value.productId,
      accessoriesTypeId: coordForm.id,
      x: coordForm.x,
      y: coordForm.y,
    });
    ElMessage.success("更新坐标成功");
    coordDialogVisible.value = false;
    getAccessoriesTypeList();
  } catch (error) {
    console.error(error);
    ElMessage.error("更新坐标失败");
  } finally {
    coordLoading.value = false;
  }
};

// 监听抽屉可见性变化
watch(drawerVisible, async (newVal) => {
  if (newVal) {
    console.log("【DEBUG】抽屉已打开，尝试初始化配件类型映射");
    await getAccessoriesTypeList();
  }
});

// 确保组件挂载时也尝试获取配件类型映射
onMounted(() => {
  console.log("【DEBUG】组件已挂载，尝试初始化配件类型映射");
  onDrawerOpen();
});

// 直接在脚本加载时执行一次
console.log("【DEBUG】脚本加载，立即尝试获取配件类型映射");
getAccessoriesTypeList();

// 暴露方法
defineExpose({
  acceptParams,
});

// 添加打印行信息的函数
const logRowInfo = (row) => {
  console.log('行数据完整结构:', row);
  console.log('行数据属性列表:', Object.keys(row));
  console.log('行数据 name 属性:', row.name);
  console.log('行数据 accessoryTypeId 属性:', row.accessoryTypeId);
  
  // 如果有其他重要属性，也可以打印出来
};
</script>

<style scoped>
.accessories-config-container {
  padding: 20px;
}

.action-bar {
  margin-bottom: 20px;
}
</style>

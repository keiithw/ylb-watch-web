<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="商品管理"
      :indent="20"
      :columns="columns"
      :search-columns="searchColumns"
      :request-api="getTableList"
      row-key="id"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button
          type="primary"
          v-auth="'product.create'"
          :icon="CirclePlus"
          @click="openAddEdit('新增商品')"
        >
          新增
        </el-button>
        <el-button
          v-auth="'product.remove'"
          type="danger"
          :icon="Delete"
          plain
          :disabled="!scope.isSelected"
          @click="batchDelete(scope.selectedListIds)"
        >
          批量删除
        </el-button>
        <el-button
          v-auth="'product.import'"
          type="primary"
          :icon="Upload"
          plain
          @click="importData"
        >
          导入
        </el-button>
        <el-button
          v-auth="'product.export'"
          type="primary"
          :icon="Download"
          plain
          @click="downloadFile"
        >
          导出
        </el-button>
        <el-button
          v-auth="'w.web.config.query_table'"
          type="primary"
          :icon="Setting"
          plain
          @click="openWebConfig"
        >
          页面配置
        </el-button>
      </template>
      <template #photoFront="scope">
        <div class="image-preview-container">
          <el-image
            :src="scope.row.photoFront"
            :preview-src-list="getPreviewList(scope.row)"
            :initial-index="0"
            preview-teleported
            fit="cover"
            class="preview-image"
            loading="lazy"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>加载失败</span>
              </div>
            </template>
            <template #placeholder>
              <div class="image-loading">
                <el-icon><Loading /></el-icon>
              </div>
            </template>
          </el-image>
          <div class="image-preview-tip">点击预览</div>
        </div>
      </template>
      <template #photo_back="{ row }">
        <el-image
          v-if="row.photo_back"
          :src="row.photo_back"
          :preview-src-list="[row.photo_back]"
          fit="cover"
          class="table-image"
          preview-teleported
        />
        <span v-else>-</span>
      </template>
      <template #operation="{ row }">
        <el-button
          v-auth="'product.update'"
          type="primary"
          link
          :icon="EditPen"
          @click="openAddEdit('编辑商品', row, false)"
        >
          编辑
        </el-button>
        <el-button
          v-auth="'product.accessories'"
          type="success"
          link
          :icon="Connection"
          @click="openAccessoriesConfig(row)"
        >
          配件配置
        </el-button>
        <el-button
          v-auth="'product.remove'"
          type="primary"
          link
          :icon="Delete"
          @click="handleDelete(row)"
        >
          删除
        </el-button>
      </template>
    </ProTable>
    <ProductForm ref="productFormRef" />
    <AccessoriesConfig ref="accessoriesConfigRef" />
    <ImportExcel ref="ImportExcelRef" />
    <WebConfig ref="webConfigRef" />
  </div>
</template>

<script setup lang="ts">
import { h, ref } from "vue";
import {
  CirclePlus,
  Delete,
  EditPen,
  Upload,
  Download,
  Connection,
  Picture,
  Loading,
  Setting,
} from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import {
  createProductApi,
  removeProductApi,
  updateProductApi,
  getProductListApi,
  getProductDetailApi,
  importProductExcelApi,
  exportProductExcelApi,
  deleteProductApi,
} from "@/api/modules/product/product";
import { useHandleData } from "@/hooks/useHandleData";
import ProductForm from "@/views/product/components/ProductForm.vue";
import AccessoriesConfig from "@/views/product/components/AccessoriesConfig.vue";
import { useOptionsStore } from "@/stores/modules/options";
import type {
  ColumnProps,
  ProTableInstance,
  SearchProps,
} from "@/components/ProTable/interface";
import type { IProduct } from "@/api/interface/product/product";
import ImportExcel from "@/components/ImportExcel/index.vue";
import { downloadTemplate } from "@/api/modules/system/common";
import { ElMessageBox, ElMessage } from "element-plus";
import { useDownload } from "@/hooks/useDownload";
import WebConfig from "@/views/product/components/WebConfig.vue";

defineOptions({
  name: "ProductView",
});

const optionsStore = useOptionsStore();
const proTableRef = ref<ProTableInstance>();

// 表格配置项
const columns: ColumnProps<IProduct.Row>[] = [
  { type: "selection", width: 80 },
  { prop: "id", label: "ID", width: 80 },
  { prop: "name", label: "商品名称" },
  { prop: "subName", label: "二级标题" },
  {
    prop: "price",
    label: "价格",
    render: ({ row }) => {
      return row.price != null ? `$${Number(row.price).toFixed(2)}` : '--';
    }
  },
  {
    prop: "displayArea",
    label: "展示区域",
    width: 100,
    render: ({ row }) => {
      const areaMap = {
        promo: "宣传区",
        featured: "甄选区", 
        selected: "精选区",
        hot: "热销区",
        featured_picks: "FEATURED PICKS (精选商品)",
        new_arrivals: "New Arrivals (新品上市)",
        timeless_classics: "Timeless Classics (永恒经典)",
        trending_now: "Trending Now (热门趋势)",
        big_sales: "Big Sales Up to 70% Off (大促销)"
      };
      return areaMap[row.displayArea] || "-";
    }
  },
  { prop: "sortOrder", label: "排序", width: 80 },
  //   { prop: 'seriesName', label: '系列名称' },
  {
    prop: "photoFront",
    label: "商品图片",
    width: 100,
    slot: true,
  },
  //   { prop: 'diameter', label: '直径大小' },
  //   { prop: 'waterResistance', label: '防水深度(米)' },
  //   { prop: 'createTime', label: '创建时间' },
  { prop: "operation", label: "操作", width: 250, fixed: "right" },
];

// 搜索条件项
const searchColumns: SearchProps[] = [
  { prop: "name", label: "商品名称", el: "input" },
  { prop: "subName", label: "子名称", el: "input" },
  { prop: "seriesName", label: "系列名称", el: "input" },
  {
    prop: "displayArea",
    label: "展示区域",
    el: "select",
    props: {
      options: [
        { label: "宣传区", value: "promo" },
        { label: "甄选区", value: "featured" },
        { label: "精选区", value: "selected" },
        { label: "热销区", value: "hot" },
        { label: "FEATURED PICKS (精选商品)", value: "featured_picks" },
        { label: "New Arrivals (新品上市)", value: "new_arrivals" },
        { label: "Timeless Classics (永恒经典)", value: "timeless_classics" },
        { label: "Trending Now (热门趋势)", value: "trending_now" },
        { label: "Big Sales Up to 70% Off (大促销)", value: "big_sales" }
      ]
    }
  },
  {
    prop: "price",
    label: "价格区间",
    el: "number-range",
    span: 2,
    props: {
      min: 0,
    },
  },
  {
    prop: "createTime",
    label: "创建时间",
    el: "date-picker",
    span: 2,
    props: {
      type: "datetimerange",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
    },
  },
];

// 获取table列表
const getTableList = (params: IProduct.Query) => {
  let newParams = formatParams(params);
  return getProductListApi(newParams);
};

// 完全重写 formatParams 函数，避免 JSON 解析错误
const formatParams = (params) => {
  // 创建一个新对象，避免修改原始对象
  const result = {};

  // 安全地复制所有非 undefined/null 值
  for (const key in params) {
    // 跳过 undefined 和 null 值
    if (params[key] === undefined || params[key] === null) {
      continue;
    }

    // 直接赋值，不进行 JSON 解析
    result[key] = params[key];
  }

  // 处理日期范围
  if (
    result.createTime &&
    Array.isArray(result.createTime) &&
    result.createTime.length === 2
  ) {
    result.createTimeStart = result.createTime[0];
    result.createTimeEnd = result.createTime[1];
    delete result.createTime;
  }

  // 处理价格范围
  if (result.price && Array.isArray(result.price) && result.price.length === 2) {
    result.minPrice = result.price[0];
    result.maxPrice = result.price[1];
    delete result.price;
  }

  return result;
};

// 打开 drawer(新增、查看、编辑)
const productFormRef = ref<InstanceType<typeof ProductForm>>();
const openAddEdit = async (title: string, row: any = {}, isAdd = true) => {
  if (!isAdd) {
    const record = await getProductDetailApi({ id: row?.id });
    row = record?.data;
  }
  const params = {
    title,
    row: { ...row },
    api: isAdd ? createProductApi : updateProductApi,
    getTableList: proTableRef.value?.getTableList,
  };
  productFormRef.value?.acceptParams(params);
};

// 打开配件配置页面
const accessoriesConfigRef = ref<InstanceType<typeof AccessoriesConfig>>();
const openAccessoriesConfig = (row: IProduct.Row) => {
  const params = {
    title: `配置商品配件: ${row.name}`,
    productId: row.id,
    getTableList: proTableRef.value?.getTableList,
  };
  accessoriesConfigRef.value?.acceptParams(params);
};

// 简化删除方法，只调用API和刷新列表
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除商品 "${row.name}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await deleteProductApi({ ids: [row.id] });

        if (res && res.code === "0000") {
          ElMessage.success("删除成功");
          // 只调用刷新列表方法
          getTableList();
        } else {
          ElMessage.error((res && res.message) || "删除失败");
        }
      } catch (error) {
        console.error("删除商品失败:", error);
        ElMessage.error("删除商品失败");
      }
    })
    .catch(() => {
      // 用户取消删除，不做任何操作
    });
};

// 批量删除信息
const batchDelete = async (ids: (string | number)[]) => {
  await useHandleData(removeProductApi, { ids }, "删除所选商品");
  proTableRef.value?.clearSelection();
  proTableRef.value?.getTableList();
};

// 导入
const ImportExcelRef = ref<InstanceType<typeof ImportExcel>>();
const importData = () => {
  const params = {
    title: "商品",
    templateName: "商品导入模板",
    tempApi: downloadTemplate,
    importApi: importProductExcelApi,
    getTableList: proTableRef.value?.getTableList,
  };
  ImportExcelRef.value?.acceptParams(params);
};

// 导出
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出商品数据?", "温馨提示", { type: "warning" }).then(() => {
    let newParams = formatParams(proTableRef.value?.searchParam as IProduct.Query);
    useDownload(exportProductExcelApi, "商品数据", newParams);
  });
};

// 获取预览图片列表（包含所有图片）
const getPreviewList = (row: IProduct.Row): string[] => {
  const list: string[] = [];
  // 甄选区图片组
  if (row.photoFront) list.push(row.photoFront);
  if (row.photoSide) list.push(row.photoSide);
  if (row.photoDetail) list.push(row.photoDetail);
  if (row.photoBack) list.push(row.photoBack);
  // 其他展示图片
  if (row.posterImage) list.push(row.posterImage);
  if (row.promoImage) list.push(row.promoImage);
  return list.length ? list : [""];
};

const webConfigRef = ref();

const openWebConfig = () => {
  webConfigRef.value?.open();
};
</script>

<style scoped>
.table-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.image-preview-container {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s;
}

.image-preview-container:hover .preview-image {
  transform: scale(1.05);
}

.image-preview-tip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  text-align: center;
  padding: 2px 0;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview-container:hover .image-preview-tip {
  opacity: 1;
}

.image-error,
.image-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #909399;
  font-size: 12px;
}

.image-error .el-icon,
.image-loading .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}
</style>

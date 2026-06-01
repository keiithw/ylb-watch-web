<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="博客文章管理"
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
          v-auth="'w.blog.article.create'"
          :icon="CirclePlus"
          @click="openAddEdit('新增文章')"
        >
          新增
        </el-button>
        <el-button
          v-auth="'w.blog.article.remove'"
          type="danger"
          :icon="Delete"
          plain
          :disabled="!scope.isSelected"
          @click="batchDelete(scope.selectedListIds)"
        >
          批量删除
        </el-button>
      </template>
      <template #coverImage="scope">
        <el-image
          v-if="scope.row.coverImage"
          :src="scope.row.coverImage"
          :preview-src-list="[scope.row.coverImage]"
          fit="cover"
          class="table-image"
          preview-teleported
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
        <span v-else>-</span>
      </template>
      <template #articleStatus="scope">
        <el-tag
          :type="getStatusType(scope.row.articleStatus)"
        >
          {{ getStatusText(scope.row.articleStatus) }}
        </el-tag>
      </template>
      <template #operation="{ row }">
        <el-button
          v-auth="'w.blog.article.update'"
          type="primary"
          link
          :icon="EditPen"
          @click="openAddEdit('编辑文章', row, false)"
        >
          编辑
        </el-button>
        <el-button
          v-auth="'w.blog.article.remove'"
          type="primary"
          link
          :icon="Delete"
          @click="handleDelete(row)"
        >
          删除
        </el-button>
      </template>
    </ProTable>
    <ArticleForm ref="articleFormRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  CirclePlus,
  Delete,
  EditPen,
  Picture,
  Loading,
} from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import {
  createBlogArticleApi,
  removeBlogArticleApi,
  updateBlogArticleApi,
  getBlogArticleListApi,
  getBlogArticleDetailApi,
} from "@/api/modules/blog/article";
import { useHandleData } from "@/hooks/useHandleData";
import ArticleForm from "@/views/blog/article/components/ArticleForm.vue";
import type {
  ColumnProps,
  ProTableInstance,
  SearchProps,
} from "@/components/ProTable/interface";
import type { IBlogArticle } from "@/api/interface/blog/article";
import { ElMessageBox, ElMessage } from "element-plus";

defineOptions({
  name: "BlogArticleView",
});

const proTableRef = ref<ProTableInstance>();

// 表格配置项
const columns: ColumnProps<IBlogArticle.Row>[] = [
  { type: "selection", width: 80 },
  { prop: "id", label: "ID", width: 80 },
  { prop: "title", label: "文章标题", minWidth: 200 },
  { prop: "subtitle", label: "副标题/摘要", minWidth: 150 },
  {
    prop: "coverImage",
    label: "封面图",
    width: 100,
    slot: true,
  },
  {
    prop: "articleStatus",
    label: "状态",
    width: 100,
    slot: true,
  },
  { prop: "viewCount", label: "浏览量", width: 100 },
  { prop: "likeCount", label: "点赞数", width: 100 },
  { prop: "authorName", label: "作者", width: 120 },
  { prop: "publishTime", label: "发布时间", width: 180 },
  { prop: "createTime", label: "创建时间", width: 180 },
  { prop: "operation", label: "操作", width: 180, fixed: "right" },
];

// 搜索条件项
const searchColumns: SearchProps[] = [
  { prop: "title", label: "文章标题", el: "input" },
  {
    prop: "articleStatus",
    label: "文章状态",
    el: "select",
    props: {
      options: [
        { label: "草稿", value: "draft" },
        { label: "已发布", value: "published" },
        { label: "已归档", value: "archived" },
      ]
    }
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
const getTableList = (params: IBlogArticle.Query) => {
  let newParams = formatParams(params);
  return getBlogArticleListApi(newParams);
};

// 格式化参数
const formatParams = (params: any) => {
  const result: any = {};

  for (const key in params) {
    if (params[key] === undefined || params[key] === null) {
      continue;
    }
    result[key] = params[key];
  }

  // 处理日期范围
  if (
    result.createTime &&
    Array.isArray(result.createTime) &&
    result.createTime.length === 2
  ) {
    result.startTime = result.createTime[0];
    result.endTime = result.createTime[1];
    delete result.createTime;
  }

  return result;
};

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: "info",
    published: "success",
    archived: "warning",
  };
  return statusMap[status] || "info";
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: "草稿",
    published: "已发布",
    archived: "已归档",
  };
  return statusMap[status] || status;
};

// 打开 drawer(新增、查看、编辑)
const articleFormRef = ref<InstanceType<typeof ArticleForm>>();
const openAddEdit = async (title: string, row: any = {}, isAdd = true) => {
  if (!isAdd) {
    const record = await getBlogArticleDetailApi({ id: row?.id });
    row = record?.data;
  }
  const params = {
    title,
    row: { ...row },
    api: isAdd ? createBlogArticleApi : updateBlogArticleApi,
    getTableList: proTableRef.value?.getTableList,
  };
  articleFormRef.value?.acceptParams(params);
};

// 删除
const handleDelete = (row: IBlogArticle.Row) => {
  ElMessageBox.confirm(`确定要删除文章 "${row.title}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await removeBlogArticleApi({ ids: [row.id] });
        if (res && res.code === "0000") {
          ElMessage.success("删除成功");
          proTableRef.value?.getTableList();
        } else {
          ElMessage.error((res && res.message) || "删除失败");
        }
      } catch (error) {
        console.error("删除文章失败:", error);
        ElMessage.error("删除文章失败");
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};

// 批量删除
const batchDelete = async (ids: (string | number)[]) => {
  await useHandleData(removeBlogArticleApi, { ids }, "删除所选文章");
  proTableRef.value?.clearSelection();
  proTableRef.value?.getTableList();
};
</script>

<style scoped>
.table-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.image-error,
.image-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  color: #909399;
  font-size: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.image-error .el-icon,
.image-loading .el-icon {
  font-size: 20px;
  margin-bottom: 4px;
}
</style>

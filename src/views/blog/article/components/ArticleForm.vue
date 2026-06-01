<template>
  <el-drawer
    v-model="drawerVisible"
    :title="drawerProps.title"
    :size="1200"
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
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入文章标题" maxlength="200" show-word-limit clearable />
      </el-form-item>
      <el-form-item label="副标题/摘要" prop="subtitle">
        <el-input
          v-model="formData.subtitle"
          type="textarea"
          placeholder="请输入副标题或摘要"
          maxlength="300"
          show-word-limit
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <BlogRichTextEditor v-model="formData.content" />
        <div class="form-tip">支持直接输入、粘贴富文本内容，微信截图可直接粘贴自动上传</div>
      </el-form-item>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="封面图片" prop="coverImage">
            <UploadImg v-model:image-url="formData.coverImage" width="200px" height="150px" dir="blog" />
            <div class="image-tip">用于列表页和详情页展示</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文章状态" prop="articleStatus">
            <el-radio-group v-model="formData.articleStatus">
              <el-radio value="visible">可见</el-radio>
              <el-radio value="hidden">隐藏</el-radio>
            </el-radio-group>
            <div class="form-tip">可见：文章已发布，隐藏：文章为草稿</div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="发布时间" prop="publishTime">
            <el-date-picker
              v-model="formData.publishTime"
              type="datetime"
              placeholder="选择发布时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
            <div class="form-tip">状态为"可见"时，如未设置则自动使用当前时间</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序顺序" prop="sortOrder">
            <el-input-number v-model="formData.sortOrder" :min="0" controls-position="right" placeholder="数字越小越靠前" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="作者名称" prop="authorName">
        <el-input v-model="formData.authorName" placeholder="请输入作者名称" maxlength="50" clearable />
      </el-form-item>
      <el-divider content-position="left">SEO设置（可选）</el-divider>
      <el-form-item label="SEO关键词" prop="seoKeywords">
        <el-input
          v-model="formData.seoKeywords"
          type="textarea"
          placeholder="请输入SEO关键词，多个关键词用逗号分隔"
          maxlength="500"
          show-word-limit
          :rows="2"
        />
      </el-form-item>
      <el-form-item label="SEO描述" prop="seoDescription">
        <el-input
          v-model="formData.seoDescription"
          type="textarea"
          placeholder="请输入SEO描述"
          maxlength="500"
          show-word-limit
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="URL标识" prop="slug">
        <el-input v-model="formData.slug" placeholder="请输入URL友好标识（如：my-blog-article）" maxlength="200" clearable />
        <div class="form-tip">用于生成友好的URL，如不填写将自动生成</div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import UploadImg from '@/components/Upload/Img.vue';
import type { IBlogArticle } from '@/api/interface/blog/article';
import { processRichTextImages } from '@/api/modules/system/upload';
import BlogRichTextEditor from '@/components/RichText/BlogRichTextEditor.vue';

// 初始化表单数据
const formDataInit = {
  title: '',
  subtitle: '',
  content: '',
  contentText: '',
  coverImage: '',
  categoryId: undefined,
  articleStatus: 'hidden', // 默认隐藏（草稿）
  publishTime: '',
  seoKeywords: '',
  seoDescription: '',
  slug: '',
  sortOrder: 0,
  authorName: '',
};

// 接收参数
interface DrawerProps {
  title: string;
  row: any;
  api: (params: any) => Promise<any>;
  getTableList?: () => void;
}

// drawer状态
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: '',
  row: {},
  api: () => Promise.resolve()
});

// 表单数据
const formRef = ref<FormInstance>();
const formData = reactive<IBlogArticle.CreateParams>({ ...formDataInit });

// 表单校验规则
const formRules = reactive<FormRules>({
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }]
});

// 提交loading
const submitLoading = ref(false);

// 接受参数
const acceptParams = (params: DrawerProps) => {
  drawerProps.value = params;
  drawerVisible.value = true;
  
  // 重置表单数据
  Object.keys(formData).forEach(key => {
    formData[key] = formDataInit[key];
  });
  
  // 如果是编辑模式，则填充表单数据
  if (params.row && params.row.id) {
    // 映射后端返回的数据到表单
    formData.title = params.row.title || '';
    formData.subtitle = params.row.subtitle || '';
    formData.content = params.row.content || '';
    formData.contentText = params.row.contentText || '';
    formData.coverImage = params.row.coverImage || '';
    formData.categoryId = params.row.categoryId;
    // 状态映射：published -> visible, draft -> hidden
    if (params.row.articleStatus === 'published') {
      formData.articleStatus = 'visible';
    } else if (params.row.articleStatus === 'draft') {
      formData.articleStatus = 'hidden';
    } else {
      formData.articleStatus = params.row.articleStatus || 'hidden';
    }
    formData.publishTime = params.row.publishTime || '';
    formData.seoKeywords = params.row.seoKeywords || '';
    formData.seoDescription = params.row.seoDescription || '';
    formData.slug = params.row.slug || '';
    formData.sortOrder = params.row.sortOrder || 0;
    formData.authorName = params.row.authorName || '';
  }
};

// 提交
const handleSubmit = async () => {
  await formRef.value?.validate();
  try {
    submitLoading.value = true;
    const params = { ...formData };
    
    // 处理富文本内容中的图片（base64和外部链接）
    if (params.content) {
      try {
        const processedContent = await processRichTextImages(params.content, 'blog');
        if (processedContent && processedContent.data) {
          params.content = processedContent.data;
          ElMessage.success('图片已自动上传到服务器');
        }
      } catch (error) {
        console.error('处理富文本图片失败:', error);
        ElMessage.warning('图片处理失败，将使用原始内容');
      }
    }
    
    // 处理id参数（区分新增和编辑）
    if (drawerProps.value.row.id) {
      params.id = drawerProps.value.row.id;
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

<style scoped>
.image-tip,
.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.el-divider {
  margin: 20px 0;
}
</style>

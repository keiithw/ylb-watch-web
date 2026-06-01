<template>
  <el-drawer
    v-model="drawerVisible"
    :title="drawerProps.title"
    :size="1000"
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
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入商品名称" maxlength="200" show-word-limit clearable />
      </el-form-item>
      <el-form-item label="子名称" prop="subName">
        <el-input v-model="formData.subName" placeholder="请输入子名称" maxlength="20" show-word-limit clearable />
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 8px; color: #606266;">$</span>
          <el-input-number v-model="formData.price" :precision="2" :step="0.1" :min="0" controls-position="right" style="flex: 1;" />
        </div>
      </el-form-item>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="展示区域" prop="displayArea">
            <el-select v-model="formData.displayArea" placeholder="请选择展示区域" clearable>
              <el-option label="宣传区" value="promo" />
              <el-option label="甄选区" value="featured" />
              <el-option label="精选区" value="selected" />
              <el-option label="热销区" value="hot" />
              <el-option label="FEATURED PICKS (精选商品)" value="featured_picks" />
              <el-option label="New Arrivals (新品上市)" value="new_arrivals" />
              <el-option label="Timeless Classics (永恒经典)" value="timeless_classics" />
              <el-option label="Trending Now (热门趋势)" value="trending_now" />
              <el-option label="Big Sales Up to 70% Off (大促销)" value="big_sales" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number v-model="formData.sortOrder" :min="0" controls-position="right" placeholder="数字越小越靠前" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="系列名称" prop="seriesName">
        <el-input v-model="formData.seriesName" placeholder="请输入系列名称" maxlength="200" show-word-limit clearable />
      </el-form-item>
      
      <!-- 甄选区图片组 -->
      <el-divider content-position="left">甄选区图片</el-divider>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="正面图" prop="photoFront">
            <UploadImg v-model:image-url="formData.photoFront" width="150px" height="150px" />
            <div class="image-tip">甄选区第1张图片</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="侧面图" prop="photoSide">
            <UploadImg v-model:image-url="formData.photoSide" width="150px" height="150px" />
            <div class="image-tip">甄选区第2张图片</div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="细节图" prop="photoDetail">
            <UploadImg v-model:image-url="formData.photoDetail" width="150px" height="150px" />
            <div class="image-tip">甄选区第3张图片</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="背面图" prop="photoBack">
            <UploadImg v-model:image-url="formData.photoBack" width="150px" height="150px" />
            <div class="image-tip">甄选区第4张图片</div>
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 其他展示图片 -->
      <el-divider content-position="left">其他展示图片</el-divider>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="海报图" prop="posterImage">
            <UploadImg v-model:image-url="formData.posterImage" width="150px" height="150px" />
            <div class="image-tip">甄选区左侧、精选区右侧</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="宣传图" prop="promoImage">
            <UploadImg v-model:image-url="formData.promoImage" width="150px" height="150px" />
            <div class="image-tip">宣传区背景图</div>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="机芯描述" prop="movement">
        <el-input
          v-model="formData.movement"
          type="textarea"
          placeholder="请输入机芯描述"
          maxlength="200"
          show-word-limit
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="表壳描述" prop="caseDes">
        <el-input
          v-model="formData.caseDes"
          type="textarea"
          placeholder="请输入表壳描述"
          maxlength="200"
          show-word-limit
          :rows="3"
        />
      </el-form-item>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="直径大小" prop="diameter">
            <el-input-number v-model="formData.diameter" :precision="1" :step="0.1" :min="0" controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="防水深度(米)" prop="waterResistance">
            <el-input-number v-model="formData.waterResistance" :min="0" controls-position="right" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="商品介绍" prop="desc">
        <el-input
          v-model="formData.desc"
          type="textarea"
          placeholder="请输入商品介绍"
          maxlength="300"
          show-word-limit
          :rows="5"
        />
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
import UploadImg from '@/components/Upload/UploadImg.vue';
import type { IProduct } from '@/api/interface/product/product';

// 初始化表单数据
const formDataInit = {
  name: '',
  subName: '',
  price: 0,
  displayArea: '',
  sortOrder: 0,
  photoFront: '',
  photoBack: '',
  photoSide: '',
  photoDetail: '',
  posterImage: '',
  promoImage: '',
  movement: '',
  caseDes: '',
  diameter: undefined,
  waterResistance: undefined,
  desc: '',
  seriesName: ''
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
const formData = reactive<IProduct.CreateParams>({ ...formDataInit });

// 表单校验规则
const formRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { max: 200, message: '商品名称长度不能超过 200 个字符', trigger: 'blur' }
  ],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }]
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
    console.log('回显数据:', params.row); // 调试日志
    
    // 映射后端返回的数据到表单
    formData.name = params.row.name || '';
    formData.subName = params.row.subName || '';
    formData.price = params.row.price || 0;
    formData.displayArea = params.row.displayArea || '';
    formData.sortOrder = params.row.sortOrder || 0;
    formData.photoFront = params.row.photoFront || '';
    formData.photoBack = params.row.photoBack || '';
    formData.photoSide = params.row.photoSide || '';
    formData.photoDetail = params.row.photoDetail || '';
    formData.posterImage = params.row.posterImage || '';
    formData.promoImage = params.row.promoImage || '';
    formData.movement = params.row.movement || '';
    formData.caseDes = params.row.caseDes || '';
    formData.diameter = params.row.diameter;
    formData.waterResistance = params.row.waterResistance;
    formData.desc = params.row.desc || '';
    formData.seriesName = params.row.seriesName || '';
  }
};

// 提交
const handleSubmit = async () => {
  await formRef.value?.validate();
  try {
    submitLoading.value = true;
    const params = { ...formData };
    
    // 处理id参数（区分新增和编辑）
    if (drawerProps.value.row.id) {
      params.id = drawerProps.value.row.id;
    }
    
    console.log('提交数据:', params); // 调试日志
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
.image-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: center;
}

.el-divider {
  margin: 20px 0;
}
</style> 
<template>
  <el-dialog
    v-model="dialogVisible"
    title="页面配置"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      class="form-box"
    >
      <el-form-item label="英雄区背景" prop="heroBackground">
        <UploadImg v-model:image-url="formData.heroBackground" width="200px" height="100px" />
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入电话" />
      </el-form-item>
      <el-form-item label="邮箱" prop="mail">
        <el-input v-model="formData.mail" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="WhatsApp" prop="whatsapp">
        <el-input v-model="formData.whatsapp" placeholder="请输入WhatsApp" />
      </el-form-item>
      <el-form-item label="微信" prop="wechat">
        <el-input v-model="formData.wechat" placeholder="请输入微信" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getWebConfigApi, updateWebConfigApi } from '@/api/modules/web/webConfig'
import UploadImg from '@/components/Upload/UploadImg.vue'

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  id: 1,
  heroBackground: '',
  phone: '',
  mail: '',
  whatsapp: '',
  wechat: ''
})

const rules = {
  heroBackground: [{ required: true, message: '请上传英雄区背景', trigger: 'change' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  mail: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  whatsapp: [{ required: true, message: '请输入WhatsApp', trigger: 'blur' }],
  wechat: [{ required: true, message: '请输入微信', trigger: 'blur' }]
}

const open = async () => {
  dialogVisible.value = true
  try {
    const res = await getWebConfigApi(1)
    Object.assign(formData, res.data)
  } catch (error) {
    console.error('获取配置失败:', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updateWebConfigApi(formData)
        ElMessage.success('保存成功')
        dialogVisible.value = false
      } catch (error) {
        console.error('保存失败:', error)
      }
    }
  })
}

const handleClose = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

defineExpose({
  open
})
</script>

<style scoped>
.form-box {
  padding: 20px;
}
</style> 
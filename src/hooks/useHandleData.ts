import { ElMessage, ElMessageBox } from 'element-plus';

/**
 * 处理删除确认和API调用的Hook
 */
export const useHandleData = () => {
  /**
   * 删除确认
   * @param params 参数对象，包含message, api和callback
   */
  const confirmDelete = async (params: {
    message?: string;  // 设为可选
    api: () => Promise<any>;
    callback?: () => void;
  }) => {
    try {
      // 使用默认消息，避免显示undefined
      const confirmMessage = params.message || '确定要删除该数据吗？';
      
      await ElMessageBox.confirm(confirmMessage, '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      // 调用删除API
      const res = await params.api();
      if (res.code === 200) {
        ElMessage.success('删除成功');
        params.callback && params.callback();
      }
    } catch (error) {
      // 取消删除不提示错误
      if (error !== 'cancel') {
        console.error('删除失败:', error);
      }
    }
  };

  return {
    confirmDelete
  };
};

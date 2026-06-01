import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAllAccessoriesTagsApi } from '@/api/modules/accessories/accessoriesTag';
import type { IAccessoriesTag } from '@/api/interface/accessories/accessoriesTag';

// 定义标签存储
export const useAccessoriesTagStore = defineStore('accessoriesTag', () => {
  // 所有标签的映射表 {id: 标签对象}
  const tagsMap = ref<Map<number, IAccessoriesTag.Row>>(new Map());
  
  // 是否已加载
  const loaded = ref(false);
  
  // 获取所有标签 - 静默失败，不显示任何提示
  const fetchAllTags = async () => {
    try {
      if (loaded.value) return; // 避免重复加载
      
      const res = await getAllAccessoriesTagsApi();
      
      // 检查返回的数据结构
      let tagsArray: IAccessoriesTag.Row[] = [];
      
      if (res.data) {
        // 如果是分页对象
        if (res.data.rows && Array.isArray(res.data.rows)) {
          tagsArray = res.data.rows;
        } 
        // 如果直接返回数组
        else if (Array.isArray(res.data)) {
          tagsArray = res.data;
        }
      }
      
      // 强制转换为数组
      if (!Array.isArray(tagsArray)) {
        tagsArray = [];
      }
      
      // 使用传统的for循环，避免对undefined使用forEach
      for (let i = 0; i < tagsArray.length; i++) {
        const tag = tagsArray[i];
        if (tag && tag.id) {
          tagsMap.value.set(Number(tag.id), tag);
        }
      }
      
      loaded.value = true;
    } catch (error) {
      console.error('获取标签失败，但不显示错误提示:', error);
      // 故意不显示任何错误提示
    }
  };
  
  // 添加或更新标签
  const addOrUpdateTag = (tag: IAccessoriesTag.Row) => {
    if (tag && typeof tag === 'object' && tag.id) {
      tagsMap.value.set(Number(tag.id), tag);
    }
  };
  
  // 删除标签
  const removeTag = (tagId: number | string) => {
    if (tagId) {
      tagsMap.value.delete(Number(tagId));
    }
  };
  
  // 获取标签名称 - 安全返回空字符串
  const getTagName = (tagId: number | string | undefined): string => {
    if (!tagId) return '';
    const tag = tagsMap.value.get(Number(tagId));
    return tag && tag.tagName ? tag.tagName : '';
  };
  
  // 获取某个类型下的所有标签 - 安全返回空数组
  const getTagsByTypeId = (typeId: number | string): IAccessoriesTag.Row[] => {
    if (!typeId) return [];
    
    const result: IAccessoriesTag.Row[] = [];
    tagsMap.value.forEach((tag) => {
      if (tag && tag.typeId === Number(typeId)) {
        result.push(tag);
      }
    });
    
    return result;
  };
  
  return {
    tagsMap,
    loaded,
    fetchAllTags,
    addOrUpdateTag,
    removeTag,
    getTagName,
    getTagsByTypeId
  };
}); 
import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/interface';
import type { IAccessoriesTag } from '@/api/interface/accessories/accessoriesTag';

/**
 * 查询配件二级标签列表
 * @param params
 * @returns {*}
 */
export const getAccessoriesTagListApi = (params?: IAccessoriesTag.Query) => {
  return http.get<IPage<IAccessoriesTag.Row>>(ADMIN_MODULE + `/w-accessories-tag`, params);
};

/**
 * 根据配件类型ID获取标签列表
 * @param typeId 配件类型ID
 * @returns {*}
 */
export const getAccessoriesTagListByTypeApi = (typeId: number) => {
  // 使用分页接口并传递typeId作为过滤条件
  const params: IAccessoriesTag.Query = {
    pageNum: 1,
    pageSize: 100,  // 设置较大值以获取全部数据
    typeId: typeId
  };
  return http.get<IPage<IAccessoriesTag.Row>>(ADMIN_MODULE + `/w-accessories-tag`, params);
};

/**
 * 根据配件类型ID获取标签列表
 * @param typeId
 * @returns {*}
 */
export const getAccessoriesTagByTypeIdApi = (typeId: number) => {
  // 使用产品配件类型接口获取数据
  return http.get<IAccessoriesTag.Row[]>(ADMIN_MODULE + `/w-product-accessories-type/listByProductId/${typeId}`);
};

/**
 * 添加配件二级标签
 * @param params
 * @returns {*}
 */
export const createAccessoriesTagApi = (params: IAccessoriesTag.CreateParams) => {
  return http.post(ADMIN_MODULE + `/w-accessories-tag`, params);
};

/**
 * 修改配件二级标签
 * @param params
 * @returns {*}
 */
export const updateAccessoriesTagApi = (params: IAccessoriesTag.UpdateParams) => {
  return http.put(ADMIN_MODULE + `/w-accessories-tag`, params);
};

/**
 * 删除配件二级标签
 * @param params
 * @returns {*}
 */
export const removeAccessoriesTagApi = (params: { ids: (string | number)[] }) => {
  return http.delete(ADMIN_MODULE + `/w-accessories-tag`, params);
};

/**
 * 获取配件二级标签详情
 * @param id 标签ID
 * @returns {*}
 */
export const getAccessoriesTagDetailApi = (id: number | string) => {
  return http.get<IAccessoriesTag.Row>(ADMIN_MODULE + `/w-product-accessories-type/${id}`);
};

/**
 * 获取所有标签
 */
export const getAllAccessoriesTagsApi = () => {
  const params = {
    pageNum: 1,
    pageSize: 1000
  };
  return http.get<IPage<IAccessoriesTag.Row>>(ADMIN_MODULE + `/w-accessories-tag`, params)
    .then(res => {
      console.log('API返回的原始数据:', JSON.stringify(res.data));
      // 确保返回的是数组
      return res;
    });
}; 
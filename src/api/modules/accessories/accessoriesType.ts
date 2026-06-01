import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/interface';
import type { IAccessoriesType } from '@/api/interface/accessories/accessoriesType';

/**
 * 查询配件类型列表
 * @param params
 * @returns {*}
 */
export const getAccessoriesTypeListApi = (params: IAccessoriesType.Query) => {
  return http.get<IPage<IAccessoriesType.Row>>(ADMIN_MODULE + `/w-accessories-type`, params);
};

/**
 * 获取所有配件类型列表（使用大页码获取尽可能多的数据）
 * @returns {*}
 */
export const getAllAccessoriesTypeListApi = () => {
  // 使用分页API但设置较大的limit，使用接口定义的类型确保参数正确
  const params: IAccessoriesType.Query = {
    page: 1,
    limit: 1000 // 设置足够大以获取所有数据
  };
  return http.get<IPage<IAccessoriesType.Row>>(ADMIN_MODULE + `/w-accessories-type`, params);
};

/**
 * 添加配件类型
 * @param params
 * @returns {*}
 */
export const createAccessoriesTypeApi = (params: IAccessoriesType.CreateParams) => {
  return http.post(ADMIN_MODULE + `/w-accessories-type`, params);
};

/**
 * 修改配件类型
 * @param params
 * @returns {*}
 */
export const updateAccessoriesTypeApi = (params: IAccessoriesType.UpdateParams) => {
  return http.put(ADMIN_MODULE + `/w-accessories-type`, params);
};

/**
 * 删除配件类型
 * @param params
 * @returns {*}
 */
export const removeAccessoriesTypeApi = (params: { ids: (string | number)[] }) => {
  return http.delete(ADMIN_MODULE + `/w-accessories-type`, params);
};

/**
 * 获取配件类型详情
 * @param id 配件类型ID
 * @returns {*}
 */
export const getAccessoriesTypeDetailApi = (id: number | string) => {
  return http.get<IAccessoriesType.Row>(ADMIN_MODULE + `/w-accessories-type/${id}`);
}; 
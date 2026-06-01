import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/interface';
import type { IAccessories } from '@/api/interface/accessories/accessories';

/**
 * 获取配件列表
 * @param params 查询参数
 * @returns 配件列表
 */
export const getAccessoriesListApi = (params?: IAccessories.Query) => {
  return http.get<IPage<IAccessories.Row>>(ADMIN_MODULE + '/w-accessories', params);
};

/**
 * 创建配件
 * @param data 配件数据
 * @returns 创建结果
 */
export const createAccessoriesApi = (data: IAccessories.Form) => {
  return http.post(ADMIN_MODULE + '/w-accessories', data);
};

/**
 * 更新配件
 * @param data 配件数据
 * @returns 更新结果
 */
export const updateAccessoriesApi = (data: IAccessories.Form) => {
  return http.put(ADMIN_MODULE + '/w-accessories', data);
};

/**
 * 删除配件
 * @param params 删除参数，包含ids数组
 * @returns 删除结果
 */
export const deleteAccessoriesApi = (params: { ids: (string | number)[] }) => {
  return http.delete(ADMIN_MODULE + '/w-accessories', params);
};

/**
 * 获取配件详情
 * @param id 配件ID
 * @returns {*}
 */
export const getAccessoriesDetailApi = (id: number | string) => {
  return http.get<IAccessories.Row>(ADMIN_MODULE + `/w-accessories/${id}`);
}; 
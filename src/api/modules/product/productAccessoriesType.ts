import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/interface';
import type { IProductAccessoriesType } from '@/api/interface/product/productAccessoriesType';
import type { IAccessoriesType } from '@/api/interface/accessories/accessoriesType';

/**
 * 获取商品关联的配件类型列表
 * @param params
 * @returns {*}
 */
export const getProductAccessoriesTypeListApi = (params: { productId: number }) => {
  const { productId } = params;
  return http.get<IPage<IProductAccessoriesType.Row>>(ADMIN_MODULE + `/w-product-accessories-type/listByProductId/${productId}`);
};

/**
 * 添加商品配件类型关联
 * @param params
 * @returns {*}
 */
export const createProductAccessoriesTypeApi = (params: IProductAccessoriesType.CreateParams) => {
  return http.post(ADMIN_MODULE + `/w-product-accessories-type`, params);
};

/**
 * 删除商品配件类型关联
 * @param params
 * @returns {*}
 */
export const removeProductAccessoriesTypeApi = (params: { ids: (string | number)[] }) => {
  return http.delete(ADMIN_MODULE + `/w-product-accessories-type`, params);
};

/**
 * 更新商品配件类型坐标
 * @param params
 * @returns {*}
 */
export const updateProductAccessoriesTypeCoordApi = (params: IProductAccessoriesType.UpdateParams) => {
  return http.put(ADMIN_MODULE + `/w-product-accessories-type`, params);
}; 
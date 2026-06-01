import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/interface';
import type { IProduct } from '@/api/interface/product/product';
import type { UploadRawFile } from 'element-plus/es/components/upload/src/upload';
import type { AxiosRequestConfig } from 'axios';

/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getProductListApi = (params: IProduct.Query) => {
  return http.get<IPage<IProduct.Row>>(ADMIN_MODULE + `/w-product`, params);
};

/**
 * 添加
 * @param params
 * @returns {*}
 */
export const createProductApi = (params: IProduct.CreateParams) => {
  return http.post(ADMIN_MODULE + `/w-product`, params);
};

/**
 * 修改
 * @param params
 * @returns {*}
 */
export const updateProductApi = (params: IProduct.UpdateParams) => {
  return http.put(ADMIN_MODULE + `/w-product`, params);
};

/**
 * 删除
 * @param params
 * @returns {*}
 */
export const removeProductApi = (params: { ids: (string | number)[] }) => {
  return http.delete(ADMIN_MODULE + `/w-product`, params);
};

/**
 * 获取详情
 * @param params
 * @returns {*}
 */
export const getProductDetailApi = (params: { id: number }) => {
  const { id } = params;
  return http.get<IProduct.Row>(ADMIN_MODULE + `/w-product/${id}`);
};

/**
 * 导入excel
 * @param params
 */
export const importProductExcelApi = (params: UploadRawFile, config?: AxiosRequestConfig<{}> | undefined) => {
  return http.upload(ADMIN_MODULE + `/w-product/import`, params, config);
};

/**
 * 导出excel
 * @param params
 * @returns {*}
 */
export const exportProductExcelApi = (params: IProduct.Query) => {
  return http.download(ADMIN_MODULE + `/w-product/export`, params);
};

/**
 * 删除商品
 * @param params
 * @returns {*}
 */
export const deleteProductApi = (params: IProduct.RemoveParams) => {
  return http.delete(ADMIN_MODULE + `/w-product`, params);
}; 
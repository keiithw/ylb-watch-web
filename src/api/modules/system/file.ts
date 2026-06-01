import http from "@/api";
import { ADMIN_MODULE } from "@/api/helper/prefix";
import type { IPage } from '@/api/interface';
import type { ISysFile } from '@/api/interface/system/file';

/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getSysFileListApi = (params: ISysFile.Query) => {
  return http.get<IPage<ISysFile.Row>>(ADMIN_MODULE + `/sys-file`, params);
};

// 上传结果接口定义
export interface UploadResult {
  url: string;
  filename: string;
  objectName: string;
  eTag: string;
  dirTag: string;
  contextType: string;
  size: number;
  fileId: number;
}

/**
 * 上传文件
 * @param data FormData对象，包含file和dirTag
 * @returns 上传结果
 */
export const uploadFileApi = (data: FormData) => {
  return http.post(ADMIN_MODULE + '/sys-file/upload', data);
};

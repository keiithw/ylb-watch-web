import http from "@/api";
import { ADMIN_MODULE } from "@/api/helper/prefix";
import type { IResultData } from "@/api/interface";

export interface WebConfigVO {
  id: number;
  hero_background: string;
  phone: string;
  mail: string;
  whatsapp: string;
  wechat: string;
}

// 获取配置详情
export const getWebConfigApi = (id: number) => {
  return http.get<IResultData<WebConfigVO>>(ADMIN_MODULE + `/web/w-web-config/${id}`);
};

// 更新配置
export const updateWebConfigApi = (data: WebConfigVO) => {
  return http.put<IResultData<null>>(ADMIN_MODULE + `/web/w-web-config`, data);
}; 
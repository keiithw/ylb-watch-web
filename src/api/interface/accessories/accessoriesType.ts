// 配件类型接口类型定义
export namespace IAccessoriesType {
  // 配件类型表行数据接口
  export interface Row {
    id: number;
    name: string;
    x: number;
    y: number;
    createTime: string;
    updateTime: string;
  }

  // 查询参数
  export interface Query {
    page: number;
    limit: number;
    name?: string;
  }

  // 创建参数
  export interface CreateParams {
    name: string;
    x: number;
    y: number;
  }

  // 更新参数
  export interface UpdateParams {
    id: number;
    name: string;
    x: number;
    y: number;
  }

  // 删除配件类型参数
  export interface RemoveParams {
    ids: number[];
  }

  // 获取详情参数
  export interface DetailParams {
    id: number;
  }
} 
// 配件接口类型定义
export namespace IAccessories {
  // 配件表行数据接口
  export interface Row {
    id: number;
    accessoriesTypeId: number;
    accessoriesTagId: number;
    name: string;
    pictureUrl: string;
    isDefault: number;
    price: number;
    typeName?: string; // 配件类型名称（关联查询）
    tagName?: string; // 标签名称（关联查询）
    createTime: string;
    updateTime: string;
  }

  // 查询参数接口
  export interface Query {
    id?: number;
    accessoriesTypeId?: number;
    accessoriesTagId?: number;
    name?: string;
    isDefault?: number;
    price?: number[] | number;
    minPrice?: number;
    maxPrice?: number;
    createTime?: string[];
    pageNum: number;
    pageSize: number;
  }

  // 创建配件参数
  export interface CreateParams {
    accessoriesTypeId: number;
    accessoriesTagId: number;
    name: string;
    pictureUrl: string;
    isDefault: number;
    price: number;
  }

  // 更新配件参数
  export interface UpdateParams extends CreateParams {
    id: number;
  }
} 
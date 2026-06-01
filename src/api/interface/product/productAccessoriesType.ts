// 商品配件类型关联接口类型定义
export namespace IProductAccessoriesType {
  // 商品配件类型关联表行数据接口
  export interface Row {
    id: number;
    productId: number;
    accessoriesTypeId: number;
    accessoriesTypeName: string;
    x?: number;
    y?: number;
    createTime: string;
    updateTime: string;
  }

  // 查询参数接口
  export interface Query {
    productId: number;
    pageNum: number;
    pageSize: number;
  }

  // 创建商品配件类型关联参数
  export interface CreateParams {
    productId: number;
    accessoriesTypeId: number;
  }

  // 更新参数
  export interface UpdateParams {
    id: number;
    productId: number;
    accessoriesTypeId: number;
    x: number;
    y: number;
  }
} 
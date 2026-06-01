// 配件二级标签接口类型定义
export namespace IAccessoriesTag {
  // 配件二级标签表行数据接口
  export interface Row {
    id: number;
    typeId: number;
    tagName: string;
    typeName?: string; // 配件类型名称（关联查询后端可能会返回）
    createTime: string;
    updateTime: string;
  }

  // 查询参数接口
  export interface Query {
    id?: number;
    typeId?: number;
    tagName?: string;
    createTime?: string[];
    pageNum: number;
    pageSize: number;
  }

  // 创建配件二级标签参数
  export interface CreateParams {
    typeId: number;
    tagName: string;
  }

  // 更新配件二级标签参数
  export interface UpdateParams extends CreateParams {
    id: number;
  }
} 
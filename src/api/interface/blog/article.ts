// 博客文章接口类型定义
export namespace IBlogArticle {
  // 博客文章表行数据接口
  export interface Row {
    id: number;
    title: string;
    subtitle?: string;
    content?: string;
    contentText?: string;
    coverImage?: string;
    categoryId?: number;
    articleStatus?: string; // draft-草稿, published-已发布, archived-已归档
    publishTime?: string;
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
    seoKeywords?: string;
    seoDescription?: string;
    slug?: string;
    sortOrder?: number;
    authorId?: number;
    authorName?: string;
    createTime: string;
    updateTime: string;
  }

  // 查询参数接口
  export interface Query {
    id?: number;
    title?: string;
    categoryId?: number;
    articleStatus?: string;
    authorId?: number;
    startTime?: string;
    endTime?: string;
    pageNum: number;
    pageSize: number;
  }

  // 创建文章参数
  export interface CreateParams {
    title: string;
    subtitle?: string;
    content: string;
    contentText?: string;
    coverImage?: string;
    categoryId?: number;
    articleStatus?: string; // draft/published/archived 或 visible/hidden
    publishTime?: string;
    seoKeywords?: string;
    seoDescription?: string;
    slug?: string;
    sortOrder?: number;
    authorName?: string;
  }

  // 更新文章参数
  export interface UpdateParams extends CreateParams {
    id: number;
  }

  // 删除文章参数
  export interface RemoveParams {
    ids: number[];
  }

  // 获取详情参数
  export interface DetailParams {
    id: number;
  }

  // 文章状态选项
  export interface ArticleStatusOption {
    code: string;
    desc: string;
  }
}

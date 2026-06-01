import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/interface';
import type { IBlogArticle } from '@/api/interface/blog/article';

/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getBlogArticleListApi = (params: IBlogArticle.Query) => {
  return http.get<IPage<IBlogArticle.Row>>(ADMIN_MODULE + `/w-blog-article`, params);
};

/**
 * 添加
 * @param params
 * @returns {*}
 */
export const createBlogArticleApi = (params: IBlogArticle.CreateParams) => {
  return http.post(ADMIN_MODULE + `/w-blog-article`, params);
};

/**
 * 修改
 * @param params
 * @returns {*}
 */
export const updateBlogArticleApi = (params: IBlogArticle.UpdateParams) => {
  return http.put(ADMIN_MODULE + `/w-blog-article`, params);
};

/**
 * 删除
 * @param params
 * @returns {*}
 */
export const removeBlogArticleApi = (params: { ids: (string | number)[] }) => {
  return http.delete(ADMIN_MODULE + `/w-blog-article`, params);
};

/**
 * 获取详情
 * @param params
 * @returns {*}
 */
export const getBlogArticleDetailApi = (params: { id: number }) => {
  const { id } = params;
  return http.get<IBlogArticle.Row>(ADMIN_MODULE + `/w-blog-article/${id}`);
};

/**
 * 获取文章状态选项
 * @returns {*}
 */
export const getArticleStatusesApi = () => {
  return http.get<IBlogArticle.ArticleStatusOption[]>(ADMIN_MODULE + `/w-blog-article/article-statuses`);
};

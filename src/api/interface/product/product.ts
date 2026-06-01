// 商品接口类型定义
export namespace IProduct {
  // 商品表行数据接口
  export interface Row {
    id: number;
    name: string;
    subName?: string;
    price: number;
    displayArea?: string; // 展示区域：promo-宣传区, featured-甄选区, selected-精选区, hot-热销区, featured_picks-精选商品, new_arrivals-新品上市, timeless_classics-永恒经典, trending_now-热门趋势, big_sales-大促销
    sortOrder?: number; // 排序顺序，数字越小越靠前
    photoFront?: string; // 正面图（甄选区第1张）
    photoBack?: string; // 背面图（甄选区第4张）
    photoSide?: string; // 侧面图（甄选区第2张）
    photoDetail?: string; // 细节图（甄选区第3张）
    posterImage?: string; // 海报图（甄选区左侧、精选区右侧）
    promoImage?: string; // 宣传图（宣传区背景图）
    movement?: string;
    case?: string;
    diameter?: number;
    waterResistance?: number;
    desc?: string;
    seriesName?: string;
    createTime: string;
    updateTime: string;
  }

  // 查询参数接口
  export interface Query {
    id?: number;
    name?: string;
    subName?: string;
    seriesName?: string;
    displayArea?: string; // 按区域筛选
    price?: number[] | number;
    minPrice?: number;
    maxPrice?: number;
    createTime?: string[];
    createTimeStart?: string;
    createTimeEnd?: string;
    pageNum: number;
    pageSize: number;
  }

  // 创建商品参数
  export interface CreateParams {
    name: string;
    subName?: string;
    price: number;
    displayArea?: string;
    sortOrder?: number;
    photoFront?: string;
    photoBack?: string;
    photoSide?: string;
    photoDetail?: string;
    posterImage?: string;
    promoImage?: string;
    movement?: string;
    caseDes?: string;
    diameter?: number;
    waterResistance?: number;
    desc?: string;
    seriesName?: string;
  }

  // 更新商品参数
  export interface UpdateParams extends CreateParams {
    id: number;
  }

  // 删除商品参数
  export interface RemoveParams {
    ids: number[];
  }

  // 获取详情参数
  export interface DetailParams {
    id: number;
  }

  // 展示区域选项
  export interface DisplayAreaOption {
    label: string;
    value: string;
  }
} 
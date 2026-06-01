-- 修改现有w_product表的ALTER语句 

-- 1. 添加区域属性字段
ALTER TABLE w_product 
ADD COLUMN display_area VARCHAR(20) DEFAULT '' NOT NULL COMMENT '展示区域：promo-宣传区, featured-甄选区, selected-精选区, hot-热销区' AFTER price;

ALTER TABLE w_product 
ADD COLUMN sort_order INT DEFAULT 0 NOT NULL COMMENT '排序顺序，数字越小越靠前' AFTER display_area;

-- 2. 添加新的图片字段
ALTER TABLE w_product 
ADD COLUMN photo_side VARCHAR(200) NULL COMMENT '侧面图（甄选区第2张）' AFTER photo_back;

ALTER TABLE w_product 
ADD COLUMN photo_detail VARCHAR(200) NULL COMMENT '细节图（甄选区第3张）' AFTER photo_side;

ALTER TABLE w_product 
ADD COLUMN poster_image VARCHAR(200) NULL COMMENT '海报图（甄选区左侧、精选区右侧）' AFTER photo_detail;

ALTER TABLE w_product 
ADD COLUMN promo_image VARCHAR(200) NULL COMMENT '宣传图（宣传区背景图）' AFTER poster_image;

-- 3. 修改现有字段的注释
ALTER TABLE w_product 
MODIFY COLUMN photo_front VARCHAR(200) NULL COMMENT '正面图（甄选区第1张）';

ALTER TABLE w_product 
MODIFY COLUMN photo_back VARCHAR(200) NULL COMMENT '背面图（甄选区第4张）'; 
const {
    mysql
} = require('../../mysql');


//获得icon 列表
async function getChannel(ctx) {
    const channel = await mysql('shop_channel').column("id", "name", "url", "icon_url").select();
    ctx.body = {
        channel
    }

}
/*秒杀商品*/
async function newGoods(ctx) {
    const newGoods = await mysql('shop_goods').whereIn('id', [1181000, 1135002, 1134030, 1134032]).andWhere("is_new", 1).select();
    ctx.body = {
        newGoods
    }

}
/**
 * 热门商品
 * 选择对象的列字段
 * retail_price  零售价
 * goods_brief   简明描述
 */
async function getHotGoods(ctx) {
    const hotGoods = await mysql('shop_goods').column('id', 'name', 'list_pic_url', 'retail_price', 'goods_brief').where({
        is_hot: 1
    }).limit(5).select();
    ctx.body = {
        hotGoods
    }
}

/**
 * 品牌列表
 */

async function getBrandList(ctx) {
    const brandList = await mysql('shop_brand').where({
        is_new: 1
    }).orderBy("new_sort_order", 'asc').limit(4).select();
    ctx.body = {
        brandList
    }
}

/**
 * 主题列表
 */
async function getTopicList(ctx) {
    const topicList = await mysql('shop_topic').limit(3).select();

    ctx.body = {
        topicList
    }
}

/**
 * 类别列表
 */

async function getCategoryList(ctx) {
    //1.查询到所有的主类别
    const categoryList = await mysql('shop_category').where({
        parent_id: 0
    }).select();
    //2.查询住类别对应的子类别
    const newCategoryList = [];


    for (let i = 0; i < categoryList.length; i++) {
        var item = categoryList[i];
        let childCategoryIds = await mysql('shop_category').where({
            parent_id: item.id
        }).column('id').select();
        //需要变成数组形式childCategoryIds [1020000,1036002]
        childCategoryIds = childCategoryIds.map((item) => {
            return item.id;
        })
        //在商品中找到 在childCategoryIds里的七条数据
        const categoryGoods = await mysql('shop_goods').column('id', 'name', 'list_pic_url', 'retail_price').whereIn('category_id', childCategoryIds).limit(7).select();
        newCategoryList.push({
            "id": item.id,
            "name": item.name,
            "goodsList": categoryGoods
        })
    }
    ctx.body = {
        newCategoryList
    }
}



module.exports = {
    getChannel,
    newGoods,
    getHotGoods,
    getBrandList,
    getTopicList,
    getCategoryList
}
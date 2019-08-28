const {
    mysql
} = require('../../mysql');
//首页banner
module.exports = async (ctx) => {
    //轮播数据
    const banner = await mysql('shop_ad').column("id", "image_url", "link", "name").where({
        ad_position_id: 1
    }).select();

    ctx.body = {
        "banner": banner
    }

}
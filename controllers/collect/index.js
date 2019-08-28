const {
  mysql
} = require('../../mysql');

/**
 * 添加收藏
 * @param {*} ctx
 */
async function addCollect(ctx) {
  const {
    userId,
    goodsId
  } = ctx.request.body
  //判断是否收藏过
  const iscollect = await mysql("shop_collect").where({
    "user_id": userId,
    "value_id": goodsId
  }).select()
  if (iscollect.length == 0) {
    await mysql('shop_collect').insert({
      "user_id": userId,
      "value_id": goodsId
    })
  } else {
    await mysql("shop_collect").where({
      "user_id": userId,
      "value_id": goodsId
    }).del()
  }
  ctx.body = {
    data: "success"
  }
}
async function listAction(ctx) {
  const openId = ctx.query.userId;
  const data = await mysql("shop_collect").where({
    "user_id": userId,
  }).select()
  var goodsIds = [];
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    goodsIds.push(element.value_id)
  }
  const listData = await mysql("shop_goods").whereIn('id', goodsIds).column('id', 'name', 'list_pic_url', 'retail_price', 'goods_brief').select();
  ctx.body = {
    collectGoodsList: listData
  }
}

async function deleteCollect(ctx) {
  const id = ctx.query.id;
  console.log(id);

  const data = await mysql("shop_collect").where({
    "id": id
  }).del();
  console.log(data)
  if (data) {
    ctx.body = {
      'data': "删除成功"
    }
  } else {
    ctx.body = {
      'data': "删除失败"
    }
  }

}
module.exports = {
  addCollect,
  deleteCollect,
  listAction
}
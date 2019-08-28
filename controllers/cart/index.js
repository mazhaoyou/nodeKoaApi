const {
  mysql
} = require('../../mysql');
async function addCart(ctx) {
  const {
    number,
    goodsId,
    userId
  } = ctx.request.body


  //判断购物车是否包含此数据
  const haveGoods = await mysql("shop_cart").where({
    "user_id": userId,
    "goods_id": goodsId
  }).select()


  if (haveGoods.length == 0) {
    // const {
    //   retail_price,
    //   name,
    //   list_pic_url
    // } = await mysql("shop_goods").where({
    //   "id": goodsId
    // }).select()[0];
    const goods = await mysql("shop_goods").where({
      "id": goodsId
    }).select();
    const {
      retail_price,
      name,
      list_pic_url
    } = goods[0];
    //如果不存在
    await mysql('shop_cart').insert({
      "user_id": userId,
      "goods_id": goodsId,
      number,
      "goods_name": name,
      list_pic_url,
      retail_price
    })
  } else {
    //如果存在
    const oldNumber = await mysql("shop_cart").where({
      "user_id": userId,
      "goods_id": goodsId
    }).column('number').select();
    console.log(oldNumber)
    //跟新数据
    await mysql("shop_cart").where({
      "user_id": userId,
      "goods_id": goodsId
    }).update({
      "number": oldNumber[0].number + number
    });
  }
  ctx.body = {
    data: "success"
  }
}
/* 获得购物车列表 */
async function cartList(ctx) {

  const {
    userId
  } = ctx.query;

  const cartList = await mysql("shop_cart").column("user_id as userId", "goods_id as goodsId", "goods_name as goodsName", "retail_price as retailPrice", "list_pic_url as listPicUrl", "number").where({
    "user_id": userId,
  }).select();

  ctx.body = {
    cartList
  }

}

/*删除购物车 */
async function deleteAction(ctx) {
  const {
    userId,
    id
  } = ctx.query;


  const data = await mysql("shop_cart").where({
    goods_id: id,
    user_id: userId

  }).del();
  console.log("data=" + data);


  if (data) {
    ctx.body = true;

  } else {
    ctx.body = false;

  }
}


/*清空购物车 */
async function emptyCart(ctx) {

  const userId = ctx.query.userId;

  const data = await mysql("shop_cart").where({
    user_id: userId,
  }).del();
  console.log("data=" + JSON.stringify(data));
  if (data > 0) {
    ctx.body = data;
  } else {
    ctx.body = {
      code: '418',
      message: '订单删除失败'
    }
  }
}
module.exports = {
  addCart,
  cartList,
  deleteAction,
  emptyCart
}
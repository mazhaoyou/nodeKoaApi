const {
    mysql
} = require('../../mysql');



/**
 * 预创建订单信息
 *  @param {*} ctx
 */
async function prepareOrderAction(ctx) {
    let userId = ctx.query.userId;
    let goodsId = ctx.query.goodsId;

    if (!userId && !goodsId) {
        ctx.body = {
            code: "5003",
            message: "参数不合法"
        };
    }
    let addressList = [];
    if (userId) {
        addressList = await mysql("shop_address").column("id", "name", "address", "mobile", "address_detail as detailAddress", "is_default as isDefault")
            .where({
                user_id: userId
            }).orderBy('is_default', 'desc').limit(1)
            .select();
    }
    let goodsList = [];
    if (goodsId) {
        let goodsIds = goodsId.split(",")
        goodsList = await mysql('shop_goods').column("id", "name", "list_pic_url", "retail_price", "goods_sn").whereIn('id', goodsIds).select();
    }

    ctx.body = {
        addressList,
        goodsList
    };
}
//提交订单
async function submitAction(ctx) {
    const {
        userId,
        goodsArr,
        phone,
        name,
        address
    } = ctx.request.body;
    let goodsIdStr = '',
        allPrice = 0,
        orderGoods = "";
    let orderId = new Date().getTime();
    console.log(goodsArr);
    for (let i in goodsArr) {
        if (i < goodsArr.length - 1) {
            goodsIdStr += goodsArr[i].id + ",";
        } else {
            goodsIdStr += goodsArr[i].id;
        }

        const unitPrice = await mysql('shop_goods').column('retail_price').where({
            goods_sn: goodsArr[i].id,
        }).select();
        orderGoods = await mysql('shop_order_goods').insert({
            order_id: orderId,
            goods_id: goodsArr[i].id,
            number: goodsArr[i].goodsCount,
            retail_price: unitPrice[0].retail_price,
            list_pic_url: goodsArr[i].list_pic_url,
            goods_name: goodsArr[i].name

        });

        allPrice += unitPrice[0].retail_price * goodsArr[i].goodsCount;
    }
    const data = await mysql('shop_order').insert({
        order_id: orderId,
        user_id: userId,
        goods_id: goodsIdStr,
        allprice: allPrice,
        order_status: 1,
        create_time: new Date().getTime(),
        consignee_address: address,
        consignee_phone: phone,
        consignee_name: name
    })
    if (data && orderGoods) {
        ctx.body = "订到创建成功";

    } else {
        ctx.body = {
            data: false
        }
    }



}


/* 订单列表 
 * userId 必须传 
 * orderStatus 订单状态，  1、 待支付 2 待发货 3、 待收货 4、 待评价 5、全部 为 0
 */
async function orderListAction(ctx) {
    let userId = ctx.query.userId;
    let orderStatus = ctx.query.orderStatus;
    if (orderStatus == 0) {
        orderStatus = "";
    }

    let orderIdList = [],
        orderLists = [];
    if (orderStatus == "") {
        orderIdList = await mysql('shop_order').column('order_id', "allprice", "create_time", "order_status").where({
            user_id: userId,
        }).select();
    } else {
        orderIdList = await mysql('shop_order').column('order_id', "allprice", "create_time", "order_status").where({
            user_id: userId,
            order_status: orderStatus
        }).select();
    }

    for (const key in orderIdList) {
        let orderList = {};
        let orderId = orderIdList[key].order_id;
        let unitOrderInfo = await mysql('shop_order_goods').column("id", "order_id as orderId", "goods_id as goodsId", "goods_name as goodsName", "list_pic_url as listPicUrl", "retail_price as  retailPrice", "market_price as marketPrice").where({
            order_id: orderId
        }).select();
        console.log('tag', orderIdList[key].order_id)

        orderList = {
            orderList: unitOrderInfo,
            total: unitOrderInfo.length,
            allPrice: orderIdList[key].allprice,
            createTime: orderIdList[key].create_time,
            orderId: orderId,
            orderStatus: orderIdList[key].order_status
        }
        //  orderList = [...orderList, ...unitOrderInfo]
        orderLists.push(
            orderList
        )

    }

    ctx.body = {
        orderLists: orderLists
    }


}

/**订单详情
 */
async function orderDetail(ctx) {
    // const addressId = ctx.query.addressId || '';
    const userId = ctx.query.userId;
    const orderId = ctx.query.orderId;
    const orderDetail = await mysql('shop_order_goods').column("id", "order_id as orderId", "goods_id as goodsId", "goods_name as goodsName", "list_pic_url as listPicUrl", "retail_price as  retailPrice", "market_price as marketPrice", "number").where({
        order_id: orderId,
    }).select();
    const orderInfo = await mysql('shop_order').column("id", "allprice", "consignee_address as address", "consignee_phone as phone", "consignee_name as name", "order_status as orderStatus").where({
        order_id: orderId,
        user_id: userId
    }).select();

    ctx.body = {
        orderDetail: orderDetail,
        orderInfo: orderInfo[0]
    }

}


module.exports = {
    submitAction,
    orderDetail,
    orderListAction,
    prepareOrderAction
}
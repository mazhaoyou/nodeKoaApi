const {
  mysql
} = require('../../mysql');

/**
 * 商品详情页数据
 * 
 */
async function detailAction(ctx) {
  //ctx.query 获取get请求的参数对象的形式
  const goodsId = ctx.query.id;
  const userId = ctx.query.userId;
  //商品信息
  const info = await mysql('shop_goods').where({
    'id': goodsId
  }).select();
  //商品相关图片
  const imgUrl = [];
  const gallery = await mysql('shop_goods_gallery').where({
    goods_id: goodsId
  }).limit(4).select();
  gallery.map((item) => {
    imgUrl.push({
      "img_url": item.img_url
    });
  })

  //相关属性
  //关联查询两个表  leftJoin
  /*  const attribute = await mysql('shop_goods_attribute').column("shop_goods_attribute.value", "shop_attribute.name").leftJoin('shop_attribute', 'shop_goods_attribute.attribute_id', 'shop_attribute.id').where({
     'shop_goods_attribute.goods_id': goodsId
   }).select(); */
  //常见问题
  const issue = await mysql('shop_goods_issue').select();
  //品牌
  let brand = [];
  if (info[0].brand_id) {
    brand = await mysql('shop_brand').where({
      id: info[0].brand_id
    }).select();
  }

  //评论条数
  const commentCount = await mysql('shop_comment').where({
    value_id: goodsId,
    type_id: 0
  }).count('id  as number ');
  //热门评论
  const hotComment = await mysql('shop_comment').where({
    value_id: goodsId,
    type_id: 0
  }).select();
  let commentInfo = {};
  if (hotComment.length != 0) {
    const commentUser = await mysql('shop_user').column('nickname', 'username', 'avatar').where({
      id: hotComment[0].user_id
    }).select();
    commentInfo = {
      content: Buffer.from(hotComment[0].content, 'base64').toString(),
      add_time: hotComment.add_time,
      nickname: commentUser[0].nickname,
      avatar: commentUser[0].avatar,
      pic_list: await mysql('shop_comment_picture').where({
        comment_id: hotComment[0].id
      }).select()
    };
  }

  const comment = {
    count: commentCount[0].number,
    data: commentInfo
  };
  //大家都在看
  const productList = await mysql('shop_goods').where({
    'category_id': info[0].category_id
  }).select();

  //判断是否收藏过
  const iscollect = await mysql("shop_collect").where({
    "user_id": userId,
    "value_id": goodsId
  }).select();
  let collected = false;
  if (iscollect.length > 0) {
    collected = true
  }
  //判断该用户是否在购物车有此商品
  const oldNumber = await mysql("shop_cart").where({
    "user_id": userId,
  }).column('number').select();
  let allnumber = 0;

  if (oldNumber.length > 0) {
    for (let i = 0; i < oldNumber.length; i++) {
      const element = oldNumber[i];
      allnumber += element.number
    }
  }

  ctx.body = {
    "info": info[0] || [],
    "gallery": imgUrl,
    "attribute": attribute,
    "issue": issue,
    "comment": comment,
    "brand": brand[0] || [],
    "productList": productList,
    "collected": collected,
    "allnumber": allnumber,
  }
}


async function goodsList(ctx) {
  const categoryId = ctx.query.categoryId;
  const isNew = ctx.query.isNew;
  const isHot = ctx.query.isHot;
  // const page = this.get('page');
  // const size = this.get('size');
  // const sort = this.get('sort');
  let order = ctx.query.order;
  let goodsList = [];
  //----------------------------------------------------------------------
  if (categoryId) {
    //获得商品列表
    goodsList = await mysql("shop_goods").where({
      "category_id": categoryId
    }).select();
    //获得当前分类
    const currentNav = await mysql("shop_category").where({
      "id": categoryId
    }).select();

    //如果goodsList没有可能这个分类是主分类例如:居家,厨具
    if (goodsList.length == 0) {
      //找到与之相关的子类,再找到与子类相关的商品列表
      let subIds = await mysql("shop_category").where({
        "parent_id": categoryId
      }).column('id').select();
      //需要变成数组形式childCategoryIds [1020000,1036002]
      if (subIds.lenght != 0) {
        subIds = subIds.map((item) => {
          return item.id;
        })
      }

      goodsList = await mysql("shop_goods").column("id", "category_id", "goods_sn", "name", "goods_number", "list_pic_url", "retail_price").whereIn('category_id', subIds).limit(10).select();
    }
    ctx.body = {
      data: goodsList,
      /*       currentNav: currentNav[0]
       */
    }
  }


  if (!order) {
    order = '';
    orderBy = "id"
  } else {
    orderBy = "retail_price"
  }




  //----------------------------------------------------------------------
  //新品列表
  if (isNew) {
    goodsList = await mysql("shop_goods").where('is_new', isNew).orderBy(orderBy, order).select();
    ctx.body = {
      data: goodsList,
    }
  }
  //----------------------------------------------------------------------
  //----------------------------------------------------------------------
  //热门商品
  if (isHot) { //desc //asc
    goodsList = await mysql("shop_goods").where('is_hot', isHot).orderBy(orderBy, order).select();
    ctx.body = {
      data: goodsList,
    }
  }
  //----------------------------------------------------------------------

}

async function goodsDetails(ctx) {
  const goodsId = ctx.query.id;
  const userId = ctx.query.userId;
  //商品信息
  const info = await mysql('shop_goods').where({
    id: goodsId
  }).select();
  //商品轮播图
  const imgUrl = [];
  const gallery = await mysql('shop_goods_gallery').where({
    goods_id: goodsId
  }).limit(4).select();
  gallery.map((item) => {
    imgUrl.push({
      img_url: item.img_url
    });
  })

  const oldNumber = await mysql("shop_cart").where({
    user_id: userId,
    goods_id: goodsId
  }).column('number').select();
  let allnumber = 0;

  if (oldNumber.length > 0) {
    for (let i = 0; i < oldNumber.length; i++) {
      const element = oldNumber[i];
      allnumber += element.number
    }
  }

  ctx.body = {
    info: info[0] || [],
    gallery: imgUrl,
    isCartNumber: allnumber
  }
}

module.exports = {
  detailAction,
  goodsList,
  goodsDetails,

}
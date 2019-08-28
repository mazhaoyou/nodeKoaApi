const {
  mysql
} = require('../../mysql');

async function submitAction(ctx) {
  const {
    openId,
    name,
    content,
    phone
  } = ctx.request.body;

  const data = await mysql("shop_feedback").insert({
    'user_id': openId,
    "user_name": name,
    "msg_content": content,
    "connect": phone,
    "msg_time": new Date().getTime() / 100
  })
  console.log(data)
  if (data) {
    ctx.body = {
      data: true
    }
  } else {
    ctx.body = {
      data: false
    }
  }

}

async function getFeedback(ctx) {
  var id = ctx.query.id;

  const feedback = await mysql('shop_feedback').where({
    id: id
  }).select();
  ctx.body = feedback[0];

}

module.exports = {
  submitAction,
  getFeedback
}
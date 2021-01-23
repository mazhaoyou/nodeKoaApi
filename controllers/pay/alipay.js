// import AlipaySdk from 'alipay-sdk';

const AlipaySdk = require('alipay-sdk').default;
const AlipayFromData = require('alipay-sdk/lib/form').default;

const fs = require('fs')
const path = require("path");

const qr_image = require('qr-image');





async function alipay (ctx) {

  const alipaySdk = new AlipaySdk({
    appId: '2016101000654482',
    // 私钥
    signType: "RSA2", // 签名类型
    privateKey: fs.readFileSync(
      path.join(__dirname, "../../config/pem/app_private_key.pem"),
      "ascii"
    ), // 私钥
    alipayPublicKey: fs.readFileSync(
      path.join(__dirname, "../../config/pem/alipay_public_key.pem"),
      "ascii"
    ),

    // 支付宝公钥（不是应用公钥）
    gateway: "https://openapi.alipaydev.com/gateway.do", // 网关地址
    timeout: 5000, // 网关超时时间
    // camelcase: true // 是否把网关返回的下划线 key 转换为驼峰写法
  });


  const formData = new AlipayFromData();
  formData.setMethod("get");
  formData.addField("appId", "2016101000654482");
  formData.addField("charset", "utf-8");
  formData.addField("signType", "RSA2");
  formData.addField('returnUrl', 'https://engine.piesat.cn/#/');
  formData.addField("bizContent", {
    outTradeNo: "TEST_" + new Date().getTime,
    // 【必选】商户订单号：64个字符内，包含数字，字母，下划线；需要保证在商户端不重复
    productCode: "FAST_INSTANT_TRADE_PAY",// 【必选】销售产品码，目前仅支持FAST_INSTANT_TRADE_PAY
    totalAmount: "0.01",// 【必选】订单总金额，精确到小数点后两位
    subject: "test",// 【必选】 订单标题
    body: "test" // 【可选】订单描述
  });

  const result = await alipaySdk.exec(
    "alipay.trade.page.pay",
    {},
    { formData }
  );
  // var temp_qrcode = qr_image.image(result { ec_level: 'H' })//设置容错率level为30%
  // temp_qrcode.pipe(require('fs').createWriteStream('/tmp/qr.png').on('finish', function () {
  //   log.info('write finished')
  // }))
  console.log(result); // result为可以跳转到支付连接的url
  ctx.body = result;
}

module.exports = {
  alipay
}
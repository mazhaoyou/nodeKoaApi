const debug = require('debug')('koa-weapp-demo')

/**
 * 响应处理模块
 */
module.exports = async function (ctx, next) {
    try {
        // 调用下一个 middleware
        await next()

       /*处理响应结果
        * 如果直接写入在 body 中，则不作处理
        * 如果写在 ctx.body 为空，则使用 state 作为响应

        没有特殊处理的 接口  ctx.body.code 为 undefined的*/
        console.log("code="+ ctx.body.code)
        let message = "成功";
        if (ctx.state.code == -1) {
            message = "失败";
        } else {
        }
        if (ctx.body.code) {
            ctx.body = ctx.body;
        } else {
            ctx.body = {
                code: "0001",
                message: message,
                data: ctx.body

            }
        }

    } catch (e) {
        // catch 住全局的错误信息
        debug('Catch Error: %o', e)

        // 设置状态码为 200 - 服务端错误
        ctx.status = 200
        ctx.body = {
            code: "5000",
            message: "服务器异常",
            data: e && e.message ? e.message : e.toString()

        }

        // 输出详细的错误信息
        /*  ctx.body = {
             code: -1,
             error: e && e.message ? e.message : e.toString()
         } */
    }
}
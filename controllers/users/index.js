const {
    mysql
} = require('../../mysql');

/**
 * 注册
 * @param {*} ctx
 */
async function register(ctx) {
    const {
        userName,
        passWord,
        mobile
    } = ctx.request.body;

    const regMobile = await mysql("shop_user").column("mobile").where({
        mobile: mobile
    }).select();

    if (regMobile.length > 0) {
        ctx.body = {
            code: "5002",
            message: "该手机号已注册,请更换手机号注册"
        }
        return;
    }
    
     let  avatar = "http://www.gx8899.com/uploads/allimg/2017081214/gva0zpvsgpr-lp.jpg"
    
    const data = await mysql("shop_user").insert({
        username: userName,
        password: passWord,
        mobile: mobile,
        avatar:avatar,
        nickname: mobile,
        user_id: new Date().getTime() + mobile,
        register_time: new Date().getTime()
    });
    const userId = await mysql("shop_user").column("user_id").where({
        mobile: mobile
    }).select();
    if (data && userId) {

        ctx.body = {
            userName: userName,
            mobile: mobile,
            nickName: mobile,
            userId: userId[0].user_id
        };
    } else {
        ctx.body = {
            data: false
        };
    }
}

/**
 * 手机号登陆
 * @param {*} ctx
 */

async function loginPhone(ctx) {
    let mobile = ctx.request.body.mobile;
    let password = ctx.request.body.passWord;

    const userInfo = await mysql("shop_user").column("nickname", "mobile", "user_id", "avatar", "password").where({
        mobile: mobile
    }).select();
    console.log(userInfo)
    if (userInfo.length > 0) {
        if (password == userInfo[0].password && password) {
            ctx.body = {
                nickname: userInfo[0].nickname,
                mobile: userInfo[0].mobile,
                avatar: userInfo[0].avatar,
                userId: userInfo[0].user_id

            }

        } else {
            ctx.body = {
                code: "5001",
                message: "密码错误"
            }
        }
    } else {
        ctx.body  = {
            code: "0100",
            message: "用户不存在"
        }
    }

}
module.exports = {
    register,
    loginPhone
};
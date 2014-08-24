/**
 * 处理通用的错误码

 const INTERNAL_ERROR = 1;				//内部错误
 const USER_NOT_LOGIN = 2;				//用户未登录
 const FORM_CHECK_FAIL = 3;				//表单验证失败之数据不全
 const USER_NO_RIGHTS = 4;				//用户没有权限
 const VCODE_VALIDATE_FAIL = 5;			//验证码验证失败，现在仅用户游记回复异步接口验证
 // 应fe要求添加
 const FORM_VALID_FAIL = 7;				//表单验证失败之数据不对
 const USER_NOT_ACTIVED = 6;				//用户未激活
 //8 强过滤
 //9 行为控制
 */
define([
    'ui/dialog',
], function(dialog){
    'use strict';
    var errno = {
        check: function (retData) {
            var errno = retData.errno;
            var msg = '';
            switch(true) {
                case (errno === 1):
                    msg=('对不起，系统出了点小错，请稍后再试。');
                    break;
                case (errno === 2):
                    msg=('提交错误: 用户已经退出登录。');
                    break;
                case (errno === 3):
                    msg=('对不起，提交失败，请检查表单内容。');
                    break;
                case (errno === 4):
                    msg=('对不起，您的帐号可能已经更换，无权限提交当前内容，请检查。');
                    break;
                case (errno === 5):
                    msg=('提交错误: 验证码错误。');
                    break;
                case (errno === 6):
                    msg=('提交错误: 用户旅游帐号未激活。');
                    break;
                case (errno === 7):
                    msg=('对不起，提交失败，请检查表单内容。');
                    break;
                case (errno === 8 || errno === 11):
                    msg=('对不起，您所编辑的内容包含不适合展现的内容，请检查。');
                    break;
                case (errno === 9):
                    msg=('您的动作太快了，休息一下再回来吧。');
                    break;

                //如果bdstoken验证不通过，提示已经更换帐号.
                case (errno === 16):
                    msg=('您可能更换了账号，请检查。');
                    break;
                default:
                    msg=('提交错误: 未知错误');
            }
            dialog.alert('<p>' + msg + '</p>', {
                iconStyle:'alert',
                title: '提示'
            });
        }
    };

    errno.onSuccess = function(res, callback){
        if (res.errno === 0){
            callback.call(null, res);
        } else {
            errno.check(res);
        }
    };

    return errno;
});


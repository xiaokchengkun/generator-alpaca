/**
 * @author danghongyang
 * @file login.js
 * 这个文件是用于用户登录相关的代码,专题专用，仅支持jquery
 */
(function(window, undefined){
        window.lv.session = window.lv.session || {};
        window.lv = window.lv || {};

        var encodeHTML = function(source){
            return String(source)
                .replace(/&/g,'&amp;')
                .replace(/</g,'&lt;')
                .replace(/>/g,'&gt;')
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        };

        var superLogin = {
            check: function (callback, noAutoReload){
                var user = window.lv.session["user"];
                callback = callback  || function () {};

                /* 1.检证用户的状态, 暂时后端未提从相应的接口 TODO: 0未登录,1登录但未激活, 2激活  */
                if (user && user.is_login == 1) {
                    callback.call(null, user);
                    return true;
                } else{
                    this._showLoginDialog(callback, noAutoReload);
                    return false;
                }
            },
            fetchUserInfo:function(callback){  //登陆不刷新时获取用户信息写在Fcontext
                var url = window.debug ? "json/getuser.json?t=": "/user/ajax/getuser?t=";
                $.getJSON(url + new Date().getTime(), function(json){
                    if(json.errno == 2){
                        window.lv.session.user = {"is_login": 0};
                        zEvent.$emit("user_loaded", window.lv.session.user);
                        callback && callback(window.lv.session.user);
                    }
                    else if(json.errno == 0) {

                        //专题下面就用user全局变量
                        window.lv.session.user = json.data.user;
                        window.lv.session.user.bduss = json.data.bduss;

                        zEvent.$emit("user_loaded", window.lv.session.user);
                        callback && callback(window.lv.session.user);
                    }
                });
            },
            _showLoginDialog: function (callback, noAutoReload){
                var me = this;
                if(this.instance) {
                    this.instance.show();
                    return;
                }
                var onLoginSuccess;
                if(noAutoReload){
                    onLoginSuccess = function(e){
                        me.fetchUserInfo(function(user){
                            callback && callback(user);
                            me.instance.hide();
                        });
                        e.returnValue = false;
                    };
                } else {
                    onLoginSuccess = function(){
                        callback();
                    };
                }
                var domain = location.host.indexOf("lvyou.baidu.com") >= 0 ? "":"";
                $.getScript("http://passport"+ domain +".baidu.com/passApi/js/uni_login_wrapper.js?cdnversion=" + new Date().getTime(), function() {
                    me.instance = passport.pop.init({
                        apiOpt: {
                            staticPage:  "http://" + location.host + "/static/common/html/v3Jump.html",
                            product: 'lv',
                            u: encodeHTML(location.href).replace(/&amp;/g, "&").replace(/#.*$/g, ""),
                            memberPass: true,
                            safeFlag: 0
                        },
                        cache: false,
                        authsite: ["tsina", "qzone", "renren"],
                        authsiteCfg: {
                            tpl: "lv",
                            u: encodeHTML(location.href).replace(/&amp;/g, "&").replace(/#.*$/g, ""),
                            display: "popup",
                            act: "implicit"
                        },
                        tangram: true,
                        // img: "welcome.jpg",
                        onLoginSuccess: onLoginSuccess
                    });
                    me.instance.show();
                });
            }

        };



    //适配require js
    if ( typeof module === "object" && module && typeof module.exports === "object" ) {
        module.exports = superLogin;
    } else {
        window.lv.login = superLogin;
        if ( typeof define === "function" && define.amd ) {
            define(["jquery"], function ($) { return superLogin; } );
        }
    }
})(window);

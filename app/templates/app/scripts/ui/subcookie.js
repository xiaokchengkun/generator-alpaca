;!(function(window, undefined){

    var _isValidKey = function (key) {
        return (new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24")).test(key);
    };

    var cookieGetRaw = function (key) {
        if (_isValidKey(key)) {
            var reg = new RegExp("(^| )" + key + "=([^;]*)(;|\x24)"),
                result = reg.exec(document.cookie);
            if (result) {
                return result[2] || null;
            }
        }
        return null;
    };

/*
 * @description    子cookie操作
 */
var subcookie = {
    /**
     * @namespace    lv.subcookie.get
     * @function
     * @description    获得子cookie
     * @param {string}    name    cookie的name
     * @param {string}    subName    子cookie的name
     * @returns {string | null}    子cookie的value
     */
    get: function(name,subName){
        var subcookies = this.getAll(name);
        if (subcookies){
            return subcookies[subName];
        } else {
            return null;
        }
    },
    getAll: function(name){
        var cookieValue = cookieGetRaw(name), result = {};
        if (cookieValue){
            var subcookies = cookieValue.split("&");
            for (var i=0,len=subcookies.length; i<len; i++){
                var parts = subcookies[i].split("=");
                result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
            }
            return result;
        } else {
            return null;
        }
    },
    /**
     * @namespace    lv.helper.subcookie.set
     * @function
     * @description    设置子cookie
     * @param {string}    name    cookie的name
     * @param {string}    subName    子cookie的name
     * @param {string}    value    子cookie的value
     * @param {Object}    opts    {domain,expires,path,secure}    子cookie的相关配置
     * @returns {undefined}
     */
    set: function(name,subName,value,opts){
        var subcookies = this.getAll(name) || {};
        subcookies[subName] = value;
        this.setAll(name,subcookies,opts);
    },
    setAll: function(name,subcookies,opts){
        var date = new Date();
        var year = date.getFullYear();
        date.setFullYear(year+1);
        var o = {
            expires: date,
            path: "/",
            domain: "lvtest.baidu.com",
            secure: false
        };
        $.extend(o, opts || {});
        o.domain = o.domain.split(':')[0];
        var cookieText = encodeURIComponent(name) + "=";
        var subcookieParts = [];
        for (var subName in subcookies){
            if (subName.length>0 && subcookies.hasOwnProperty(subName)){
                subcookieParts.push(encodeURIComponent(subName) + "=" + encodeURIComponent(subcookies[subName]));
            }
        }
        if (subcookieParts.length>0){
            cookieText += subcookieParts.join("&");
            if (o.expires instanceof Date){
                cookieText += ";expires=" + o.expires.toUTCString();
            }
            cookieText += ";path=" + o.path;
            cookieText += ";domain=" + o.domain;
            if (o.secure){
                cookieText += ";secure";
            }
        } else {
            cookieText += ";expires=" + (new Date(0)).toUTCString();
        }
        document.cookie = cookieText;
    },
    /**
     * @namespace    lv.helper.subcookie.unset
     * @function
     * @description    删除子cookie
     * @param {string}    name    cookie的name
     * @param {string}    subName    子cookie的name
     * @param {Object}    opts    {domain,expires,path,secure}    子cookie的相关配置
     * @returns {undefined}
     */
    unset: function(name,subName,opts){
        var subcookies = this.getAll(name);
        if (subcookies){
            delete subcookies[subName];
            this.setAll(name,subcookies,opts);
        }
    },
    unsetAll: function(name,opts){
        var o = opts || {};
        o.expires = new Date(0);
        this.setAll(name,null,o);
    }
};

    window.lv = window.lv || {};

    if ( typeof module === "object" && module && typeof module.exports === "object" ) {
        module.exports = subcookie;
    } else {
        if ( typeof define === "function" && define.amd ) {
            define(["jquery"], function ($) { return subcookie; } );
        }
    }

})(window);
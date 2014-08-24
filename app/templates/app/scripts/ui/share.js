/**
 * Created by JetBrains PhpStorm.
 * User: Administrator
 * Date: 12-7-7
 * Time: 下午12:35
 * find out interest
 */


;!(function () {

    var isArray = function (source) {
        return '[object Array]' == Object.prototype.toString.call(source);
    };

    var isPlain = function (obj) {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            key;
        if (!obj ||
            //一般的情况，直接用toString判断
            Object.prototype.toString.call(obj) !== "[object Object]" ||
            //IE下，window/document/document.body/HTMLElement/HTMLCollection/NodeList等DOM对象上一个语句为true
            //isPrototypeOf挂在Object.prototype上的，因此所有的字面量都应该会有这个属性
            //对于在window上挂了isPrototypeOf属性的情况，直接忽略不考虑
            !('isPrototypeOf' in obj)
            ) {
            return false;
        }

        //判断new fun()自定义对象的情况
        //constructor不是继承自原型链的
        //并且原型中有isPrototypeOf方法才是Object
        if (obj.constructor && !hasOwnProperty.call(obj, "constructor") && !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
            return false;
        }
        //判断有继承的情况
        //如果有一项是继承过来的，那么一定不是字面量Object
        //OwnProperty会首先被遍历，为了加速遍历过程，直接看最后一项
        for (key in obj) {
        }
        return key === undefined || hasOwnProperty.call(obj, key);
    };

    var clone = function (source) {
        var result = source, i, len;
        if (!source
            || source instanceof Number
            || source instanceof String
            || source instanceof Boolean) {
            return result;
        } else if (isArray(source)) {
            result = [];
            var resultLen = 0;
            for (i = 0, len = source.length; i < len; i++) {
                result[resultLen++] = clone(source[i]);
            }
        } else if (isPlain(source)) {
            result = {};
            for (i in source) {
                if (source.hasOwnProperty(i)) {
                    result[i] = clone(source[i]);
                }
            }
        }
        return result;
    };

    var decodeHTML = function (source) {
        var str = String(source)
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, "&");
        //处理转义的中文和实体字符
        return str.replace(/&#([\d]+);/g, function (_0, _1) {
            return String.fromCharCode(parseInt(_1, 10));
        });
    };

    /**
     * @file share.js
     * @class shareComponent
     * @namespace lv.component
     * 分享类型，支持renren, sina, tqq, qzone 四个分享
     * @param type
     *
     */
    function shareComponent(type) {
        this.type = type;
        this.fnParams = new Array;
    }

    $.extend(shareComponent.prototype, {
        /**
         * @method _setSiteUrl
         * 主url
         * @param url
         * url后面带的参数，key => value形式
         * @param params
         * @description 分享是用window.open实现的，设置要打开的window的location
         */
        _setSiteUrl: function (url, params) {
            var reqParams = [];
            for (var p in params) {
                reqParams.push(p + '=' + encodeURIComponent(params[p] || ''));
            }
            siteUrl = url + "?";
            siteUrl += reqParams.join('&');
            this.fnParams.push(siteUrl);
        },
        /**
         * @method  _addWindowParams
         * 要追加到this.fnParams的数组, this.fnParams是window.open除url之外的参数
         * @param {Array} params
         */
        _addWindowParams: function (params) {
            this.fnParams = this.fnParams.concat(params);
        },
        /**
         * @method _getWindowLocalString
         * window.open打开窗体的高度
         * @param {Number} width
         * window.open打开窗体的宽度
         * @param {Number} height
         * @description 返回高度宽度left,top结合后的字符串
         */
        _getWindowLocalString: function (width, height) {
            return ["width=", width, ",",
                "height=", height, ",",
                "left=", (screen.width - width) / 2, ",",
                "top=" + (screen.height - height) / 2].join("");
        },
        /**
         * @method init
         * 包含url,pic,title等要分享的内容
         * @param {key => value} params
         */
        init: function (params) {
            //为了防止防盗链显示的恶心的效果，先lazyload图片
            var pre_init_pics = params.pic.split('|');
            $.each(pre_init_pics, function (i, item) {
                var init_img = new Image();
                init_img.src = item;
            });

            var urlParams = clone(params);

            //针对模板中两次的防xss 1.火麒麟默认转义 2.JSON.stringify的 双重转义
            //最多两次 所以加两次的decodeHTML
            urlParams.title = decodeHTML(urlParams.title);
            urlParams.title = decodeHTML(urlParams.title);

            var lastChar = (urlParams.pic.charAt(urlParams.pic.length - 1));
            if (urlParams.pic.length > 0 && lastChar === '|') {
                urlParams.pic = urlParams.pic.substring(0, urlParams.pic.length - 1);
            }
            //检验url，把share=***放到url中
            var urlSplit = urlParams.url.split('?');
            if (urlSplit.length > 1) {
                //排出已经加了share参数的情况
                if (/share=/i.test(urlSplit[1])) {
                    urlParams.url = urlSplit.join('?');
                }
                else {
                    urlParams.url = [urlSplit[0], "?share=" + this.type + "&", urlSplit[1]].join('');
                }
            }
            else {
                urlSplit = urlParams.url.split('#');
                if (urlSplit.length > 1) {
                    urlParams.url = [urlSplit[0], "?share=" + this.type, '#', urlSplit[1]].join('');
                }
                else {
                    urlParams.url += "?share=" + this.type;
                }
            }

            var withoutPic = urlParams.withoutPic;
            delete urlParams.withoutPic;
            switch (this.type) {
                case "renren":
                {
                    urlParams.pic = urlParams.pic.split("|")[0];
                    this._setSiteUrl("http://widget.renren.com/dialog/share", urlParams);
                    this._addWindowParams(["sharer", "toolbar=0,status=0," + this._getWindowLocalString(550, 400)]);
                    break;
                }
                case "sina":
                {
                    urlParams.pic = urlParams.pic.split("|")[0];
                    urlParams.appkey = urlParams.sina_appkey;
                    if (withoutPic) {
                        $.extend(urlParams, {
                            "searchPic": "false"
                        });
                    }
                    this._setSiteUrl("http://service.weibo.com/share/share.php", urlParams);
                    this._addWindowParams(["sharer", this._getWindowLocalString(615, 505)]);
                    break;
                }
                case "tqq":
                {

                    urlParams.appkey = urlParams.tqq_appkey;
                    this._setSiteUrl("http://v.t.qq.com/share/share.php", urlParams);
                    this._addWindowParams(['sharer', "toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no," + this._getWindowLocalString(700, 480)]);
                    break;
                }
                case "qzone":
                {

                    this._setSiteUrl("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey", urlParams);
                    this._addWindowParams(['sharer', "toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no," + this._getWindowLocalString(700, 480)]);
                    break;
                }
                default:
                {
                    return;
                }
            }
        },
        /**
         * @method exec
         * @description 执行分享动作
         */
        exec: function () {
            var fn = window.open;
            if (fn.apply) {
                fn.apply(window, this.fnParams);
            } else {
                fn(this.fnParams[0], this.fnParams[1], this.fnParams[2]);
            }
        },
        load: function () {
            window.open("/static/common/html/loading-jump.html", "sharer", "width=600,height=500");
        }
    });

    window.lv = window.lv || {};
   window.lv.Share = shareComponent;

    if ( typeof module === "object" && module && typeof module.exports === "object" ) {
        module.exports = shareComponent;
    } else {
        if ( typeof define === "function" && define.amd ) {
            define(["jquery"], function ($) { return shareComponent; } );
        }
    }
})();


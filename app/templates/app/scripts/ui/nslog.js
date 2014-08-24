/*
 * nslog
 *
 * path: nslog.js
 * author: conzi
 * version: 1.0.0
 * date: 2010/3/18
 * support by jquery.js
 */

(function(){

    var jsonParse = function(data) {
        return (new Function("return (" + data + ")"))();
    };
    var isString = function (str) {
        return typeof  str === "string";
    };
    var hasClass = function (ele, clazz) {
        return $(ele).hasClass(clazz);
    };

    /*
     提供一个简单的方法来向nsclick服务器发统计请求
     */
    var nslog = function (url, type, other, callback) {//nslog统计
        var t = (new Date()).getTime();
        // nslog统计参数约定
        //   @pid、@url、@type三个数是必须的，并且位置固定。pid=130代表活动类统计。type为统计类型
        //   @url: 被点击链接的url ，如果是展现的统计，则为当前页的url
        //   @type 详细内容，知道见：fe.baidu.com/doc/iknow/train/nslog.html，其他产品线请自己维护，避免冲突
        //   @other: {}扩展参数，object类型

        var params = [
            "http://nsclick.baidu.com/v.gif?pid=" + nslog.pid,
            "url=" + encodeURIComponent(url),
            "type=" + type,
            "t=" + t
        ];
        for (var k in other) {
            params.push(k + "=" + other[k]);
        }
        for (var k in nslog.globalParams) {
            params.push(k + "=" + nslog.globalParams[k]);
        }

        //发送请求
        nslog.imageReq(params.join("&"), callback);
    };
    nslog.pid = 308; //默认设置为百度旅游的pid。其他产品调用时请在最开始覆盖一次。
    nslog.globalParams = {}; //全局的统计参数
    nslog.set = function (key, val) {  //设置全局统计参数
        nslog.globalParams[key] = val;
    };
    nslog.imageReq = function (url, callback) {
        //图片请求函数，用于统计
        var n = "iknowlog_" + (new Date()).getTime();
        var c = window[n] = new Image();//将image对象赋给全局变量，防止被当做垃圾回收，造成请求失败。
        c.onload = c.onerror = function () {
            window[n] = null; //垃圾回收
            if (callback) {
                callback();
            }
        };
        c.src = url;
        c = null;//垃圾回收
    };


    /**
     * nslog的点击统计，class="nslog",点击统计，class="nslog-area",区域链接点击统计
     * 用法示例,class里面需要有nslog,或者nslog-area,nslog的参数放到 data-nslog里面
     * 1. <button class="nslog" data-nslog="{type:1}"></button>
     * 2. <div class="nslog-area" data-nslog="{type:1,pos:'area'}"><a href="#" onClick="return false;">nslog-area test</a></div>
     */
    $(document).bind("mousedown", function (e) {
        var evt = e;
        var ele = evt.target,
        //事件传递的深度
            deep = 3,
        //是否为链接
            linkClick = false,
            linkHref = null,
            continueNslog = true,
            url = window.location.href;
        /*
         * nslog:单链接统计，nslog-area 区域链接统计
         */
        while (ele) {
            //如果节点是对象才需要nslog
            if (ele.nodeType == 1) {
                //nslog
                if (deep > 0) {
                    //ele.href.length >2 fix for href="#"
                    url = ele.href && ele.href.length > 2 ? ele.href : window.location.href;
                    if (continueNslog && isString(ele.className) && hasClass(ele, 'nslog')) {
                        var extra = {x: evt.pageX, y: evt.pageY},
                            extraData = jsonParse($(ele).attr('data-nslog')),
                            type = 0;
                        //获取到了data-nslog才执行
                        if (extraData) {
                            type = extraData.type || 0;
                            extraData.type = null;
                            try {
                                delete extraData.type;
                            } catch (e) {
                            }
                            extra = $.extend(extra, extraData);
                            //如果已经获取到nslog，那么后面就不再获取nslog,而转为nslog-area
                            nslog(url, type, extra);
                            continueNslog = false;
                        }
                        extra = null;
                        extraData = null;
                        type = null;
                    }// END continueNslog &&

                    //链接的时候把修正链接选项
                    if (!linkClick && ele.href) {
                        linkClick = true;
                        linkHref = url;
                    }
                }// END deep > 0
                //nslog-area 的链接
                if (linkClick && isString(ele.className) && hasClass(ele, 'nslog-area')) {
                    var extra = {x: evt.pageX, y: evt.pageY},
                        extraData = jsonParse(($(ele).attr('data-nslog'))),
                        type = 0;
                    //获取到了data-nslog才执行
                    if (extraData) {
                        type = extraData.type || 0;
                        extraData.type = null;
                        try {
                            delete extraData.type;
                        } catch (e) {
                        }
                        extra = $.extend(extra, extraData);
                        //nslog-area
                        nslog(url, type, extra);
                    }
                    extra = null;
                    extraData = null;
                    type = null;
                }
            }
            deep--;
            ele = ele.parentNode;
        }
        //释放DOM节点引用，
        ele = null;
    });

    $('.nslog-show').each(function (i, item) {
        // 隐藏元素不发展现统计
        if ($(item).css("display") == "none") {
            return
        }
        var extraData = jsonParse(($(item).attr('data-nslog'))),
            type = 0,
            url = item.href && item.href.length > 2 ? item.href : window.location.href;
        if (extraData) {
            type = extraData.type || 0;
            extraData.type = null;
            try {
                delete extraData.type;
            } catch (e) {
            }
            extraData.cmd = "show";
            //nslog-show
            nslog(url, type, extraData);
        }
    });
    window.lv = window.lv || {};
    window.lv.nslog = nslog;


    if ( typeof module === "object" && module && typeof module.exports === "object" ) {
        module.exports = nslog;
    } else {
        if ( typeof define === "function" && define.amd ) {
            define(["jquery"], function ($) { return nslog; } );
        }
    }
})();

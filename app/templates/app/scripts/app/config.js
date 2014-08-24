/**
 * 项目公共常量的配置项
 *
 */
define(["jquery"], function($){

    var config = {
        /** 项目名称
         * 最好使用小写字母和数字组成
         * 数字代表专题上线时间
         * 字母代表专题有意义的英文
         * 例如：201403yunnan
         */
        NAME: "southern-airlines",
        /** 专题基础url 用来组装请求请求地址
         *  ajax请求url后面带上?format=ajax
         *  get请求url最后带上 &t=new Date().getTime() 防止ie对请求的缓存
         *  post请求需要带上bdstoken
         */
        BASE_URL: "/ajax/event/" + this.NAME
    };

    $.extend(true, config, {
        /** 如果需要使用cookie或者本地存储，这里设置key
         * 由于每次请求会将cookie传至服务器，故能使用localstorage则尽量避免cookie
         * 由于安全组有要求每个产品线不能使用一级cookie故使用subcookie
         * SAVEKEY 父级存储空间
         * SUBKEY 存储key
         */
        LOCALSTORAGE: {
            SAVEKEY: "BDLVYMONTH", //可选值参考ui/subcookie
            SUBKEY: "LV_ZT_" + config.NAME.toUpperCase()
        },

        /** 分享信息 每次专题需要更改title,需要穿一张share.png到专题的images文件夹中
         *  多图片在pic中使用","分隔
         *
         */
        SHARE: {
            url:  "http://lvyou.baidu.com/tehui201409",
            type:'3',
            title: "#领免费机票，去见Ta#想见谁就去吧！写一张心愿登机牌，机票钱百度旅游承包了！还有一大波低价机票，坐等开抢……机票便宜成这样也真是醉了~",
            pic:"http://lvyou.baidu.com/event/s/" + config.NAME + "/images/share.jpg",
            ralateUid:'2039610063', /*@百度旅游*/
            sina_appkey:'2451833099'
        }
    });

    return config;

});

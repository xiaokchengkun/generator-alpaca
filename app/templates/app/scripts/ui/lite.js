;!(function(window, undefined){

    window.lv = window.lv || {};
    window.lv.lite = {};


    lv.lite.encodeHTML = function(source){
        return String(source)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };
    /**
     * 图片格式化url,根据picid取得空间服务的完整url * 图片格式化url,根据pic_url取得空间服务的完整pic_url
     * @param {string} picid,图片id
     * @return {string} 空间图片url
     **/
    lv.lite.getImg = function(pic_url, webmapimg, limit_width, limit_height, quality) {
        if (!pic_url) {
            return "";
        }
        var is_full_pic = pic_url.indexOf("http");
        if(is_full_pic === -1){
            var fullurl = ["http://hiphotos.baidu.com/", "lvpics", "/pic/item/", pic_url, ".jpg"].join("");
        } else {
            var fullurl = pic_url;
        }

        if(webmapimg !== undefined && limit_width && limit_height){
            !quality && (quality = 100);
            return ["http://webmap", webmapimg, ".map.bdimg.com/maps/services/thumbnails",
                "?width=", limit_width,
                "&height=", limit_height,
                "&quality=", quality,
                "&align=middle,middle",
                "&src=", fullurl].join("");
        } else {
            return fullurl;
        }
    };
    /**
     * 图片格式化url,根据pic_url取得空间服务的完整url[缩略图版]
     * @param {string} pic_url,图片pic_url
     * @return {string} 空间图片url
     **/
    lv.lite.getAbImg = function(pic_url){
        if (!pic_url){
            return "";
        }
        var arr = ["http://hiphotos.baidu.com/", "lvpics", "/abpic/item/", pic_url, ".jpg"];
        return arr.join("");
    };
    /**
     * 头像图片格式化url,根据picid取得空间服务的完整url * 图片格式化url,根据pic_url取得空间服务的完整pic_url
     * @param {string} avatar_url,头像url
     * @param {number} avatar_source,是否用通用头像
     * @return {string} 空间图片url
     **/
    lv.lite.getUserHead = function(avatar_url,avatar_source){

        var _avatar_source = avatar_source || 0;
        var arr = ["http://hiphotos.baidu.com/lvpics/pic/item/9c66db2ccffc1e178f987c8d4a90f603728de945.jpg"];

        if(avatar_url){
            if ( _avatar_source == 1){
                arr = ["http://himg.bdimg.com/", "sys", "/portrait/item/", avatar_url, ".jpg"];
            }else{
                arr = ["http://hiphotos.baidu.com/", "lvpics", "/pic/item/", avatar_url, ".jpg"];
            }
        }
        return arr.join("");
    };
    /**
     * 头像图片格式化url,根据pic_url取得空间服务的完整url[缩略图版]
     * @param {string} avatar_url,头像url
     * @param {number} avatar_source,是否用通用头像
     * @return {string} 空间图片url
     **/
    lv.lite.getUserAbHead = function(avatar_url,avatar_source){

        var _avatar_source = avatar_source || 0;
        var arr = ["http://hiphotos.baidu.com/lvpics/pic/item/9c66db2ccffc1e178f987c8d4a90f603728de945.jpg"];

        if(avatar_url){
            if ( _avatar_source == 1){
                arr = ["http://himg.bdimg.com/", "sys", "/portrait/item/", avatar_url, ".jpg"];
            }else{
                arr = ["http://hiphotos.baidu.com/", "lvpics", "/abpic/item/", avatar_url, ".jpg"];
            }
        }
        return arr.join("");
    };
    /**
     *
     * 飘红，高亮关键词
     * @param {string} content 要处理高亮的字符串
     * @param {array||string} arrWords 需要高亮的字符串或者数组
     * @param {string} color 高亮的颜色，默认是 #CC0000
     */
    lv.lite.hilight = function(content,arrWords,color){
        if(!color){
            color = "#CC0000";
        }
        if ( arrWords === null || arrWords == '' ) {
            return content;
        }
        var pat = arrWords.replace(/[\*\|\(\)\?]/,'');
        pat = pat.replace("/\1/",'|');
        pat = pat.replace("/\+/",'\+');
        content = lv.lite.encodeHTML(content);
        var pattern = "/^\.\.\./";
        if ( !!content.match(pattern) ) {
            content = content.replace(pattern,"");
        }
        var reg = content.replace(new RegExp(pat,'ig'),function(match,key){
            return '<span style="color:'+ color + '">'+ match+ '</span>'
        });

        return reg != '' ? reg : content;
    };

    /**
     * cut字符串截取
     * @param {string} string,需要截取的字符串
     * @param {number} length,截取的字节长度，默认40字节(20汉字)
     * @param {string} etc,截取后追加的字符，默认...
     * @return {string}  截取后的字符串
     **/
    lv.lite.cut = function(string, length, etc){
        length = length || 40;
        etc = etc || "...";
        if (length === 0){
            return '';
        }
        var getByteLength = function(string){
            return String(string).replace(/[^\x00-\xff]/g, "ci").length;
        };
        var subByte = function (source, length, tail) {
            source = String(source);
            tail = tail || '';
            if (length < 0 || getByteLength(source) <= length) {
                return source + tail;
            }
            //thanks 加宽提供优化方法
            source = source.substr(0,length).replace(/([^\x00-\xff])/g,"\x241 ")//双字节字符替换成两个
                .substr(0,length)//截取长度
                .replace(/[^\x00-\xff]$/,"")//去掉临界双字节字符
                .replace(/([^\x00-\xff]) /g,"\x241");//还原
            return source + tail;
        };
        if (getByteLength(string) >length){
            return subByte(string, length-etc.length) + etc;
        } else {
            return string;
        }
    };
    lv.lite.getByteLength = function(string){
        return String(string).replace(/[^\x00-\xff]/g, "ci").length;
    };
    /**
     *
     * 根据用户积分（经验）换算用户等级
     * @param {Number} score,用户经验，积分
     * @return {Int} 用户等级
     */
    lv.lite.getUserLevel = function(score){
        var level = [-1, 50, 100, 200, 400, 800, 1600, 3200, 6400, 10000, 15000, 20000, 30000, 50000, 70000, 100000];
        score = parseInt(score, 10);
        for (var i=0,len=level.length;i<len; i++){
            if (score <= level[i]){
                return i;
            }
        }
        return level.length;
    };
    /**
     * 根据用户积分（经验）换算用户等级,并获取头衔
     * @param {Number} score,用户经验，积分
     * @return {string} 用户头衔
     */
    lv.lite.getUserTitle = function(score){
        var level = lv.lite.getUserLevel(score);
        var title = ["草鞋徒步者","草鞋徒步者","登山鞋先锋","轮滑小旋风","单车骑行军","摩托车车手","马车驾驶员","三轮摩托党","小汽车司机","越野车领队","房车观光客","滑翔伞玩家 ","游艇冲锋队","直升飞机主","商务机大亨","时空旅行者"];
        return title[level];
    };
    /**
     * 日期格式化
     * @param {string} format,格式化字符串
     * @param {int} timestamp 传入的日期
     * @return {string} 格式化后的日期字符串
     **/
    lv.lite.date = function(format, timestamp){
        var pad = function (source, length) {
            var pre = "",
                negative = (source < 0),
                string = String(Math.abs(source));
            if (string.length < length) {
                pre = (new Array(length - string.length + 1)).join('0');
            }
            return (negative ?  "-" : "") + pre + string;
        };

        var dateFormat = function (source, pattern) {
            if ('string' != typeof pattern) {
                return source.toString();
            }
            function replacer(patternPart, result) {
                pattern = pattern.replace(patternPart, result);
            }
            var year    = source.getFullYear(),
                month   = source.getMonth() + 1,
                date2   = source.getDate(),
                hours   = source.getHours(),
                minutes = source.getMinutes(),
                seconds = source.getSeconds();

            replacer(/yyyy/g, pad(year, 4));
            replacer(/yy/g, pad(parseInt(year.toString().slice(2), 10), 2));
            replacer(/MM/g, pad(month, 2));
            replacer(/M/g, month);
            replacer(/dd/g, pad(date2, 2));
            replacer(/d/g, date2);

            replacer(/HH/g, pad(hours, 2));
            replacer(/H/g, hours);
            replacer(/hh/g, pad(hours % 12, 2));
            replacer(/h/g, hours % 12);
            replacer(/mm/g, pad(minutes, 2));
            replacer(/m/g, minutes);
            replacer(/ss/g, pad(seconds, 2));
            replacer(/s/g, seconds);

            return pattern;
        };

        timestamp = timestamp || 0;
        var time = new Date();
        if (timestamp !== 0){
            time.setTime(timestamp*1000);
        }
        format = format.replace("Y","yyyy");
        format = format.replace("m","MM");
        format = format.replace("d","dd");
        format = format.replace("H","HH");
        format = format.replace("i","mm");
        format = format.replace("s","ss");
        return dateFormat(time, format);
    };

    /**
     * 个人中心使用的日期格式化，(今天 14:18,昨天 16:00,其他的一律2011-03-11 17:10)
     * update by dengxiaoming
     * @time 2011/12/05
     * @param {int} timestamp
     * @param {string} feedformat 当是今天和昨天时候格式化字符串默认" H:i"
     * @param {string} format 不是今天和昨天时候的格式化字符串默认" Y-m-d H:i"
     * @return {string} 格式化后的日期字符串
     **/
    lv.lite.feeddate = function(timestamp, feedformat , format ){
        /*
         feedformat = " H:i";
         format = " Y-m-d";
         timestamp = new Date();
         */

        var arr = {today:'今天',yesterday:'昨天'};
        var d = new Date();
        var curDate = d.getDate();
        var curYear = d.getFullYear();
        var curMonth = d.getMonth() + 1;

        /**
         *获取当前时间的前一天日期
         */
        function getYesterdate(){
            var d2 = new Date();
            d2.setDate(curDate - 1);
            return {
                curYear:d2.getFullYear(),
                curMonth:(d2.getMonth()+1),
                curDate:d2.getDate()
            };
        }

        /**
         *获取当前时间的后一天日期
         */
        function getTomorrowdate(){
            var d3 = new Date();
            d3.setDate(curDate + 1);
            return {
                curYear:d3.getFullYear(),
                curMonth:(d3.getMonth()+1),
                curDate:d3.getDate()
            };
        }

        /**
         *获取当前时间的unixtime
         */
        function getUnixTime(year,month,date){
            var t = year + '/' + (month-1) + '/' + date;
            return Math.round(new Date(t).getTime()/1000) ;
        }

        var today = getUnixTime(curYear,curMonth,curDate);
        //获取昨天的日期
        var yesterDayDate = getYesterdate();
        //将昨天的日期转化为unixtime
        var yesterday = getUnixTime(yesterDayDate.curYear,yesterDayDate.curMonth,yesterDayDate.curDate);
        //获取明天的日期
        var tomorrowDayDate = getTomorrowdate();
        //将明天的日期转化为unixtime
        var tomorrow = getUnixTime(tomorrowDayDate.curYear,tomorrowDayDate.curMonth,tomorrowDayDate.curDate);

        if ( (timestamp > today) && (timestamp < tomorrow)){
            return arr['today'] + lv.lite.date(feedformat, timestamp);
        }else if ( timestamp > yesterday ){
            return arr['yesterday'] + lv.lite.date(feedformat, timestamp);
        }else{
            return lv.lite.date(format, timestamp);
        }
    };

    /**
     * 根据日期字符串 获得日期单位
     * @param {string}  日期单位字母
     * @return {string} 日期单位汉字
     **/
    lv.lite.getTimeUnit = function(type){
        var result = "";
        switch(type){
            case "m": {
                result = "个月";
                break;
            }
            case "w": {
                result = "周";
                break;
            }
            case "d": {
                result = "天";
                break;
            }
            case "h": {
                result = "个小时";
                break;
            }
            default:
                break;
        }
        return result;
    };
    /**
     * 创建图片居中的图片
     * @param {string} url,图片地址
     * @return {string} 图片pid
     **/
    lv.lite.createImage = function ($href, $url, $width, $height, $limitWidth, $limitHeight, $big, $withoutTarget){
        var $is_full = $url.indexOf("http");
        if($is_full != 0){
            if($big){
                $url = lv.lite.getImg($url);
            } else {
                $url = lv.lite.getAbImg($url);
            }
        }
        var $targetAttr = '';
        if(!$withoutTarget){
            $targetAttr = 'target="_blank"';
        }
        var $result = {};
        //var tdHeight, tdWidth, baseMargin;
        //tdHeight = tdWidth = 1000;
        //baseMargin = (-1) * (tdHeight - $limitHeight) / 2;
        var $marginTop = 0, $marginLeft = 0;
        var $rate_width = $limitWidth/$width;
        var $rate_height = $limitHeight/$height;
        if($rate_width > $rate_height) {	//压的比例越小则说明限制越明显
            $result["width"] = $limitWidth;
            $result["height"] = Math.round($height * $rate_width);
            $marginTop = -Math.round(($result["height"] - $limitHeight)/2);
        }else {
            $result["height"] = $limitHeight;
            $result["width"] = Math.round($width * $rate_height);
            $marginLeft = -Math.round(($result["width"] - $limitWidth)/2);
        }
        var $newWidth = $result['width'];
        var $newHeight = $result['height'];
        var linkStart = "";
        var linkEnd = "";
        if($href){
            linkStart  = '<a ' + $targetAttr + ' href="' + $href + '">';
            linkEnd = "</a>";
        }
        //var $imageDom = '<table class="filled-image" style="margin-top: '+ baseMargin +'px;"><tr><td style="height: '+ tdHeight +'px;width: '+tdWidth+'px;">'+ linkStart +'<img class="center-img" width="' + $newWidth + '" height="' + $newHeight + '" src="'+ $url + '"/>' + linkEnd + '</td></tr></table>';
        var $imageDom = linkStart + '<img width="' + $newWidth + '" height="' + $newHeight + '" style="margin:' + $marginTop + 'px 0px 0px ' + $marginLeft + 'px" src="' + $url + '"/>' + linkEnd;
        return $imageDom;
    };

    //适配require js
    if ( typeof module === "object" && module && typeof module.exports === "object" ) {
        module.exports = lite;
    } else {
        if ( typeof define === "function" && define.amd ) {
            define([], function () { return lv.lite; } );
        }
    }

})(window);

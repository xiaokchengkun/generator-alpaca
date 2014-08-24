(function($){
	//字符串扩展
	$.string = $.string || {};


	/**
	 * 对目标字符串进行格式化
	 * @name baidu.string.format
	 * @function
	 * @grammar baidu.string.format(source, opts)
	 * @param {string} source 目标字符串
	 * @param {Object|string...} opts 提供相应数据的对象或多个字符串
	 * @remark
	 *
	opts参数为“Object”时，替换目标字符串中的#{property name}部分。<br>
	opts为“string...”时，替换目标字符串中的#{0}、#{1}...部分。

	 * @shortcut format
	 * @meta standard
	 *
	 * @returns {string} 格式化后的字符串
	 */
	$.string.format = function(source, opts){
		source = String(source);
		    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
		    if(data.length){
			    data = data.length == 1 ?
			    	/* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
			    	(opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data)
			    	: data;
		    	return source.replace(/#\{(.+?)\}/g, function (match, key){
			    	var replacer = data[key];
			    	// chrome 下 typeof /a/ == 'function'
			    	if('[object Function]' == toString.call(replacer)){
			    		replacer = replacer(key);
			    	}
			    	return ('undefined' == typeof replacer ? '' : replacer);
		    	});
		    }
		    return source;
	}

	/**
	 * 动态在页面上加载一个外部js文件
	 * @name baidu.page.loadJsFile
	 * @function
	 * @grammar baidu.page.loadJsFile(path)
	 * @param {string} path js文件路径
	 * @see baidu.page.loadCssFile
	 */

	$.loadJsFile = function (path) {
	    var element = document.createElement('script');

	    element.setAttribute('type', 'text/javascript');
	    element.setAttribute('src', path);
	    element.setAttribute('defer', 'defer');

	    document.getElementsByTagName("head")[0].appendChild(element);
	};

    /**
     * 对字符串进行%#&+=以及和\s匹配的所有字符进行url转义
     * @name baidu.url.escapeSymbol
     * @function
     * @grammar baidu.url.escapeSymbol(source)
     * @param {string} source 需要转义的字符串.
     * @return {string} 转义之后的字符串.
     * @remark
     * 用于get请求转义。在服务器只接受gbk，并且页面是gbk编码时，可以经过本转义后直接发get请求。
     *
     * @return {string} 转义后的字符串
     */
    $.escapeSymbol = function(source) {

        //TODO: 之前使用\s来匹配任意空白符
        //发现在ie下无法匹配中文全角空格和纵向指标符\v，所以改\s为\f\r\n\t\v以及中文全角空格和英文空格
        //但是由于ie本身不支持纵向指标符\v,故去掉对其的匹配，保证各浏览器下效果一致
        return String(source).replace(/[#%&+=\/\\\ \　\f\r\n\t]/g, function(all) {
            return '%' + (0x100 + all.charCodeAt()).toString(16).substring(1).toUpperCase();
        });
    };

    /**
     * 对目标字符串进行html编码
     * @name baidu.string.encodeHTML
     * @function
     * @grammar baidu.string.encodeHTML(source)
     * @param {string} source 目标字符串
     * @remark
     * 编码字符有5个：&<>"'
     * @shortcut encodeHTML
     * @meta standard
     * @see baidu.string.decodeHTML
     *
     * @returns {string} html编码后的字符串
     */
    $.string.encodeHTML = function (source) {
        return String(source)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    $.hashToJson = function (url) {
        var query   = url.substr(url.lastIndexOf('#') + 1),
            params  = query.split('&'),
            len     = params.length,
            result  = {},
            i       = 0,
            key, value, item, param;

        for (; i < len; i++) {
            if(!params[i]){
                continue;
            }
            param   = params[i].split('=');
            key     = param[0];
            value   = param[1];

            item = result[key];
            if ('undefined' == typeof item) {
                result[key] = value;
            } else if (baidu.lang.isArray(item)) {
                item.push(value);
            } else { // 这里只可能是string了
                result[key] = [item, value];
            }
        }

        return result;
    };

})(jQuery);
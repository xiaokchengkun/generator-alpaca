define([
	'jquery',
	'ui/lite'
], function($, lite){
	'use strict';
	var setText = function($element, text){
		$element.text(text);
	},
	changeColor = function(val, $elem){
		$elem.css('color', val);
	},
	countWords = function($elem, options){
		if ($elem.hasClass(options.defaultprompt)){
			setText(options.numberContainer, 0);
			return false;
		}
		var value = $.trim($elem.val());
		var numNow = options.gbk !== true ? value.length : Math.ceil(lite.getByteLength(value)/2);
		setText(options.numberContainer, numNow);
		if (numNow > options.max) {
			changeColor(options.alertColor, options.numberContainer);
			options.onfail();
		} else {
			changeColor(options.defaultColor, options.numberContainer);
			options.onsuccess();
		}
	};
	var counter = function($element, options){
		if (!$element.length){ return; }
		var $elem = $element;
		var opts = {
			numberContainer: null, //数字容器
			max: 140, //最大字数
			gbk: true, //是否采用字节
			defaultColor: '#666', //默认颜色
			alertColor: '#cc0000', //警示颜色
			defaultprompt: 'prompt-default', //默认提示
			oninput: function(){}, //每次输入回调函数
			onfail: function(){}, //字数超出时的回调函数
			onsuccess: function(){} //成功时的回调
		};
		$.extend(opts, options);
		if (opts.numberContainer === null){
			opts.numberContainer = '<span></span>';
			$elem.insertAfter(opts.numberContainer);
		}
		countWords($elem, opts);
		$elem.on('focus', function(){
			countWords($elem, opts);
		});
		var eventType = 'input';

		$elem.on(eventType, function(){
			countWords($elem, opts);
			if ($.isFunction(opts.oninput)){
				opts.oninput();
			}
		});
        //ie9退格的时候 不触发input事件
        // if($.browser.msie == 9){
        //     $elem.on("keyup",function(e){
        //         if(e.keyCode === 8){
        //             countWords($elem, opts);
        //             if ($.isFunction(opts.oninput)){
        //                 opts.oninput();
        //             }
        //         }
        //     });
        // }
	};

	return counter;
});

# Yeoman Web App generator-alpaca

[Yeoman](http://yeoman.io) generator that scaffolds out a front-end web app.


Alpaca 的中文含义为“羊驼”，民间成为“草泥马”，因为谐音爽口常被大家用来表达自身的情绪。
取这个名字的含义很简单，就是希望"Build your app without 'alpaca'"。

## 功能

* 集成百度旅游专题开发组建
* 支持sass, less的css编译
* 自动添加css浏览器前缀
* 可自定义加载js开发框架
* bower管理前端开发包
* 根据文件修改自动刷新页面


## 开始

假设您已经安装了yeoman， 如若没有安装，前往[Yeoman](http://yeoman.io)官网进行安装准备。

- 安装: `sudo npm install -g generator-alpaca`
- 运行: `yo alpaca`
- 发布项目：运行 `grunt serve`
- 本地开发：`grunt serve`，`--allow-remote` 参数允许远程访问

在第一次运行之后，alpaca会将您的设置情况存储在项目文件夹下的`.yo-rc.json`下，当alpaca升级之后您不需要重新进行设置，alpaca会自动使用您之前的设置来进行创建。

## 参数

* `--init` 或者 ‘--i’

	强制重新初始化，重置`.yo-rc.json`

* `--skip-install` 或者 `--si`

	跳过安装`bower install`和`npm install`

* `--skip-welcome` 或者 `--sw`

	跳过欢迎界面


### 第三方依赖库

由于产品线自身特点，除了自定义选择的js库之外，自身默认集成了一些第三方的库：

- `typeahead.js`	来自twitter的suggestion组件
- `handlebars`		前端模板(支持typeahead.js)
- `ejs`				前端模板
- `jquery-qrcode`	生成二维码


### 百度旅游依赖ui

产品线根据自身特点，产出一些js组件：

####基础类
- `login`		登录组件，基于lv.session.user
- `nslog`		nslog统计，可以和monkey同时使用
- `lite`		自行封装的一些旅游常用方法，可以参考fis-common，但是暂时没有和fis-common的同步
- `ext`			自行封装的一些jquery的附加方法
- `errno`		对ajax请求返回错误码统一处理
- `subcookie`	cookie操作

####应用类
- `share`		分享组件，可以分享到新浪微博，人人，qq空间等
- `pagination`	翻页组建
- `fixed`		页面右侧悬浮导航，包括页面滚动时位置和导航的即时高亮(by chengkun)
- `dialog`		基于jquery的弹窗(by chengkun)
- `counter`		表单等的文字字数倒数
- `comment`		专题类的基本留言组件(by chengkun)

以上如有任何bug或者需求添加，可以联系chengkun来进行更改，或者fork此项目来进行共建~


## License

[BSD license](http://opensource.org/licenses/bsd-license.php)

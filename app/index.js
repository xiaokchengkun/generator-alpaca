'use strict';

var fs = require('fs');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var shell = require('shelljs');
var updateNotifier = require('update-notifier');
var _ = require('lodash');


var AlpacaGenerator = yeoman.generators.Base.extend({
	init: function() {
		this.pkg = require('../package.json');
		var pkg = this.pkg;

		//检验是否有更新
		var notifier = updateNotifier({
			packageName: pkg.name,
			packageVersion: pkg.version,
			updateCheckInterval: 1
	    });
	    if (notifier.update && notifier.update.latest !== pkg.version) {
	    	notifier.notify();
	    	process.exit(1);
	    }

	    this.description = pkg.description;

	    this.option('init', {
	    	alias: 'i',
	    	desc: 'Force to reset and re-init.',
	    	type: String,
	    	defaults: false,
	    	required: false
	    });

	    this.config.defaults({
	    	projectName: 'Alpaca Base',
    		projectDesc: this.description,
			author: {
				name: this.user.git.username || process.env.user || process.env.username
			},
			changedDir: false
	    });

	    this.option('test-framework', {
			desc: 'Test framework to be invoked',
			type: String,
			defaults: 'mocha'
		});
		this.testFramework = this.options['test-framework'];

		this.option('coffee', {
			desc: 'Use CoffeeScript',
			type: Boolean,
			defaults: false
		});
		this.coffee = this.options.coffee;

	    //this.options 表示 yo alpaca 后面添加的参数
	    this.init = this.options['init'] || this.options['i'] || false;

	    //设置结束之后
	    this.on('end', function(){
	    	var path = this.cwd.split('/');
	    	path = path[path.length - 1];
			if (!this.options['skip-install'] && !this.options['si']) {
				this.installDependencies({
					skipInstall: this.options['skip-install'] || this.options['si'],
					skipMessage: this.options['skip-welcome'] || this.options['sw'],
					callback: function () {						console.log('');
						console.log(chalk.green('Nice!') + ' Everything installed correctly.');
						if (this.changedDir) {
							console.log('Your project has been created in a new directory');
							console.log('You can go to it via the command ' + chalk.blue('cd ' + path) + '');
							console.log('Then run the command ' + chalk.yellow('grunt serve') + ' to launch the development server.');
						}
						else {
							console.log('Please run the command ' + chalk.yellow('grunt serve') + ' to launch the development server.');
						}
						console.log('Most questions you have will be answered in the generated ' + chalk.red('README.md'));
						console.log('');
					}.bind(this)
				});
			}
			else {
				console.log('');
				console.log(chalk.green('Nice!') + ' It appears that everything was copied over correctly.');
				if (this.changedDir) {
					console.log('Your project has been created in a new directory');
					console.log('You can travel to it via the command ' + chalk.blue('cd ' + path) + '');
					console.log('and then run the command ' + chalk.yellow('npm install && bower install') + ' to install all dependencies.');
				}
				else {
					console.log('Please run the command ' + chalk.yellow('npm install && bower install') + ' to install all dependencies.');
				}
				console.log('Most questions you have will be answered in the generated ' + chalk.red('README.md'));
				console.log('');
			}
	    });
	},

	envVars: function(){

	},

	//询问配置
	askFor: function(){
		var done = this.async();

		if(!this.options['skip-welcome'] && !this.options['sw']){
			this.log(this.yeoman);
			this.log(chalk.magenta(this.description));
		}

		this.coffee = false;
		//是否强制重新安装
		var force = false;

		if(!this.config.existed || this.init){
			force = true;
		}

		var questions = [];

		//设置项目名称
		if(!this.config.get('projectName') || force){
			questions.push({
				type: 'input',
				name: 'projectName',
				message: 'What is this project\'s name?',
				default: this.config.get('projectName')
			});
		}else{
			this.projectName = this.config.get('projectName');
		}

		if(!this.config.get('author') || force){
			questions.push({
				type: 'input',
				name: 'author',
				message: 'What is your name?',
				default: 'coder'
			});
		}else{
			this.projectName = this.config.get('author');
		}

		if(!this.config.get('version') || force){
			questions.push({
				type: 'input',
				name: 'version',
				message: 'Version is?',
				default: '0.0.1'
			});
		}else{
			this.projectName = this.config.get('version');
		}

		//选择相应套件
		if(!this.config.get('features') || force){
			questions.push({
				type: 'checkbox',
				name: 'features',
				message: 'What more would you like?',
				choices: [{
					name: 'jQuery',
					value: 'includeJQuery',
					checked: true
				},{
					name: 'Angular',
					value: 'includeAngular',
					checked: false
				},{
					name: 'Less',
					value: 'includeLess',
					checked: false
				},{
					name: 'Sass',
					value: 'includeSass',
					checked: true
				},{
					name: 'Modernizr',
					value: 'includeModernizr',
					checked: true
				}]
			});
		}

		this.prompt(questions, function(answers){
			var answersList = ['projectName', 'author', 'version'];
			for(var i=0; i<answersList.length; i++){
				var key = answersList[i];
				this[key] = answers[key] || this.config.get(key);
			}

			var features = answers.features || this.config.get('features');
			var hasFeature = function(feat) {
				return features && features.indexOf(feat) !== -1;
			};

			this.includeJQuery = hasFeature('includeJQuery');
			this.includeAngular = hasFeature('includeAngular');
			this.includeSass = hasFeature('includeSass');
			this.includeLess = hasFeature('includeLess');
			this.includeModernizr = hasFeature('includeModernizr');

			//保存配置在本地的.yo-rc.json 下次update时可以跳过配置项
			this.config.set(answers);
			done();
		}.bind(this));
	},

	//检查是否当前文件夹已经安装过
	dirCheck: function(){
		var done = this.async();
		var cwd = process.cwd();
		this.cwd = cwd;
		var projectName = this.projectName;
		var newDir = cwd + '/' + projectName;
		this.changedDir = false;
		done();
		return;

		var cleanup = function (done) {
			//清除老的.yo-rc.json
			this.config.path = newDir + '/.yo-rc.json';
			this.changedDir = true;
			fs.unlink(cwd + '/.yo-rc.json', function (err) {
				if (err) {
					done();
				}
				this.config.save();
				process.chdir(newDir);
				done();
			}.bind(this));
		}.bind(this);

		var mkdir = function (files, done) {
			fs.mkdir(newDir, function (err) {
				if (err) {
					fs.unlink(cwd + '/.yo-rc.json', function () {
						console.log(chalk.red('ERROR: ') + 'It seems you already have a folder named ' + projectName);
						console.log('       Please try a different name for your project');
						process.exit(1);
					});
				}
				else {
					cleanup(done);
				}
			});
		};

		fs.readdir(cwd, function (err, files) {
			if (err) {
				return done(err);
			}
			else if (!_.isEmpty(_.difference(files, ['.yo-rc.json'])) && !_.contains(files, '.gitignore')) {
				this.cwd = newDir;
				mkdir(files, done);
			}
			else {
				this.cwd = process.cwd();
				done();
			}
		}.bind(this));
	},

	//开始创建项目文件
	app: function(){
		var cwd = this.cwd;
		this.mkdir(cwd + '/app');
		//拷贝基础文件
		this.directory('app/scripts', cwd + '/app/scripts');
	    this.directory('app/styles', cwd + '/app/styles');
	    this.directory('app/images', cwd + '/app/images');
	    this.directory('app/templates', cwd + '/app/templates');
	    this.directory('app/ajax', cwd + '/app/ajax');
	    this.template('app/_index.html', cwd + '/app/index.html');
	},

	//部署依赖包配置
	manifests: function(){
		this.template('_package.json', this.cwd + '/package.json');
	    this.template('_Gruntfile.js', this.cwd + '/Gruntfile.js');
	},

	//根据问题设置bower
	bower: function(){
		var bower = {
			name: this.projectName,
			private: true,
			author: this.author,
			version: this.version,
			main: 'app/index.html',
			dependencies: {
				'typeahead.js': '*',
				'handlebars': '*',
				'ejs': '*',
				'jquery-qrcode': '*'
			}
		};

		if(this.includeJQuery){
			bower.dependencies.jquery = "*";
			bower.dependencies['jquery-ui'] = "*";
		}

		if(this.includeAngular){
			bower.dependencies.AngularJS = "*";
		}

		if (this.includeModernizr) {
			bower.dependencies.modernizr = "*";
		}

		this.write(this.cwd + '/bower.json', JSON.stringify(bower, null, 2));
	},

	dotFiles: function(){
		var cwd = this.cwd;
		//编辑器缩进等设置
		this.copy('editorconfig', cwd + '/.editorconfig');
		//bower依赖包安装路径
	    this.copy('bowerrc', cwd + '/.bowerrc');
	    this.copy('gitignore', cwd + '/.gitignore');
	    this.copy('jshintrc', cwd + '/.jshintrc');
	}
});

module.exports = AlpacaGenerator;

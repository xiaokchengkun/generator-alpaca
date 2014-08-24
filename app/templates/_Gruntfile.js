// Generated on <%= (new Date).toISOString().split('T')[0] %> using
// <%= pkg.name %> <%= pkg.version %>
'use strict';

module.exports = function (grunt) {
  // 显示任务花费的时间
  require('time-grunt')(grunt);
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);
  /*
   * 配置路径
   * app: 项目文件目录
   * dist: 产出文件目录
   */
  var config = {
    app: 'app',
    dist: 'dist'
  };

  grunt.initConfig({
    /*
     * Global: grunt有一些公共参数
     *  @params {boolean} dot 是否包含还有"."开头的文件
     *  @params {boolean} expand 是否允许动态路径
     *  server: 本地测试的配置与命令
     *  dist: 发布时的配置与命令
     */
    config: config,
    /*
    * 清除指定的本地文件
    *
    */
    clean: {
      server: '.tmp',
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%%= config.dist %>/*',
            '!<%%= config.dist %>/.git*'
          ]
        }]
      }
    },

    /*
    * 拷贝相应的任务文件到合适的位置
    */
    copy: {
      styles: {
        expand: true,
        dot: true,
        cwd: '<%%= config.app %>/styles',
        dest: '<%%= config.app%>/.tmp/styles/',
        src: '{,*/}*.css'
      },
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%%= config.app %>',
          dest: '<%%= config.dist %>',
          src: [
            '*.{ico,png,txt}',
            'styles/*.css',
            'scripts/{,*/}*.js',
            'images/{,*/}*.{png, jpg, gif, webp}',
            '{,*/}*.html',
            'template/{,*/}*.{ejs}',
            'fis-conf.js'
          ]
        }]
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json']
        //tasks: ['wiredep']
      },
      <% if (coffee) { %>
      coffee: {
        files: ['<%%= config.app %>/scripts/{,*/}*.{coffee,litcoffee,coffee.md}'],
        tasks: ['coffee:dist']
      },
      coffeeTest: {
        files: ['test/spec/{,*/}*.{coffee,litcoffee,coffee.md}'],
        tasks: ['coffee:test', 'test:watch']
      },
      <% } else { %>
      js: {
        files: ['<%%= config.app %>/scripts/{,*/}*.js'],
        //tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      jstest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['test:watch']
      },<% } %>
      gruntfile: {
        files: ['Gruntfile.js']
      },<% if (includeSass) { %>
      compass: {
        files: ['<%%= config.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'concat:styles']
      },<% } %><% if (includeLess) { %>
      less: {
        files: ['<%%= config.app %>/styles/{,*/}*.less'],
        tasks: ['less:server', 'concat:styles']
      },<% } %>
      styles: {
        files: ['<%%= config.app %>/styles/*/*.css'],
        tasks: ['newer:copy:styles', 'concat:styles']
      },
      livereload: {
        options: {
          livereload: '<%%= connect.options.livereload %>'
        },
        files: [
          '<%%= config.app %>/{,*/}*.html',
          '<%%= config.app %>/styles/*.css',
          '.tmp/scripts/{,*/}*.js',
          '<%%= config.app %>/images/{,*/}*',
          '<%%= config.app %>/templates/*/*.{ejs}',
          '<%%= config.app %>/images/{,*/}*'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        livereload: true,
        // Change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      proxies: [
        {
          context: '/ajax',
          host: 'localhost',
          port: 9000,
          https: false,
          rewrite: {
              '^/ajax': '/ajax'
          }
        },
        {
          context: '/destination/ajax',
          host: 'localhost',
          port: 9000,
          https: false,
          rewrite: {
              '^/destination/ajax/newsug': '/ajax/sug'
          }
        },
        {
          context: '/user',
          host: 'localhost',
          port: 9000,
          rewrite: {
              '^/user/ajax': '/ajax'
          }
        }
      ],
      livereload: {
        options: {
          open: true,
          base: [
            '<%%= config.app %>'
          ],
          middleware: function(connect, options) {
            var middlewares = [];
            var directory = options.directory || options.base[options.base.length - 1];
            if (!Array.isArray(options.base)) {
                options.base = [options.base];
            }
            options.base.forEach(function(base) {
                // Serve static files.
                middlewares.push(connect.static(base));
            });
            // Setup the proxy
            middlewares.push(require('grunt-connect-proxy/lib/utils').proxyRequest);
            // Make directory browse-able.
            middlewares.push(connect.directory(directory));
            return middlewares;
          }
        }
      },
      test: {
        options: {
          open: false,
          port: 9001,
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect.static(config.app)
            ];
          }
        }
      },
      dist: {
        options: {
          base: '<%%= config.dist %>',
          livereload: false
        }
      }
    },


    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%%= config.app %>/scripts/{,*/}*.js',
        '!<%%= config.app %>/scripts/vendor/*',
        'test/spec/{,*/}*.js'
      ]
    },<% if (testFramework === 'mocha') { %>

    // Mocha testing framework configuration options
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://<%%= connect.test.options.hostname %>:<%%= connect.test.options.port %>/index.html']
        }
      }
    },<% } else if (testFramework === 'jasmine') { %>

    // Jasmine testing framework configuration options
    jasmine: {
      all: {
        options: {
          specs: 'test/spec/{,*/}*.js'
        }
      }
    },<% } %><% if (coffee) { %>

    // Compiles CoffeeScript to JavaScript
    coffee: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= config.app %>/scripts',
          src: '{,*/}*.{coffee,litcoffee,coffee.md}',
          dest: '.tmp/scripts',
          ext: '.js'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test/spec',
          src: '{,*/}*.{coffee,litcoffee,coffee.md}',
          dest: '.tmp/spec',
          ext: '.js'
        }]
      }
    },<% } %>

    /*
    * 编译sass并且放到.tmp
    */
    compass: {
      options: {
        sassDir: '<%%= config.app%>/styles',
        cssDir: '.tmp/styles',
        relativeAssets: false,
        assetCacheBuster: false
      },
      server: {
        options: {
          debugInfo: false
        }
      },
      dist: {
        options: {
          debugInfo: false,
          noLineComments: true,
          outputStyle: 'nested'
        }
      }
    },

    /*
    * 编译Less
    *
     */
    less: {
      options: {
        paths: '<%%= config.app%>/styles',
        cleancss: true
      },
      files: {
        expand: true,
        cwd: '<%%= config.app%>/styles',
        src: ['/{,*/}*.less'],
        dest: '.tmp/styles',
        ext: '.css'
      },
      server: {
      }
    },

    /*
    * 自动添加css3浏览器支持的前缀
    */
    autoprefixer: {
      options: {
        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    requirejs: {
      dist: {
        options: {
          baseUrl: '<%%= config.app %>/scripts/',
          optimize: 'none',
          name: 'main',
          mainConfigFile: '<%%= config.app %>/scripts/main.js',
          out: 'dist/scripts/main.js'
        }
      }
    },

    // Automatically inject Bower components into the HTML file
    wiredep: {
      app: {
        ignorePath: /^<%%= config.app %>\/|\.\.\//,
        src: ['<%%= config.app %>/index.html']
      }<% if (includeSass) { %>,
      sass: {
        src: ['<%%= config.app %>/styles/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      }<% } %>
    },

    /*
    * css合并文件
    *
    */
    concat: {
        options: {
            banner: '/*alpaca*/',
            separator: ' '
        },
        styles: {
            files: {
                '<%%= config.app%>/styles/main.css':
                    ['.tmp/styles/main/*.css'],
                '<%%= config.app%>/styles/detail.css':
                    ['.tmp/styles/detail/*.css']
            }
        }
    },

    /*
    * 静态文件加戳
     */
    rev: {
      dist: {
        files: {
          src: [
            '<%%= config.dist %>/scripts/{,*/}*.js',
            '<%%= config.dist %>/styles/{,*/}*.css',
            '<%%= config.dist %>/images/{,*/}*.{jpg, png, gif, webp}',
            '<%%= config.dist %>/template/{,*/}*.{ejs}',
            '<%%= config.dist %>/*.{ico,png}'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: '<%%= config.dist %>'
      },
      html: '<%%= config.app %>/index.html'
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: ['<%%= config.dist %>', '<%%= config.dist %>/images']
      },
      html: ['<%%= config.dist %>/{,*/}*.html'],
      css: ['<%%= config.dist %>/styles/{,*/}*.css']
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= config.app %>/images',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%%= config.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= config.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%%= config.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          removeRedundantAttributes: true,
          useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: '<%%= config.dist %>',
          src: '{,*/}*.html',
          dest: '<%%= config.dist %>'
        }]
      }
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care
    // of minification. These next options are pre-configured if you do not
    // wish to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%%= config.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css',
    //         '<%%= config.app %>/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%%= config.dist %>/scripts/scripts.js': [
    //         '<%%= config.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    // Copies remaining files to places other tasks can use
    <% if (includeModernizr) { %>

    // Generates a custom Modernizr build that includes only the tests you
    // reference in your app
    modernizr: {
      dist: {
        devFile: 'bower_components/modernizr/modernizr.js',
        outputFile: '<%%= config.dist %>/scripts/vendor/modernizr.js',
        files: {
          src: [
            '<%%= config.dist %>/scripts/{,*/}*.js',
            '<%%= config.dist %>/styles/{,*/}*.css',
            '!<%%= config.dist %>/scripts/vendor/*'
          ]
        },
        uglify: true
      }
    },<% } %>

    /*
    *并行处理一些互相没有关系的进程
     */
    concurrent: {
      server: [
        <% if (includeSass) { %>'compass:server',<% } %>
        <% if (coffee) {  %>'coffee:dist',<% } %>
        'copy:styles'
      ],
      dist: [
        <% if (coffee) { %>'coffee',<% } %>
        <% if (includeSass) { %>'compass',<% } %>
        'copy:styles',
        'imagemin',
        'svgmin'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-newer');
  <% if (includeLess) {%>
  grunt.loadNpmTasks('grunt-contrib-less');
  <% } %>
  <% if (includeSass) {%>
  grunt.loadNpmTasks('grunt-contrib-compass');
  <% } %>
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('serve', 'start the server and preview your app, --allow-remote for remote access', function (target) {
    if (grunt.option('allow-remote')) {
      grunt.config.set('connect.options.hostname', '0.0.0.0');
    }
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }
    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'autoprefixer',
      'concat:styles',
      'configureProxies',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run([target ? ('serve:' + target) : 'serve']);
  });

  grunt.registerTask('test', function (target) {
    if (target !== 'watch') {
      grunt.task.run([
        'clean:server',
        'concurrent:test',
        'autoprefixer'
      ]);
    }

    grunt.task.run([
      'connect:test',<% if (testFramework === 'mocha') { %>
      'mocha'<% } else if (testFramework === 'jasmine') { %>
      'jasmine'<% } %>
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'cssmin',
    'uglify',
    'copy:dist',<% if (includeModernizr) { %>
    'modernizr',<% } %>
    'rev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};

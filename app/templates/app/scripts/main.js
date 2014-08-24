require.config({
    //define the base url
    baseUrl: '/scripts/',

    paths: {
        'jquery': 'lib/jquery.min', //jquery 1.10.1
        'jquery-ui': 'lib/jquery-ui.min', //jquery 1.10.4
        'typeahead': '../bower_components/typeahead.js/dist/typeahead.bundle',
        'handlebars': '../bower_components/handlebars/handlebars',
        'qrcode': '../bower_components/jquery-qrcode/jquery.qrcode.min',
        'ejs': 'lib/ejs',
        'app': 'app',
        'ui': 'ui'
    },

    deps: ['app/app']
});

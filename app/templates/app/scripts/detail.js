require.config({
    //define the base url
    baseUrl: '/scripts/',

    paths: {
        'jquery': 'lib/jquery.min', //jquery 1.10.1
        'jquery-ui': 'lib/jquery-ui.min', //jquery 1.10.4
        'ejs': 'lib/ejs',
        'app': 'app',
        'ui': 'ui'
    },

    deps: ['app/detail']
});

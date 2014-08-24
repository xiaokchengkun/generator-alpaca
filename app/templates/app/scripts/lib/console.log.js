/*重写connsole.log,防止ie调试代码出错*/
if (!window.console){
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
        "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = (typeof window.loadFirebugConsole == 'function') ? window.loadFirebugConsole() : {};
    for (var i = 0; i < names.length; ++i){
        window.console[names[i]] = function() {};
    }
}

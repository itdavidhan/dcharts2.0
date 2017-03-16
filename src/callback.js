/*
* callback
*/
dcharts.callback = function(selector, options, render, callback) {

    callback && callback(set);

    function set() {
        var hasArgs = typeof arguments != 'undefined';
        var argsLen = hasArgs ? arguments.length : 0;
        var argsType = (hasArgs && argsLen == 1 && typeof arguments == 'object') ? 'object' : 'undefined';

        if(hasArgs && argsLen == 2) {
            options[arguments[0]] = arguments[1];
        }else if(hasArgs && argsType == 'object') {
            var json = arguments[0];
            for(var i in json) {
                options[i] = json[i];
            }
        }else{
            return;
        }
        render(selector, options);
    }
};

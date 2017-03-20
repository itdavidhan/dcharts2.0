
dcharts.utils = {};

// dfc: data format conversion
dcharts.utils.dfc = {};

dcharts.utils.dfc.json2arr = function(arr) {
    // example: [{year:2016, value:2}, {year:2017, value:3}] ==> [[2016, 2],[2017, 3]]
    var _main = [];
    arr.map(function(json) {
        var _arr = [];
        for(var i in json)
        {
            _arr.push(json[i]);
        }
        _main.push(_arr);
    });
    return _main;
};

dcharts.utils.json2arr = function(json) {
    var _arr = [];
    for(var i in json) {
        _arr.push(json[i]);
    }
    return _arr;
};

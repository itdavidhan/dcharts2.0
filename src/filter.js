
dcharts.filter = {};

dcharts.filter.maxInArrs = function(arr) {
    // [[0, 1], [1, 6]] ==> [1, 6]
    var _keyArr = [];
    var _valArr = [];
    var _rArr = [];
    var _keyMax = 0;
    var _valMax = 0;
    var _rMax = 0;
    arr.map(function(a) {
        _keyArr.push(a[0]);
        _valArr.push(a[1]);
        _rArr.push(parseFloat(a[2]));
    });
    _keyMax = d3.max(_keyArr, function(a) {
        return +a;
    });
    _valMax = d3.max(_valArr, function(a) {
        return +a;
    });
    _rMax = d3.max(_rArr, function(a) {
        return +a;
    });
    return [_keyMax, _valMax, _rMax];
};

dcharts.filter.minInArrs = function(arr) {
    // [[0, 2], [1, 6]] ==> [0, 2]
    var _keyArr = [];
    var _valArr = [];
    var _rArr = [];
    var _keyMin = 0;
    var _valMin = 0;
    var _rMin = 0;
    arr.map(function(a) {
        _keyArr.push(a[0]);
        _valArr.push(a[1]);
        _rArr.push(parseFloat(a[2]));
    });
    _keyMin = d3.min(_keyArr, function(a) {
        return +a;
    });
    _valMin = d3.min(_valArr, function(a) {
        return +a;
    });
    _rMin = d3.min(_rArr, function(a) {
        return +a;
    });
    return [_keyMin, _valMin, _rMin];
};

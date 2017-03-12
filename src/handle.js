
dcharts.handle = {};
dcharts.handle.data = function(data) {
    var initData = data;
    // 数据为空
    if(initData.length == 0 || !(initData instanceof Array))
    {
        console.error('数据为空，或者非数组');
        return [[]];
    }
    // 数据嵌套
    if(initData[0] instanceof Array)
    {   // 数据嵌套数组
        if(typeof initData[0][0] !== 'undefined')
        {
            if(initData[0][0] instanceof Array && initData[0][0].length == 2)
            {
                return initData;
            }else if(initData[0][0] instanceof Object) {
                var data = [];
                initData.map(function(a) {
                  _a = dcharts.utils.dfc.json2arr(a);
                  data.push(_a);
                });
                return data;
            }else{
                console.error('数据格式错误');
                return [[]];
            }
        }else if(initData[0].length == 2){
            return initData;
        }else{
            console.error('数据格式错误');
            return [[]];
        }
    }
    // 数据不嵌套
    else if(initData[0] instanceof Object) {
       var _data = dcharts.utils.dfc.json2arr(initData);
       return [_data];
   } else if(Number(initData[0])) {
       var _arr = [];
       initData.map(function(n, i) {
           var _a = [i+1, n];
           _arr.push(_a);
       });
       return [_arr];
   }else{
       console.error('数据格式错误');
       return [[]];
   }
};

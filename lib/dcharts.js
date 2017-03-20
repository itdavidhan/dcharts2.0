(function() {
    function _dcharts(d3, crossfilter) {


var dcharts = {
    version: '2.0.1'
};

dcharts.default = {};
dcharts.default._MARGIN = {top: 30, left: 30, right: 30, bottom: 30};
dcharts.default._COLOR = d3.scale.category10();
dcharts.default._colorArr = ['#5282e4', '#b5c334', '#fdcf10', '#e97c24', '#c1222a', '#ff8562', '#9bcb62', '#fbd960', '#f3a53a'];

// 图表组合
dcharts.group = {};

// 处理数据
dcharts.group.options = function(selector, options) {
    var ops = {
        getSelector: function() {
            return d3.select(selector);
        },
        getBox: function() {
            return this.getSelector().select('.dcharts-container');
        },
        getOriginalSelector: function() {
            return selector;
        },
        getSelWdith: function() {
            var dom = this.getSelector();
            return parseFloat(dom.style('width'));
        },
        getSelHeight: function() {
            var dom = this.getSelector();
            return parseFloat(dom.style('height'));
        },
        getWidth: function() {
            return parseFloat(options.width) || this.getSelWdith();
        },
        getHeight: function() {
            return parseFloat(options.height) || this.getSelHeight();
        },
        getScale: function() {
            return options.scale || 'linear';
        },
        getData: function() {
            return dcharts.handle.data(options.data);
        },
        getOriginalData: function() {
            return options.data;
        },
        getValMax: function() {
            var _max = -Infinity;
            d3.map(this.getData(), function(d) {
              var dMax = dcharts.filter.maxInArrs(d)[1];
              if(dMax > _max) _max = dMax;
            });
            return _max;
        },
        getValMin: function() {
            var _min = Infinity;
            d3.map(this.getData(), function(d) {
              var dMin = dcharts.filter.minInArrs(d)[1];
              if(dMin < _min) _min = dMin;
            });
            return _min;
        },
        getKeyMax: function() {
            var _max = -Infinity;
            d3.map(this.getData(), function(d) {
              var dMax = dcharts.filter.maxInArrs(d)[0];
              if(dMax > _max) _max = dMax;
            });
            return _max;
        },
        getKeyMin: function() {
            var _min = Infinity;
            d3.map(this.getData(), function(d) {
              var dMin = dcharts.filter.minInArrs(d)[0];
              if(dMin < _min) _min = dMin;
            });
            return _min;
        },
        getRMax: function() {
            var _max = -Infinity;
            d3.map(this.getData(), function(d) {
              var dMax = dcharts.filter.maxInArrs(d)[2];
              if(dMax > _max) _max = dMax;
            });
            return _max;
        },
        getRMin: function() {
            var _min = Infinity;
            d3.map(this.getData(), function(d) {
              var dMin = dcharts.filter.minInArrs(d)[2];
              if(dMin < _min) _min = dMin;
            });
            return _min;
        },
        getMargin: function() {
            return options.margin || dcharts.default._MARGIN;
        },
        getX: function() {
            if(this.getScale() == 'linear')
            {
                return d3.scale.linear()
                .domain([0, this.getKeyMax()+1])
                // .domain([this.getKeyMin(), this.getKeyMax()])
                .range([0, ops.quadrantWidth()]);
            }else if(this.getScale() == 'time') {
                return d3.time.scale()
                .domain([new Date(2000, 0, 1).getTime(), new Date(2022, 0, 1).getTime()])
                .range([0, ops.quadrantWidth()]);
            }else if(this.getScale() == 'ordinal'){
                var data = this.getData()[0];
                return d3.scale.ordinal()
                .domain(data.map(function(d) {
                    return d[0];
                })).rangeRoundBands([0, this.quadrantWidth()], 1, 0.6);
                // })).rangePoints([0, this.quadrantWidth()], 1);
            }
        },
        getY: function() {
            return d3.scale.linear()
            .domain([0, this.getValMax()])
            // .domain([this.getValMin(), this.getValMax()])
            .range([ops.quadrantHeight(), 0]);
        },
        getTicks: function() {
            return options.ticks;
        },
        getInterpolate: function() {
            return options.interpolate || 'linear';
        },
        getTension: function() {
            return options.tension || 0.7;
        },
        getBottomPct: function() {
            return options.bottomPct || 1/4;
        },
        showAxisX: function() {
            return (typeof options.showAxisX != 'undefined') ? options.showAxisX : true;
        },
        showAxisY: function() {
            return (typeof options.showAxisY != 'undefined') ? options.showAxisY : true;
        },
        showLineX: function() {
            return options.showLineX || false;
        },
        showLineY: function() {
            return options.showLineY || false;
        },
        axisTextX: function() {
            return options.axisTextX || '';
        },
        axisTextY: function() {
            return options.axisTextY || '';
        },
        showDot: function() {
            return options.showDot;
        },
        showText: function() {
            return options.showText || false;
        },
        getColor: function() {
            return options.color || dcharts.default._colorArr;
        },
        getFormatX: function() {
            return options.formatX || '';
        },
        getFormatY: function() {
            return options.formatY || '';
        },
        getPadAngle: function() {
            return options.padAngle || 0; // 0.01-0.03
        },
        getTitle: function() {
            return options.title || '';
        },
        getOuterRadius: function() {
            return options.outerRadius || ops.getWidth()/2 - ops.getMargin().left - ops.getMargin().right;
        },
        getInnerRadius: function() {
            return (typeof options.innerRadius !== 'undefined') ? options.innerRadius : ops.getOuterRadius()/2;
        },
        xStart: function() {
            return this.getMargin().left;
        },
        yStart: function() {
            return this.getHeight() - this.getMargin().bottom;
        },
        xEnd: function() {
            return this.getWidth() - this.getMargin().right;
        },
        yEnd: function() {
            return this.getMargin().top;
        },
        quadrantWidth: function() {
            return this.getWidth() - this.getMargin().left - this.getMargin().right;
        },
        quadrantHeight: function() {
            return this.getHeight() - this.getMargin().bottom - this.getMargin().top;
        },
        _dchartCont: null,
        _svg: null,
        _bodyG: null,
        _axesG: null,
        _defs: null,
        _bar: null,
        _area: null,
        _line: null,
        _dots: null,
        _pieG: null,
        _bubble: null,
        _legend: null,
        _axisXb: null,
        _axisXt: null,
        _axisYl: null,
        _axisYr: null,
        _hasGuidLineX: false,
        _hasGuidLineY: false
    };
    return ops;
};

// 生成svg
dcharts.group.renderSvg = function(ops) {
    if(!ops._dchartCont) {
        var selector = ops.getSelector();
        ops._dchartCont = selector.html('')
        .append('div')
        .attr('class', 'dcharts-container')
        .style('width', ops.getWidth() + 'px')
        .style('height', ops.getHeight() + 'px');
        
        ops._svg = ops._dchartCont.append("svg");
        ops._svg.attr("height", ops.getHeight())
            .attr("width", ops.getWidth());
        dcharts.tooltip.initTooltip(ops._dchartCont);
        dcharts.legend.init(ops);
    }
};

// 生成 g.body
dcharts.group.renderBody = function(ops) {
    if (!ops._bodyG)
    {
        ops._bodyG = ops._svg.append("g")
                .attr("class", "body")
                .attr("transform", "translate("
                    + ops.xStart() + ","
                    + ops.yEnd() + ")")
                .attr("clip-path", "url(#body-clip)");
    }
},

// 生成坐标轴
dcharts.group.renderAxes = function(ops, type) {

    if(!ops._axesG)
    {
        ops._axesG = ops._svg.append("g")
                .attr("class", "axes");
    }

    switch(type)
    {
        case 'x-bottom':
            createXB();
            break;
        case 'x-top':
            createXT();
            break;
        case 'y-left':
            createYL();
            break;
        case 'y-right':
            createYR();
            break;
        default:
            console.error('参数有误');
            break;
    }

    function createXB() {
        if(!ops._axisXb) {
            ops._axisXb = d3.svg.axis()
                    .scale(ops.getX())
                    .orient("bottom")
                    .tickFormat(function(v) {
                      return v + ops.getFormatX();
                    });
                    // .ticks(ops.getTicks());
            ops._axesG.append("g")
                .attr("class", "x-axis xb")
                .attr("transform", function(){
                    return "translate(" + ops.xStart() + "," + ops.yStart() + ")";
                })
                .call(ops._axisXb)
                .append("text")
                    .attr("x", (ops.xEnd() - ops.xStart()))
                    .attr("dy", 40)
                    .style("text-anchor", "end")
                    .text(ops.axisTextX());
            dcharts.group._renderGridLineX(ops, 'xb');
        }
    }

    function createXT() {
        if(!ops._axisXt) {
            ops._axisXt = d3.svg.axis()
                    .scale(ops.getX())
                    .orient("top")
                    .tickFormat(function(v) {
                      return v + ops.getFormatX();
                    });
                    // .ticks(ops.getTicks());
            ops._axesG.append("g")
                .attr("class", "x-axis xt")
                .attr("transform", function(){
                    return "translate(" + ops.xStart() + "," + ops.yEnd() + ")";
                })
                .call(ops._axisXt)
                .append("text")
                    .attr("x", (ops.xEnd() - ops.xStart()))
                    .attr("dy", -40)
                    .style("text-anchor", "end")
                    .text(ops.axisTextX());
            dcharts.group._renderGridLineX(ops, 'xt');
        }
    }

    function createYL() {
        if(!ops._axisYl) {
            ops._axisYl = d3.svg.axis()
                    .scale(ops.getY())
                    .orient("left")
                    .ticks(ops.getTicks())
                    .tickFormat(function(v) {
                      return v + ops.getFormatY();
                    });
            ops._axesG.append("g")
                .attr("class", "y-axis yl")
                .attr("transform", function(){
                    return "translate(" + ops.xStart() + "," + ops.yEnd() + ")";
                })
                .call(ops._axisYl)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", -40)
                .style("text-anchor", "end")
                .text(ops.axisTextY());
            dcharts.group._renderGridLineY(ops, 'yl');
        }
    }

    function createYR() {
        if(ops._axisYr) return;
        ops._axisYr = d3.svg.axis()
                .scale(ops.getY())
                .orient("right")
                .ticks(ops.getTicks())
                .tickFormat(function(v) {
                  return v + ops.getFormatY();
                });
        ops._axesG.append("g")
            .attr("class", "y-axis yr")
            .attr("transform", function(){
                return "translate(" + ops.xEnd() + "," + ops.yEnd() + ")";
            })
            .call(ops._axisYr)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", 40)
            .style("text-anchor", "end")
            .text(ops.axisTextY());
        dcharts.group._renderGridLineY(ops, 'yr');
    }
};

// 生成坐标线 X
dcharts.group._renderGridLineX = function(ops, type) {
    if(ops.showLineX() && !ops._hasGuidLineX)
    {
        var _y2 = (type == 'xb') ? - ops.quadrantHeight() : ops.quadrantHeight();
        ops._axesG.selectAll("g.x-axis g.tick")
            .append("line")
            .classed("grid-line", true)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", _y2);

        ops._hasGuidLineX = true;
    }
};

// 生成坐标线 Y
dcharts.group._renderGridLineY = function(ops, type) {
    if(ops.showLineY() && !ops._hasGuidLineY)
    {
        var _x2 = (type == 'yl') ? ops.quadrantWidth() : -ops.quadrantWidth();
        ops._axesG.selectAll("g.y-axis g.tick")
            .append("line")
            .classed("grid-line", true)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", _x2)
            .attr("y2", 0);

        ops._hasGuidLineY = true;
    }
};

// 生成线图
dcharts.group.renderLine = function(ops) {
    var _x = ops.getX();
    var _y = ops.getY();
    var _color = ops.getColor();
    var _data = ops.getData();

    if(!ops._line) {
        ops._line = d3.svg.line()
                .x(function (d) { return _x(d[0]); })
                .y(function (d) { return _y(d[1]); });

        if(ops.getInterpolate()) ops._line.interpolate(ops.getInterpolate());
        if(ops.getTension()) ops._line.tension(ops.getTension());

        ops._bodyG.selectAll("path.line")
                .data(_data)
                .enter()
                .append("path")
                .style("stroke", function (d, i) {
                  if(typeof _color != 'undefined' && _color.length > 0)
                  {
                    return _color[i%_color.length];
                  }else{
                    return dcharts.default._COLOR(i);
                  }
                })
                .attr("class", "line");

        ops._bodyG.selectAll("path.line")
                .data(_data)
                .transition()
                .attr("d", function (d) {return ops._line(d); });
    }
};

// 生成块
dcharts.group.renderArea = function(ops) {
    var _x = ops.getX();
    var _y = ops.getY();
    var _color = ops.getColor();
    var data = ops.getData();

    if(ops._area) return;
    ops._area = d3.svg.area()
        .x(function(d) { return _x(d[0]); })
        .y0(_y(0))
        .y1(function(d) { return _y(d[1]); });

    if(ops.getInterpolate()) ops._area.interpolate(ops.getInterpolate());
    if(ops.getTension()) ops._area.tension(ops.getTension());

    ops._bodyG.selectAll("path.area")
            .data(data)
            .enter()
            .append("path")
            .style("fill", function (d, i) {
                if(typeof _color != 'undefined' && _color.length > 0)
                {
                  return _color[i%_color.length];
                }else{
                  return dcharts.default._COLOR(i);
                }
            })
            .transition()
            .attr("class", "area")
            .attr("d", function(d){return ops._area(d);});
};

// 生成圆点
dcharts.group.renderDots = function(ops) {
    var _x = ops.getX();
    var _y = ops.getY();
    var _color = ops.getColor();
    var data = ops.getData();

    if(ops._dots) return;
    data.forEach(function (list, i) {
       ops._dots = ops._bodyG.selectAll("circle._" + i)
               .data(list)
               .enter()
               .append("circle")
               .attr("class", "dot _" + i);

       ops._bodyG.selectAll("circle._" + i)
               .data(list)
               .style("stroke", function (d) {
                   if(typeof _color != 'undefined' && _color.length > 0)
                   {
                     return _color[i%_color.length];
                   }else{
                     return dcharts.default._COLOR(i);
                   }
               })
               .transition()
               .attr("cx", function (d) { return _x(d[0]); })
               .attr("cy", function (d) { return _y(d[1]); })
               .attr("r", 4.5);

       dcharts.tooltip.mountTooltip(ops, ops._dots);
    });
};

// 生成条/柱
dcharts.group.renderBar = function(ops) {
    var data = ops.getData()[0];
    var _x = ops.getX();
    var _y = ops.getY();
    var _color = ops.getColor();

    var padding = Math.floor(ops.quadrantWidth() / data.length)*0.2;

    if(!ops._bar) {
        ops._bar = ops._bodyG.selectAll("rect.bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar");

        ops._bodyG.selectAll("rect.bar")
                .data(data)
                .attr("y", ops.quadrantHeight())
                .transition()
                // .duration(500)
                .delay(function(d, i) {
                    return i*100;
                })
                .ease('linear')
                .style("fill", function(d, i) {
                  if(typeof _color !== 'undefined' && _color.length > 0)
                  {
                    return _color[i%_color.length];
                  }else{
                    return dcharts.default._COLOR(i);
                  }
                })
                .attr("x", function (d) {
                    return _x(d[0]) - (Math.floor(ops.quadrantWidth() / data.length) - padding)/2;
                })
                .attr("y", function (d) {
                    return _y(d[1]);
                })
                .attr("height", function (d) {
                    return ops.yStart() - _y(d[1]);
                })
                .attr("width", function(d){
                    return Math.floor(ops.quadrantWidth() / data.length) - padding;
                });

        dcharts.tooltip.mountTooltip(ops, ops._bar);

        ops._bar.on('mouseenter.defult1', function(d) {
          d3.select(this).transition().style('opacity', '0.8');
        })
        .on('mouseleave.defult3', function() {
            d3.select(this).transition().style('opacity', '1');
        });

        if(ops.showText()) showText();
        function showText() {
            ops._bodyG.selectAll("text.text")
                .data(data)
                .enter()
                .append("text")
                .attr("class", "text")
                .attr("x", function (d, i) {
                    var _resultX = d instanceof Array ? d[0] : i+1;
                    return _x(_resultX);
                })
                .attr("y", function (d) {
                    var _resultY = d instanceof Array ? d[1] : d;
                    return _y(_resultY) + 16; // 16:距离柱形图顶部的距离，根据情况而定
                })
                .style({
                  "fill": "#FFF",
                  "font-size": "12px"
                })
                .attr("text-anchor", "middle")
                .text(function(d) {
                  return d instanceof Array ? d[1] : d;
                });
        }
    }
};

// body-clip
dcharts.group.defineBodyClip = function(ops) {
    var padding = Math.floor(ops.quadrantWidth() / ops.getData()[0].length)*0.2;
    if(!ops._defs) {
        ops._defs = ops._svg.append("defs");
        ops._defs.append("clipPath")
        .attr("id", "body-clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", ops.quadrantWidth() + 2 * padding)
        .attr("height", ops.quadrantHeight());
    }
};


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
            if(initData[0][0] instanceof Array)
            {
                return initData;
            }else if(initData[0][0] instanceof Object) {
                var data = [];
                initData.map(function(a) {
                  _a = dcharts.utils.dfc.json2arr(a);
                  data.push(_a);
                });
                return data;
            }else if(typeof initData[0][0] == 'string') {
                return [initData];
            }else{
                console.error('数据格式错误');
                return [[]];
            }
        }else if((initData[0].length == 2) || (initData[0].length == 3)){
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
        _rArr.push(a[2]);
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
        _rArr.push(a[2]);
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

/*
* 创建柱状图 - bar chart
* @param: {Object} options
* options参数配置（带★为必选）
* ★ scale: <string> example: 'linear' or 'ordinal'
* ★ data: <array> example: [1, 4, 12] or [{'key': 'a', 'value': 1}, {'key': 'b', 'value': 2}]
* margin: <json> example: {top: 20, right: 20, bottom: 20, left: 20}
* ticks: <number> example: 5
* showLineX: <boolean> example: false
* showLineY: <boolean> example: true
* showText: <boolean> example: true
* formatX: <string> example: '%'
* formatY: <string> example: '%'
* showAxisX: <boolean> example: true
* showAxisY: <boolean> example: true
* axisTextX: <string> example: 'x轴'
* axisTextY: <string> example: 'y轴'
* color: <array> example: ['yellow', 'red', 'orange', 'blue', 'green']
*
*/

dcharts.barChart = function(selector, options, callback) {

    function render(selector, options) {
        // 处理数据
        var ops = dcharts.group.options(selector, options);

        // 生成svg
        dcharts.group.renderSvg(ops);

        // 生成坐标轴
        dcharts.group.renderAxes(ops, 'x-bottom');
        dcharts.group.renderAxes(ops, 'y-left');

        dcharts.group.defineBodyClip(ops);

        // 生成 g.body
        dcharts.group.renderBody(ops);

        // 生成条
        dcharts.group.renderBar(ops);
    }

    // 渲染图表
    render(selector, options);

    // 执行回调
    dcharts.callback(selector, options, render, callback);
};


dcharts.crossBarChart = function(selector, options, callback) {
    // 渲染图表
    render(selector, options);
    // 执行回调
    dcharts.callback(selector, options, render, callback);

    function render(selector, options) {
        // 处理数据
        var ops = dcharts.group.options(selector, options);
        ops.data = ops.getData()[0];
        ops.x = d3.scale.linear().domain([0, ops.getValMax()]).range([0, ops.quadrantWidth()]);
        ops.y = d3.scale.ordinal()
        .domain(ops.data.map(function(d) {
            return d[0];
        })).rangePoints([0, ops.quadrantHeight()], 1);
        ops.color = ops.getColor();
        ops.padding = Math.floor(ops.quadrantHeight() / ops.data.length)*0.2;

        // 生成svg
        dcharts.group.renderSvg(ops);

        dcharts.group.defineBodyClip(ops);

        // 生成坐标轴
        renderAxes(ops);

        // 生成 g.body
        dcharts.group.renderBody(ops);

        // 生成柱
        renderBar(ops);
    }
    function renderAxes(ops) {
        ops._axesG = ops._svg.append("g")
                .attr("class", "axes");

        ops._axisYl = d3.svg.axis()
                .scale(ops.y)
                .orient("left")
                .tickFormat(function(v) {
                  return v + ops.getFormatY();
                });
                // .ticks(ops.getTicks());

        ops._axisXb = d3.svg.axis()
                .scale(ops.x)
                .orient("bottom")
                .tickFormat(function(v) {
                  return v + ops.getFormatX();
                })
                .ticks(ops.getTicks());
        ops._axesG.append("g")
            .attr("class", "x-axis xb")
            .attr("transform", function(){
                return "translate(" + ops.xStart() + "," + ops.yStart() + ")";
            })
            .call(ops._axisXb)
            .append("text")
                .attr("x", (ops.xEnd() - ops.xStart()))
                .attr("dy", 40)
                .style("text-anchor", "end")
                .text(ops.axisTextY());

        dcharts.group._renderGridLineX(ops, 'xb');

        ops._axesG.append("g")
            .attr("class", "y-axis yl")
            .attr("transform", function(){
                return "translate(" + ops.xStart() + "," + ops.yEnd() + ")";
            })
            .call(ops._axisYl)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", -40)
            .style("text-anchor", "end")
            .text(ops.axisTextX());
        dcharts.group._renderGridLineY(ops, 'yl');
    }
    function renderBar(ops) {
        ops._bar = ops._bodyG.selectAll("rect.bar")
                .data(ops.data)
                .enter()
                .append("rect")
                .attr("class", "bar");

        ops._bar.style("fill", function(d, i) {
                  if(typeof ops.color !== 'undefined' && ops.color.length > 0)
                  {
                    return ops.color[i%ops.color.length];
                  }else{
                    return dcharts.default._COLOR(i);
                  }
                })
                .attr("y", function (d) {
                    return ops.y(d[0]) - (Math.floor(ops.quadrantHeight() / ops.data.length) - ops.padding)/2;
                })
                .attr("x", function (d) {
                    return 0;
                })
                .attr("width", 0)
                .transition()
                // .duration(500)
                .delay(function(d, i) {
                    return i*100;
                })
                .ease('linear')
                .attr("width", function (d) {
                    return ops.x(d[1]);
                })
                .attr("height", function(d){
                    return Math.floor(ops.quadrantHeight() / ops.data.length) - ops.padding;
                });

        if(ops.showText()) showText();
        function showText() {
            ops._bodyG.selectAll("text.text")
                .data(ops.data)
                .enter()
                .append("text")
                .attr("class", "text")
                .attr("y", function (d) {
                    return ops.y(d[0]) + 6; // 6：字体大小的一半
                })
                .attr("x", function (d) {
                    return ops.x(d[1]) - 12; // 12:距离柱形图右边的距离，根据情况而定
                })
                .style({
                  "fill": "#fff",
                  "font-size": "12px"
                })
                .attr("text-anchor", "middle")
                .text(function(d) {
                  return d instanceof Array ? d[1] : d;
                });
        }

        dcharts.tooltip.mountTooltip(ops, ops._bar);

        ops._bar.on('mouseenter.defult1', function(d) {
          d3.select(this).transition().style('opacity', '0.8');
        })
        .on('mouseleave.defult3', function() {
            d3.select(this).transition().style('opacity', '1');
        });
    }
};

/*
* 创建线图 - line chart
* @param: {Object} options
* 参数配置（带★为必选）
* ★ scale: <string> example: 'linear' or 'time'
* ★ data: <array> example: [1, 4, 12] or [{'key': 'a', 'value': 1}, {'key': 'b', 'value': 2}]
* margin: <json> example: {top: 20, right: 20, bottom: 20, left: 20}
* ticks: <number> example: 5
* showLineX: <boolean> example: false
* showLineY: <boolean> example: true
* formatX: <string> example: '%'
* formatY: <string> example: '%'
* axisTextX: <string> example: 'x轴'
* axisTextY: <string> example: 'y轴'
* interpolate: <string> example: 'linear','cardinal','step'
* tension: <number> example: 0~1之间
* color: <array> example: ['yellow', 'red', 'orange', 'blue', 'green']
*/

dcharts.lineChart = function(selector, options, callback) {

    function render(selector, options) {
        // 处理数据
        var ops = dcharts.group.options(selector, options);

        // 生成svg
        dcharts.group.renderSvg(ops);

        // 生成坐标轴
        dcharts.group.renderAxes(ops, 'x-bottom');
        dcharts.group.renderAxes(ops, 'y-left');

        // 生成 g.body
        dcharts.group.renderBody(ops);

        // 生成线
        dcharts.group.renderLine(ops);

        // 生成点
        dcharts.group.renderDots(ops);
    }

    // 渲染图表
    render(selector, options);

    // 执行回调
    dcharts.callback(selector, options, render, callback);

};

/*
* 创建面积图 - area chart
* @param: {Object} options
* 参数配置（带★为必选）
* ★ data: <array> example: [1, 4, 12] or [{'key': 'a', 'value': 1}, {'key': 'b', 'value': 2}]
* margin: <json> example: {top: 20, right: 20, bottom: 20, left: 20}
* ticks: <number> example: 5
* showLineX: <boolean> example: false
* showLineY: <boolean> example: true
* formatX: <string> example: '%'
* formatY: <string> example: '%'
* axisTextX: <string> example: 'x轴'
* axisTextY: <string> example: 'y轴'
* interpolate: <string> example: 'linear','cardinal','step'
* tension: <number> example: 0~1之间
* color: <array> example: ['yellow', 'red', 'orange', 'blue', 'green']
*/

dcharts.areaChart = function(selector, options, callback) {

    function render(selector, options) {
        // 处理数据
        var ops = dcharts.group.options(selector, options);

        // 生成svg
        dcharts.group.renderSvg(ops);

        // 生成坐标轴
        dcharts.group.renderAxes(ops, 'x-bottom');
        dcharts.group.renderAxes(ops, 'y-left');

        // dcharts.group.renderAxes(ops, 'x-top');
        // dcharts.group.renderAxes(ops, 'y-right');

        // 生成 g.body
        dcharts.group.renderBody(ops);

        // 生成线
        dcharts.group.renderLine(ops);

        // 生成块
        dcharts.group.renderArea(ops);

        // 生成点
        dcharts.group.renderDots(ops);
    }

    // 渲染图表
    render(selector, options);

    // 执行回调
    dcharts.callback(selector, options, render, callback);

};

/*
* 创建饼图 - pie chart
* @param: selector, options
* options参数配置（带★为必选）
* ★ data: <array> example: [{'key': 'a', 'value': 1}, {'key': 'b', 'value': 2}]
* margin: <json> example: {top: 20, right: 20, bottom: 20, left: 20}
* title: <string>
* padAngle: <number> example: 0.01
* width: <number> example: 200
* height: <number> example: 200
* outerRadius: <number> example: 200
* innerRadius: <number> example: 100
* color: <array> example: ['yellow', 'red', 'orange', 'blue', 'green']
*
*/

dcharts.pieChart = function(selector, options, callback) {

    function render(selector, options) {
        // 处理数据
        var ops = dcharts.group.options(selector, options);

        // 生成svg
        dcharts.group.renderSvg(ops);

        // 生成 g.body
        dcharts.group.renderBody(ops);

        // 生成饼图
        dcharts.group.renderPie(ops);
    }

    // 渲染图表
    render(selector, options);

    // 执行回调
    dcharts.callback(selector, options, render, callback);

};

// 生成饼图
dcharts.group.renderPie = function(ops) {
    if (ops._pieG) return;
    var pie = d3.layout.pie()
            .sort(function (d) {
                return d[0];
            })
            .value(function (d) {
                return d[1];
            });

    var arc = d3.svg.arc()
            .outerRadius(ops.getOuterRadius())
            .innerRadius(ops.getInnerRadius())
            .padAngle(ops.getPadAngle());

    ops._pieG = ops._bodyG.append("g")
            .attr("class", "pie")
            .attr("transform", "translate("
                + ops.getOuterRadius()
                + ","
                + ops.getOuterRadius() + ")");

    dcharts.group._renderSlices(pie, arc, ops);
    dcharts.group._renderLabels(pie, arc, ops);
    showTitle();

    // 在圆心显示标题
    function showTitle() {
        ops._svg.append("text")
        .attr("dx", ops.getWidth()/2 - ops.getMargin().left)
        .attr("dy", ops.getWidth()/2 - ops.getMargin().top)
        .style("text-anchor", "middle")
        .text(function(d) { return ops.getTitle(); });
    }

};

dcharts.group._renderSlices = function(pie, arc, ops) {
    var data = ops.getData()[0];
    var slices = ops._pieG.selectAll("path.arc")
            .data(pie(data));
    var _color = ops.getColor();
    var selector = ops.getSelector();

    slices.enter()
            .append("path")
            .attr("class", "arc")
            .attr("fill", function (d, i) {
              if(typeof _color != 'undefined' && _color.length != 0)
              {
                return _color[i%_color.length];
              }else{
                return dcharts.default._COLOR(i);
              }
            });

    slices.transition()
            .attrTween("d", function (d) {
                var currentArc = this.__current__;

                if (!currentArc)
                    currentArc = {startAngle: 0,
                                    endAngle: 0};

                var interpolate = d3.interpolate(
                                    currentArc, d);

                this.__current__ = interpolate(1);

                return function (t) {
                    return arc(interpolate(t));
                };
            });

    dcharts.tooltip.mountTooltip(ops, slices);
};

dcharts.group._renderLabels = function(pie, arc, ops) {
    var data = ops.getData()[0];
    var labels = ops._pieG.selectAll("text.label")
            .data(pie(data));

    labels.enter()
            .append("text")
            .attr("class", "label");

    labels.transition()
            .attr("transform", function (d) {
                return "translate("
                    + arc.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.data[0];
            });
}

/*
* 创建堆叠柱状图 - stack bar chart
* @param: {Object} options
* 参数配置（带★为必选）
* ★ scale: <string> example: 'ordinal'
* ★ data: <array> example: [1, 4, 12] or [{'key': 'a', 'value': 1}, {'key': 'b', 'value': 2}]
* margin: <json> example: {top: 20, right: 20, bottom: 20, left: 20}
* ticks: <number> example: 5
* showLineX: <boolean> example: false
* showLineY: <boolean> example: true
* formatX: <string> example: '%'
* formatY: <string> example: '%'
* axisTextX: <string> example: 'x轴'
* axisTextY: <string> example: 'y轴'
* color: <array> example: ['yellow', 'red', 'orange', 'blue', 'green']
*/

dcharts.stackChart = function(selector, options, callback) {

    function render(selector, options) {
        // 处理数据
        var ops = dcharts.group.options(selector, options);
        // 生成svg
        dcharts.group.renderSvg(ops);
        // 生成坐标轴
        dcharts.group.renderAxes(ops, 'x-bottom');
        dcharts.group.renderAxes(ops, 'y-left');

        // dcharts.group.renderAxes(ops, 'x-top');
        // dcharts.group.renderAxes(ops, 'y-right');

        // 生成 g.body
        dcharts.group.renderBody(ops);
        // body-clip
        dcharts.group.defineBodyClip(ops);
        // 生成堆叠柱状图
        dcharts.group.renderStackBar(ops);
    }

    render(selector, options);
    dcharts.callback(selector, options, render, callback);

};

dcharts.group.renderStackBar = function(ops) {
    var _data = ops.getOriginalData();
    _data = handleData(_data);
    var _stack = d3.layout.stack()(_data);
    var _x = d3.scale.ordinal()
        .domain(_data[0].map(function(d) {
            return d.x;
        }))
        .rangeRoundBands([0, ops.quadrantWidth()], 1, 0.6);
        // .rangePoints([0, ops.quadrantWidth()], 1);
    var _y = d3.scale.linear()
        .range([0, ops.quadrantHeight()])
        .domain([0, d3.max(_stack[_stack.length - 1], function(d) { return d.y0 + d.y; })]);
    var _color = ops.getColor();
    var padding = Math.floor(ops.quadrantWidth() / ops.getData()[0].length)*0.4;
    var _w = Math.floor(ops.quadrantWidth() / _data[0].length) - padding;

    var _stackG = ops._bodyG.selectAll('g')
        .data(_stack)
        .enter()
        .append('g')
        .attr('class', 'stack-group')
        .style('fill', function(d, i) {
            return _color[i];
        });

    var _rects = _stackG.selectAll('rect')
        .data(function(d) {return d;})
        .enter()
        .append('rect');

    function handleData(data) {
        if(data[0] && data[0] instanceof Array) {
            return data;
        }else if(data[0] && data[0] instanceof Object) {
            var _a = [];
            for(var i=0; i<data.length; i++) {
                _a.push(data[i].children);
            }
            return _a;
        }else {
            return [[]];
        }
    }

    _rects.attr("x", function(d) {return _x(d.x) - (_w)/2; })
    .attr("y", ops.quadrantHeight())
    .transition()
    .delay(function(d, i) {
        return i*100;
    })
    .attr("y", function(d) {return ops.quadrantHeight() - _y(d.y0) - _y(d.y); })
    .attr("height", function(d) {return _y(d.y); })
    .attr("width", function() {
        return _w;
    });

    dcharts.tooltip.mountTooltip(ops, _rects);
};

/*
* 创建线图 - line chart
* @param: {Object} options
* 参数配置（带★为必选）
* ★ scale: <string> example: 'linear' or 'time'
* ★ data: <array> example: [1, 4, 12] or [{'key': 'a', 'value': 1}, {'key': 'b', 'value': 2}]
* margin: <json> example: {top: 20, right: 20, bottom: 20, left: 20}
* ticks: <number> example: 5
* showLineX: <boolean> example: false
* showLineY: <boolean> example: true
* formatX: <string> example: '%'
* formatY: <string> example: '%'
* axisTextX: <string> example: 'x轴'
* axisTextY: <string> example: 'y轴'
* interpolate: <string> example: 'linear','cardinal','step'
* tension: <number> example: 0~1之间
* color: <array> example: ['yellow', 'red', 'orange', 'blue', 'green']
*/

dcharts.bubbleChart = function(selector, options, callback) {

    function render(selector, options) {
        // 处理数据
        var ops = dcharts.group.options(selector, options);
        // 生成svg
        dcharts.group.renderSvg(ops);
        // 生成坐标轴
        dcharts.group.renderAxes(ops, 'x-bottom');
        dcharts.group.renderAxes(ops, 'y-left');
        // 生成 g.body
        dcharts.group.renderBody(ops);

        dcharts.group.defineBodyClip(ops);
        // 生成气泡图
        dcharts.group.renderBubble(ops);
    }

    // 渲染图表
    render(selector, options);

    // 执行回调
    dcharts.callback(selector, options, render, callback);

};

// 生成气泡图
dcharts.group.renderBubble = function(ops) {
    var _data = ops.getData();
    var _rMax = ops.getRMax(_data[0]);
    var _rMin = ops.getRMin(_data[0]);
    var _r = d3.scale.pow().exponent(1).domain([_rMin, _rMax]).range([0, 50]); // <-B
    var _x = ops.getX();
    var _y = ops.getY();
    var _color = ops.getColor();

    if(ops._bubble) return;
    _data.forEach(function (list, i) {
        ops._bubble = ops._bodyG.selectAll("circle._" + i)
                .data(list)
                .enter()
                .append("circle")
                .attr("class", "bubble _" + i);
        dcharts.tooltip.mountTooltip(ops, ops._bubble);

        ops._bodyG.selectAll("circle._" + i)
                .data(list)
                .style("stroke", function (d, j) {
                    return _color[j%_color.length];
                })
                .style("fill", function (d, j) {
                    return _color[j%_color.length];
                })
                .transition()
                .attr("cx", function (d) {
                    return _x(d[0]);
                })
                .attr("cy", function (d) {
                    return _y(d[1]);
                })
                .attr("r", function (d) {
                    if(d[2]) {
                        return _r(d[2]);
                    }else {
                        return 5;
                    }
                });
    });
};


dcharts.indexCard = function(selector, options, callback) {
    var selector = document.querySelector(selector);
    var ops = options;
    var arr = (function() {
        var _a = [];
        for(var i in ops)
        {
            _a.push(ops[i]);
        }
        return _a;
    })();
    var oFragment = document.createDocumentFragment();
    var dcharts = document.createElement("div");
    var card = document.createElement("div");

    dcharts.setAttribute("class", "dcharts-container");
    card.setAttribute("class", "card");

    for(var i=0; i<arr.length; i++)
    {
        var op = document.createElement("p");
        op.innerHTML = arr[i];
        //先附加在文档碎片中
        oFragment.appendChild(op);
    }
    card.appendChild(oFragment);
    dcharts.appendChild(card);
    selector.appendChild(dcharts);
};

// dcharts.group.renderIndexCard = function(ops) {
//     var data =
// };

/*
* 创建漏斗图 - funnel chart
* @param: {Object} options
* 参数配置（带★为必选）
* ★ data: <array> example: [['a', 10], ['b', 20]]
* width: <number> example: 400
* height: <number> example: 400
* bottomPct: <number> example: 1/4
* showText: <boolean> example: false
*/
dcharts.funnelChart = function(selector, options, callback) {

    // 渲染图表
    render(selector, options);
    // 执行回调
    dcharts.callback(selector, options, render, callback);

    function render(selector, options) {
        var ops = dcharts.group.options(selector, options);
        var data = ops.getData()[0];
        var chart = new FunnelChart({
                        ops: ops,
        				data: data,
        				width: ops.getWidth(),
        				height: ops.getHeight(),
        				bottomPct: ops.getBottomPct(),
                        color: ops.getColor()
        			});

        chart.draw(selector, ops, handlePath);

        function handlePath() {
            var _path = d3.select(selector).selectAll('.trapezoid-path');
            dcharts.tooltip.mountTooltip(ops, _path);
            dcharts.legend.init(ops);
            _path.on('mouseenter.handlePath', function() {
                d3.select(this).transition().style('opacity', '0.8');
            })
            .on('mouseleave.handlePath', function() {
                d3.select(this).transition().style('opacity', '1');
            });
        }
    }
};

(function(){
  var DEFAULT_HEIGHT = 400,
      DEFAULT_WIDTH = 600,
      DEFAULT_MARGIN = {left: 30, top: 30, right: 160, bottom: 30},
      DEFAULT_BOTTOM_PERCENT = 1/3;

  window.FunnelChart = function(options) {
    this.ops = options.ops;
    this.data = options.data;
    this.color = options.color;
    this.margin = options.margin || DEFAULT_MARGIN;
    this.totalEngagement = 0;
    for(var i = 0; i < this.data.length; i++){
      this.totalEngagement += this.data[i][1];
    }
    this.width = this.ops.quadrantWidth();
    this.height = this.ops.quadrantHeight();
    var bottomPct = this.ops.getBottomPct();
    this._slope = 2*this.height/(this.width - bottomPct*this.width);
    this._totalArea = (this.width+bottomPct*this.width)*this.height/2;
  };

  window.FunnelChart.prototype._getLabel = function(ind){
    /* Get label of a category at index 'ind' in this.data */
    return this.data[ind][0];
  };

  window.FunnelChart.prototype._getEngagementCount = function(ind){
    /* Get engagement value of a category at index 'ind' in this.data */
    return this.data[ind][1];
  };

  window.FunnelChart.prototype._createPaths = function(){
    /* Returns an array of points that can be passed into d3.svg.line to create a path for the funnel */
    trapezoids = [];

    function findNextPoints(chart, prevLeftX, prevRightX, prevHeight, dataInd){
      // reached end of funnel
      if(dataInd >= chart.data.length) return;

      // math to calculate coordinates of the next base
      area = chart.data[dataInd][1]*chart._totalArea/chart.totalEngagement;
      prevBaseLength = prevRightX - prevLeftX;
      nextBaseLength = Math.sqrt((chart._slope * prevBaseLength * prevBaseLength - 4 * area)/chart._slope);
      nextLeftX = (prevBaseLength - nextBaseLength)/2 + prevLeftX;
      nextRightX = prevRightX - (prevBaseLength-nextBaseLength)/2;
      nextHeight = chart._slope * (prevBaseLength-nextBaseLength)/2 + prevHeight;

      points = [[nextRightX, nextHeight]];
      points.push([prevRightX, prevHeight]);
      points.push([prevLeftX, prevHeight]);
      points.push([nextLeftX, nextHeight]);
      points.push([nextRightX, nextHeight]);
      trapezoids.push(points);

      findNextPoints(chart, nextLeftX, nextRightX, nextHeight, dataInd+1);
    }

    findNextPoints(this, 0, this.width, 0, 0);
    return trapezoids;
  };

  window.FunnelChart.prototype.draw = function(elem, ops, callback){
    var DEFAULT_SPEED = 6;
    var speed = DEFAULT_SPEED;

    var selector = d3.select(elem);
    var funnelSvg = selector.html('')
              .append('div')
              .attr('class', 'dcharts-container')
              .append('svg:svg')
              .attr('width', ops.getWidth())
              .attr('height', ops.getHeight());
    var bodyG = funnelSvg.append('svg:g')
                .attr('class', 'body')
                .attr('transform', 'translate('
                + ops.xStart()+','
                + ops.yEnd()+')');

    // Creates the correct d3 line for the funnel
    var funnelPath = d3.svg.line()
                    .x(function(d) { return d[0]; })
                    .y(function(d) { return d[1]; });

    // Automatically generates colors for each trapezoid in funnel
    var colorScale = this.color;
    var paths = this._createPaths();
    var _dchartCont = selector.select('.dcharts-container');
    dcharts.tooltip.initTooltip(_dchartCont);

    function drawTrapezoids(funnel, i){
      var trapezoid = bodyG
                      .append('svg:path')
                      .attr('class', 'trapezoid-path')
                      .attr('d', function(d){
                        return funnelPath(
                            [paths[i][0], paths[i][1], paths[i][2],
                            paths[i][2], paths[i][1], paths[i][2]]);
                      })
                      .attr('fill', '#fff');

      nextHeight = paths[i][[paths[i].length]-1];

      var totalLength = trapezoid.node().getTotalLength();

      var transition = trapezoid
                      .transition()
                        .duration(totalLength/speed)
                        .ease("linear")
                        .attr("d", function(d){return funnelPath(paths[i]);})
                        .attr("fill", function(d){return colorScale[i%colorScale.length];});

      if(ops.showText()) showText();
      function showText() {
          funnelSvg.append('svg:text')
          .text(funnel._getLabel(i) + ': ' + funnel._getEngagementCount(i))
          .attr("x", function(d){ return ops.quadrantWidth()/2 + ops.xStart(); })
          .attr("y", function(d){
            return (paths[i][0][1] + paths[i][1][1])/2 + ops.getMargin().top;}) // Average height of bases
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#fff");
      }


      if(i < paths.length - 1){
        transition.each('end', function(){
          drawTrapezoids(funnel, i+1);
        });
      }
      callback();
    }

    drawTrapezoids(this, 0);
  };
})();


dcharts.legend = {};

dcharts.legend.init = function(ops) {
    if(ops._legend) return;
    var selector = document.querySelector(ops.getOriginalSelector());
    var dchartCont = selector.querySelector('.dcharts-container');
    ops._legend = document.createElement('div');
    ops._legend.setAttribute('class', 'legend');
    dchartCont.appendChild(ops._legend);
    dcharts.legend.create(ops);
};

dcharts.legend.create = function(ops) {
    var _data = ops.getData();
    if(_data[0][0][2]) {
        _data = (function() {
            var _a = [];
            for(var i=0; i<_data.length; i++) {
                _a.push(_data[i][0][2]);
            }
            return _a;
        })();

    }else {
        _data = ops.getData()[0];
    }
    var _html = '';
    var _rect = null;
    var _color = ops.getColor();
    var _key = _data[0][0];

    if(!isNaN(Number(_key))) return;

    for(var i=0; i<_data.length; i++) {
        var _name = (_data[i] instanceof Object) ? _data[i][0] : _data[i];
        _html += '<div class="legend-r legend-rect-'+i+'"><em></em><span title="'+_name+'">'+_name+'</span></div>';
    }
    ops._legend.innerHTML = _html;

    _rect =ops._legend.querySelectorAll('.legend-r');

    for(var i=0, len=_rect.length; i<len; i++)
    {
        var em = _rect[i].querySelector('em');
        em.style.backgroundColor = _color[i%_color.length];
    }
};

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


dcharts.tooltip = {timer: null};

dcharts.tooltip.initTooltip = function(_selector) {
  var _tooltip;
  var _selector = _selector;

  if(!_tooltip)
  {
    _tooltip = _selector.append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0.0);
  }
};

dcharts.tooltip.mountTooltip = function(ops, dom) {
    dom.on('mouseenter.tooltip', function(d, i) {
        var _d = d || ops.getData()[0][i];
        dcharts.tooltip.showTooltip(_d, ops.getSelector());
    })
    .on('mousemove.tooltip', function() {
      var arr = d3.mouse(ops.getBox()[0][0]);
      var x = arr[0];
      var y = arr[1];
      dcharts.tooltip.moveTooltip(ops.getSelector(), x, y);
    })
    .on('mouseleave.tooltip', function() {
        dcharts.tooltip.hideTooltip(ops.getSelector());
    });
};

dcharts.tooltip.showTooltip = function(d, _selector) {
    var _result = (function() {
        if(d instanceof Array){
            return (typeof d[0] == 'string') ? (d[0] + ':' + d[1]) : d[1];
        }else if(d instanceof Object) {
            return (d.x !== 'undefined') ? (d.x + ':' + d.y) : (d.data[0] + ':' + d.data[1]);
        }else{
            return d;
        }
    })();
    var _otherTooltip = d3.select('body').selectAll('div.tooltip');
    _otherTooltip.transition().style('opacity', 0);

    clearTimeout(dcharts.tooltip.timer);
    _selector.select('div.tooltip')
      .style('opacity', 1)
      .html(_result);
};

dcharts.tooltip.moveTooltip = function(_selector, x, y) {
    var _tooltip = _selector.select('div.tooltip');
    var main_width = parseFloat(_selector.style('width'));
    var main_height = parseFloat(_selector.style('height'));
    var self_width = parseFloat(_tooltip.style('width')) + 30;
    var self_height = parseFloat(_tooltip.style('height')) + 30;
    var x = (x >= main_width/2) ? x - self_width - 20 : x + 20;
    var y = (y >= main_height/2) ? y - self_height : y;

    clearTimeout(dcharts.tooltip.timer);

    _tooltip.transition()
          .ease('linear')
          .style('left', x + 'px')
          .style('top', y + 10 + 'px');
};

dcharts.tooltip.hideTooltip = function(_selector) {
    clearTimeout(dcharts.tooltip.timer);
    dcharts.tooltip.timer = setTimeout(function() {
        dcharts.tooltip._hide(_selector);
    }, 800);
};

dcharts.tooltip._hide = function(_selector) {
    _selector.select('div.tooltip')
       .transition()
       .style('opacity', 0);
};


dcharts.flicker = {
  timer: null,
  flickerBegin: function(dom) {
    var _dom = dom, that = this;
    clearInterval(this.timer);
    this.timer = setInterval(function() {
      that._flicke(_dom);
    }, 1000);
  },
  flickerOver: function(dom) {
    clearInterval(this.timer);
    d3.select(dom).transition()
      .duration(600)
      .style({
        'fill-opacity': 1,
        'r': 4.5
      })
  },
  _flicke: function(dom) {
    d3.select(dom).transition()
      .ease("linear")
      .duration(600)
      .style({
        'fill-opacity': 0,
        'r': 80
      })
      .transition()
      .duration(20)
      .style({
        'fill-opacity': 1,
        'r': 4.5
      });
  }
};

        dcharts.d3 = d3;
        dcharts.crossfilter = crossfilter;
        return dcharts;
    }

    if(typeof define === "function" && define.amd) {
        define(["d3", "crossfilter"], _dcharts);
    } else if(typeof module === "object" && module.exports) {
        var _d3 = require('d3');
        var _crossfilter = require('crossfilter2');
        // When using npm + browserify, 'crossfilter' is a function,
        // since package.json specifies index.js as main function, and it
        // does special handling. When using bower + browserify,
        // there's no main in bower.json (in fact, there's no bower.json),
        // so we need to fix it.
        if (typeof _crossfilter !== "function") {
            _crossfilter = _crossfilter.crossfilter;
        }
        module.exports = _dcharts(_d3, _crossfilter);
    } else {
        this.dcharts = _dcharts(d3, crossfilter);
    }

})();

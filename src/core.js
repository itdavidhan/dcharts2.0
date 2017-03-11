
var dcharts = {
    version: '2.0.1'
};

dcharts.default = {};
dcharts.default._MARGIN = {top: 30, left: 30, right: 30, bottom: 30};
dcharts.default._COLOR = d3.scale.category10();

// 图表组合
dcharts.group = {};

// 处理数据
dcharts.group.options = function(selector, options) {
    var ops = {
        getSelector: function() {
            return d3.select(selector);
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
            return options.width || this.getSelWdith();
        },
        getHeight: function() {
            return options.height || this.getSelHeight();
        },
        getScale: function() {
            return options.scale;
        },
        getData: function() {
            var data = [];
            options.data.map(function(a) {
              _a = dcharts.utils.dfc.json2arr(a);
              data.push(_a);
            });
            return data;
        },
        getValMax: function() {
            var _max = -10000;
            d3.map(this.getData(), function(d) {
              var dMax = dcharts.filter.maxInArrs(d)[1];
              if(dMax > _max) _max = dMax;
            });
            return _max;
        },
        getValMin: function() {
            var _min = 10000;
            d3.map(this.getData(), function(d) {
              var dMin = dcharts.filter.minInArrs(d)[1];
              if(dMin < _min) _min = dMin;
            });
            return _min;
        },
        getKeyMax: function() {
            var _max = -10000;
            d3.map(this.getData(), function(d) {
              var dMax = dcharts.filter.maxInArrs(d)[0];
              if(dMax > _max) _max = dMax;
            });
            return _max;
        },
        getKeyMin: function() {
            var _min = 1000000000;
            d3.map(this.getData(), function(d) {
              var dMin = dcharts.filter.minInArrs(d)[0];
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
                .domain([0, this.getKeyMax()])
                // .domain([this.getKeyMin(), this.getKeyMax()])
                .range([0, ops.quadrantWidth()]);
            }else if(this.getScale() == 'time') {
                return d3.time.scale()
                .domain([new Date(2000, 0, 1).getTime(), new Date(2022, 0, 1).getTime()])
                .range([0, ops.quadrantWidth()]);
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
            return options.interpolate || 'cardinal';
        },
        getTension: function() {
            return options.tension || 0.7;
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
        getColor: function() {
            return options.color;
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
        _svg: null,
        _bodyG: null,
        _line: null
    };
    return ops;
};

// 生成svg
dcharts.group.renderSvg = function(ops) {
    if(!ops._svg)
    {
        ops._svg = ops.getSelector().append("svg");
        ops._svg.attr("height", ops.getHeight())
            .attr("width", ops.getWidth());
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
        var xAxis = d3.svg.axis()
                .scale(ops.getX())
                .orient("bottom");
        ops._svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", function(){
                return "translate(" + ops.xStart() + "," + ops.yStart() + ")";
            })
            .call(xAxis);
    }

    function createXT() {
        var xAxis = d3.svg.axis()
                .scale(ops.getX())
                .orient("top");
        ops._svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", function(){
                return "translate(" + ops.xStart() + "," + ops.yEnd() + ")";
            })
            .call(xAxis);
    }

    function createYL() {
        var yAxis = d3.svg.axis()
                .scale(ops.getY())
                .orient("left");
        ops._svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", function(){
                return "translate(" + ops.xStart() + "," + ops.yEnd() + ")";
            })
            .call(yAxis);
    }

    function createYR() {
        var yAxis = d3.svg.axis()
                .scale(ops.getY())
                .orient("right");
        ops._svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", function(){
                return "translate(" + ops.xEnd() + "," + ops.yEnd() + ")";
            })
            .call(yAxis);
    }
};

// 生成线
dcharts.group.renderLine = function(ops) {
    var _x = ops.getX();
    var _y = ops.getY();
    var _color = ops.getColor();
    var _data = ops.getData();

    _line = d3.svg.line()
            .x(function (d) { return _x(d[0]); })
            .y(function (d) { return _y(d[1]); });

    ops._bodyG.selectAll("path.line")
            .data(_data)
            .enter()
            .append("path")
            .style("stroke", function (d, i) {
              if(typeof _color != 'undefined' && _color.length > 0)
              {
                return _color[i];
              }else{
                return dcharts.default._COLOR(i);
              }
            })
            .attr("class", "line");

    ops._bodyG.selectAll("path.line")
            .data(_data)
            .transition()
            .attr("d", function (d) { return _line(d); });
};

// 生成块
dcharts.group.renderArea = function(ops) {
    var _x = ops.getX();
    var _y = ops.getY();
    var _color = ops.getColor();
    var data = ops.getData();

    var area = d3.svg.area()
        .x(function(d) { return _x(d[0]); })
        .y0(_y(0))
        .y1(function(d) { return _y(d[1]); });

    ops._bodyG.selectAll("path.area")
            .data(data)
            .enter()
            .append("path")
            .style("fill", function (d, i) {
                if(typeof _color != 'undefined' && _color.length > 0)
                {
                  return _color[i];
                }else{
                  return dcharts.default._COLOR(i);
                }
            })
            .attr("class", "area")
            .attr("d", function(d){return area(d);});
};

// 生成圆点
dcharts.group.renderDots = function(ops) {
    var _x = ops.getX();
    var _y = ops.getY();
    var data = ops.getData();

    data.forEach(function (list, i) {
       ops._bodyG.selectAll("circle._" + i)
               .data(list)
               .enter()
               .append("circle")
               .attr("class", "dot _" + i);

       ops._bodyG.selectAll("circle._" + i)
               .data(list)
               .style("stroke", function (d) {
                   return dcharts.default._COLOR(i);
               })
               .transition()
               .attr("cx", function (d) { return _x(d[0]); })
               .attr("cy", function (d) { return _y(d[1]); })
               .attr("r", 4.5);
    });
};

// 生成条/柱
dcharts.group.renderBar = function(ops) {
    var _x = ops.getX();
    var _y = ops.getY();
    var _color = ops.getColor();
    var data = ops.getData();

    var padding = Math.floor(ops.quadrantWidth() / data.length)*0.2;
    var bar = ops._bodyG.selectAll("rect.bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar");

    ops._bodyG.selectAll("rect.bar")
            .data(data)
            .transition()
            .style("fill", function(d, i) {
              if(typeof _color !== 'undefined' && _color.length > 0)
              {
                return _color[i];
              }else{
                return dcharts.default._COLOR(i);
              }
            })
            .attr("x", function (d, i) {
                var _resultX = d instanceof Array ? d[0] : i+1;
                return ops.getX()(_resultX) - (Math.floor(ops.quadrantWidth() / data.length) - padding)/2;
            })
            .attr("y", function (d) {
                var _resultY = d instanceof Array ? d[1] : d;
                return ops.getY()(_resultY);
            })
            .attr("height", function (d) {
                var _result = d instanceof Array ? d[1] : d;
                return ops.yStart() - ops.getY(_result);
            })
            .attr("width", function(d){
                return Math.floor(ops.quadrantWidth() / data.length) - padding;
            });
};

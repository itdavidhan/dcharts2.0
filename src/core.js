
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
    // var _selector = d3.select(selector);
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
                // return d3.scale.linear().domain([0, 10]);
                return d3.scale.linear().domain([this.getKeyMin(), this.getKeyMax()]);
            }else if(this.getScale() == 'time') {
                return d3.time.scale().domain([new Date(2000, 0, 1).getTime(), new Date(2022, 0, 1).getTime()]);
            }
        },
        getY: function() {
            return d3.scale.linear().domain([this.getValMin(), this.getValMax()]);
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
    console.log(ops);
    return ops;
};

// 生成svg
dcharts.group.renderSvg = function(ops) {
    ops._svg = ops.getSelector().append("svg");
    ops._svg.attr("height", ops.getHeight())
        .attr("width", ops.getWidth());
};

// 生成 g.body
dcharts.group.renderBody = function(ops) {
    if (!ops._bodyG)
        ops._bodyG = ops._svg.append("g")
                .attr("class", "body")
                .attr("transform", "translate("
                    + ops.xStart() + ","
                    + ops.yEnd() + ")")
                .attr("clip-path", "url(#body-clip)");
},

// 生成坐标轴
dcharts.group.renderAxes = function(ops) {
    var xAxis = d3.svg.axis()
            .scale(ops.getX().range([0, ops.quadrantWidth()]))
            .orient("bottom");

    var yAxis = d3.svg.axis()
            .scale(ops.getY().range([ops.quadrantHeight(), 0]))
            .orient("left");

    ops._svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", function(){
            return "translate(" + ops.xStart() + "," + ops.yStart() + ")";
        })
        .call(xAxis);

    ops._svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", function(){
            return "translate(" + ops.xStart() + "," + ops.yEnd() + ")";
        })
        .call(yAxis);
};

// 生成线
dcharts.group.renderLine = function(ops) {
    var _x = ops.getX();
    var _y = ops.getY();

    var _line = d3.svg.line()
            .x(function(d){ return _x(d[0]); })
            .y(function(d){ return _y(d[1]); });

    var data = ops.getData();

    ops._bodyG.selectAll("path.line")
            .data(data)
            .enter()
            .append("path")
            .style("stroke", function (d, i) {
              if(typeof ops.getColor() != 'undefined' && ops.getColor().length > 0)
              {
                return ops.getColor()[i];
              }else{
                return dcharts.default._COLOR(i);
              }
            })
            .attr("class", "line");

    ops._bodyG.selectAll("path.line")
            .data(data)
            .transition()
            .attr("d", function (d) { return _line(d); });
};

// 生成块
dcharts.group.renderArea = function() {
    var area = d3.svg.area()
        .x(function(d) { return x(d[0]); })
        .y0(y(0))
        .y1(function(d) { return y(d[1]); });

    svg.selectAll("path.area")
            .data([data])
        .enter()
            .append("path")
            .attr("class", "area")
            .attr("d", function(d){return area(d);});
};

// 生成圆点
dcharts.group.renderDots = function(svg) {
    svg.append("g").selectAll("circle")
       .data(data)
     .enter().append("circle")
       .attr("class", "dot")
       .attr("cx", function(d) { return x(d.x); })
       .attr("cy", function(d) { return y(d.y); })
       .attr("r", 4.5);
};

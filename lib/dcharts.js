(function() {
    function _dcharts(d3, crossfilter) {


var dcharts = {
    version: '2.0.1'
};

dcharts.default = {};
dcharts.default._MARGIN = {top: 30, left: 30, right: 30, bottom: 30};
dcharts.default._COLOR = d3.scale.category10();


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
    var _keyMax = 0;
    var _valMax = 0;
    arr.map(function(a) {
        _keyArr.push(a[0]);
        _valArr.push(a[1]);
    });
    _keyMax = d3.max(_keyArr, function(a) {
        return +a;
    });
    _valMax = d3.max(_valArr, function(a) {
        return +a;
    });
    return [_keyMax, _valMax];
};

dcharts.filter.minInArrs = function(arr) {
    // [[0, 2], [1, 6]] ==> [0, 2]
    var _keyArr = [];
    var _valArr = [];
    var _keyMin = 0;
    var _valMin = 0;
    arr.map(function(a) {
        _keyArr.push(a[0]);
        _valArr.push(a[1]);
    });
    _keyMin = d3.min(_keyArr, function(a) {
        return +a;
    });
    _valMin = d3.min(_valArr, function(a) {
        return +a;
    });
    return [_keyMin, _valMin];
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
* showAxisX: <boolean> example: true
* showAxisY: <boolean> example: true
* axisTextX: <string> example: 'x轴'
* axisTextY: <string> example: 'y轴'
* color: <array> example: ['yellow', 'red', 'orange', 'blue', 'green']
*
*/

dcharts.barChart = function(selector, options) {
    var _selector = d3.select(selector);
    var _selWdith = parseFloat(_selector.style('width'));
    var _selHeight = parseFloat(_selector.style('height'));
    var _width = options.width || _selWdith;
    var _height = options.height || _selHeight;
    var _scale = options.scale;
    var _data = (function() {
        if(_scale == 'linear') {
            return options.data;
        }else{
            return dcharts.utils.dfc.json2arr(options.data);
        }
    })();
    var _valMax = (function() {
        if(_scale == 'linear')
        {
            return d3.max(options.data);
        }
        else if(_scale == 'ordinal')
        {
            return dcharts.filter.maxInArrs(_data)[1];
        }
    })();
    var _margins = options.margin || dcharts.default._MARGIN;
    var _x = (function() {
        if(_scale == 'linear')
        {
            return d3.scale.linear().domain([0, _data.length+1]).range([0, quadrantWidth()]);
        }
        else if(_scale == 'ordinal') {
            return d3.scale.ordinal().domain(_data.map(function(d) {
                return d[0];
            })).rangePoints([0, _width - _margins.left - _margins.right], 1);
        }
    })();
    var _y = d3.scale.linear().domain([0, _valMax]).range([quadrantHeight(), 0]);
    var _colors = options.color;
    var _ticks = options.ticks || 5;
    var _showLineX = options.showLineX || false;
    var _showLineY = options.showLineY || false;
    var _showText = options.showText || false;
    var _formatX = options.formatX || false;
    var _formatY = options.formatY || false;
    var _showAxisX = (typeof options.showAxisX != 'undefined') ? options.showAxisX : true;
    var _showAxisY = (typeof options.showAxisY != 'undefined') ? options.showAxisY : true;
    var _axisTextX = options.axisTextX || '';
    var _axisTextY = options.axisTextY || '';
    var _svg;
    var _bodyG;

    _selector.html('');

    _selector.on('mouseleave', function() {
        dcharts.tooltip.hideTooltip(_selector);
    });

    dcharts.tooltip.initTooltip(_selector);

    render();
    function render() {
        if (!_svg) {
            _svg = _selector.append("svg")
                    .attr("height", _height)
                    .attr("width", _width);
            renderAxes(_svg);
            defineBodyClip(_svg);
        }
        renderBody(_svg, _selector);
    };

    function renderAxes(svg) {
        var axesG = svg.append("g")
                .attr("class", "axes");

        var xAxis = d3.svg.axis()
                .scale(_x)
                .orient("bottom");

        if(_formatX)
        {
          xAxis.tickFormat(function(v) {
            return v + _formatX;
          });
        }

        var yAxis = d3.svg.axis()
                .scale(_y)
                .orient("left")
                .ticks(_ticks);

        if(_formatY)
        {
          yAxis.tickFormat(function(v) {
            return v + _formatY;
          });
        }

        // 是否显示x轴
        if(_showAxisX)
        {
            axesG.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", function () {
                        return "translate(" + xStart() + "," + yStart() + ")";
                    })
                    .call(xAxis)
                    .append("text")
                    .attr("x", (xEnd() - xStart()))
                    .attr("dy", 40)
                    .style("text-anchor", "end")
                    .text(_axisTextX);
        }
        // 是否显示y轴
        if(_showAxisY)
        {
            axesG.append("g")
                    .attr("class", "y-axis")
                    .attr("transform", function () {
                        return "translate(" + xStart() + "," + yEnd() + ")";
                    })
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", "-40px")
                    .style("text-anchor", "end")
                    .text(_axisTextY);
        }

        if(_showLineX)
        {
          axesG.selectAll('g.x-axis g.tick')
               .append('line')
               .attr('class', 'grid-line')
               .attr('x1', 0)
               .attr('y1', 0)
               .attr('x2', 0)
               .attr('y2', - (_height - 2*_margins.bottom));
        }

        if(_showLineY)
        {
          axesG.selectAll('g.y-axis g.tick')
               .append('line')
               .attr('class', 'grid-line')
               .attr('x1', 0)
               .attr('y1', 0)
               .attr('x2', quadrantWidth())
               .attr('y2', 0);
        }
    }
    function defineBodyClip(svg) {
        var padding = 5;

        svg.append("defs")
                .append("clipPath")
                .attr("id", "body-clip")
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", quadrantWidth() + 2 * padding)
                .attr("height", quadrantHeight());
    }
    function renderBody(svg, _selector) {
        if (!_bodyG)
            _bodyG = svg.append("g")
                    .attr("class", "body")
                    .attr("transform", "translate("
                            + xStart()
                            + ","
                            + yEnd() + ")")
                    .attr("clip-path", "url(#body-clip)");

        renderBars(svg, _selector);

    }
    function renderBars(svg, _selector) {
        var padding = Math.floor(quadrantWidth() / _data.length)*0.2;
        var svg = svg;
        var bar = _bodyG.selectAll("rect.bar")
                .data(_data)
                .enter()
                .append("rect")
                .attr("class", "bar");

        _bodyG.selectAll("rect.bar")
                .data(_data)
                .transition()
                .style("fill", function(d, i) {
                  if(typeof options.color !== 'undefined' && options.color.length > 0)
                  {
                    return _colors[i];
                  }else{
                    return dcharts.default._COLOR(i);
                  }
                })
                .attr("x", function (d, i) {
                    var _resultX = d instanceof Array ? d[0] : i+1;
                    return _x(_resultX) - (Math.floor(quadrantWidth() / _data.length) - padding)/2;
                })
                .attr("y", function (d) {
                    var _resultY = d instanceof Array ? d[1] : d;
                    return _y(_resultY);
                })
                .attr("height", function (d) {
                    var _result = d instanceof Array ? d[1] : d;
                    return yStart() - _y(_result);
                })
                .attr("width", function(d){
                    return Math.floor(quadrantWidth() / _data.length) - padding;
                });

        bar.on('mouseenter', function(d) {
            dcharts.tooltip.showTooltip(d, _selector);
            d3.select(this).transition().style('opacity', '0.8');
        })
        .on('mousemove', function() {
            var x = d3.event.pageX;
            var y = d3.event.pageY;
            dcharts.tooltip.moveTooltip(_selector, x, y);
        })
        .on('mouseleave', function() {
          d3.select(this).transition().style('opacity', '1');
        });

        if(_showText) showText();

        function showText() {
            _bodyG.selectAll("text.text")
                    .data(_data)
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
    function xStart() {
        return _margins.left;
    }
    function yStart() {
        return _height - _margins.bottom;
    }
    function xEnd() {
        return _width - _margins.right;
    }
    function yEnd() {
        return _margins.top;
    }
    function quadrantWidth() {
        return _width - _margins.left - _margins.right;
    }
    function quadrantHeight() {
        return _height - _margins.top - _margins.bottom;
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
* axisTextX: <string> example: 'x轴'
* axisTextY: <string> example: 'y轴'
* interpolate: <string> example: 'linear','cardinal','step'
* tension: <number> example: 0~1之间
* color: <array> example: ['yellow', 'red', 'orange', 'blue', 'green']
*/

dcharts.lineChart = function(selector, options) {
    var _selector = d3.select(selector);
    var _selWdith = parseFloat(_selector.style('width'));
    var _selHeight = parseFloat(_selector.style('height'));
    var _width = options.width || _selWdith;
    var _height = options.height || _selHeight;
    var _scale = options.scale;
    var _data = (function() {
          var data = [];
          options.data.map(function(a) {
            _a = dcharts.utils.dfc.json2arr(a);
            data.push(_a);
          });
          return data;
      })();
    var _valMax = (function() {
          var _max = -10000;
          d3.map(_data, function(d) {
            var dMax = dcharts.filter.maxInArrs(d)[1];
            if(dMax > _max) _max = dMax;
          });
          return _max;
      })();
    var _valMin = (function() {
          var _min = 10000;
          d3.map(_data, function(d) {
            var dMin = dcharts.filter.minInArrs(d)[1];
            if(dMin < _min) _min = dMin;
          });
          return _min;
      })();
    var _keyMax = (function() {
          var _max = -10000;
          d3.map(_data, function(d) {
            var dMax = dcharts.filter.maxInArrs(d)[0];
            if(dMax > _max) _max = dMax;
          });
          return _max;
      })();
    var _keyMin = (function() {
          var _min = 1000000000;
          d3.map(_data, function(d) {
            var dMin = dcharts.filter.minInArrs(d)[0];
            if(dMin < _min) _min = dMin;
          });
          return _min;
      })();
    var _dataLength = (function() {
          var _len = 0;
          d3.map(_data, function(d) {
            if(d.length > _len) _len = d.length;
          });
          return _len;
      })();
    var _margins = options.margin || dcharts.default._MARGIN;
    var _x = (function() {
        if(_scale == 'linear')
        {
            return d3.scale.linear().domain([_keyMin, _keyMax]);
        }else if(_scale == 'time') {
            return d3.time.scale().domain([new Date(2000, 0, 1).getTime(), new Date(2022, 0, 1).getTime()]);
        }
    })();
    var _y = d3.scale.linear().domain([_valMin, _valMax + 10]);
    var _ticks = options.ticks;
    var _interpolate = options.interpolate || 'cardinal';
    var _tension = options.tension || 0.7;
    var _showLineX = options.showLineX || false;
    var _showLineY = options.showLineY || false;
    var _axisTextX = options.axisTextX || '';
    var _axisTextY = options.axisTextY || '';
    var _showDot = options.showDot;
    var _color = options.color;
    var _svg;
    var _bodyG;
    var _line;

    _selector.html('');
    _selector.on('mouseleave', function(d) {
        dcharts.tooltip.hideTooltip(_selector);
    });
    dcharts.tooltip.initTooltip(_selector);

    render();
    function render() {
        if (!_svg) {
            _svg = _selector.append("svg")
                    .attr("height", _height)
                    .attr("width", _width);

            renderAxes(_svg);

            defineBodyClip(_svg);
        }

        renderBody(_svg);
    };

    function renderAxes(svg) {
        var axesG = svg.append("g")
                .attr("class", "axes");

        renderXAxis(axesG);

        renderYAxis(axesG);
    }

    function renderXAxis(axesG){
        var xAxis = d3.svg.axis()
                .scale(_x.range([0, quadrantWidth()]))
                .orient("bottom");

        axesG.append("g")
                .attr("class", "x-axis")
                .attr("transform", function () {
                    return "translate(" + xStart() + "," + yStart() + ")";
                })
                .call(xAxis)
                .append("text")
                .attr("x", (xEnd() - xStart()))
                .attr("dy", 40)
                .style("text-anchor", "end")
                .text(_axisTextX);

        if(_showLineX) showLineX();
        function showLineX() {
          axesG.selectAll("g.x-axis g.tick")
              .append("line")
                  .classed("grid-line", true)
                  .attr("x1", 0)
                  .attr("y1", 0)
                  .attr("x2", 0)
                  .attr("y2", - quadrantHeight());
        }
    }

    function renderYAxis(axesG){
        var yAxis = d3.svg.axis()
                .scale(_y.range([quadrantHeight(), 0]))
                .orient("left")
                .ticks(_ticks);

        axesG.append("g")
                .attr("class", "y-axis")
                .attr("transform", function () {
                    return "translate(" + xStart() + "," + yEnd() + ")";
                })
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "-40px")
                .style("text-anchor", "end")
                .text(_axisTextY);

         if(_showLineY) showLineY();
         function showLineY() {
           axesG.selectAll("g.y-axis g.tick")
              .append("line")
                  .classed("grid-line", true)
                  .attr("x1", 0)
                  .attr("y1", 0)
                  .attr("x2", quadrantWidth())
                  .attr("y2", 0);
         }
    }

    function defineBodyClip(svg) {
        var padding = 5;

        svg.append("defs")
                .append("clipPath")
                .attr("id", "body-clip")
                .append("rect")
                .attr("x", 0 - padding)
                .attr("y", 0)
                .attr("width", quadrantWidth() + 2 * padding)
                .attr("height", quadrantHeight());
    }

    function renderBody(svg) {
        if (!_bodyG)
            _bodyG = svg.append("g")
                    .attr("class", "body")
                    .attr("transform", "translate("
                        + xStart() + ","
                        + yEnd() + ")")
                    .attr("clip-path", "url(#body-clip)");

        renderLines();

        // 是否显示圆点
        if(_showDot) renderDots();
    }

    function renderLines() {
        _line = d3.svg.line()
                        .x(function (d) { return _x(d[0]); })
                        .y(function (d) { return _y(d[1]); });

        if(_interpolate) _line.interpolate(_interpolate);
        if(_tension) _line.tension(_tension);

        _bodyG.selectAll("path.line")
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

        _bodyG.selectAll("path.line")
                .data(_data)
                .transition()
                .attr("d", function (d) { return _line(d); });
    }

    function renderDots() {
        _data.forEach(function (list, i) {
            var dots = _bodyG.selectAll("circle._" + i)
                    .data(list)
                    .enter()
                    .append("circle")
                    .attr("class", "dot _" + i);

            _bodyG.selectAll("circle._" + i)
                    .data(list)
                    // .style('stroke', function(d) {
                    //   if(typeof _color != 'undefined' && _color.length > 0)
                    //   {
                    //     return _color[i];
                    //   }else{
                    //     return dcharts.default._COLOR(i);
                    //   }
                    // })
                    .style("fill", function (d) {
                        if(typeof _color != 'undefined' && _color.length > 0)
                        {
                          return _color[i];
                        }else{
                          return dcharts.default._COLOR(i);
                        }
                    })
                    .transition()
                    .attr("cx", function (d) { return _x(d[0]); })
                    .attr("cy", function (d) { return _y(d[1]); })
                    .attr("r", 4.5);

            dots.on('mouseenter', function(d) {
              dcharts.flicker._flicke(this);
              dcharts.flicker.flickerBegin(this);
              dcharts.tooltip.showTooltip(d, _selector);
            })
            .on('mousemove', function() {
              var x = d3.event.pageX;
              var y = d3.event.pageY;
              dcharts.tooltip.moveTooltip(_selector, x, y);
            })
            .on('mouseleave', function() {
              dcharts.flicker.flickerOver(this);
            });
        });
    }

    function xStart() {
        return _margins.left;
    }

    function yStart() {
        return _height - _margins.bottom;
    }

    function xEnd() {
        return _width - _margins.right;
    }

    function yEnd() {
        return _margins.top;
    }

    function quadrantWidth() {
        return _width - _margins.left - _margins.right;
    }

    function quadrantHeight() {
        return _height - _margins.top - _margins.bottom;
    }
};

/*
* 创建柱状图 - bar chart
* @param: selector, options
* options参数配置（带★为必选）
* ★ data: <array> example: [{'key': 'a', 'value': 1}, {'key': 'b', 'value': 2}]
* margin: <json> example: {top: 20, right: 20, bottom: 20, left: 20}
* title: <string>
* padAngle: <number> example: 0.01
* width: <number> example: 200
* height: <number> example: 200
* radius: <number> example: 200
* innerRadius: <number> example: 100
* color: <array> example: ['yellow', 'red', 'orange', 'blue', 'green']
*
*/

dcharts.pieChart = function(selector, options) {
    var _selector = d3.select(selector);
    var _selWdith = parseFloat(_selector.style('width'));
    var _selHeight = parseFloat(_selector.style('height'));
    var _width = options.width || _selWdith;
    var _height = options.height || _selHeight;
    var _data = dcharts.utils.dfc.json2arr(options.data);
    var _padAngle = options.padAngle || 0; //0.01-0.03
    var _color = options.color;
    var _title = options.title || '';
    var _svg;
    var _bodyG;
    var _pieG;
    var _radius = options.radius || _width/2;
    var _innerRadius = (typeof options.innerRadius !== 'undefined') ? options.innerRadius : _radius/2;

    _selector.html('');
    _selector.on('mouseleave', function() {
        dcharts.tooltip.hideTooltip(_selector);
    });
    dcharts.tooltip.initTooltip(_selector);

    render();
    function render() {
        if (!_svg) {
            _svg = _selector.append("svg")
                    .attr("height", _height)
                    .attr("width", _width);
        }

        // 在圆心显示标题
        _svg.append("text")
        .attr("dx", _width/2)
        .attr("dy", _width/2)
        .style("text-anchor", "middle")
        .text(function(d) { return _title; });

        renderBody(_svg);
    };

    function renderBody(svg) {
        if (!_bodyG)
            _bodyG = svg.append("g")
                    .attr("class", "body");
        renderPie();
    }

    function renderPie() {
        var pie = d3.layout.pie()
                .sort(function (d) {
                    return d[0];
                })
                .value(function (d) {
                    return d[1];
                });

        var arc = d3.svg.arc()
                .outerRadius(_radius)
                .innerRadius(_innerRadius)
                // .innerRadius(_innerRadius)
                .padAngle(_padAngle);

        if (!_pieG)
            _pieG = _bodyG.append("g")
                    .attr("class", "pie")
                    .attr("transform", "translate("
                        + _radius
                        + ","
                        + _radius + ")");

        renderSlices(pie, arc);
        renderLabels(pie, arc);
    }

    function renderSlices(pie, arc) {
        var slices = _pieG.selectAll("path.arc")
                .data(pie(_data));

        slices.enter()
                .append("path")
                .attr("class", "arc")
                .attr("fill", function (d, i) {
                  if(typeof _color != 'undefined' && _color.length != 0)
                  {
                    return _color[i];
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

        slices.on('mouseenter', function(d) {
            dcharts.tooltip.showTooltip(d, _selector);
            d3.select(this).transition().style('opacity', '0.8');
        })
        .on('mousemove', function() {
            var x = d3.event.pageX;
            var y = d3.event.pageY;
            dcharts.tooltip.moveTooltip(_selector, x, y);
        })
        .on('mouseleave', function() {
            d3.select(this).transition().style('opacity', '1');
        });
    }

    function renderLabels(pie, arc) {
        var labels = _pieG.selectAll("text.label")
                .data(pie(_data));

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
};


dcharts.tooltip = {};

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

dcharts.tooltip.showTooltip = function(d, _selector) {
    var _result = (function() {
        if(d instanceof Array){
            return d[1];
        }else if(d instanceof Object) {
            return d.data[1];
        }else{
            return d;
        }
    })();
    var _tooltip = _selector.select('div.tooltip')
                      .style('opacity', 0.8)
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

    _tooltip.transition()
          .ease('linear')
          .style('left', x + 'px')
          .style('top', y + 10 + 'px');
};

dcharts.tooltip.hideTooltip = function(_selector) {
    var _tooltip = _selector.select('div.tooltip')
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

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
    // var _x = (function() {
    //     if(_scale == 'linear')
    //     {
    //         return d3.scale.linear().domain([_keyMin, _keyMax]);
    //     }else if(_scale == 'time') {
    //         return d3.time.scale().domain([new Date(2000, 0, 1).getTime(), new Date(2022, 0, 1).getTime()]);
    //     }
    // })();
    var _x = d3.scale.linear().domain([_keyMin, _keyMax]);
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

    console.log('全局=', _x(1));
    render();
    function render() {
        if (!_svg) {
            _svg = _selector.append("svg")
                    .attr("height", _height)
                    .attr("width", _width);

                    console.log('render=', _x(1));
            renderAxes(_svg);



            // defineBodyClip(_svg);
        }


        renderBody(_svg);
    };

    function renderAxes(svg) {
        var axesG = svg.append("g")
                .attr("class", "axes");
        renderXAxis(axesG);
        console.log('创建坐标=', _x(1));

        renderYAxis(axesG);
    }

    function renderXAxis(axesG){
        var xAxis = d3.svg.axis()
                .scale(_x.range([0, quadrantWidth()]))
                .orient("bottom");

                console.log('x轴=', _x(1));
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

                    console.log('renderBody=', _x(1));

        renderLines();

        // 是否显示圆点
        if(_showDot) renderDots();
    }

    function renderLines() {
        var _x2 = d3.scale.linear().domain([_keyMin, _keyMax]);
        console.log('renderLines', _x(1), _x2(1));
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

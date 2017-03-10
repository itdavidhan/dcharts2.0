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

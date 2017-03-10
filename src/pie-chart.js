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

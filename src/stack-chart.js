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

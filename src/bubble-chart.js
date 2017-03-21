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
    var _oData = ops.getOriginalData();
    var _rMax = ops.getRMax(_data[0]);
    var _rMin = ops.getRMin(_data[0]);
    console.log(_rMin, _rMax);
    var _r = d3.scale.pow().exponent(1).domain([_rMin, _rMax]).range([0, 50]);
    var _x = ops.getX();
    var _y = ops.getY();
    var _color = ops.getColor();

    if(ops._bubble) return;
    if(_oData[0] instanceof Array) {
        _oData.forEach(function (list, i) {
            var index = i;
            ops._bubble = ops._bodyG.selectAll("circle._" + i)
                    .data(list)
                    .enter()
                    .append("circle")
                    .attr("class", "bubble _" + i);
            dcharts.tooltip.mountTooltip(ops, ops._bubble, index);

            ops._bodyG.selectAll("circle._" + i)
                    .data(list)
                    .style("stroke", function (d, j) {
                        return _color[i%_color.length];
                    })
                    .style("fill", function (d, j) {
                        return _color[i%_color.length];
                    })
                    .transition()
                    .attr("cx", function (d) {
                        var d = dcharts.utils.json2arr(d);
                        return _x(d[0]);
                    })
                    .attr("cy", function (d) {
                        var d = dcharts.utils.json2arr(d);
                        return _y(d[1]);
                    })
                    .attr("r", function (d) {
                        var d = dcharts.utils.json2arr(d);
                        if(d[2]) {
                            return _r(d[2]);
                        }else {
                            return 5;
                        }
                    });
        });
    } else {
        ops._bubble = ops._bodyG.selectAll("circle._")
                .data(_oData)
                .enter()
                .append("circle")
                .attr("class", "bubble _");
        dcharts.tooltip.mountTooltip(ops, ops._bubble);

        ops._bodyG.selectAll("circle._")
                .data(_oData)
                .style("stroke", function (d, j) {
                    return _color[j%_color.length];
                })
                .style("fill", function (d, j) {
                    return _color[j%_color.length];
                })
                .transition()
                .attr("cx", function (d) {
                    var d = dcharts.utils.json2arr(d);
                    return _x(d[0]);
                })
                .attr("cy", function (d) {
                    var d = dcharts.utils.json2arr(d);
                    return _y(d[1]);
                })
                .attr("r", function (d) {
                    var d = dcharts.utils.json2arr(d);
                    var _n = parseFloat(d[2]);
                    if(d[2] && _r(_n)) {
                        return _r(_n);
                    }else {
                        return 5;
                    }
                });
    }

};

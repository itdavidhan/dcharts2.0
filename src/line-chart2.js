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

dcharts.lineChart2 = function(selector, options) {
    // 处理数据
    var ops = dcharts.group.options(selector, options);

    // 生成svg
    dcharts.group.renderSvg(ops);

    // 生成 g.body
    dcharts.group.renderBody(ops);

    // 生成坐标轴
    dcharts.group.renderAxes(ops);

    // 生成线
    dcharts.group.renderLine(ops);
};

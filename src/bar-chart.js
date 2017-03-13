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

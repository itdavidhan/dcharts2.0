/*
* 创建饼图 - pie chart
* @param: selector, options
* options参数配置（带★为必选）
* ★ data: <array> example: [{'key': 'a', 'value': 1}, {'key': 'b', 'value': 2}]
* margin: <json> example: {top: 20, right: 20, bottom: 20, left: 20}
* title: <string>
* padAngle: <number> example: 0.01
* width: <number> example: 200
* height: <number> example: 200
* outerRadius: <number> example: 200
* innerRadius: <number> example: 100
* color: <array> example: ['yellow', 'red', 'orange', 'blue', 'green']
*
*/

dcharts.pieChart = function(selector, options, callback) {

    function render(selector, options) {
        // 处理数据
        var ops = dcharts.group.options(selector, options);

        // 生成svg
        dcharts.group.renderSvg(ops);

        // 生成 g.body
        dcharts.group.renderBody(ops);

        // 生成饼图
        dcharts.group.renderPie(ops);
    }

    // 渲染图表
    render(selector, options);

    // 执行回调
    dcharts.callback(selector, options, render, callback);

};

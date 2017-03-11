/*
* 创建面积图 - area chart
*
*
*
*
*
*/
dcharts.areaChart = function(selector, options) {
    // 处理数据
    var ops = dcharts.group.options(selector, options);

    // 生成svg
    dcharts.group.renderSvg(ops);

    // 生成 g.body
    dcharts.group.renderBody(ops);

    // 生成坐标轴
    dcharts.group.renderAxes(ops, 'x-bottom');
    dcharts.group.renderAxes(ops, 'x-top');
    dcharts.group.renderAxes(ops, 'y-left');
    dcharts.group.renderAxes(ops, 'y-right');

    // 生成线
    dcharts.group.renderLine(ops);

    // 生成块
    dcharts.group.renderArea(ops);

    // 生成点
    dcharts.group.renderDots(ops);

};


dcharts.barChart2 = function(selector, options) {
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
};

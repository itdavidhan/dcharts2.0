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

// 生成饼图
dcharts.group.renderPie = function(ops) {
    if (ops._pieG) return;
    var pie = d3.layout.pie()
            .sort(function (d) {
                return d[0];
            })
            .value(function (d) {
                return d[1];
            });

    var arc = d3.svg.arc()
            .outerRadius(ops.getOuterRadius())
            .innerRadius(ops.getInnerRadius())
            .padAngle(ops.getPadAngle());

    ops._pieG = ops._bodyG.append("g")
            .attr("class", "pie")
            .attr("transform", "translate("
                + ops.getOuterRadius()
                + ","
                + ops.getOuterRadius() + ")");

    dcharts.group._renderSlices(pie, arc, ops);
    dcharts.group._renderLabels(pie, arc, ops);
    showTitle();

    // 在圆心显示标题
    function showTitle() {
        ops._svg.append("text")
        .attr("dx", ops.getWidth()/2 - ops.getMargin().left)
        .attr("dy", ops.getWidth()/2 - ops.getMargin().top)
        .style("text-anchor", "middle")
        .text(function(d) { return ops.getTitle(); });
    }

};

dcharts.group._renderSlices = function(pie, arc, ops) {
    var data = ops.getData()[0];
    var slices = ops._pieG.selectAll("path.arc")
            .data(pie(data));
    var _color = ops.getColor();
    var selector = ops.getSelector();

    slices.enter()
            .append("path")
            .attr("class", "arc")
            .attr("fill", function (d, i) {
              if(typeof _color != 'undefined' && _color.length != 0)
              {
                return _color[i%_color.length];
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

    dcharts.tooltip.mountTooltip(ops, slices);
};

dcharts.group._renderLabels = function(pie, arc, ops) {
    var data = ops.getData()[0];
    var labels = ops._pieG.selectAll("text.label")
            .data(pie(data));

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


dcharts.crossBarChart = function(selector, options, callback) {
    // 渲染图表
    render(selector, options);
    // 执行回调
    dcharts.callback(selector, options, render, callback);

    function render(selector, options) {
        // 处理数据
        var ops = dcharts.group.options(selector, options);
        ops.data = ops.getData()[0];
        ops.x = d3.scale.linear().domain([0, ops.getValMax()]).range([0, ops.quadrantWidth()]);
        ops.y = d3.scale.ordinal()
        .domain(ops.data.map(function(d) {
            return d[0];
        })).rangePoints([0, ops.quadrantHeight()], 1);
        ops.color = ops.getColor();
        ops.padding = Math.floor(ops.quadrantHeight() / ops.data.length)*0.2;

        // 生成svg
        dcharts.group.renderSvg(ops);

        dcharts.group.defineBodyClip(ops);

        // 生成坐标轴
        renderAxes(ops);

        // 生成 g.body
        dcharts.group.renderBody(ops);

        // 生成柱
        renderBar(ops);
    }
    function renderAxes(ops) {
        ops._axesG = ops._svg.append("g")
                .attr("class", "axes");

        ops._axisYl = d3.svg.axis()
                .scale(ops.y)
                .orient("left")
                .tickFormat(function(v) {
                  return v + ops.getFormatY();
                });
                // .ticks(ops.getTicks());

        ops._axisXb = d3.svg.axis()
                .scale(ops.x)
                .orient("bottom")
                .tickFormat(function(v) {
                  return v + ops.getFormatX();
                })
                .ticks(ops.getTicks());
        ops._axesG.append("g")
            .attr("class", "x-axis xb")
            .attr("transform", function(){
                return "translate(" + ops.xStart() + "," + ops.yStart() + ")";
            })
            .call(ops._axisXb)
            .append("text")
                .attr("x", (ops.xEnd() - ops.xStart()))
                .attr("dy", 40)
                .style("text-anchor", "end")
                .text(ops.axisTextY());

        dcharts.group._renderGridLineX(ops, 'xb');

        ops._axesG.append("g")
            .attr("class", "y-axis yl")
            .attr("transform", function(){
                return "translate(" + ops.xStart() + "," + ops.yEnd() + ")";
            })
            .call(ops._axisYl)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", -40)
            .style("text-anchor", "end")
            .text(ops.axisTextX());
        dcharts.group._renderGridLineY(ops, 'yl');
    }
    function renderBar(ops) {
        ops._bar = ops._bodyG.selectAll("rect.bar")
                .data(ops.data)
                .enter()
                .append("rect")
                .attr("class", "bar");

        ops._bar.style("fill", function(d, i) {
                  if(typeof ops.color !== 'undefined' && ops.color.length > 0)
                  {
                    return ops.color[i%ops.color.length];
                  }else{
                    return dcharts.default._COLOR(i);
                  }
                })
                .attr("y", function (d) {
                    return ops.y(d[0]) - (Math.floor(ops.quadrantHeight() / ops.data.length) - ops.padding)/2;
                })
                .attr("x", function (d) {
                    return 0;
                })
                .attr("width", 0)
                .transition()
                // .duration(500)
                .delay(function(d, i) {
                    return i*100;
                })
                .ease('linear')
                .attr("width", function (d) {
                    return ops.x(d[1]);
                })
                .attr("height", function(d){
                    return Math.floor(ops.quadrantHeight() / ops.data.length) - ops.padding;
                });

        if(ops.showText()) showText();
        function showText() {
            ops._bodyG.selectAll("text.text")
                .data(ops.data)
                .enter()
                .append("text")
                .attr("class", "text")
                .attr("y", function (d) {
                    return ops.y(d[0]) + 6; // 6：字体大小的一半
                })
                .attr("x", function (d) {
                    return ops.x(d[1]) - 12; // 12:距离柱形图右边的距离，根据情况而定
                })
                .style({
                  "fill": "#fff",
                  "font-size": "12px"
                })
                .attr("text-anchor", "middle")
                .text(function(d) {
                    return d instanceof Array ? d[1] : d;
                });
        }

        dcharts.tooltip.mountTooltip(ops, ops._bar);

        ops._bar.on('mouseenter.defult1', function(d) {
          d3.select(this).transition().style('opacity', '0.8');
        })
        .on('mouseleave.defult3', function() {
            d3.select(this).transition().style('opacity', '1');
        });
    }
};

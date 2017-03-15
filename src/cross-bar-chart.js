
dcharts.crossBarChart = function(selector, options, callback) {
    var ops = dcharts.group.options(selector, options);
    // 生成svg
    dcharts.group.renderSvg(ops);

    dcharts.group.defineBodyClip(ops);

    // 生成 g.body
    dcharts.group.renderBody(ops);

    var data = ops.getData()[0];
    var x = d3.scale.linear().domain([0, ops.getValMax()]).range([0, ops.quadrantWidth()]);
    var y = d3.scale.ordinal()
    .domain(data.map(function(d) {
        return d[0];
    })).rangePoints([0, ops.quadrantHeight()], 1);
    var color = ops.getColor();
    var padding = Math.floor(ops.quadrantHeight() / data.length)*0.2;

    // 生成坐标轴
    renderAxes(ops);
    function renderAxes(ops) {
        ops._axesG = ops._svg.append("g")
                .attr("class", "axes");

        ops._axisYl = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickFormat(function(v) {
                  return v + ops.getFormatY();
                });
                // .ticks(ops.getTicks());

        ops._axisXb = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickFormat(function(v) {
                  return v + ops.getFormatX();
                });
                // .ticks(ops.getTicks());
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
    }

    // 生成柱
    renderBar(ops);
    function renderBar(ops) {
        ops._bar = ops._bodyG.selectAll("rect.bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar");

        ops._bodyG.selectAll("rect.bar")
                .data(data)
                .transition()
                .style("fill", function(d, i) {
                  if(typeof color !== 'undefined' && color.length > 0)
                  {
                    return color[i%color.length];
                  }else{
                    return dcharts.default._COLOR(i);
                  }
                })
                .attr("y", function (d) {
                    return y(d[0]) - (Math.floor(ops.quadrantHeight() / data.length) - padding)/2;
                })
                .attr("x", function (d) {
                    return 0;
                })
                .attr("width", function (d) {
                    return x(d[1]);
                })
                .attr("height", function(d){
                    return Math.floor(ops.quadrantHeight() / data.length) - padding;
                });
    }

};

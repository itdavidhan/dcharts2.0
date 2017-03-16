/*
* 创建漏斗图 - funnel chart
* @param: {Object} options
* 参数配置（带★为必选）
* ★ data: <array> example: [['a', 10], ['b', 20]]
* width: <number> example: 400
* height: <number> example: 400
* bottomPct: <number> example: 1/4
*/
dcharts.funnelChart = function(selector, options, callback) {

    // 渲染图表
    render(selector, options);
    // 执行回调
    dcharts.callback(selector, options, render, callback);

    function render(selector, options) {
        var ops = dcharts.group.options(selector, options);
        var data = ops.getData()[0];
        var chart = new FunnelChart({
        				data: data,
        				width: ops.getWidth(),
        				height: ops.getHeight(),
        				bottomPct: ops.getBottomPct(),
                        color: ops.getColor()
        			});
        chart.draw(selector);
    }
};

(function(){
  var DEFAULT_HEIGHT = 400,
      DEFAULT_WIDTH = 600,
      DEFAULT_BOTTOM_PERCENT = 1/3;

  window.FunnelChart = function(options) {
    /* Parameters:
      data:
        Array containing arrays of categories and engagement in order from greatest expected funnel engagement to lowest.
        I.e. Button loads -> Short link hits
        Ex: [['Button Loads', 1500], ['Button Clicks', 300], ['Subscribers', 150], ['Shortlink Hits', 100]]
      width & height:
        Optional parameters for width & height of chart in pixels, otherwise default width/height are used
      bottomPct:
        Optional parameter that specifies the percent of the total width the bottom of the trapezoid is
        This is used to calculate the slope, so the chart's view can be changed by changing this value
    */

    this.data = options.data;
    this.color = options.color;
    this.totalEngagement = 0;
    for(var i = 0; i < this.data.length; i++){
      this.totalEngagement += this.data[i][1];
    }
    this.width = typeof options.width !== 'undefined' ? options.width : DEFAULT_WIDTH;
    this.height = typeof options.height !== 'undefined' ? options.height : DEFAULT_HEIGHT;
    var bottomPct = typeof options.bottomPct !== 'undefined' ? options.bottomPct : DEFAULT_BOTTOM_PERCENT;
    this._slope = 2*this.height/(this.width - bottomPct*this.width);
    this._totalArea = (this.width+bottomPct*this.width)*this.height/2;
  };

  window.FunnelChart.prototype._getLabel = function(ind){
    /* Get label of a category at index 'ind' in this.data */
    return this.data[ind][0];
  };

  window.FunnelChart.prototype._getEngagementCount = function(ind){
    /* Get engagement value of a category at index 'ind' in this.data */
    return this.data[ind][1];
  };

  window.FunnelChart.prototype._createPaths = function(){
    /* Returns an array of points that can be passed into d3.svg.line to create a path for the funnel */
    trapezoids = [];

    function findNextPoints(chart, prevLeftX, prevRightX, prevHeight, dataInd){
      // reached end of funnel
      if(dataInd >= chart.data.length) return;

      // math to calculate coordinates of the next base
      area = chart.data[dataInd][1]*chart._totalArea/chart.totalEngagement;
      prevBaseLength = prevRightX - prevLeftX;
      nextBaseLength = Math.sqrt((chart._slope * prevBaseLength * prevBaseLength - 4 * area)/chart._slope);
      nextLeftX = (prevBaseLength - nextBaseLength)/2 + prevLeftX;
      nextRightX = prevRightX - (prevBaseLength-nextBaseLength)/2;
      nextHeight = chart._slope * (prevBaseLength-nextBaseLength)/2 + prevHeight;

      points = [[nextRightX, nextHeight]];
      points.push([prevRightX, prevHeight]);
      points.push([prevLeftX, prevHeight]);
      points.push([nextLeftX, nextHeight]);
      points.push([nextRightX, nextHeight]);
      trapezoids.push(points);

      findNextPoints(chart, nextLeftX, nextRightX, nextHeight, dataInd+1);
    }

    findNextPoints(this, 0, this.width, 0, 0);
    return trapezoids;
  };

  window.FunnelChart.prototype.draw = function(elem, speed){
    var DEFAULT_SPEED = 10;
    speed = typeof speed !== 'undefined' ? speed : DEFAULT_SPEED;

    var selector = d3.select(elem);
    var funnelSvg = selector.html('')
              .append('div')
              .attr('class', 'dcharts-container')
              .append('svg:svg')
              .attr('width', this.width)
              .attr('height', this.height)
              .append('svg:g');

    // Creates the correct d3 line for the funnel
    var funnelPath = d3.svg.line()
                    .x(function(d) { return d[0]; })
                    .y(function(d) { return d[1]; });

    // Automatically generates colors for each trapezoid in funnel
    var colorScale = this.color;

    var paths = this._createPaths();

    function drawTrapezoids(funnel, i){
      var trapezoid = funnelSvg
                      .append('svg:path')
                      .attr('d', function(d){
                        return funnelPath(
                            [paths[i][0], paths[i][1], paths[i][2],
                            paths[i][2], paths[i][1], paths[i][2]]);
                      })
                      .attr('fill', '#fff');

      trapezoid.on('click', function(i) {
          alert(i);
      });

      nextHeight = paths[i][[paths[i].length]-1];

      var totalLength = trapezoid.node().getTotalLength();

      var transition = trapezoid
                      .transition()
                        .duration(totalLength/speed)
                        .ease("linear")
                        .attr("d", function(d){return funnelPath(paths[i]);})
                        .attr("fill", function(d){return colorScale[i];});

      funnelSvg
      .append('svg:text')
      .text(funnel._getLabel(i) + ': ' + funnel._getEngagementCount(i))
      .attr("x", function(d){ return funnel.width/2; })
      .attr("y", function(d){
        return (paths[i][0][1] + paths[i][1][1])/2;}) // Average height of bases
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff");

      if(i < paths.length - 1){
        transition.each('end', function(){
          drawTrapezoids(funnel, i+1);
        });
      }
    }

    drawTrapezoids(this, 0);
  };
})();


dcharts.tooltip = {timer: null};

dcharts.tooltip.initTooltip = function(_selector) {
  var _tooltip;
  var _selector = _selector;

  if(!_tooltip)
  {
    _tooltip = _selector.append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0.0);
  }
};

dcharts.tooltip.showTooltip = function(d, _selector) {
    var _result = (function() {
        if(d instanceof Array){
            return d[1];
        }else if(d instanceof Object) {
            return d.data[1];
        }else{
            return d;
        }
    })();
    clearTimeout(dcharts.tooltip.timer);
    _selector.select('div.tooltip')
      .style('opacity', 0.8)
      .html(_result);
};

dcharts.tooltip.moveTooltip = function(_selector, x, y) {
    var _tooltip = _selector.select('div.tooltip');
    var main_width = parseFloat(_selector.style('width'));
    var main_height = parseFloat(_selector.style('height'));
    var self_width = parseFloat(_tooltip.style('width')) + 30;
    var self_height = parseFloat(_tooltip.style('height')) + 30;
    var x = (x >= main_width/2) ? x - self_width - 20 : x + 20;
    var y = (y >= main_height/2) ? y - self_height : y;

    clearTimeout(dcharts.tooltip.timer);

    _tooltip.transition()
          .ease('linear')
          .style('left', x + 'px')
          .style('top', y + 10 + 'px');
};

dcharts.tooltip.hideTooltip = function(_selector) {
    clearTimeout(dcharts.tooltip.timer);
    dcharts.tooltip.timer = setTimeout(function() {
        _selector.select('div.tooltip')
           .transition()
           .style('opacity', 0);
    }, 1000);
};

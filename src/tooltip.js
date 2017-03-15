
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

dcharts.tooltip.mountTooltip = function(ops, dom) {
    dom.on('mouseenter', function(d) {
      dcharts.tooltip.showTooltip(d, ops.getSelector());
    })
    .on('mousemove', function() {
      var arr = d3.mouse(ops.getBox()[0][0]);
      var x = arr[0];
      var y = arr[1];
      dcharts.tooltip.moveTooltip(ops.getSelector(), x, y);
    })
    .on('mouseleave', function() {
        dcharts.tooltip.hideTooltip(ops.getSelector());
    });
};

dcharts.tooltip.showTooltip = function(d, _selector, html) {
    var _result = (function() {
        if(d instanceof Array){
            return d[1];
        }else if(d instanceof Object) {
            return d.x + ':' + d.y;
        }else{
            return d;
        }
    })();
    var _html = html || _result;
    var _otherTooltip = d3.select('body').selectAll('div.tooltip');
    _otherTooltip.transition().style('opacity', 0);

    clearTimeout(dcharts.tooltip.timer);
    _selector.select('div.tooltip')
      .style('opacity', 1)
      .html(_html);
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
        dcharts.tooltip._hide(_selector);
    }, 800);
};

dcharts.tooltip._hide = function(_selector) {
    _selector.select('div.tooltip')
       .transition()
       .style('opacity', 0);
};

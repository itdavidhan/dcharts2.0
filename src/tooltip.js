
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

dcharts.tooltip.mountTooltip = function(ops, dom, index) {
    dom.on('mouseenter.tooltip', function(d, i) {
        // var _d = d || ops.getData()[0][i];
        var _d = ops.getOriginalData()[i];
        var _index = (typeof index != 'undefined') ? index : i;
        dcharts.tooltip.showTooltip(_d, ops.getSelector(), ops, _index);
    })
    .on('mousemove.tooltip', function() {
      var arr = d3.mouse(ops.getBox()[0][0]);
      var x = arr[0];
      var y = arr[1];
      dcharts.tooltip.moveTooltip(ops.getSelector(), x, y);
    })
    .on('mouseleave.tooltip', function() {
        dcharts.tooltip.hideTooltip(ops.getSelector());
    });
};

dcharts.tooltip.showTooltip = function(d, _selector, ops, index) {
    var _color = ops.getColor();
    var _result = '';
    var _otherTooltip = d3.select('body').selectAll('div.tooltip');
    _otherTooltip.transition().style('opacity', 0);
    if(!(d instanceof Array)) {
        for(var i in d) {
            var p = '<p style="color: '+_color[index%_color.length]+'"><b>'+i+'</b>'+'：'+'<span>'+d[i]+'</span></p>';
            _result += p;
        }
    } else {
        var d = d[index];
        for(var i in d) {
            var p = '<p style="color: '+_color[index%_color.length]+'"><b>'+i+'</b>'+'：'+'<span>'+d[i]+'</span></p>';
            _result += p;
        }
    }

    clearTimeout(dcharts.tooltip.timer);
    _selector.select('div.tooltip')
      .style('opacity', 1)
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
        dcharts.tooltip._hide(_selector);
    }, 800);
};

dcharts.tooltip._hide = function(_selector) {
    _selector.select('div.tooltip')
       .transition()
       .style('opacity', 0);
};

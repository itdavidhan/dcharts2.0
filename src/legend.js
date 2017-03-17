
dcharts.legend = {};

dcharts.legend.init = function(ops) {
    if(ops._legend) return;
    var selector = document.querySelector(ops.getOriginalSelector());
    var dchartCont = selector.querySelector('.dcharts-container');
    ops._legend = document.createElement('div');
    ops._legend.setAttribute('class', 'legend');
    dchartCont.appendChild(ops._legend);
    dcharts.legend.create(ops);
};

dcharts.legend.create = function(ops) {
    var _data = ops.getData();
    if(_data[0][0][2]) {
        _data = (function() {
            var _a = [];
            for(var i=0; i<_data.length; i++) {
                _a.push(_data[i][0][2]);
            }
            return _a;
        })();

    }else {
        _data = ops.getData()[0];
    }
    var _html = '';
    var _rect = null;
    var _color = ops.getColor();
    var _key = _data[0][0];

    if(!isNaN(Number(_key))) return;

    for(var i=0; i<_data.length; i++) {
        var _name = (_data[i] instanceof Object) ? _data[i][0] : _data[i];
        _html += '<div class="legend-r legend-rect-'+i+'"><em></em><span title="'+_name+'">'+_name+'</span></div>';
    }
    ops._legend.innerHTML = _html;

    _rect =ops._legend.querySelectorAll('.legend-r');

    for(var i=0, len=_rect.length; i<len; i++)
    {
        var em = _rect[i].querySelector('em');
        em.style.backgroundColor = _color[i%_color.length];
    }
};

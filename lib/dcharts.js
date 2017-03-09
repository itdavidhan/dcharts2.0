(function() {
    function _dcharts(d3, crossfilter) {


var dcharts = {
    version: '2.0.1'
};

dcharts.default = {};
dcharts.default._MARGIN = {top: 30, left: 30, right: 30, bottom: 30};
dcharts.default._COLOR = d3.scale.category20();


dcharts.utils = {};

// dfc: data format conversion
dcharts.utils.dfc = {};

dcharts.utils.dfc.json2arr = function(arr) {
    // example: [{year:2016, value:2}, {year:2017, value:3}] ==> [[2016, 2],[2017, 3]]
    var _main = [];
    arr.map(function(json) {
        var _arr = [];
        for(var i in json)
        {
            _arr.push(json[i]);
        }
        _main.push(_arr);
    });
    return _main;
};


dcharts.filter = {};

dcharts.filter.maxInArrs = function(arr) {
    // [[0, 1], [1, 6]] ==> [1, 6]
    var _keyArr = [];
    var _valArr = [];
    var _keyMax = 0;
    var _valMax = 0;
    arr.map(function(a) {
        _keyArr.push(a[0]);
        _valArr.push(a[1]);
    });
    _keyMax = d3.max(_keyArr, function(a) {
        return +a;
    });
    _valMax = d3.max(_valArr, function(a) {
        return +a;
    });
    return [_keyMax, _valMax];
};

dcharts.filter.minInArrs = function(arr) {
    // [[0, 2], [1, 6]] ==> [0, 2]
    var _keyArr = [];
    var _valArr = [];
    var _keyMin = 0;
    var _valMin = 0;
    arr.map(function(a) {
        _keyArr.push(a[0]);
        _valArr.push(a[1]);
    });
    _keyMin = d3.min(_keyArr, function(a) {
        return +a;
    });
    _valMin = d3.min(_valArr, function(a) {
        return +a;
    });
    return [_keyMin, _valMin];
};


dcharts.barChart = function(selector, options) {
    var _selector = d3.select(selector);
    var _selWdith = parseFloat(_selector.style('width'));
    var _selHeight = parseFloat(_selector.style('height'));
    var _width = options.width || _selWdith;
    var _height = options.height || _selHeight;
    var _scale = options.scale;
    var _data = (function() {
        if(_scale == 'linear') {
            return options.data;
        }else{
            return dcharts.utils.dfc.json2arr(options.data);
        }
    })();
    var _valMax = (function() {
        if(_scale == 'linear')
        {
            return d3.max(options.data);
        }
        else if(_scale == 'ordinal')
        {
            return dcharts.util.dfc.maxInArrs(_data)[1];
        }
    })();
    var _margins = options.margin || dcharts.default._MARGIN;
    var _x = (function() {
        if(_scale == 'linear')
        {
            return d3.scale.linear().domain([0, _data.length+1]).range([0, quadrantWidth()]);
        }
        else if(_scale == 'ordinal') {
            return d3.scale.ordinal().domain(_data.map(function(d) {
                return d[0];
            })).rangePoints([0, _width - _margins.left*2], 1);
        }
    })();
    var _y = d3.scale.linear().domain([0, _valMax]).range([quadrantHeight(), 0]);
    var _colors = options.color;
    var _ticks = options.ticks;
    var _showLineX = options.showLineX || false;
    var _showLineY = options.showLineY || false;
    var _formatX = options.formatX || false;
    var _formatY = options.formatY || false;
    var _svg;
    var _bodyG;

    _selector.html('');

    render();
    function render() {
        if (!_svg) {
            _svg = _selector.append("svg")
                    .attr("height", _height)
                    .attr("width", _width);
            renderAxes(_svg);
            defineBodyClip(_svg);
        }
        renderBody(_svg, _selector);
    };

    function renderAxes(svg) {
        var axesG = svg.append("g")
                .attr("class", "axes");

        var xAxis = d3.svg.axis()
                .scale(_x)
                .orient("bottom");

        if(_formatX)
        {
          xAxis.tickFormat(function(v) {
            return v + _formatX;
          });
        }

        var yAxis = d3.svg.axis()
                .scale(_y)
                .orient("left")
                .ticks(_ticks);

        if(_formatY)
        {
          yAxis.tickFormat(function(v) {
            return v + _formatY;
          });
        }

        axesG.append("g")
                .attr("class", "x-axis")
                .attr("transform", function () {
                    return "translate(" + xStart() + "," + yStart() + ")";
                })
                .call(xAxis);

        axesG.append("g")
                .attr("class", "y-axis")
                .attr("transform", function () {
                    return "translate(" + xStart() + "," + yEnd() + ")";
                })
                .call(yAxis);

        // axesG.append("g")
        //    .attr("class", "y axis")
        //    .call(yAxis)
        //    .append("text")
        //    .attr("transform", "rotate(-90)")
        //    .attr("y", 6)
        //    .attr("dy", ".71em")
        //    .style("text-anchor", "end")
        //    .text("Frequency");

        if(_showLineX)
        {
          axesG.selectAll('g.x-axis g.tick')
               .append('line')
               .attr('class', 'grid-line')
               .attr('x1', 0)
               .attr('y1', 0)
               .attr('x2', 0)
               .attr('y2', - (_height - 2*_margins.bottom));
        }

        if(_showLineY)
        {
          axesG.selectAll('g.y-axis g.tick')
               .append('line')
               .attr('class', 'grid-line')
               .attr('x1', 0)
               .attr('y1', 0)
               .attr('x2', quadrantWidth())
               .attr('y2', 0);
        }
    }
    function defineBodyClip(svg) {
        var padding = 5;

        svg.append("defs")
                .append("clipPath")
                .attr("id", "body-clip")
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", quadrantWidth() + 2 * padding)
                .attr("height", quadrantHeight());
    }
    function renderBody(svg, _selector) {
        if (!_bodyG)
            _bodyG = svg.append("g")
                    .attr("class", "body")
                    .attr("transform", "translate("
                            + xStart()
                            + ","
                            + yEnd() + ")")
                    .attr("clip-path", "url(#body-clip)");

        renderBars(svg, _selector);

    }
    function renderBars(svg, _selector) {
        var padding = Math.floor(quadrantWidth() / _data.length)*0.2;
        var svg = svg;
        var bar = _bodyG.selectAll("rect.bar")
                .data(_data)
                .enter()
                .append("rect")
                .attr("class", "bar");

        _bodyG.selectAll("rect.bar")
                .data(_data)
                .transition()
                .style("fill", function(d, i) {
                  if(typeof options.color !== 'undefined' && options.color.length > 0)
                  {
                    return _colors[i];
                  }else{
                    return dcharts.default._COLOR(i);
                  }
                })
                .attr("x", function (d, i) {
                    var _resultX = d instanceof Array ? d[0] : i+1;
                    return _x(_resultX) - (Math.floor(quadrantWidth() / _data.length) - padding)/2;
                })
                .attr("y", function (d) {
                    var _resultY = d instanceof Array ? d[1] : d;
                    return _y(_resultY);
                })
                .attr("height", function (d) {
                    var _result = d instanceof Array ? d[1] : d;
                    return yStart() - _y(_result);
                })
                .attr("width", function(d){
                    return Math.floor(quadrantWidth() / _data.length) - padding;
                });

        bar.on('mouseenter', function(d) {
        //   _this.tooltip._showTooltip(d, _selector);
          d3.select(this).transition().style('opacity', '0.8');
        })
        .on('mousemove', function() {
          var x = d3.event.pageX;
          var y = d3.event.pageY;
        //   _this.tooltip._moveTooltip(_selector, x, y);
        })
        .on('mouseleave', function() {
          d3.select(this).transition().style('opacity', '1');
        });

        _bodyG.selectAll("text.text")
                .data(_data)
                .enter()
                .append("text")
                .attr("class", "text")
                .attr("x", function (d, i) {
                    var _resultX = d instanceof Array ? d[0] : i+1;
                    return _x(_resultX);
                })
                .attr("y", function (d) {
                    var _resultY = d instanceof Array ? d[1] : d;
                    return _y(_resultY) + 16; // 16:距离柱形图顶部的距离，根据情况而定
                })
                .style({
                  "fill": "#FFF",
                  "font-size": "12px"
                })
                .attr("text-anchor", "middle")
                .text(function(d) {
                  return d instanceof Array ? d[1] : d;
                });
    }
    function xStart() {
        return _margins.left;
    }
    function yStart() {
        return _height - _margins.bottom;
    }
    function xEnd() {
        return _width - _margins.right;
    }
    function yEnd() {
        return _margins.top;
    }
    function quadrantWidth() {
        return _width - _margins.left - _margins.right;
    }
    function quadrantHeight() {
        return _height - _margins.top - _margins.bottom;
    }
};

        dcharts.d3 = d3;
        dcharts.crossfilter = crossfilter;
        return dcharts;
    }

    if(typeof define === "function" && define.amd) {
        define(["d3", "crossfilter"], _dcharts);
    } else if(typeof module === "object" && module.exports) {
        var _d3 = require('d3');
        var _crossfilter = require('crossfilter2');
        // When using npm + browserify, 'crossfilter' is a function,
        // since package.json specifies index.js as main function, and it
        // does special handling. When using bower + browserify,
        // there's no main in bower.json (in fact, there's no bower.json),
        // so we need to fix it.
        if (typeof _crossfilter !== "function") {
            _crossfilter = _crossfilter.crossfilter;
        }
        module.exports = _dcharts(_d3, _crossfilter);
    } else {
        this.dcharts = _dcharts(d3, crossfilter);
    }

})();

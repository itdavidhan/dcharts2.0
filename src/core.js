
var dcharts = {
    version: '2.0.1'
};

dcharts.default = {};
dcharts.default._MARGIN = {top: 30, left: 30, right: 30, bottom: 30};
dcharts.default._COLOR = d3.scale.category10();
dcharts.default._colorArr = ['#5282e4', '#b5c334', '#fdcf10', '#e97c24', '#c1222a', '#ff8562', '#9bcb62', '#fbd960', '#f3a53a'];

// 图表组合
dcharts.group = {};

// 处理数据
dcharts.group.options = function(selector, options) {
    var ops = {
        getSelector: function() {
            return d3.select(selector);
        },
        getSelWdith: function() {
            var dom = this.getSelector();
            return parseFloat(dom.style('width'));
        },
        getSelHeight: function() {
            var dom = this.getSelector();
            return parseFloat(dom.style('height'));
        },
        getWidth: function() {
            return parseFloat(options.width) || this.getSelWdith();
        },
        getHeight: function() {
            return parseFloat(options.height) || this.getSelHeight();
        },
        getScale: function() {
            return options.scale || 'linear';
        },
        getData: function() {
            return dcharts.handle.data(options.data);
        },
        getOriginalData: function() {
            return options.data;
        },
        getValMax: function() {
            var _max = -Infinity;
            d3.map(this.getData(), function(d) {
              var dMax = dcharts.filter.maxInArrs(d)[1];
              if(dMax > _max) _max = dMax;
            });
            return _max;
        },
        getValMin: function() {
            var _min = Infinity;
            d3.map(this.getData(), function(d) {
              var dMin = dcharts.filter.minInArrs(d)[1];
              if(dMin < _min) _min = dMin;
            });
            return _min;
        },
        getKeyMax: function() {
            var _max = -Infinity;
            d3.map(this.getData(), function(d) {
              var dMax = dcharts.filter.maxInArrs(d)[0];
              if(dMax > _max) _max = dMax;
            });
            return _max;
        },
        getKeyMin: function() {
            var _min = Infinity;
            d3.map(this.getData(), function(d) {
              var dMin = dcharts.filter.minInArrs(d)[0];
              if(dMin < _min) _min = dMin;
            });
            return _min;
        },
        getRMax: function() {
            var _max = -Infinity;
            d3.map(this.getData(), function(d) {
              var dMax = dcharts.filter.maxInArrs(d)[2];
              if(dMax > _max) _max = dMax;
            });
            return _max;
        },
        getRMin: function() {
            var _min = Infinity;
            d3.map(this.getData(), function(d) {
              var dMin = dcharts.filter.minInArrs(d)[2];
              if(dMin < _min) _min = dMin;
            });
            return _min;
        },
        getMargin: function() {
            return options.margin || dcharts.default._MARGIN;
        },
        getX: function() {
            if(this.getScale() == 'linear')
            {
                return d3.scale.linear()
                .domain([0, this.getKeyMax()+1])
                // .domain([this.getKeyMin(), this.getKeyMax()])
                .range([0, ops.quadrantWidth()]);
            }else if(this.getScale() == 'time') {
                return d3.time.scale()
                .domain([new Date(2000, 0, 1).getTime(), new Date(2022, 0, 1).getTime()])
                .range([0, ops.quadrantWidth()]);
            }else if(this.getScale() == 'ordinal'){
                var data = this.getData()[0];
                return d3.scale.ordinal()
                .domain(data.map(function(d) {
                    return d[0];
                })).rangePoints([0, this.quadrantWidth()], 1);
            }
        },
        getY: function() {
            return d3.scale.linear()
            .domain([0, this.getValMax()])
            // .domain([this.getValMin(), this.getValMax()])
            .range([ops.quadrantHeight(), 0]);
        },
        getTicks: function() {
            return options.ticks;
        },
        getInterpolate: function() {
            return options.interpolate || 'linear';
        },
        getTension: function() {
            return options.tension || 0.7;
        },
        showAxisX: function() {
            return (typeof options.showAxisX != 'undefined') ? options.showAxisX : true;
        },
        showAxisY: function() {
            return (typeof options.showAxisY != 'undefined') ? options.showAxisY : true;
        },
        showLineX: function() {
            return options.showLineX || false;
        },
        showLineY: function() {
            return options.showLineY || false;
        },
        axisTextX: function() {
            return options.axisTextX || '';
        },
        axisTextY: function() {
            return options.axisTextY || '';
        },
        showDot: function() {
            return options.showDot;
        },
        showText: function() {
            return options.showText || false;
        },
        getColor: function() {
            return options.color || dcharts.default._colorArr;
        },
        getFormatX: function() {
            return options.formatX || '';
        },
        getFormatY: function() {
            return options.formatY || '';
        },
        getPadAngle: function() {
            return options.padAngle || 0; // 0.01-0.03
        },
        getTitle: function() {
            return options.title || '';
        },
        getOuterRadius: function() {
            return options.outerRadius || ops.getWidth()/2 - ops.getMargin().left - ops.getMargin().right;
        },
        getInnerRadius: function() {
            return (typeof options.innerRadius !== 'undefined') ? options.innerRadius : ops.getOuterRadius()/2;
        },
        xStart: function() {
            return this.getMargin().left;
        },
        yStart: function() {
            return this.getHeight() - this.getMargin().bottom;
        },
        xEnd: function() {
            return this.getWidth() - this.getMargin().right;
        },
        yEnd: function() {
            return this.getMargin().top;
        },
        quadrantWidth: function() {
            return this.getWidth() - this.getMargin().left - this.getMargin().right;
        },
        quadrantHeight: function() {
            return this.getHeight() - this.getMargin().bottom - this.getMargin().top;
        },
        _dchartCont: null,
        _svg: null,
        _bodyG: null,
        _axesG: null,
        _defs: null,
        _bar: null,
        _area: null,
        _line: null,
        _dots: null,
        _pieG: null,
        _bubble: null,
        _axisXb: null,
        _axisXt: null,
        _axisYl: null,
        _axisYr: null,
        _hasGuidLineX: false,
        _hasGuidLineY: false
    };
    return ops;
};

// 生成svg
dcharts.group.renderSvg = function(ops) {
    if(!ops._dchartCont) {
        var selector = ops.getSelector();
        ops._dchartCont = selector.html('').append('div').attr('class', 'dcharts-container');
        ops._svg = ops._dchartCont.append("svg");
        ops._svg.attr("height", ops.getHeight())
            .attr("width", ops.getWidth());
        dcharts.tooltip.initTooltip(ops._dchartCont);
    }
};

// 生成 g.body
dcharts.group.renderBody = function(ops) {
    if (!ops._bodyG)
    {
        ops._bodyG = ops._svg.append("g")
                .attr("class", "body")
                .attr("transform", "translate("
                    + ops.xStart() + ","
                    + ops.yEnd() + ")")
                .attr("clip-path", "url(#body-clip)");
    }
},

// 生成坐标轴
dcharts.group.renderAxes = function(ops, type) {

    if(!ops._axesG)
    {
        ops._axesG = ops._svg.append("g")
                .attr("class", "axes");
    }

    switch(type)
    {
        case 'x-bottom':
            createXB();
            break;
        case 'x-top':
            createXT();
            break;
        case 'y-left':
            createYL();
            break;
        case 'y-right':
            createYR();
            break;
        default:
            console.error('参数有误');
            break;
    }

    function createXB() {
        if(!ops._axisXb) {
            ops._axisXb = d3.svg.axis()
                    .scale(ops.getX())
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
                    .text(ops.axisTextX());
            dcharts.group._renderGridLineX(ops, 'xb');
        }
    }

    function createXT() {
        if(!ops._axisXt) {
            ops._axisXt = d3.svg.axis()
                    .scale(ops.getX())
                    .orient("top")
                    .tickFormat(function(v) {
                      return v + ops.getFormatX();
                    });
                    // .ticks(ops.getTicks());
            ops._axesG.append("g")
                .attr("class", "x-axis xt")
                .attr("transform", function(){
                    return "translate(" + ops.xStart() + "," + ops.yEnd() + ")";
                })
                .call(ops._axisXt)
                .append("text")
                    .attr("x", (ops.xEnd() - ops.xStart()))
                    .attr("dy", -40)
                    .style("text-anchor", "end")
                    .text(ops.axisTextX());
            dcharts.group._renderGridLineX(ops, 'xt');
        }
    }

    function createYL() {
        if(!ops._axisYl) {
            ops._axisYl = d3.svg.axis()
                    .scale(ops.getY())
                    .orient("left")
                    .ticks(ops.getTicks())
                    .tickFormat(function(v) {
                      return v + ops.getFormatY();
                    });
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
                .text(ops.axisTextY());
            dcharts.group._renderGridLineY(ops, 'yl');
        }
    }

    function createYR() {
        if(ops._axisYr) return;
        ops._axisYr = d3.svg.axis()
                .scale(ops.getY())
                .orient("right")
                .ticks(ops.getTicks())
                .tickFormat(function(v) {
                  return v + ops.getFormatY();
                });
        ops._axesG.append("g")
            .attr("class", "y-axis yr")
            .attr("transform", function(){
                return "translate(" + ops.xEnd() + "," + ops.yEnd() + ")";
            })
            .call(ops._axisYr)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", 40)
            .style("text-anchor", "end")
            .text(ops.axisTextY());
        dcharts.group._renderGridLineY(ops, 'yr');
    }
};

// 生成坐标线 X
dcharts.group._renderGridLineX = function(ops, type) {
    if(ops.showLineX() && !ops._hasGuidLineX)
    {
        var _y2 = (type == 'xb') ? - ops.quadrantHeight() : ops.quadrantHeight();
        ops._axesG.selectAll("g.x-axis g.tick")
            .append("line")
            .classed("grid-line", true)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", _y2);

        ops._hasGuidLineX = true;
    }
};

// 生成坐标线 Y
dcharts.group._renderGridLineY = function(ops, type) {
    if(ops.showLineY() && !ops._hasGuidLineY)
    {
        var _x2 = (type == 'yl') ? ops.quadrantWidth() : -ops.quadrantWidth();
        ops._axesG.selectAll("g.y-axis g.tick")
            .append("line")
            .classed("grid-line", true)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", _x2)
            .attr("y2", 0);

        ops._hasGuidLineY = true;
    }
};

// 生成线图
dcharts.group.renderLine = function(ops) {
    var _x = ops.getX();
    var _y = ops.getY();
    var _color = ops.getColor();
    var _data = ops.getData();

    if(!ops._line) {
        ops._line = d3.svg.line()
                .x(function (d) { return _x(d[0]); })
                .y(function (d) { return _y(d[1]); });

        if(ops.getInterpolate()) ops._line.interpolate(ops.getInterpolate());
        if(ops.getTension()) ops._line.tension(ops.getTension());

        ops._bodyG.selectAll("path.line")
                .data(_data)
                .enter()
                .append("path")
                .style("stroke", function (d, i) {
                  if(typeof _color != 'undefined' && _color.length > 0)
                  {
                    return _color[i%_color.length];
                  }else{
                    return dcharts.default._COLOR(i);
                  }
                })
                .attr("class", "line");

        ops._bodyG.selectAll("path.line")
                .data(_data)
                .transition()
                .attr("d", function (d) {return ops._line(d); });
    }
};

// 生成块
dcharts.group.renderArea = function(ops) {
    var _x = ops.getX();
    var _y = ops.getY();
    var _color = ops.getColor();
    var data = ops.getData();

    if(ops._area) return;
    ops._area = d3.svg.area()
        .x(function(d) { return _x(d[0]); })
        .y0(_y(0))
        .y1(function(d) { return _y(d[1]); });

    if(ops.getInterpolate()) ops._area.interpolate(ops.getInterpolate());
    if(ops.getTension()) ops._area.tension(ops.getTension());

    ops._bodyG.selectAll("path.area")
            .data(data)
            .enter()
            .append("path")
            .style("fill", function (d, i) {
                if(typeof _color != 'undefined' && _color.length > 0)
                {
                  return _color[i%_color.length];
                }else{
                  return dcharts.default._COLOR(i);
                }
            })
            .transition()
            .attr("class", "area")
            .attr("d", function(d){return ops._area(d);});
};

// 生成圆点
dcharts.group.renderDots = function(ops) {
    var _x = ops.getX();
    var _y = ops.getY();
    var _color = ops.getColor();
    var data = ops.getData();

    if(ops._dots) return;
    data.forEach(function (list, i) {
       ops._dots = ops._bodyG.selectAll("circle._" + i)
               .data(list)
               .enter()
               .append("circle")
               .attr("class", "dot _" + i);

       ops._bodyG.selectAll("circle._" + i)
               .data(list)
               .style("stroke", function (d) {
                   if(typeof _color != 'undefined' && _color.length > 0)
                   {
                     return _color[i%_color.length];
                   }else{
                     return dcharts.default._COLOR(i);
                   }
               })
               .transition()
               .attr("cx", function (d) { return _x(d[0]); })
               .attr("cy", function (d) { return _y(d[1]); })
               .attr("r", 4.5);

       dcharts.tooltip.mountTooltip(ops, ops._dots);
    });
};

// 生成条/柱
dcharts.group.renderBar = function(ops) {
    var data = ops.getData()[0];
    var _x = ops.getX();
    var _y = ops.getY();
    var _color = ops.getColor();

    var padding = Math.floor(ops.quadrantWidth() / data.length)*0.2;

    if(!ops._bar) {
        ops._bar = ops._bodyG.selectAll("rect.bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar");

        ops._bodyG.selectAll("rect.bar")
                .data(data)
                .attr("y", ops.quadrantHeight())
                .transition()
                // .duration(500)
                .delay(function(d, i) {
                    return i*100;
                })
                .ease('linear')
                .style("fill", function(d, i) {
                  if(typeof _color !== 'undefined' && _color.length > 0)
                  {
                    return _color[i%_color.length];
                  }else{
                    return dcharts.default._COLOR(i);
                  }
                })
                .attr("x", function (d) {
                    return _x(d[0]) - (Math.floor(ops.quadrantWidth() / data.length) - padding)/2;
                })
                .attr("y", function (d) {
                    return _y(d[1]);
                })
                .attr("height", function (d) {
                    return ops.yStart() - _y(d[1]);
                })
                .attr("width", function(d){
                    return Math.floor(ops.quadrantWidth() / data.length) - padding;
                });

        dcharts.tooltip.mountTooltip(ops, ops._bar);

        ops._bar.on('mouseenter.defult1', function(d) {
          d3.select(this).transition().style('opacity', '0.8');
        })
        .on('mouseleave.defult3', function() {
            d3.select(this).transition().style('opacity', '1');
        });

        if(ops.showText()) showText();
        function showText() {
            ops._bodyG.selectAll("text.text")
                .data(data)
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
    }
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

// 生成气泡图
dcharts.group.renderBubble = function(ops) {
    var _data = ops.getData();
    var _rMax = ops.getRMax(_data[0]);
    var _rMin = ops.getRMin(_data[0]);
    var _r = d3.scale.pow().exponent(1).domain([_rMin, _rMax]).range([0, 50]); // <-B
    var _x = ops.getX();
    var _y = ops.getY();
    var _color = ops.getColor();

    if(ops._bubble) return;
    _data.forEach(function (list, i) {
        ops._bubble = ops._bodyG.selectAll("circle._" + i)
                .data(list)
                .enter()
                .append("circle")
                .attr("class", "bubble _" + i);

        ops._bodyG.selectAll("circle._" + i)
                .data(list)
                .style("stroke", function (d, j) {
                    return _color[j%_color.length];
                })
                .style("fill", function (d, j) {
                    return _color[j%_color.length];
                })
                .transition()
                .attr("cx", function (d) {
                    return _x(d[0]);
                })
                .attr("cy", function (d) {
                    return _y(d[1]);
                })
                .attr("r", function (d) {
                    if(d[2]) {
                        return _r(d[2]);
                    }else {
                        return 5;
                    }

                });

    });

    dcharts.tooltip.mountTooltip(ops, ops._bubble);
};

// body-clip
dcharts.group.defineBodyClip = function(ops) {
    var padding = Math.floor(ops.quadrantWidth() / ops.getData()[0].length)*0.2;
    if(!ops._defs) {
        ops._defs = ops._svg.append("defs");
        ops._defs.append("clipPath")
        .attr("id", "body-clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", ops.quadrantWidth() + 2 * padding)
        .attr("height", ops.quadrantHeight());
    }
};

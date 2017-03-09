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

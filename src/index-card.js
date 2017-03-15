
dcharts.indexCard = function(selector, options, callback) {
    var selector = document.querySelector(selector);
    var ops = options;
    var arr = (function() {
        var _a = [];
        for(var i in ops)
        {
            _a.push(ops[i]);
        }
        return _a;
    })();
    var oFragment = document.createDocumentFragment();
    var dcharts = document.createElement("div");
    var card = document.createElement("div");

    dcharts.setAttribute("class", "dcharts-container");
    card.setAttribute("class", "card");

    for(var i=0; i<arr.length; i++)
    {
        var op = document.createElement("p");
        op.innerHTML = arr[i];
        //先附加在文档碎片中
        oFragment.appendChild(op);
    }
    card.appendChild(oFragment);
    dcharts.appendChild(card);
    selector.appendChild(dcharts);
};

// dcharts.group.renderIndexCard = function(ops) {
//     var data =
// };

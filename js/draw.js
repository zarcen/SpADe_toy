
var palette = new Rickshaw.Color.Palette();
var colorQ = palette.color();
var colorD = palette.color();
var graph = new Rickshaw.Graph( {
    element: document.querySelector("#chart"),
    width: screen.width - 200,
    height: 240,
    renderer: 'line',
    series: [
        {
            name: "seriesQ",
            data: seriesQ,
            color: colorQ
        },
        {
            name: "seriesD",
            data: seriesD,
            color: colorD
        },
    ]
} );
var windowQ = new Rickshaw.Graph( {
    element: document.querySelector("#chartQ"),
    width: screen.width*0.2,
    height: 300,
    renderer: 'line',
    series: [
        {
            name: "windowQ",
            data: seriesQ.slice(0,wDefault),
            color: colorQ
        },
    ]
} );
var windowD = new Rickshaw.Graph( {
    element: document.querySelector("#chartD"),
    width: screen.width*0.2,
    height: 300,
    renderer: 'line',
    series: [
        {
            name: "windowD",
            data: seriesD.slice(0,wDefault),
            color: colorD
        },
    ]
} );
var windowH = new Rickshaw.Graph( {
    element: document.querySelector("#chartH"),
    width: screen.width*0.2,
    height: 360,
    renderer: 'line',
    series: [
        {
            name: "haarQ",
            data: haarQ,
            color: colorQ
        },
        {
            name: "haarD",
            data: haarD,
            color: colorD
        },
    ]
} );

var x_axis = new Rickshaw.Graph.Axis.Time( { graph: graph } );
var x_axisQ = new Rickshaw.Graph.Axis.Time( { graph: windowQ } );
var x_axisD = new Rickshaw.Graph.Axis.Time( { graph: windowD } );
var x_axisH = new Rickshaw.Graph.Axis.Time( { graph: windowH } );

var y_axis = new Rickshaw.Graph.Axis.Y( {
    graph: graph,
    orientation: 'left',
    tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
    element: document.getElementById('y_axis'),
} );
var y_axisQ = new Rickshaw.Graph.Axis.Y( {
    graph: windowQ,
    orientation: 'left',
    tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
    element: document.getElementById('y_axisQ'),
} );
var y_axisD = new Rickshaw.Graph.Axis.Y( {
    graph: windowD,
    orientation: 'left',
    tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
    element: document.getElementById('y_axisD'),
} );
var y_axisH = new Rickshaw.Graph.Axis.Y( {
    graph: windowH,
    orientation: 'left',
    tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
    element: document.getElementById('y_axisH'),
} );

var legend = new Rickshaw.Graph.Legend( {
    element: document.querySelector('#legend'),
    graph: graph
} );
var legendQ = new Rickshaw.Graph.Legend( {
    element: document.querySelector('#legendQ'),
    graph: windowQ
} );
var legendD = new Rickshaw.Graph.Legend( {
    element: document.querySelector('#legendD'),
    graph: windowD
} );
var legendH = new Rickshaw.Graph.Legend( {
    element: document.querySelector('#legendH'),
    graph: windowH
} );

var shift_forwardQ = document.getElementById('shift_forwardQ');
var shift_backwardQ = document.getElementById('shift_backwardQ');
var shift_forwardD = document.getElementById('shift_forwardD');
var shift_backwardD = document.getElementById('shift_backwardD');
var window_offsetQ = 0;
var window_offsetD = 0;
function shifting_renew() {
    windowQ.series[0].data = seriesQ.slice(window_offsetQ, window_offsetQ+wDefault);
    windowD.series[0].data = seriesD.slice(window_offsetD, window_offsetD+wDefault);
    windowQ.render();
    windowD.render();
    haarQ = haar1d(seriesQ.slice(window_offsetQ, window_offsetQ+wDefault));
    haarD = haar1d(seriesD.slice(window_offsetD, window_offsetD+wDefault));
    for(var i = 0; i < wDefault; i++) {
        haarQ[i].x = i;
        haarD[i].x = i;
    }
    windowH.series[0].data = haarQ;
    windowH.series[1].data = haarD;
    windowH.render();
    var sQ = [];
    for(i = window_offsetQ; i < window_offsetQ+wDefault; i++) {
        sQ[i-window_offsetQ] = seriesQ[i].y;
    }
    var sD = [];
    for(i = window_offsetD; i < window_offsetD+wDefault; i++) {
        sD[i-window_offsetD] = seriesD[i].y;
    }
    var hQ = [];
    for(i = 0; i < wDefault; i++) {
        hQ[i] = haarQ[i].y;
    }
    var hD = [];
    for(i = 0; i < wDefault; i++) {
        hD[i] = haarD[i].y;
    }
    document.getElementById('seriesQ').innerHTML = 'seriesQ_window: ' + sQ;
    document.getElementById('seriesD').innerHTML = 'seriesD_window: ' + sD;
    document.getElementById('haarQ').innerHTML = 'haarQ: ' + hQ;
    document.getElementById('haarD').innerHTML = 'haarD: ' + hD;
    document.getElementById('D1').innerHTML = 'D1 = ' + D1(windowD.series[0].data,windowQ.series[0].data).toString();
}
shift_forwardQ.onclick = function(e) {
    if(window_offsetQ < lenQ-wDefault)
        window_offsetQ += 1;
    shifting_renew();
};
shift_backwardQ.onclick = function(e) {
    if(window_offsetQ > 0)
        window_offsetQ -= 1;
    shifting_renew();
};
shift_forwardD.onclick = function(e) {
    if(window_offsetD < lenD-wDefault)
        window_offsetD += 1;
    shifting_renew();
};
shift_backwardD.onclick = function(e) {
    if(window_offsetD > 0)
        window_offsetD -= 1;
    shifting_renew();
};

graph.render();
windowQ.render();
windowD.render();
windowH.render();

var sample_point = {
    init: function(t, v) {
        this.x = t;
        this.y = v;
    },

    debug: function() {
        console.log(this.x.toString() + ', ' + this.y.toString());
    }
};
var LPM_object = {
    init: function(px, py) {
        this.x = px;
        this.y = py;
    },

    debug: function() {
        console.log(this.x.toString() + ', ' + this.y.toString());
    }
};

/* simple unit test for object creation
var s1 = Object.create(sample_point);
s1.init(0,5);
s1.debug();
*/
var lenQ = 40;
var lenD = 120;
var yRange = 30;
var wDefault = 8;
var seriesQ = []; // length = 20 (n=20)
var seriesD = []; // length = 30 (m=30)

for(var i = 0; i < lenQ; i++) {
    seriesQ[i] = Object.create(sample_point); 
    seriesQ[i].init(i, Math.floor((Math.random() * yRange) + 1)); 
}
for(var i = 0; i < lenD; i++) {
    seriesD[i] = Object.create(sample_point); 
    seriesD[i].init(i, Math.floor((Math.random() * yRange) + 1)); 
}

/**** test ****/
var testQ = [8, 16, 3, 8, 23, 0, 15, 10, 0, 15, 30, 0, 0, 8, 15, 20, 5, 12, 5, 10]
var testD = [30,20,10,20,30,10, 15, 5, 10, 20, 0, 15, 10, 0, 15, 25, 0, 8, 14, 22, 5, 12, 8, 22, 4, 10, 20, 30, 20, 10]
//var testD = [ 22.0, 9.0, 27.0, 16.0, 20.0, 18.0, 14.0, 14.0, 14.0, 5.0, 32.0, 33.0, 12.0, 28.0, 34.0, 40.0, 42.0, 35.0, 28.0];
//var testQ =  [ 13.0, 7.0, 40.0, 42.0, 15.0, 22.0, 28.0, 34.0];

var testObjQ = [];
var testObjD = [];

for(var i = 0; i < testQ.length; i++) {
    testObjQ[i] = Object.create(sample_point);
    testObjQ[i].init(i, testQ[i]);
}
for(var i = 0; i < testD.length; i++) {
    testObjD[i] = Object.create(sample_point);
    testObjD[i].init(i, testD[i]);
}
/**************/
// uncomment if using the static test series
/*
seriesQ = testObjQ;
seriesD = testObjD;
lenQ = seriesQ.length;
lenD = seriesD.length;
*/


function haar1d(series) {
    var i = 0;
    var n = series.length;
    var w = n;
    var haared_series = [];
    var series_copy = series.slice();
    for(i = 0; i < n; i++) {
        haared_series[i] = Object.create(sample_point);
        haared_series[i].init(series[i].x, 0);
    }
    while(w > 1)
    {
        w/=2;
        for(i = 0; i < w; i++)
        {
            haared_series[i].y = (series_copy[2*i].y + series_copy[2*i+1].y)/Math.sqrt(2.0);
            haared_series[i+w].y = (series_copy[2*i].y - series_copy[2*i+1].y)/Math.sqrt(2.0);
        }
        for ( i = 0; i < w * 2; i++ )
        {
          series_copy[i] = haared_series[i];
        }
    }
    return haared_series;
}

var haarD = haar1d(seriesD.slice(0,8));
var haarQ = haar1d(seriesQ.slice(0,8));

/* v1: 1d-array; v2: 1d-array */
function two_norm(v1, v2) {
    var n = v1.length;
    var sum = 0.0; 
    for(var i=0; i<n; i++) {
        sum += Math.pow(v1[i]-v2[i], 2.0);
    }
    return Math.sqrt(sum);
}

/* frameD is a window of seriesD; frameQ is a window of seriesQ*/
function D1(frameD, frameQ) {
    var haar_frameD = haar1d(frameD);
    var haar_frameQ = haar1d(frameQ); 
    var yhaarD = [];
    var yhaarQ = [];
    for(var i = 0; i < wDefault; i++) {
        yhaarD[i] = haar_frameD[i].y;
        yhaarQ[i] = haar_frameQ[i].y;
    }
    
    var dif_amp = Math.abs(yhaarD[0]-yhaarQ[0]);
    var dif_shp = two_norm(yhaarD.slice(1,wDefault), yhaarQ.slice(1,wDefault));
    return dif_amp + dif_shp; 
}




var LPM_matching = [];
var LPM_D1_scores = [];

/**
 * series: 1d-array of Object-sample_point (defined above),
 * query: 1d-array of Object-sample_point (defined above),
 * window_size: default = 8,
 * epsilon: tolerance of similarity of shape (the higher, the more tolerant)
 * return: an Object with: { target.bestX = the best position,
 *                           target.scaleFactor = how much you'd have to compress the query to match
 *                           target.bestHit = the match strength (lower is better)
 *                         }
*/
function spade(series, query, window_size, epsilon) {
    window_size = typeof window_size !== 'undefined' ? window_size : 8; 
    epsilon = typeof epsilon !== 'undefined' ? epsilon : 5; 
    var m = query.length-wDefault+1;
    var n = series.length-wDefault+1;
    var frameQ, frameD;
    for(var i = 0; i < m; i++) {
        LPM_matching[i] = [];
        LPM_D1_scores[i] = [];
        frameQ = query.slice(i, i+wDefault); 
        for(var j = 0; j < n; j++) {
            frameD = series.slice(j, j+wDefault); 
            LPM_D1_scores[i][j] = D1(frameD, frameQ);
            if(LPM_D1_scores[i][j] < epsilon) {
                LPM_matching[i][j] = 1;
            }
            else { 
                LPM_matching[i][j] = 0;
            }
        }
    }
    //console.debug(LPM_matching);
    //console.debug(LPM_D1_scores);
    heatmap_entity = {};
    LPM_heatmap = [];
    for(var i = 0; i < m; i++) {
        for(var j = 0; j < n; j++) {
            LPM_heatmap[i*n+j] = Object.create(heatmap_entity);  
            LPM_heatmap[i*n+j].value = (LPM_matching[i][j] > 0)? -1 : 0;
            LPM_heatmap[i*n+j].row = i;
            LPM_heatmap[i*n+j].col = j; 
        }
    }
    heatmap(LPM_heatmap, m, n);
    
    var starting_cands = [];
    var tmp_idx = 0;
    for(var j = 0; j < n; j++) {
        if(LPM_matching[0][j] > 0.0) {
            starting_cands[tmp_idx++] = j;
        }
    } 
    var sizeS = tmp_idx;
    //console.debug(starting_cands);

    var distance_matrix = [];
    var path_tracing = [];
    for(var i = 0; i < sizeS; i++) {
        distance_matrix[i] = [];
        path_tracing[i] = [];
        // compute_path from S
        distance_matrix[i] = compute_path(0,starting_cands[i],window_size,path_tracing[i]); 
    }   
    //console.debug(distance_matrix);
    //console.debug(path_tracing);
    var minD = Infinity;
    var chosenS;
    for(var i = 0; i < sizeS; i++) {
        if(distance_matrix[i] < minD) {
            minD = distance_matrix[i];
            chosenS = i;
        }
        else if(distance_matrix[i] == minD && minD != Infinity) {
            if(path_tracing[i][path_tracing[i].length - 1].y - starting_cands[i] < path_tracing[chosenS][path_tracing[chosenS].length - 1].y - starting_cands[chosenS]) {
                chosenS = i;    
            }
        }
    }
    //alert('chosenS = (0, ' + starting_cands[chosenS] + '); chosenE = (' + path_tracing[chosenS][path_tracing[chosenS].length - 1].x + ', ' + path_tracing[chosenS][path_tracing[chosenS].length - 1].y + ')');
    if(typeof chosenS === 'undefined') {
        //alert('No output. Relax the tolerance and run again.');
        return spade(series, query, window_size, epsilon+3);
    }
    console.debug(starting_cands[chosenS]);
    console.debug(distance_matrix);
    console.debug(path_tracing[chosenS]);


    var matching_score = 0.0;
    matching_score += LPM_D1_scores[0][starting_cands[chosenS]];
    LPM_heatmap[starting_cands[chosenS]].value = 1;
    for(var i = 0; i < path_tracing[chosenS].length; i++) {
        matching_score += LPM_D1_scores[path_tracing[chosenS][i].x][path_tracing[chosenS][i].y];
        LPM_heatmap[path_tracing[chosenS][i].x * n + path_tracing[chosenS][i].y].value = 1;
    }
    matching_score /= path_tracing[chosenS].length+1;
    heatmap(LPM_heatmap, m, n);

    var target = {
        bestX: starting_cands[chosenS],
        scaleFactor: (path_tracing[chosenS][path_tracing[chosenS].length - 1].y - starting_cands[chosenS] + window_size) / parseFloat(query.length) ,
        bestHit: matching_score
    };
    return target;

}

// searching region: (x+w/2 ~ x+(3/2)w, y+w/2 ~ y+(3/2)w) 
// ** greedy version **
function compute_path(px, py, w, path_list) {
    if(LPM_matching.length == 1) {
        var chosenP = Object.create(LPM_object);
        var minD = Infinity;
        var chosenY = py;
        for (var y = py; y < LPM_matching[0].length; y++) {
            if(LPM_matching[px][y] != 0.0) {
                var curD = LPM_D1_scores[px][y];
                if(curD < minD) {
                    minD = curD;
                    chosenY = y;
                }
            } 
        }
        chosenP.init(px, chosenY);
        path_list.push(chosenP); 
        return LPM_D1_scores[px][chosenY];
    }
    if(px == LPM_matching.length - 1) {
        return 0;
    }
    var region_xmin = px + w/2;
    var region_xmax = px + w;
    var region_ymin = py + w/2;
    var region_ymax = py + w;
    //alert(region_xmin + ', ' + region_xmax + ', '+ region_ymin + ', ' + region_ymax);
    if(region_xmin >= LPM_matching.length - 1) {
        region_xmin = LPM_matching.length - 1;
        region_xmax = LPM_matching.length - 1;
    }
    if(region_xmax >= LPM_matching.length - 1) {
        region_xmax = LPM_matching.length - 1;
    }
    if(region_ymin >= LPM_matching[0].length - 1) {
        region_ymin = LPM_matching[0].length - 1;
        region_ymax = LPM_matching[0].length - 1;
    }
    if(region_ymax >= LPM_matching[0].length - 1) {
        region_ymax = LPM_matching[0].length - 1;
    }
    var minD = Infinity;
    var chosenX = region_xmin;
    var chosenY = region_ymin;
    var find_matching = false;
    for(var x = region_xmin; x <= region_xmax; x++) {
        for(var y = region_ymin; y <= region_ymax; y++) {
            if(LPM_matching[x][y] == 0.0) {
                continue;
            }
            else {
                find_matching = true;
            }
            var curD = distance_LPM(px,py,x,y,w);
            if(curD < minD) {
                minD = curD;
                chosenX = x;
                chosenY = y;
            }
        }
    }
    var chosenP = Object.create(LPM_object);
    chosenP.init(chosenX, chosenY);
    path_list.push(chosenP);
    return minD + compute_path(chosenX, chosenY, w, path_list);
}

function distance_LPM(x1, y1, x2, y2, w) {
    if(x1 == 0 || x2 == 0) {
        return D3(x1,y1,x2,y2,w);
    }
    else if(x2 == LPM_matching.length-1) {
        return D4(x1,y1,x2,y2,w);
    }
    else {
        return D2(x1,y1,x2,y2,w); 
    }

}

// x2 should be greater than x1
function D2(x1, y1, x2, y2, w) {
    var toReturn = 0.0;
    if(x2 <= x1) {
        return Infinity;
    }
    if(y2 <= y1) {
        return Infinity;
    }
    if(x2 > x1 + w) {
        toReturn += x2 - x1 - w;
    }
    if(y2 > y1 + w) {
        toReturn += y2 - y1 - w;
    } 
    // let h = 0 first
    return toReturn;
}

// Ps = (0, y1)
function D3(x1, y1, x2, y2, w) {
    if(x1 != 0) {
        return Infinity;
    } 
    if(x2 < (w/2.0)){
        return Infinity;
    }
    if(y1 > y2 - (w/2.0)) {
        return Infinity;
    }
    else {
        return x2+y2-y1-w;
    }
}

// Pe = (m, y2)
function D4(x1, y1, x2, y2, w) {
    if(x2 != LPM_matching.length-1) {
        return Infinity;
    } 
    if(x1 > LPM_matching.length-1-(w/2.0)) {
        return Infinity;
    }
    if(y2 < y1 + (w/2.0)) {
        return Infinity;
    }
    else {
        return LPM_matching.length - 1 - x1 - y1 + y2 - w;
    }
}

// for rendering the result on the webpage,
// remove it if not necessary
var matching_result;

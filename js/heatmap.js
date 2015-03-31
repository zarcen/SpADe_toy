function heatmap(data, r, c) {
    xLabels = [];
    yLabels = [];
    for(var i=0; i<c; i++)
        xLabels[i] = i;
    for(var i=0; i<r; i++)
        yLabels[i] = i;
    /*var data = [
        {value: 0.5, row: 0, col: 0},
        {value: 0.7, row: 0, col: 1},
        {value: 0.2, row: 1, col: 0},
        {value: 0.4, row: 1, col: 1}
        ];*/

        //height of each row in the heatmap
        //width of each column in the heatmap
        var gridSize = 20,
        h = gridSize,
        w = gridSize,
        rectPadding = 6;

        var colorLow = 'green', colorMed = 'grey', colorHigh = 'red';

        var margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = 25*c - margin.left - margin.right,
        height = 25*r - margin.top - margin.bottom;

        var colorScale = d3.scale.linear()
        .domain([-1, 0, 1])
        .range([colorLow, colorMed, colorHigh]);

        var svg = d3.select("#heatmap").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var heatMap = svg.selectAll(".heatmap")
        .data(data, function(d) { return d.col + ':' + d.row; })
        .enter().append("svg:rect")
        .attr("x", function(d) { return d.col * w; })
        .attr("y", function(d) { return d.row * h; })
        .attr("width", function(d) { return w; })
        .attr("height", function(d) { return h; })
        .style("fill", function(d) { return colorScale(d.value); });

        var xLabel = svg.selectAll(".xLabel")
        .data(xLabels)
        .enter().append("text")
        .text(function(d) { return d; })
        .attr("x", function(d, i) { return i * gridSize; })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class", function(d, i) { return "mono axis"; });

        var yLabel = svg.selectAll(".yLabel")
        .data(yLabels)
        .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize; })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", function (d, i) { return "mono axis"; });


}

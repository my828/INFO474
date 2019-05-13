'use strict';

(function() {
    let data = ""; // keep data in global scope
    let svgContainer = ""; // keep SVG reference in global scope
    let div = "";
    let color, avgViewers, year;
    window.onload = function() {
        svgContainer = d3.select('body').append('svg')
            .attr('width', 700)
            .attr('height', 500);
      
        svgContainer.append('text')
            .attr('x', 150)
            .attr('y', 20)
            .text('Average Viewership By Season');
        d3.csv('../data/Seasons.csv')
            .then((data) => makeHist(data));
    }

    function makeHist(csvData) {
        data = csvData;
        avgViewers = data.map((row) => parseFloat(row['Avg. Viewers (mil)']))
        year = data.map((row) => parseInt(row['Year']))

        let axesLimits = findMinMax(year, avgViewers); 

        let mapFunction = drawTicks(axesLimits);

        plotHist(mapFunction);
    }

    function plotHist(map) {
        let xMap = map.x;
        let yMap = map.y;

        // color 
        color = d3.scaleOrdinal()
            .domain(['Estimated', 'Actual'])
            .range(["#838383", "#46A4F6"])

        // legend
        var legend = svgContainer.selectAll('.legend')
            .data(color.domain().slice().reverse())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr("transform",function(d,i) {
                return "translate(0," + i * 20 + ")";
            });
        legend.append('rect')
            .attr('x', 530)
            .attr('y', 40)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', color)
        
        legend.append("text")
            .attr("x", 550)
            .attr("y", 50)
            .attr("dy",".35em")
            .style("text-anchor","start")
            .text(function(d) {
              return d.charAt(0).toUpperCase()+d.slice(1);
            });
        svgContainer.append('text')
            .attr("x", 520)
            .attr("y", 30)
            .text('Viewership Data')
        
        // Average horizonal line
        var sum = 0;
        avgViewers.map((data) => sum += data) 
        var avg = sum / avgViewers.length * 10 / 10;
        avg = Math.round(avg * 10)/10;


        // make tooltip
        div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
        svgContainer.selectAll('.bar') 
            .data(data)
            .enter()
            .append('rect')
                .attr('x', (d) => xMap(d) ) 
                .attr('y', yMap)
                .attr('width', 15)
                .attr('height', (d) => 450 - yMap(d))
                .attr('fill', function(d) { return color(d.Data)})
            .on('mouseover', (d) => {
                div.transition()
                    .duration(200)
                    .style('opacity', .9)
                div.html(
                    "<h3>" + "Season: " + d['Year'] + "</h3>" 
                    + "<br/>" + "Year: " + d['Year']
                    + "Episodes:" + d['Episodes']
                    + "Avg Viewers (mil): " + d['Avg. Viewers (mil)']
                    + "Most Watched Episode: " + d['Most Watched Episode']
                    + 'Viewers (mil): ' + d['Viewers (mil)']
                )
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
            })
            .on("mouseout", (d) => {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
                });
        svgContainer.selectAll(".text")        
        .data(data)
        .enter()
        .append("text")
            .attr("class","label")
            .attr("x", (function(d) { return xMap(d) + 6; }  ))
            .attr("y", function(d) { return yMap(d) - 3; })
            // .attr("dx", ".75em")
            .style('text-anchor', "middle")
            .text(function(d) { return d["Avg. Viewers (mil)"]; 
        }); 


        svgContainer.append('line')
            .style('stroke', 'gray')
            .attr('x1', 50)
            .attr('y1', map.yScale(avg))
            .attr('x2', 600)
            .attr('y2', map.yScale(avg))

        svgContainer.append('text')
            .attr("x", 50)
            .attr("y", 260)
            .style('background', "lightsteelblue")
            .text(avg)
    }
    // find min and max for GRE Scores and Chance of Admit
  function findMinMax(year, avgViewers) {

    // TODO: Use d3.min and d3.max to find the min/max of the greScores array
    let yearMin = d3.min(year);
    let yearMax = d3.max(year);

    // TODO: Use d3.min and d3.max to find the min/max of the  admissionRates array

    let viewMin = d3.min(avgViewers);
    let viewMax = d3.max(avgViewers);

    // round y-axis limits to nearest 0.05
    viewMin = Number((Math.ceil(viewMin*20)/20).toFixed(2));
    viewMax = Number((Math.ceil(viewMax*20)/20).toFixed(2));

    // return formatted min/max data as an object
    return {
      yearMin : yearMin,
      yearMax : yearMax,
      viewMin : viewMin,
      viewMax : viewMax
    }
  }
    // draw the axes and ticks
  function drawTicks(limits) {
    let xValue = function(d) { return d["Year"]; }

    // TODO: Use d3 scaleLinear, domain, and range to make a scaling function. Assign
    // the function to variable xScale. Use a range of [50, 450] and a domain of
    // [limits.greMin - 5, limits.greMax]
    // See here for more details:
    // https://www.tutorialsteacher.com/d3js/scales-in-d3
    let xScale = d3.scaleTime()
      .domain([limits.yearMin, limits.yearMax])
      .range([60, 570]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };
    // TODO: Use d3 axisBottom and scale to make the x-axis and assign it to xAxis
    // xAxis will be a function
    // See here for more details:
    // https://www.tutorialsteacher.com/d3js/axes-in-d3
    let xAxis = d3.axisBottom()
      .scale(
          d3.scaleTime()
            .domain([limits.yearMin - 1, limits.yearMax + 1])
            .range([45, 600])
      ).tickFormat(d3.format('d'))
      ;

    // TODO: use d3 append, attr, and call to append a "g" element to the svgContainer
    // variable and assign it a 'transform' attribute of 'translate(0, 450)' then
    // call the xAxis function
    svgContainer.append('g')
      .attr('transform', 'translate(0, 450)')
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

    // return Chance of Admit from a row of data
    let yValue = function(d) { return +d['Avg. Viewers (mil)']}

    // TODO: make a linear scale for y. Use a domain of [limits.admitMax, limits.admitMin - 0.05]
    // Use a range of [50, 450]

    let yScale = d3.scaleLinear()
      .domain([limits.viewMax + 2, limits.viewMin - 5])
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // TODO: use axisLeft and scale to make the y-axis and assign it to yAxis
    let yAxis = d3.axisLeft().scale(yScale);

    // TODO: append a g element to the svgContainer
    // assign it a transform attribute of 'translate(50, 0)'
    // lastly, call the yAxis function on it
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    svgContainer.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .text('Avg. Viewers (in millions)');

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }
})();


(function() {

    let data = "no data";
    let allYearsData = "no data";
    let svgContainer = '';
    let svgScatterPlot = '';
    let selected = '';
    let div = '';
    window.onload = function() {
        svgContainer = d3.select('body')
        .append('svg')
        .attr('width', 550)
        .attr('height', 550);


        d3.csv("./data/dataEveryYear.csv")
        .then((csvData) => {
            data = csvData;
            allYearsData = csvData;
            makeDropDown();

            // makeLineGraph(selected);
        })
    }
    
    function filterByYear(year) {
        yearData = allYearsData.filter((row) => row['time'] == year);
    }
      
    function makeDropDown() {
        var location = allYearsData.map((row) => row['location'])

        var distinct = (value, index, self) => {
            return self.indexOf(value) == index;
            }
            var distinctYears = location.filter(distinct)
            // dropdown 
            var dropDown = d3.select("body").append("select")
                        .attr("name", "country-list");
            var options = dropDown.selectAll("option")
                        .data(distinctYears)
                        .enter()
                        .append("option");
                        
            options.text(function(d) {
                        return d
                    })
                    .attr("value", function(d) {return d})
        
            dropDown.on("change", function() {
                selected = this.value;
                d3.selectAll("svg > *").remove()
                // makeScatterPlot(selected);      
                makeLineGraph(selected);
                makeCountryLabels(selected);
                svgScatterPlot = div
                .append('svg')
                .attr('width', 500)
                .attr('height', 500);
            })
    }

    function makeLineGraph(country) {
        svgContainer.html("");
        let countryData = allYearsData.filter((row) => row["location"] == country);
        let timeData = countryData.map((row) => row["time"]);
        let popData = countryData.map((row) => parseFloat(row["pop_mlns"]));

        let minMax = findMinMax(timeData, popData);
    
        let funcs = drawAxes(minMax, "time", "pop_mlns", svgContainer, {min: 100, max: 500}, {min: 50, max: 500});
        plotLineGraph(funcs, countryData);
      }
    
    function plotLineGraph(funcs, countryData) {
        let line = d3.line()
          .x((d) => funcs.x(d))
          .y((d) => funcs.y(d));
              // make tooltip
        div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        svgContainer.append('path')
          .datum(countryData)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5)
          .attr("d", line)
          .on('mouseover', (d) => {
            div.transition()
            .duration(200)
            .style("opacity", .9);
            div.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY ) + "px")
                .append(makeScatterPlot());
          })
          .on("mouseout", (d) => {
            div.transition()
              .duration(500)
              .style("opacity", 0);
          });
    
      }

    // make title and axes labels
  function makeCountryLabels(country) {
    svgContainer.append('text')
    .attr('x', 230)
    .attr('y', 30)
    .style('font-size', '14pt')
    .text(country);

    svgContainer.append('text')
        .attr('x', 270)
        .attr('y', 540)
        .style('font-size', '10pt')
        .text('Year');
    
    svgContainer.append('text')
        .attr('transform', 'translate(50, 350)rotate(-90)')
        .style('font-size', '10pt')
        .text('Population (Million)');
  }
      // draw the axes and ticks
  function drawAxes(limits, x, y, svg, rangeX, rangeY) {

    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin, limits.xMax]) // give domain buffer room
      .range([rangeX.min, rangeX.max]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format('d'))
    ;

    svg.append("g")
      .attr('transform', 'translate(0, ' + rangeY.max + ')')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax, limits.yMin]) // give domain buffer
      .range([rangeY.min, rangeY.max]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale).tickFormat(d3.format('.1f'));
    svg.append('g')
      .attr('transform', 'translate(' + rangeX.min + ', 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

      // find min and max for arrays of x and y
    function findMinMax(x, y) {
        // get min/max x values
        let xMin = d3.min(x);
        let xMax = d3.max(x);

        // get min/max y values
        let yMin = d3.min(y);
        let yMax = d3.max(y);
        // return formatted min/max data as an object
        return {
        xMin : xMin,
        xMax : xMax,
        yMin : yMin,
        yMax : yMax
        }
    }
          // make scatter plot with trend line
  function makeScatterPlot() {
    // get arrays of fertility rate data and life Expectancy data
    let fertility_rate_data = data.map((row) => parseFloat(row["fertility_rate"]));
    let life_expectancy_data = data.map((row) => parseFloat(row["life_expectancy"]));

    // find data limits
    let axesLimits = findMinMax(fertility_rate_data, life_expectancy_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "fertility_rate", "life_expectancy", svgScatterPlot, {min: 50, max: 250}, {min: 50, max: 250});

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

  }


  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    // get population data as array
    let pop_data = data.map((row) => +row["pop_mlns"]);
    let pop_limits = d3.extent(pop_data);

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // append data to SVG and plot as points
    svgScatterPlot.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', '5')
        .attr('fill', "#4286f4")

    svgScatterPlot.append('text')
    .attr('x', 20)
    .attr('y', 30)
    .style('font-size', '11pt')
    .text("All Countries Life Expectancy and Fertility Rate");
  
      svgScatterPlot.append('text')
        .attr('x', 50)
        .attr('y', 280)
        .style('font-size', '10pt')
        .text('Fertility Rates (Avg Children per Woman)');
  
      svgScatterPlot.append('text')
        .attr('transform', 'translate(10, 200)rotate(-90)')
        .style('font-size', '10pt')
        .text('Life Expectancy (years)');
  }
})();
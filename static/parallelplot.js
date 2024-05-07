let dimensions = ['Academic Score', 'Employer Score', 'Student Score', 'Citations Score', 'Faculty Rank', 'Research Rank', 'OverallScore', 'Expected Jnr Salary', 'Expected Snr Salary'];

function GetParallelPlot(fullData, data) {
    const margin = { top: 60, right: 150, bottom: 30, left: 50 };
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom - 20;

    d3.select("#parallelplot-svg").selectAll("*").remove();

    const svg = d3.select("#parallelplot-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left - 15},${margin.top - 20})`);

    svg
        .append("style")
        .text("path.hidden { stroke-opacity: 0;}");

    const x = d3.scalePoint().range([0, width+2]).domain(dimensions);
    const y = {};

    const varPosList = [];

    let start = 0;

    dimensions.forEach(d => {
        y[d] = d3.scaleLinear()
            .domain(d3.extent(data, p => p[d]))
            .range([height, 0]);

        varPosList.push({ dimension: d, xPos: start });
        start += 100;
    });

    const line = d3.line()
        .defined(d => !isNaN(d))
        .x((d, i) => x(dimensions[i]))
        .y((d, i) => y[dimensions[i]](d));


    // Assuming svg is your D3.js SVG element and data is the dataset for the parallel plot
    svg.selectAll("path")
        .data(data)
        .join("path")
        .attr("d", d => line(dimensions.map(dim => d[dim])))  // Map data through specified dimensions
        .attr("fill", "none")  // No fill, as it's a line
        .attr("stroke", "red")  // Change stroke color to yellow
        .attr("stroke-width", 0.5);  // Set stroke width


    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top - 40) + ")")
        .style("text-anchor", "middle")
        .text("Variables");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Values");

    let activeBrushes = new Map();

    const axes = svg.selectAll(".axis")
        .data(dimensions)
        .join("g")
        .attr("class", "axis")
        .attr("transform", (d, i) => `translate(${x(d)},0)`)
        .each(function (d) {
            const axisGroup = d3.select(this);

            axisGroup.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", height)
                .attr("stroke", "black");

            axisGroup.append("text")
                .attr("class", "axis-label")
                .attr("y", -10)  // Position the label above the axis
                .attr("x", 0)
                .attr("text-anchor", "middle")
                .attr("fill", "yellow")  // Set the text color to red
                .text(d);  // The text displayed on the axis


            axisGroup.call(d3.axisLeft().scale(y[d]));

            const brushes = axisGroup.append("g")
                .attr("class", "brush")
                .each(function (d) {
                    d3.select(this)
                        .call(d3.brushY()
                            .extent([[-5, 0], [10, height]])
                            .on("brush", brushed)
                            .on("end", brushEnd));
                });

            function updateBrushing() {
                svg.selectAll("path").classed("hidden", function (d) {
                    flag = false;
                    count = 0;
                    if (d != null) {
                        dimensions.forEach(attribute => {
                            if (activeBrushes.get(attribute)) {
                                const brushExtent = activeBrushes.get(attribute);
                                const attributeValues = data.map(item => item[attribute]);
                                const minValue = d3.min(attributeValues);
                                const maxValue = d3.max(attributeValues);
                                brushExtent1 = height - brushExtent[0];
                                brushExtent2 = height - brushExtent[1];
                                small = (maxValue - minValue) / height;
                                scaledMinValue = minValue + (small * brushExtent1);
                                scaledMaxValue = minValue + (small * brushExtent2);

                                if (d[attribute] < scaledMaxValue || d[attribute] > scaledMinValue) {
                                    flag = true;
                                    count +=1;
                                }
                            }
                        });
                    }
                    console.log("Count ",count)
                    return flag;
                });
            }

            function brushed(attribute) {
                activeBrushes.set(attribute, d3.event.selection);
                updateBrushing();
            }

            function brushEnd(attribute) {
                let filteredData = fullData.slice();
                dimensions.forEach(attr => {
                    if (activeBrushes.get(attr)) {            
                        const brushExtent = activeBrushes.get(attr);
                        const attributeValues = data.map(item => item[attr]);
                        const minValue = d3.min(attributeValues);
                        const maxValue = d3.max(attributeValues);
                        brushExtent1 = height - brushExtent[0];
                        brushExtent2 = height - brushExtent[1];
                        small = (maxValue - minValue) / height;
                        scaledMinValue = minValue + (small * brushExtent1);
                        scaledMaxValue = minValue + (small * brushExtent2);

                        filteredData = filteredData.filter(item => {
                            const value = item[attr];
                            return value >= scaledMaxValue && value <= scaledMinValue ;
                        });
                        console.log(attr, filteredData, activeBrushes, scaledMinValue, scaledMaxValue)
                    }
                });
                plotDots(filteredData);            
                console.log("Brush Ended");
            }            
        });
}
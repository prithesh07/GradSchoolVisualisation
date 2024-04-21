let dimensions = ['Academic Score','Employer Score','Student Score','Citations Score','Faculty Rank','Research Rank','Overall Score', 'Expected Jnr Salary', 'Expected Snr Salary'];

function GetParallelPlot(data) {
    const margin = { top: 60, right: 150, bottom: 30, left: 50 }; 
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select("#parallelplot-svg").selectAll("*").remove();

    const svg = d3.select("#parallelplot-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg
        .append("style")
        .text("path.hidden { stroke-opacity: 0;}");

    const x = d3.scalePoint().range([0, width]).domain(dimensions);
    const y = {};

    const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width + 25}, 20)`); // Adjust position as needed

    const colorScale1 = d3.scaleOrdinal(d3.schemeCategory10);
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
                    if(d!=null)
                    {   
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
                                
                                if(d[attribute] < scaledMaxValue || d[attribute] > scaledMinValue)
                                {
                                    flag = true;
                                }                                                        
                            }
                        });
                    }
                    return flag;            
                });
            }

            function brushed(attribute) {
                activeBrushes.set(attribute, d3.event.selection);
                updateBrushing();
            }

            function brushEnd(attribute) {
                console.log(attribute, activeBrushes)
                updateBrushing();
            }

            let draggedVarPos = null;
            axisGroup.call(d3.drag()
                .on("start", function () {
                    const xPos = varPosList.find(pos => pos.dimension === d).xPos;
                    axisGroup.style("opacity", 0.5);
                    draggedVarPos = { dimension: d, xPos: xPos };
                })
                .on("drag", function () {
                    const curXPos = d3.event.x;
                    axisGroup.attr("transform", `translate(${curXPos},0)`);
                })
                .on("end", function () {
                    const tc1 = document.getElementById('timeoutContainer1');
                    const tc2 = document.getElementById('timeoutContainer2');
                    const remove1 = tc1.querySelector('img');
                    const remove2 = tc2.querySelector('img');

                    if (remove1) {
                        tc1.removeChild(remove1);
                    }
                    if (remove2) {
                        tc2.removeChild(remove2);
                    }
                    axisGroup.style("opacity", 1);
                    const curXPos = d3.event.x;
                    let transPos = draggedVarPos.xPos;
                    if (curXPos < draggedVarPos.xPos) {
                        varPosList.forEach((pos, index) => {
                            if (curXPos < 0) {
                                transPos = 0;
                                varPosList.forEach((innerPos, innerIndex) => {
                                    if (innerPos.xPos >= curXPos && innerPos.xPos < draggedVarPos.xPos) {
                                        transPos = innerPos.xPos < transPos ? innerPos.xPos : transPos;
                                        console.log(`Crossed dimension: ${innerPos.dimension} at xPos: ${innerPos.xPos}`);
                                        let a = svg.selectAll(".axis")
                                            .filter((d, i) => d === innerPos.dimension)
                                            .transition()
                                            .attr("transform", `translate(${innerPos.xPos + 100},0)`);
                                    }
                                });
                            }
                            
                            else if (curXPos >= pos.xPos && curXPos < varPosList[index + 1]?.xPos) {
                                console.log(`Dragged between ${pos.dimension} and ${varPosList[index + 1]?.dimension}`);
                                varPosList.forEach((innerPos, innerIndex) => {
                                    if (innerPos.xPos >= curXPos && innerPos.xPos < draggedVarPos.xPos) {
                                        transPos = innerPos.xPos < transPos ? innerPos.xPos : transPos;
                                        console.log(`Crossed dimension: ${innerPos.dimension} at xPos: ${innerPos.xPos}`);
                                        let a = svg.selectAll(".axis")
                                            .filter((d, i) => d === innerPos.dimension)
                                            .transition()
                                            .attr("transform", `translate(${innerPos.xPos + 100},0)`);
                                    }
                                });
                            }
                        });
                        console.log("LefttransPos ", transPos);
                        axisGroup.transition().attr("transform", `translate(${transPos},0)`);
                    } else {
                        varPosList.forEach((pos, index) => {
                            if (curXPos > 1000) {
                                transPos = 1000;
                                varPosList.forEach((innerPos, innerIndex) => {
                                    if (innerPos.xPos <= curXPos && innerPos.xPos > draggedVarPos.xPos) {
                                        transPos = innerPos.xPos;
                                        console.log(`Crossed dimension: ${innerPos.dimension} at xPos: ${innerPos.xPos}`);
                                        let a = svg.selectAll(".axis")
                                            .filter((d, i) => d === innerPos.dimension)
                                            .transition()
                                            .attr("transform", `translate(${innerPos.xPos - 100},0)`);
                                    }
                                });
                            }
                            else if (curXPos <= pos.xPos && curXPos > varPosList[index - 1]?.xPos) {
                                console.log(`Dragged between ${varPosList[index - 1]?.dimension} and ${pos.dimension}`);
                                varPosList.forEach((innerPos, innerIndex) => {
                                    if (innerPos.xPos <= curXPos && innerPos.xPos > draggedVarPos.xPos) {
                                        transPos = innerPos.xPos;
                                        console.log(`Crossed dimension: ${innerPos.dimension} at xPos: ${innerPos.xPos}`);
                                        let a = svg.selectAll(".axis")
                                            .filter((d, i) => d === innerPos.dimension)
                                            .transition()
                                            .attr("transform", `translate(${innerPos.xPos - 100},0)`);
                                    }
                                });
                            }
                        });

                        console.log("RighttransPos ", transPos);
                        axisGroup.transition().attr("transform", `translate(${transPos},0)`);
                    }
                    const img1 = document.createElement('img');
                    img1.src = '/static/timeout.gif';
                    img1.width = 100;
                    img1.height = 100;
                    document.getElementById('timeoutContainer1').appendChild(img1);

                    const img2 = document.createElement('img');
                    img2.src = '/static/timeout.gif';
                    img2.width = 100;
                    img2.height = 100;
                    document.getElementById('timeoutContainer2').appendChild(img2);

                    setTimeout(() => {
                        varPosList.forEach((pos, index) => {
                            pos.xPos = parseFloat(svg.selectAll(".axis").filter(d => d === pos.dimension).attr("transform").split("(")[1].split(",")[0]);
                        });
                        varPosList.sort((a, b) => a.xPos - b.xPos);
                        varPosList.forEach((pos, index) => {
                            pos.xPos = index * 100;
                        });
                        dimensions = varPosList.map(pos => pos.dimension);
                        img1.remove();
                        img2.remove();
                    }, 3000);


                })
            );
        });
    console.log(varPosList);

}

function reorderData(data, varPosList) {
    const reorderedData = [];
    data.forEach(item => {
        const reorderedItem = {};
        varPosList.forEach(pos => {
            reorderedItem[pos.dimension] = item[pos.dimension];
        });
        reorderedData.push(reorderedItem);
    });
    return reorderedData;
}

function reorderData2(data, dimension) {
    const reorderedData = [];
    data.forEach(item => {
        const reorderedItem = {};
        reorderedItem[dimension] = item[dimension];
        Object.keys(item).forEach(key => {
            if (key !== dimension) {
                reorderedItem[key] = item[key];
            }
        });
        reorderedData.push(reorderedItem);
    });
    return reorderedData;
}

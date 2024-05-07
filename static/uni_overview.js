function drawCircle(value, name, rank2023, rank2024) {
    d3.select('#circleSvg').selectAll('svg').remove(); 

    value1 = value / 100 * 450;
    const svg = d3.select('#circleSvg')
      .append('svg')
      .attr('height', 160)
      .attr('width', 160);
  
    svg.append('circle')
      .attr('r', 70)
      .attr('cx', 80)
      .attr('cy', 80)
      .classed('animated-circle', true);
  
    const lg = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'GradientColor');
  
    lg.append('stop')
      .attr('offset', '0%')
      .style('stop-color', 'red');
  
    lg.append('stop')
      .attr('offset', '100%')
      .style('stop-color', 'yellow');

     const circle = svg.select('circle');
        circle.style('stroke-dasharray', 450)  // Define the dash pattern
             .style('stroke-dashoffset', 450);  // Set the initial offset
    
    const updateDashOffset = (newOffset) => {
        circle.transition()
              .style('stroke-dashoffset', newOffset);  // Update the offset
      };
    
    const num = document.getElementById('number');
    const uniname = document.getElementById('uniname');
    const text_info1 = document.getElementById('text-info1');
    const text_info2 = document.getElementById('text-info2');
    let flag = "equal";
    if(rank2023>rank2024)
     flag = "true";
    else if(rank2023<rank2024)
     flag = "false";

    drawTriangle(flag);
    text_info1.innerHTML = `${rank2023}`;
    text_info2.innerHTML = `${rank2024}`;
    
    uniname.innerHTML = `${name}`;
    let counter = 0;
  
    const interval = setInterval(() => {
      if (counter >= value) {
        clearInterval(interval); 
      } else {
        counter += 1;
        num.innerHTML = `${counter}%`; 
        updateDashOffset(450 - value1)
      }
    }, 1);  
  }

  function drawTriangle(isUpward) {
    const rankDiv = document.getElementById("rank");

    // Clear any existing content
    rankDiv.innerHTML = "";

    if (isUpward == "equal") {
        // Create SVG for a white equal sign
        const svg = `
            <svg width="15" height="15" viewBox="0 0 20 20">
                <line x1="4" y1="8" x2="16" y2="8" stroke="white" stroke-width="2"/>
                <line x1="4" y1="12" x2="16" y2="12" stroke="white" stroke-width="2"/>
            </svg>
        `;
        rankDiv.innerHTML = svg; // Add SVG to the div
    } else if (isUpward == "true") {
        // Create SVG for an upright green triangle
        const svg = `
            <svg width="15" height="15" viewBox="0 0 20 20">
                <polygon points="10,0 0,20 20,20" fill="green" />
            </svg>
        `;
        rankDiv.innerHTML = svg; // Add SVG to the div
    } else {
        // Create SVG for an inverted red triangle
        const svg = `
            <svg width="15" height="15" viewBox="0 0 20 20">
                <polygon points="10,20 0,0 20,0" fill="red" />
            </svg>
        `;
        rankDiv.innerHTML = svg; // Add SVG to the div
    }
}

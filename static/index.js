function GeneratePlots(data)
{
  const colsPPlot = ['Academic Score','Employer Score','Student Score','Citations Score','Faculty Rank','Research Rank','OverallScore', 'Expected Jnr Salary', 'Expected Snr Salary'];

  // Process data for the parallel plot
  const reducedDataPPlot = data.map(row => {
    const reducedRow = {};

    // Extract only the columns specified in `colsPPlot`
    colsPPlot.forEach(dim => {
      const value = parseFloat(row[dim]);
      reducedRow[dim] = value;  // Handle NaN
    });
    
    return reducedRow;
  });

  lineChartUni = [data[0].InstitutionName]
  radarUni = [data[0].Country]

  CreateGeoMap(data);
  GetParallelPlot(data, reducedDataPPlot);
  drawCircle(data[0].OverallScore, data[0].InstitutionName, data[0]["2023 RANK"], data[0]["2024 RANK"])
  drawLineChart(data)
  drawRadar(data)
}
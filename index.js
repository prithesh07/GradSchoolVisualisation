const colsGMap = ['Latitude', 'Longitude']; 
const colsPPlot = ['Academic Score','Employer Score','Student Score','Citations Score','Faculty Rank','Research Rank','Overall Score', 'Expected Jnr Salary', 'Expected Snr Salary'];

const rows = 300; 
d3.csv('universities.csv').then(function (data) {
  // Create a limited dataset by taking the first `rows` rows from the CSV
  const limitedData = data.slice(0, rows);

  // Process data for the geo map
  const reducedDataGMap = limitedData.map(row => {
    const reducedRow = {};

    // Extract only the columns specified in `colsGMap`
    colsGMap.forEach(dim => {
      const value = parseFloat(row[dim]);  // Convert to float
      reducedRow[dim] = isNaN(value) ? null : value;  // Handle NaN
    });

    return reducedRow;
  });

  // Process data for the parallel plot
  const reducedDataPPlot = limitedData.map(row => {
    const reducedRow = {};

    // Extract only the columns specified in `colsPPlot`
    colsPPlot.forEach(dim => {
      const value = parseFloat(row[dim]);  // Convert to float
      reducedRow[dim] = isNaN(value) ? null : value;  // Handle NaN
    });

    return reducedRow;
  });

  // Pass the processed data to the respective functions
  CreateGeoMap(reducedDataGMap);
  GetParallelPlot(reducedDataPPlot);
});
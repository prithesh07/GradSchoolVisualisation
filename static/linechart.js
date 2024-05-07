function drawLineChart(data)
{
    const filteredData = data.filter(row => lineChartUni.includes(row.InstitutionName));
    console.log("drawing line chart for universities", filteredData)
}
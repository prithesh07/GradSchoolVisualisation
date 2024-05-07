function drawRadar(data)
{
    const filteredData = data.filter(row => radarUni.includes(row.Country));
    console.log("drawing radar chart for countries", filteredData)
}
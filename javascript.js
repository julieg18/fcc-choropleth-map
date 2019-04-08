const USCountyLink = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";
const USEducationLink = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";
const colors = ["red", "orange", "green", "purple"]

const svg = d3.select("svg") 
  .attr("height", 800)
  .attr("width", 1000);

let path = d3.geoPath();

let firstReq = new XMLHttpRequest();
firstReq.open("GET", USCountyLink, true);
firstReq.send();
firstReq.onload = function() {
  let secondReq = new XMLHttpRequest();
  secondReq.open("Get", USEducationLink, true);
  secondReq.send();
  secondReq.onload = function() {
    const countyJSONdata = JSON.parse(firstReq.responseText);
    const educationJSONdata = JSON.parse(secondReq.responseText);

    let colorScale = d3.scaleQuantize()
      .domain([
        d3.min(educationJSONdata, (d) => d["bachelorsOrHigher"]),
        d3.max(educationJSONdata, (d) => d["bachelorsOrHigher"])
      ])
      .range(colors);
    
    let geojson = topojson.feature(countyJSONdata, countyJSONdata.objects.counties);

    svg.selectAll("path")
      .data(geojson.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "county")
      .attr("data-fips", (d, i) => educationJSONdata[i]["fips"])
      .attr("data-education", (d, i) => educationJSONdata[i]["bachelorsOrHigher"])
      .attr("fill", (d, i) => colorScale(educationJSONdata[i]["bachelorsOrHigher"]));
  }
}

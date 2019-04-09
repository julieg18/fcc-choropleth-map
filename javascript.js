const USCountyLink = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";
const USEducationLink = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";
const colors = ["#efbbff", "#d896ff", "#be29ec", "#800080", "#660066"];

const svg = d3.select("svg") 
  .attr("height", 700)
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

    let geojson = topojson.feature(countyJSONdata, countyJSONdata.objects.counties);

    let colorScale = d3.scaleQuantize()
      .domain([
        d3.min(educationJSONdata, (d) => d["bachelorsOrHigher"]),
        d3.max(educationJSONdata, (d) => d["bachelorsOrHigher"])
      ])
      .range(colors);

    function getEducationData(countyData, educationData) {
      return educationJSONdata.filter(elem => elem.fips == countyData['id'])[0][educationData]
    };

    svg.selectAll("path")
      .data(geojson.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "county")
      .attr("data-fips", (d, i) => d["id"])
      .attr("data-education", (d, i) => getEducationData(d, 'bachelorsOrHigher'))
      .attr("fill", (d, i) => colorScale(getEducationData(d, 'bachelorsOrHigher')))
      //tooltip
      .on("mouseover", (d, i) => {
        d3.select('#tooltip')
          .style('visibility', 'visible')
          .style('left', `${event.pageX + 5}px`)
          .style('top', `${event.pageY - 30}px`)
          .attr('data-education', getEducationData(d, 'bachelorsOrHigher'))
          .html(`${getEducationData(d, 'area_name')}, ${getEducationData(d, 'state')} ${getEducationData(d, 'bachelorsOrHigher')}%`)
      })
      .on("mouseout", (d, i) => {
        d3.select('#tooltip')
          .style('visibility', 'hidden')
      });
  }
}

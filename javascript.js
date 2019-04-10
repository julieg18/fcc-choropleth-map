const USCountyLink = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';
const USEducationLink = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const colors = ['#d497c1', '#bf6fac', '#a64395', '#94258c', '#7c2073', '#712065', '#661d54'];

const svg = d3.select('svg') 
  .attr('height', 615)
  .attr('width', 950)

const legend = svg.append('g')
  .attr('id', 'legend')
  .attr('transform', 'translate(520, 0)');

let path = d3.geoPath();

let firstReq = new XMLHttpRequest();
firstReq.open('GET', USCountyLink, true);
firstReq.send();
firstReq.onload = function() {
  let secondReq = new XMLHttpRequest();
  secondReq.open('Get', USEducationLink, true);
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

    let legendText = [];
    
    function getLegendTextArray() {
      let minNum = parseFloat(d3.min(educationJSONdata, (d) => d["bachelorsOrHigher"]).toFixed(1));
      let maxNum = parseFloat(d3.max(educationJSONdata, (d) => d["bachelorsOrHigher"]).toFixed(1));
      let arrayNum = minNum;
      let averageNum = parseFloat(((maxNum - minNum) / (colors.length + 1)).toFixed(1));
      while (arrayNum <= maxNum) {
        legendText.push(arrayNum)
        arrayNum = parseFloat((arrayNum + averageNum).toFixed(1));
      }
      legendText.map((elem) => console.log(elem))
    };
    getLegendTextArray();

    function getEducationData(countyData, educationData) {
      return educationJSONdata.filter(elem => elem.fips == countyData['id'])[0][educationData]
    };

    svg.selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('class', 'county')
      .attr('data-fips', (d, i) => d['id'])
      .attr('data-education', (d, i) => getEducationData(d, 'bachelorsOrHigher'))
      .attr('fill', (d, i) => colorScale(getEducationData(d, 'bachelorsOrHigher')))
      //tooltip
      .on('mouseover', (d, i) => {
        d3.select('#tooltip')
          .style('visibility', 'visible')
          .style('left', `${event.pageX + 5}px`)
          .style('top', `${event.pageY - 30}px`)
          .style('background-color', colorScale(getEducationData(d, 'bachelorsOrHigher')))
          .attr('data-education', getEducationData(d, 'bachelorsOrHigher'))
          .html(`${getEducationData(d, 'area_name')}, ${getEducationData(d, 'state')} ${getEducationData(d, 'bachelorsOrHigher')}%`)
      })
      .on("mouseout", (d, i) => {
        d3.select('#tooltip')
          .style('visibility', 'hidden')
      });

    //legend

    legend.selectAll('rect')
      .data(colors)
      .enter()
      .append('rect')
      .attr('height', 25)
      .attr('width', 50)
      .attr('fill', (d, i) => colors[i])
      .attr('x', (d, i) => i * 51)
      .attr('y', 5);

    svg.selectAll('text')
      .data(legendText)
      .enter()
      .append('text')
      .attr('height', 5)
      .attr('width', 5)
      .attr('x', (d, i) => i * 50 + 510)
      .attr('y', (d, i) => 45)
      .text((d, i) => d + '%');
  }
}

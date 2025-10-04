
// D3.js Meteor Meter Map with colored land and water, zoom, and pin functionality

// Set these to match the HTML and CSS dimensions
const width = Math.max(document.getElementById('map-container').offsetWidth, 900);
const height = 500;

// Create the SVG and add a water background
const svg = d3.select("#map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("cursor", "crosshair");

// Water background (covers entire SVG)
svg.append("rect")
  .attr("class", "water")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", width)
  .attr("height", height);

// Projection and path setup
const projection = d3.geoEquirectangular()
  .scale(width / 7.5)
  .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// Add a group for countries and pins
const g = svg.append("g");

// Load world map and draw countries
d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(function(world) {
  const countries = topojson.feature(world, world.objects.countries).features;
  g.selectAll("path")
    .data(countries)
    .enter().append("path")
    .attr("class", "land") // uses style.css for land color
    .attr("d", path);
});

// D3 zoom behavior for pan and zoom
const zoom = d3.zoom()
  .scaleExtent([1, 10])
  .on("zoom", function(event) {
    g.attr("transform", event.transform);
  });

svg.call(zoom);

// Pin a point when the map is clicked
svg.on("click", function(event) {
  const transform = d3.zoomTransform(svg.node());
  const [x, y] = d3.pointer(event, svg.node());
  const invX = (x - transform.x) / transform.k;
  const invY = (y - transform.y) / transform.k;
  let coords = projection.invert([invX, invY]);
  if (!coords) return;
  const [lon, lat] = coords;

  // Remove previous pin
  svg.selectAll(".pin").remove();

  // Draw the pin
  g.append("circle")
    .attr("class", "pin")
    .attr("cx", invX)
    .attr("cy", invY)
    .attr("r", 8)
    .attr("fill", "#c21807")
    .attr("stroke", "#fff")
    .attr("stroke-width", 2);

  // Set the latitude/longitude inputs
  document.getElementById('latitude').value = lat.toFixed(4);
  document.getElementById('longitude').value = lon.toFixed(4);
});

// Calculate impact button logic
document.getElementById('calc-btn').onclick = function() {
  const lat = parseFloat(document.getElementById('latitude').value);
  const lon = parseFloat(document.getElementById('longitude').value);
  const dia = parseFloat(document.getElementById('diameter').value);
  const speed = parseFloat(document.getElementById('speed').value);

  if(isNaN(lat) || isNaN(lon) || isNaN(dia) || isNaN(speed)) {
    document.getElementById('impact-status').textContent = 'Please fill all fields with valid numbers.';
    return;
  }
  const damageRadius = Math.round((dia * speed) / 55 * 100) / 100;
  let severity = 'Minor';
  if(damageRadius > 2) severity = 'Severe';
  else if(damageRadius > 1) severity = 'Moderate';
  document.getElementById('impact-status').textContent =
    `Impact Detected: ${severity} damage radius ${damageRadius} km`;
};

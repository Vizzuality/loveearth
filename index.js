var baseurl = this.baseurl = 'http://{s}.api.cartocdn.com/base-flatblue/{z}/{x}/{y}.png';
var map = this.map = L.map('map').setView([50, 0.0], 2);
var basemap = this.basemap = L.tileLayer(baseurl, {
  attribution: 'data OSM - map CartoDB'
}).addTo(map);

var CARTOCSS = [
	'Map {',
	'-torque-time-attribute: "date";',
	'-torque-aggregation-function: "count(cartodb_id)";',
	'-torque-frame-count: 2048;',
	'-torque-animation-duration: 60;',
	'-torque-resolution: 2',
	'}',
	'#layer {',
	'  marker-width: 3;',
	'  marker-fill-opacity: 0.8;',
	'  marker-fill: #FEE391; ',
	'  comp-op: "lighten";',
	'  [value > 2] { marker-fill: #FEC44F; }',
	'  [value > 3] { marker-fill: #FE9929; }',
	'  [value > 4] { marker-fill: #EC7014; }',
	'  [value > 5] { marker-fill: #CC4C02; }',
	'  [value > 6] { marker-fill: #993404; }',
	'  [value > 7] { marker-fill: #662506; }',
	'}'
].join('\n');

var torqueLayer = new L.TorqueLayer({
	user       : 'viz2',
	table      : 'ow',
	cartocss: CARTOCSS
});
torqueLayer.error(function(err){
	for(error in err){
		console.warn(err[error]);
	}
});
torqueLayer.addTo(map);
torqueLayer.play()

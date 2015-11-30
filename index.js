$(document).ready(function() {

var PLACES = [
  [42.553080, -0.878906, 2, "World"],
  [37.815208598896255, -122.50511169433595, 13, "San Francisco"]
];

var baseurl = this.baseurl = 'http://{s}.tiles.mapbox.com/v4/smbtc.7d2e3bf9/{z}/{x}/{y}@2x.png?access_token=pk.eyJ1Ijoic21idGMiLCJhIjoiVXM4REppNCJ9.pjaLujYj-fcCPv5evG_0uA';

var map = this.map = L.map('map', {attributionControl: false, zoomControl: false}).setView(PLACES[0].slice(0,2), PLACES[0][2]);
var basemap = this.basemap = L.tileLayer(baseurl).addTo(map);

var satelliteUrl = 'https://tiles0.planet.com/v0/mosaics/open_california_re_20150601_20150831/{z}/{x}/{y}.png?api_key=7e2b6bec147f45da89e2d1de6ceee79f';
var satellite = L.tileLayer(satelliteUrl, {bounds: [[37.86767146248696, -122.39009857177734], [37.7627084265813, -122.62029647827148]], errorTileUrl: 'none.png'}).addTo(map);
satellite.setZIndex(996);

map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable()

var placeToggle = true, placeIndex = 1;
var placeNameEl = document.querySelector('#place-name');
placeNameEl.innerHTML = PLACES[0][3];
var move = function() {
  var currentIndex = placeIndex % (PLACES.length);
  map.setView(PLACES[currentIndex].slice(0,2), PLACES[currentIndex][2], {duration: 3});
  placeIndex += 1;

  if (placeIndex === PLACES.length-1) {
    setTimeout(move, 20000);
  } else {
    setTimeout(move, 10000);
  }

  placeNameEl.innerHTML = PLACES[currentIndex][3];
}
setTimeout(move, 10000);

var randomRender = true,
    renderIndex = 0;

var availableImages = [];
var allInstaImages = [];
var baseQueryURL = "https://aarondb.cartodb.com/api/v1/sql?q=";
var query = "SELECT t.cartodb_id, ST_X(t.the_geom) AS lon, ST_Y(t.the_geom) AS lat, t.created_time, t.thumbnail FROM aarondb.instadb_loveearth t";
$.get(baseQueryURL+query).done(function(results) {
  allInstaImages = results.rows.map(function(insta) {
    insta.created_time = moment(insta.created_time);
    return insta;
  });
});

//CustomTorqueLayer = L.TorqueLayer.extend({
  //render: function() {
    //if(this.hidden) return;
    //var t, tile, pos;
    //var canvas = this.getCanvas();
    //var ctx = canvas.getContext('2d');

    //var THICKNESS = Math.pow( 80, 2 ),
        //SPACING = 5,
        //MARGIN = 100,
        //COLOR = 255,
        //DRAG = 0.95,
        //EASE = 0.25,
        //dx, dy,
        //mx, my,
        //d, t, f,
        //a, b,
        //i, n,
        //w, h,
        //p, s,
        //r, c;

    //w = canvas.width;
    //h = canvas.height;

    //var COLS = w / SPACING;
    //var ROWS = h / SPACING;
    //var NUM_PARTICLES = COLS * ROWS;

    //if (!this.dotsSetup) {
      //this.list = [];

      //var particle = { vx: 0, vy: 0, x: 0, y: 0 };

      //for ( i = 0; i < NUM_PARTICLES; i++ ) {

        //p = Object.create(particle);
        //p.x = p.ox = SPACING * ( i % COLS );
        //p.y = p.oy = SPACING * Math.floor( i / COLS );

        //this.list[i] = p;
      //}

      //this.dotsSetup = true;
    //}

    //this.renderer.getTilePos = this.getTilePos.bind(this);

        //var mx = this.renderer.mx;
        //var my = this.renderer.my;
        //b = ( a = ctx.createImageData( w, h ) ).data;
        //for ( i = 0; i < NUM_PARTICLES; i++ ) {
          //p = this.list[i];

          //d = ( dx = mx - p.x ) * dx + ( dy = my - p.y ) * dy;
          //f = -THICKNESS / (d*10);

          //if ( d < THICKNESS ) {
            //t = Math.atan2( dy, dx );
            //p.vx += f * Math.cos(t);
            //p.vy += f * Math.sin(t);
          //}

          //p.x += ( p.vx *= DRAG ) + (p.ox - p.x) * EASE;
          //p.y += ( p.vy *= DRAG ) + (p.oy - p.y) * EASE;

          //b[n = ( ~~p.x + ( ~~p.y * w ) ) * 4] = b[n+1] = b[n+2] = COLOR, b[n+3] = 255;
        //}

        //ctx.putImageData( a, 0, 0 );
    //if (randomRender !== false) {
      //for(t in this._tiles) {
        //tile = this._tiles[t];
        //if (tile) {
          //// clear cache
          //if (this.animator.isRunning()) {
            //tile._tileCache = null;
          //}

          //pos = this.getTilePos(tile.coord);
          //ctx.setTransform(1, 0, 0, 1, pos.x, pos.y);

          //if (tile._tileCache) {
            //// when the tile has a cached image just render it and avoid to render
            //// all the points
            //this.renderer._ctx.drawImage(tile._tileCache, 0, 0);
          //} else {
            //this.renderer.renderTile(tile, this.key);
          //}
        //}
      //}
      //this.renderer.applyFilters();
    //} else {
      //this.renderer.mx = undefined;
      //this.renderer.my = undefined;
      //availableImages = [];
    //}
  //}
//});

var CARTOCSS = [
  'Map {',
  '  -torque-time-attribute: "created_time";',
  '  -torque-aggregation-function: "sum(likes)";',
  '  -torque-frame-count: 512;',
  '  -torque-animation-duration: 40;',
  '  -torque-resolution: 8',
  '}',
  '[value>5] {',
  '  marker-width: 6;',
  '}',
  '#layer {',
  '  marker-width: 3;',
  '  marker-fill: #24D3CD;',
  '}',
  '#layer[frame-offset=2] {',
  '  marker-width:4.5;',
  '  marker-fill-opacity:0.75;',
  '}',
  '#layer[frame-offset=3] {',
  '  marker-width:6.5;',
  '  marker-fill-opacity:0.5; ',
  '}'
].join('\n');

//var torqueLayer = new CustomTorqueLayer({
  //user       : 'aarondb',
  //table      : 'instadb_loveearth',
  //cartocss: CARTOCSS,
  //sql: 'SELECT * FROM instadb_loveearth WHERE EXTRACT(year FROM "created_time") = 2015'
//});

//torqueLayer.setZIndex(997);

//torqueLayer.error(function(err){
  //for(error in err){
    //console.warn(err[error]);
  //}
//});
//torqueLayer.addTo(map);
//torqueLayer.play()

var timelineRemoved = false;
cartodb.createLayer(map, "http://aarondb.cartodb.com/api/v2/viz/7efc5190-8ec8-11e5-91f0-0e5db1731f59/viz.json", {legends: false})
  .addTo(map)
  .done(function(layer) {
    layer.setZIndex(997);
    layer.on('change:time', function(change) {
      if (!timelineRemoved) {
        $('.cartodb-timeslider').remove();
        timelineRemoved = true;
      }

      var date = moment(change.time);
      allInstaImages.forEach(function(insta) {
        var range = moment.range(insta.created_time.clone().subtract(6, 'hours'), insta.created_time.clone().add(6, 'hours'));
        if (date.within(range) && alreadyDone.indexOf(insta) < 0) {
          var coords = map.latLngToLayerPoint(new L.LatLng(insta.lat, insta.lon));
          insta.x = coords.x;
          insta.y = coords.y;
          availableImages.push(insta);
          alreadyDone.push(insta);
        }
      });
    });

  });

cartodb.createLayer(map, "http://aarondb.cartodb.com/api/v2/viz/7bbbb470-9239-11e5-9a6c-0ecd1babdde5/viz.json", {legends: false})
  .addTo(map)
  .done(function(layer) {
    layer.setZIndex(995);
  });

var alreadyDone = [];
map.on('movestart', function() {
  randomRender = false;
  //torqueLayer.pause();
});

map.on('zoomend', function(event) {
  //torqueLayer.play();
});

map.on('moveend', function() {
  randomRender = true;
});

var easeInOutCirc = function(currentIteration, startValue, changeInValue, totalIterations) {
  if ((currentIteration /= totalIterations / 2) < 1) {
    return changeInValue / 2 * (1 - Math.sqrt(1 - currentIteration * currentIteration)) + startValue;
  }
  return changeInValue / 2 * (Math.sqrt(1 - (currentIteration -= 2) * currentIteration) + 1) + startValue;
}

var bounceDuration = 0.25, fps = 60;
var iterations = bounceDuration * fps;
var startSize = 0, endSize = 50;
var changePerItration = (endSize - startSize) / iterations;
var changeInValue = (endSize - startSize);
var currentIteration = 0;
var imageRendered = false;
var fadePercentage = 0;
var value;
var img, imgSrc;

var ImageLayer = L.CanvasLayer.extend({
  render: function() {
    var canvas = this.getCanvas();
    var ctx = canvas.getContext('2d');

    if (randomRender === false) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      imageRendered = false;
      fadePercentage = 0;
      img = undefined;
      imgSrc = undefined;
      return this.redraw();
    }

    if (!imageRendered) {
      ctx.globalAlpha = 1;
      value = easeInOutCirc(currentIteration, startSize, changeInValue, iterations);

      if (currentIteration < iterations) {
        currentIteration++;
      } else {
        currentIteration = 0;
        imageRendered = true;
      }
    } else {
      if (fadePercentage > 100) {
        imageRendered = false;
        fadePercentage = 0;
        img = undefined;
        imgSrc = undefined;
        ctx.restore();
      } else {
        fadePercentage += 10;
        ctx.globalAlpha = (1 - fadePercentage / 100);
      }
    }

    if (!img) {
      imgSrc = availableImages.pop();
      if (imgSrc === undefined) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return this.redraw();
      }

      img = new Image;
      img.onload = function(){
        ctx.save();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.arc(imgSrc.x, imgSrc.y, value/2, 0, 2 * Math.PI, false);
        ctx.clip();

        ctx.drawImage(img,imgSrc.x-(value/2),imgSrc.y-(value/2),value,value);

        ctx.restore();

        this.redraw();
      }.bind(this);
      img.onerror = function() {
        this.redraw();
        img = undefined;
      }

      img.src = imgSrc.thumbnail;
    } else {
      ctx.save();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.arc(imgSrc.x, imgSrc.y, value/2, 0, 2 * Math.PI, false);
      ctx.clip();

      ctx.drawImage(img,imgSrc.x-(value/2),imgSrc.y-(value/2),value,value);

      ctx.restore();
      this.redraw();
    }
  }
});

var imageLayer = new ImageLayer();
imageLayer.addTo(map);
imageLayer.setZIndex(999);

});

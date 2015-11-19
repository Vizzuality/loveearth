var dc = [38.91, -77.04],
  trd = [63.41, 10.41],
  brooklyn = [40.6928, -73.9903],
  sf = [37.7833, -122.4167];

var baseurl = this.baseurl = 'http://{s}.api.cartocdn.com/base-flatblue/{z}/{x}/{y}.png';
var map = this.map = L.map('map', {zoomControl: false}).setView(brooklyn, 10);
var basemap = this.basemap = L.tileLayer(baseurl, {
  attribution: 'data OSM - map CartoDB'
}).addTo(map);

map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable()

var placeToggle = true;
setInterval(function() {
  if (placeToggle = !placeToggle) {
    map.flyTo(brooklyn, 10, {duration: 5});
  } else {
    map.flyTo(sf, 10, {duration: 5});
  }
}, 15000);

var randomRender = true;

var renderIndex = 0;

var availableImages = [{path: './image.jpg', x: 25, y: 25}];
CustomTorqueLayer = L.TorqueLayer.extend({
  render: function() {
    if(this.hidden) return;
    var t, tile, pos;
    var canvas = this.getCanvas();
    var ctx = canvas.getContext('2d');

    var THICKNESS = Math.pow( 80, 2 ),
        SPACING = 4,
        MARGIN = 100,
        COLOR = 255,
        DRAG = 0.95,
        EASE = 0.25,
        dx, dy,
        mx, my,
        d, t, f,
        a, b,
        i, n,
        w, h,
        p, s,
        r, c;

    w = canvas.width;
    h = canvas.height;

    var COLS = w / SPACING;
    var ROWS = h / SPACING;
    var NUM_PARTICLES = COLS * ROWS;

    if (!this.dotsSetup) {
      this.list = [];

      var particle = { vx: 0, vy: 0, x: 0, y: 0 };

      for ( i = 0; i < NUM_PARTICLES; i++ ) {

        p = Object.create(particle);
        p.x = p.ox = SPACING * ( i % COLS );
        p.y = p.oy = SPACING * Math.floor( i / COLS );

        this.list[i] = p;
      }

      this.dotsSetup = true;
    }

    this.renderer.getTilePos = this.getTilePos.bind(this);

    if (randomRender !== false) {
      if (renderIndex % 10 === 0) {
        availableImages.push({
          path: './image.jpg',
          x: this.renderer.mx,
          y: this.renderer.my
        });
      }
      renderIndex++;
    }

    b = ( a = ctx.createImageData( w, h ) ).data;
    for ( i = 0; i < NUM_PARTICLES; i++ ) {
      p = this.list[i];

      d = ( dx = this.renderer.mx - p.x ) * dx + ( dy = this.renderer.my - p.y ) * dy;
      f = -THICKNESS / (d*10);

      if ( d < THICKNESS ) {
        t = Math.atan2( dy, dx );
        p.vx += f * Math.cos(t);
        p.vy += f * Math.sin(t);
      }

      p.x += ( p.vx *= DRAG ) + (p.ox - p.x) * EASE;
      p.y += ( p.vy *= DRAG ) + (p.oy - p.y) * EASE;

      b[n = ( ~~p.x + ( ~~p.y * w ) ) * 4] = b[n+1] = b[n+2] = COLOR, b[n+3] = 255;
    }

    ctx.putImageData( a, 0, 0 );

    if (randomRender !== false) {
      for(t in this._tiles) {
        tile = this._tiles[t];
        if (tile) {
          // clear cache
          if (this.animator.isRunning()) {
            tile._tileCache = null;
          }

          pos = this.getTilePos(tile.coord);
          ctx.setTransform(1, 0, 0, 1, pos.x, pos.y);

          if (tile._tileCache) {
            // when the tile has a cached image just render it and avoid to render
            // all the points
            this.renderer._ctx.drawImage(tile._tileCache, 0, 0);
          } else {
            this.renderer.renderTile(tile, this.key);
          }
        }
      }
      this.renderer.applyFilters();
    } else {
      this.renderer.mx = undefined;
      this.renderer.my = undefined;
      availableImages = [];
    }
  }
});

var CARTOCSS = [
  'Map {',
  '-torque-time-attribute: "created_time";',
  '-torque-aggregation-function: "count(cartodb_id)";',
        '-torque-frame-count: 4096;',
        '-torque-animation-duration: 300;',
        '-torque-resolution: 1',
  '}',
  '#layer {',
  '  marker-width: 3;',
        '  marker-fill: #7887AB;',
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

var torqueLayer = new CustomTorqueLayer({
  user       : 'aarondb',
  table      : 'instadb_brooklyn',
  cartocss: CARTOCSS
});

torqueLayer.setZIndex(999);

torqueLayer.error(function(err){
  for(error in err){
    console.warn(err[error]);
  }
});
torqueLayer.addTo(map);
torqueLayer.play()

map.on('movestart', function() {
  randomRender = false;
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
        fadePercentage += 2;
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
      img.src = imgSrc.path;
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
imageLayer.setZIndex(998);

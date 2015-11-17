var dc = [38.91, -77.04],
  trd = [63.41, 10.41],
  brooklyn = [40.6928, -73.9903],
  sf = [37.7833, -122.4167];

var baseurl = this.baseurl = 'http://{s}.api.cartocdn.com/base-flatblue/{z}/{x}/{y}.png';
var map = this.map = L.map('map').setView(brooklyn, 10);
var basemap = this.basemap = L.tileLayer(baseurl, {
  attribution: 'data OSM - map CartoDB'
}).addTo(map);

var placeToggle = true;
setInterval(function() {
  if (placeToggle = !placeToggle) {
    map.flyTo(brooklyn, 10, {duration: 5});
  } else {
    map.flyTo(sf, 10, {duration: 5});
  }
}, 15000);

var randomRender = true;

CustomTorqueLayer = L.TorqueLayer.extend({
  render: function() {
		if(this.hidden) return;
    var t, tile, pos;
    var canvas = this.getCanvas();
    var ctx = canvas.getContext('2d');

    var THICKNESS = Math.pow( 80, 2 ),
        SPACING = 5,
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

    if (!this.adamSetup) {
      this.list = [];

      var particle = { vx: 0, vy: 0, x: 0, y: 0 };

      for ( i = 0; i < NUM_PARTICLES; i++ ) {

        p = Object.create(particle);
        p.x = p.ox = SPACING * ( i % COLS );
        p.y = p.oy = SPACING * Math.floor( i / COLS );

        this.list[i] = p;
      }

      this.adamSetup = true;
    }

    var preX;
    var preY;
    b = ( a = ctx.createImageData( w, h ) ).data;
    for ( i = 0; i < NUM_PARTICLES; i++ ) {
      p = this.list[i];

      if (this.renderer.theTile) {
        pos = this.getTilePos(this.renderer.theTile.coord);
        if (this.renderer.mx !== preX) {
          this.renderer.mx += pos.x;
          preX = this.renderer.mx;
        }

        if (this.renderer.my !== preY) {
          this.renderer.my += pos.y;
          preY = this.renderer.my;
        }
      }

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

    } else {
      this.renderer.mx = undefined;
      this.renderer.my = undefined;
    }
  }
  //render: function() {
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

    //if (!this.adamSetup) {
      //this.list = [];

      //var particle = { vx: 0, vy: 0, x: 0, y: 0 };

      //for ( i = 0; i < NUM_PARTICLES; i++ ) {

        //p = Object.create(particle);
        //p.x = p.ox = MARGIN + SPACING * ( i % COLS );
        //p.y = p.oy = MARGIN + SPACING * Math.floor( i / COLS );

        //this.list[i] = p;
      //}

      //this.adamSetup = true;
    //}

    //if (randomRender === true) {
      //mx = Math.floor(Math.random() * (w + 1));
      //my = Math.floor(Math.random() * (h + 1));
    //}

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
  //}
});

var CARTOCSS = [
	'Map {',
	'-torque-time-attribute: "created_time";',
	'-torque-aggregation-function: "count(cartodb_id)";',
	'-torque-frame-count: 2048;',
	'-torque-animation-duration: 120;',
	'-torque-resolution: 2',
	'}',
	'#layer {',
	'  marker-width: 3;',
	'  marker-fill: #FEE391; ',
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

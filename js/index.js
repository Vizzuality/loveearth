$(document).ready(function() {

var PLACES = [
  [42.553080, -0.878906, 2, "World", 10000]
];

var baseurl = this.baseurl = 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png';

var map = this.map = L.map('map', {minZoom: 2, attributionControl: false, zoomControl: false}).setView(PLACES[0].slice(0,2), PLACES[0][2]);
var basemap = this.basemap = L.tileLayer(baseurl).addTo(map);

L.control.zoom({position: 'topright'}).addTo(map);

var labelsUrl = 'http://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png';
var labels = L.tileLayer(labelsUrl).addTo(map);
labels.setZIndex(998);

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

var showImages = true;
var torqueLayer;

var pauseTorque = function() {
  $('#toggle-torque').toggleClass('pause');
  torqueLayer.toggle();
  showImages = !showImages;
};

var pauseAnimation = function() {
  $('#toggle-torque').removeClass('pause');
  torqueLayer.pause();
  showImages = !showImages;
  availableImages = [];
};

$('#toggle-torque').on('click', pauseTorque);
map.on('dragend', pauseAnimation);
map.on('zoomend', function(event) {
  setTimeout(pauseAnimation, 500);
});

function createCookie(name, value) {
  document.cookie = name+"="+value+"; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1,c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length,c.length);
    }
  }
  return null;
}

if (readCookie('seenmodal') != 'yes') {
  $('.overlay').css('display', 'flex');
};

if (readCookie('seendescription') != 'yes') {
  $('#description').css('display', 'block');
  $('#map').addClass('description-open');
};

$('#close-description').on('click', function() {
  $('#description').fadeOut();
  $('#map').removeClass('description-open');
  createCookie('seendescription', 'yes');
});

$('#close-modal, .overlay').on('click', function() {
  $('.overlay').fadeOut();

  if (torqueLayer !== undefined && readCookie('seenmodal') != 'yes') {
    torqueLayer.play();
  }

  createCookie('seenmodal', 'yes');
});

var alreadyDone = [];
cartodb.createLayer(map, "http://aarondb.cartodb.com/api/v2/viz/7efc5190-8ec8-11e5-91f0-0e5db1731f59/viz.json", {legends: false})
  .addTo(map)
  .done(function(layer) {
    torqueLayer = layer;
    layer.setZIndex(997);

    if (readCookie('seenmodal') != 'yes') {
      layer.pause();
    }

    var timeBounds = layer.getTimeBounds();
    layer.on('change:time', function(change) {
      if (change.step === timeBounds.steps-1) {
        alreadyDone = [];
      }

      var date = moment(change.time);

      if (change.time.toString() !== 'Invalid Date') {
        $('#torque-time').html(date.format('Do MMM YYYY'));
      }

      allInstaImages.forEach(function(insta) {
        var range = moment.range(insta.created_time.clone().subtract(6, 'hours'), insta.created_time.clone().add(6, 'hours'));
        if (date.within(range) && alreadyDone.indexOf(insta) < 0) {
          var point = new L.LatLng(insta.lat, insta.lon);

          if (map.getBounds().contains(point)) {
            var coords = map.latLngToLayerPoint(point);
            insta.x = coords.x;
            insta.y = coords.y;
            availableImages.push(insta);
            alreadyDone.push(insta);
          }
        }
      });
    });

  });

cartodb.createLayer(map, "http://aarondb.cartodb.com/api/v2/viz/c613ce5a-9238-11e5-a848-0e31c9be1b51/viz.json", {legends: false})
  .addTo(map)
  .done(function(layer) {
    layer.options.maxZoom = 5;
    layer.setZIndex(994);
  });

var easeInOutCirc = function(currentIteration, startValue, changeInValue, totalIterations) {
  if ((currentIteration /= totalIterations / 2) < 1) {
    return changeInValue / 2 * (1 - Math.sqrt(1 - currentIteration * currentIteration)) + startValue;
  }
  return changeInValue / 2 * (Math.sqrt(1 - (currentIteration -= 2) * currentIteration) + 1) + startValue;
}

var bounceDuration = 0.25, fps = 60;
var iterations = bounceDuration * fps;
var startSize = 0, endSize = 100;
var changePerItration = (endSize - startSize) / iterations;
var changeInValue = (endSize - startSize);
var currentIteration = 0;
var imageRendered = false;
var fadePercentage = 0;
var value;
var img, imgSrc;

var ImageLayer = L.CanvasLayer.extend({
  render: function() {
    if (showImages === false) {
      return this.redraw();
    }

    var canvas = this.getCanvas();
    var ctx = canvas.getContext('2d');

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
      }.bind(this);

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

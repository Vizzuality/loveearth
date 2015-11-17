function main() {
    cartodb.createVis('map', 'http://team.cartodb.com/api/v2/viz/bc3b0b40-965e-11e4-980a-0e9d821ea90d/viz.json', {
        zoom: 3,
        center_lat: 5,
        center_lon: 0,
        tiles_loader: false
    })

    .done(function(vis, layers) {
        var map = vis.getNativeMap();
    })

    .error(function(err) {
        console.log(err);
    });
}


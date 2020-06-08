const mapbox = document.getElementById('map')
if(mapbox)
{
    var locations = JSON.parse(mapbox.dataset.locations);
    mapboxgl.accessToken = 'pk.eyJ1IjoiamF5ZXNoLWFnYXJ3YWwiLCJhIjoiY2thaTRvOWc3MG1xdDJzbzAzeXRsbXdlNiJ9.uZPy2TJJDG33UMih1YJXZw'

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jayesh-agarwal/ckai4ylit0l4p1imzgiidzixf',
        scrollZoom: false
    })

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((loc)=> {
        const el = document.createElement('div')
        el.className = 'marker'

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);

        bounds.extend(loc.coordinates)
    })

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    })
}
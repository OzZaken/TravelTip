export const mapService = {
    initMap,
    addMarker,
    panTo,
    placeMarkerAndPanTo
}

// Var that is used throughout this Module (not global)
var gMap

function initMap() {
    return _connectGoogleApi()

        .then(() => {
            gMap = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat: 32.0749831, lng: 34.9120554 },
                zoom: 13
            })
            return gMap
        })
}

function placeMarkerAndPanTo(lat, lng) {
    panTo(lat, lng)
    addMarker({ lat, lng })
}

function addMarker(loc) {
    return new google.maps.Marker({
        position: loc,
        map: gMap,
        title: 'Hello World!'
    })
}

function panTo(lat, lng) {
    gMap.panTo(new google.maps.LatLng(lat, lng))
}

function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    const API_KEY = 'AIzaSyDJOS8Lw2pOyAk7dwu1HRePE9DHKTIiAE4'
    // Create Google Map Script
    const elGoogleApi = document.createElement('script')
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
    elGoogleApi.async = true
    document.body.append(elGoogleApi)

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve
        elGoogleApi.onerror = (error) => reject('Google script failed to load:', error)
    })
}
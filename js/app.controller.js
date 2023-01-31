import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'
import { weatherService } from './services/weather.service.js'

window.onload = onInit
window.onAddMarker = onAddMarker
window.onPanTo = onPanTo
window.onGetUserPos = onGetUserPos
window.onRemoveLoc = onRemoveLoc
window.onSearchLocation = onSearchLocation
window.onCopyLink = onCopyLink
window.useWeatherData = useWeatherData

function onInit() {
    const initLocs = locService.getLocs()
        .catch((error) => console.error('Error: cannot init Locations:', error))

    const initMap = mapService.initMap()
        .then(map => addMapListener(map))
        .catch((error) => console.log('Error: cannot init map', error))

    Promise.all([initLocs, initMap])
        .then(() => {
            _setLocationByQueryParams()
            _renderLocs()
            useWeatherData()
        })
        .catch((error) => console.error('Error After Data initializing!', error))
}

function addMapListener(map) {
    map.addListener('click', (mapsMouseEvent) => {
        Swal.fire({
            input: 'text',
            icon: 'question',
            title: 'Enter new location?',
            inputPlaceholder: 'My favorite sunset spot',
            showCloseButton: true,
            showCancelButton: true
        })
            .then((res) => {
                if (res.isConfirmed) {
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'Location Saved',
                        showConfirmButton: true,
                        showCancelButton: true,
                        timer: 1000
                    })
                    return res.value
                }
                return null
            })
            .then((locationName) => {
                if (!locationName) return
                const lat = mapsMouseEvent.latLng.lat()
                const lng = mapsMouseEvent.latLng.lng()
                const pos = { lat, lng }
                onAddLocation(locationName, pos)
                mapService.placeMarkerAndPanTo(lat, lng)
            })
    })
}

// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}

function onAddMarker(lat, lng) {
    mapService.addMarker({ lat, lng })
}

function useWeatherData() {
    getPosition()
        .then(pos => {
            const { latitude, longitude } = pos.coords
            return weatherService.getWeather(latitude, longitude)
        })
        .then(_renderWeatherData)
}

function _renderWeatherData({ temp, feelsLike, humidity, description, icon }) {
    const strHTML = `
    <h2>Weather today</h2>
    <p>
    ${description} Humidity: ${humidity}%, Temp ${temp}℃, Feels like ${feelsLike}℃
    </p>
    `
    document.querySelector('.weather-container').innerHTML = strHTML
}

function onSearchLocation(ev, elForm) {
    ev.preventDefault()
    const locationName = elForm.querySelector('[name=search-loc]').value
    locService.searchLocation(locationName)
        .then(res => {
            const { lat, lng, name } = res
            onAddLocation(name, { lat, lng })
            onPanTo(lat, lng)
        })
}

function onGetUserPos() {
    getPosition()
        .then(pos => {
            const { latitude, longitude } = pos.coords
            onPanTo(latitude, longitude)
            onAddMarker(latitude, longitude)
            document.querySelector('.user-pos-container').hidden = false
            document.querySelector('.pos-container').innerHTML =
                `Latitude: ${pos.coords.latitude.toFixed(3)} </br> Longitude: ${pos.coords.longitude.toFixed(3)}`

        })
        .catch(err => {
            console.error('err!!!', err)
        })
}

function _setLocationByQueryParams() {
    console.log('window.location.search', window.location.search);
    const queryStringParams = new URLSearchParams(window.location.search)
    const lat = +queryStringParams.get('lat')
    const lng = +queryStringParams.get('lng')
    if (lat && lng) mapService.placeMarkerAndPanTo(lat, lng)
}

function onCopyLink(lat, lng) {
    const queryStringParams = `?lat=${lat}&lng=${lng}`
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryStringParams
    // const data = [new ClipboardItem({ "text/plain": new Blob([newUrl], { type: "text/plain" }) })]
    // navigator.clipboard.write(data)
    navigator.clipboard.writeText(newUrl)
        .then(() => {
            console.log("Copied to clipboard successfully!")
        }, () => {
            console.error("Unable to write to clipboard. :-(")
        })
}

function onPanTo(lat, lng) {
    mapService.panTo(lat, lng)
    onAddMarker(lat, lng)
}

function onAddLocation(locationName, pos) {
    locService.addLocation(locationName, pos)
    _renderLocs()
}

function onRemoveLoc(locId) {
    console.log('onRemoveLoc ~ locId', locId)
    locService.removeLoc(locId)
    _renderLocs()
}

function _renderLocs() {
    locService.getLocs()
        .then(locs => {
            const strHTMLs = locs.map(loc => {
                return `<tr class="loc-preview">
                <th>${loc.name}</th>
                
                <tr class="flex space-evenly">
                <td><b>Lng:</b>${loc.lng.toFixed(3)}</td>
                <td><b>Lat:</b>${loc.lat.toFixed(3)}</td>
                </tr>
                
                <tr class="flex btn-action-container">
                <button class="btn danger i i-delete" onclick="onRemoveLoc('${loc.id}')"></button>
                <button class="btn navigate i i-navigate" onclick="onPanTo(${loc.lat}, ${loc.lng})"></button>
                <button class="btn alert i i-copy" onclick="onCopyLink(${loc.lat}, ${loc.lng})"></button>
                </tr>

                </tr>
                `
            })
            document.querySelector('.loc-container').innerHTML = strHTMLs.join('')
        })
}
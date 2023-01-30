import { utilService } from './utils.services.js'
import { storageService } from './storage.services.js'

export const locService = {
    getLocs,
    addLocation: addLoc,
    removeLoc,
    searchLocation: searchLoc
}

const STORAGE_KEY = 'locsDB'

const LOCS = _loadFromStorage() || [
    {
        name: 'Tel Aviv-Yafo, Israel',
        lat: 32.085,
        lng: 34.782,
        id: utilService.makeId(5),
    }
]

function getLocs() {
    return Promise.resolve(LOCS)
}

function addLoc(name, pos) {
    LOCS.push(_createLocation(name, pos))
    _saveToStorage()
}

function _createLocation(name, { lat, lng }) {
    return {
        id: utilService.makeId(5),
        name,
        lat,
        lng
    }
}

function searchLoc(locationName) {
    return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=AIzaSyDJOS8Lw2pOyAk7dwu1HRePE9DHKTIiAE4`)
        .then(res => res.data.results[0])
        .then(res => {
            return {
                name: res.formatted_address,
                lat: res.geometry.location.lat,
                lng: res.geometry.location.lng
            }
        })
}
function removeLoc(locId) {
    const locIdx = LOCS.findIndex(loc => loc.id === locId)
    LOCS.splice(locIdx, 1)
    _saveToStorage()
}

function _saveToStorage() {
    storageService.save(STORAGE_KEY, LOCS)
}

function _loadFromStorage() {
    return storageService.load(STORAGE_KEY)
}
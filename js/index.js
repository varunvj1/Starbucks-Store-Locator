//API token key
mapboxgl.accessToken = 'pk.eyJ1IjoidmFydW52ajEiLCJhIjoiY2txczl0cng5MTU5ODJ1bzFsaGhra3Z6biJ9.W8R-7w5Tj56V9XFXKG6S5Q';

//Map display
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-118.358080, 34.063380],  //long lat
    zoom: 11,
});

//Default Marker display
// var marker = new mapboxgl.Marker().setLngLat([-118.358080, 34.063380]).addTo(map);

//Retrieve data from REST API
const getStores = () => {
    console.log("I'm in!");

    const API_URL = "http://localhost:3000/api/stores";

    fetch(API_URL).then((response) => {
        if (response.status == 200) {
            return response.json();
        }
        else {
            throw new Error(response.status);
        }
    }).then((data) => {
        console.log(data);
        addMarkers(data);
        setStoresList(data);
    })
}


//Execute callback when the map loads
map.on('load', () => {
    getStores();
});


const addMarkers = (stores) => {
    //Define "bounds" to zoom on the area having all the points that have stores on the map
    var bounds = new mapboxgl.LngLatBounds();

    //Iterate over all the stores
    stores.forEach((store, index) => {

        //Display popup card on click
        var popup = new mapboxgl.Popup()
            .setHTML(
                `<div class="popup-heading"> ${store.storeName} </div>
                <p> ${store.openStatusText}</p>
                <hr />
                <div>
                    <span class="popup-icon"> <i class="fas fa-location-arrow"></i> </span>
                    <span class="popup-icon-info">${store.addressLines[0]}</span>
                </div>
                <div>
                    <span class="popup-icon"> <i class="fas fa-phone-alt"></i> </span>
                    <span class="popup-icon-info">
                        <a href="tel:${store.phoneNumber}">${store.phoneNumber} </a>
                    </span>
                </div>
            `);

        //Define longitude and latitude coordinates
        var lng = store.location.coordinates[0];
        var lat = store.location.coordinates[1];

        //Set marker positions
        var marker = new mapboxgl.Marker().setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map);

        var lnglat = new mapboxgl.LngLat(lng, lat);

        bounds.extend(lnglat);
    });

    //Provide padding on the corners of the selected area of stores
    map.fitBounds(bounds, {
        padding: 50
    });
}

const setStoresList = (stores) => {
    let storesHTML = '';

    stores.forEach((store) => {
        storesHTML += `
        <div class="store-container">
            <div class="store-info-container">
                <div class="store-address-lines">
                    <div class="store-address">
                            ${store.addressLines[0]}
                    </div>
                    <div class="store-address">
                            ${store.addressLines[1]}
                    </div>
                </div>
            <div class="store-phone-number">
                ${store.phoneNumber}
            </div>
        </div>
    </div>
        `

        document.querySelector('.store-list').innerHTML = storesHTML;
    })
}

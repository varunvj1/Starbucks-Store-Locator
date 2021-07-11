//API token key
mapboxgl.accessToken = 'pk.eyJ1IjoidmFydW52ajEiLCJhIjoiY2txczl0cng5MTU5ODJ1bzFsaGhra3Z6biJ9.W8R-7w5Tj56V9XFXKG6S5Q';

//Map display
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-118.358080, 34.063380],  //long lat
    zoom: 11,
});

var marker;
var countMarkers = 0;


//Retrieve data from REST API
const getStores = () => {
    //Take user input
    let inputElem = document.querySelector('#zip-code');
    let zipCode = inputElem.value;

    if (!zipCode) {
        return;
    }

    const API_URL = `http://localhost:3000/api/stores/${zipCode}`;

    fetch(API_URL).then((response) => {
        if (response.status == 200) {
            return response.json();
        }
        else {
            throw new Error(response.status);
        }
    }).then((data) => {
        //if stores found
        if (data.length > 0) {
            //Clear prev search location markers
            clearLocations();

            //Add new location markers
            addMarkers(data);

            //Set the list
            setStoresList(data);

            //Create and display popup on click
            setOnClickListener(data);
        }
        //if stores NOT found
        else {
            clearLocations();
            noStoresFound();
        }
    })
}

//Press search icon OR press enter to search the zip code
document.querySelector('.fa-search').addEventListener('click', getStores);
const onEnter = (e) => {
    if (e.key == "Enter") {
        getStores();
    }
}

//Remove markers
const clearLocations = () => {
    //if markers exist of previous search
    if (countMarkers != 0) {
        for (let i = 0; i < countMarkers; i++) {
            let markerElem = document.getElementById(`marker-${i}`);
            markerElem.remove();
        }
        countMarkers = 0;
    }
}

const noStoresFound = () => {
    let html = `
    <div class="no-stores-found"> 
        No Stores Found
    </div>
    `;

    document.querySelector('.store-list').innerHTML = html;
}

const addMarkers = (stores) => {
    //Define "bounds" to zoom on the area having all the points that have stores on the map
    var bounds = new mapboxgl.LngLatBounds();

    //Set initial count to zero
    countMarkers = 0;

    //Iterate over all the stores
    stores.forEach((store, index) => {

        /* Create a div element for the marker. */
        var el = document.createElement('div');
        /* Assign a unique `id` to the marker. */
        el.id = "marker-" + index;
        /* Assign the `marker` class to each marker for styling. */
        el.className = 'marker';

        //Increment count of markers
        countMarkers++;

        el.addEventListener('click', function (e) {
            /* Fly to the point */
            flyToStore(store.location);
            /* Close all other popups and display popup for clicked store */
            createPopUp(store, index);

            /* Highlight listing in sidebar */
            // Remove prev active state in store list
            var activeItem = document.getElementsByClassName('active');
            // e.stopPropagation();
            if (activeItem[0]) {
                activeItem[0].classList.remove('active');
            }

            //Add .active class to the current selected list item
            let item = document.querySelector(`#link-${index}`);
            item.classList.add('active');

            //Scroll to the selecetd list item 
            document.getElementById(`link-${index}`).parentNode.scrollIntoView({ behavior: "smooth" });
        });

        //Define longitude and latitude coordinates
        var lng = store.location.coordinates[0];
        var lat = store.location.coordinates[1];

        //Set marker positions
        marker = new mapboxgl.Marker(el, { offset: [0, -23] }).setLngLat([lng, lat])
            // .setPopup(popup)
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

    stores.forEach((store, index) => {
        storesHTML += `
        <div class="store-container">
            <div id="link-${index}" class="store-info-container">
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
    </div> `;
    })

    document.querySelector('.store-list').innerHTML = storesHTML;
}


const setOnClickListener = (stores) => {

    //Add event listener to each list item
    stores.forEach((store, index) => {
        var item = document.querySelector(`#link-${index}`);

        //Fly to the selected coordinates
        item.addEventListener('click', () => {
            flyToStore(store.location);
            createPopUp(store, index);

            /* Highlight listing in sidebar */
            // Remove prev active state in store list
            var activeItem = document.getElementsByClassName('active');
            // e.stopPropagation();
            if (activeItem[0]) {
                activeItem[0].classList.remove('active');
            }

            //Add .active class to the current selected list item
            item.classList.add('active');
        })
    })
}


const flyToStore = (location) => {
    map.flyTo({
        center: location.coordinates,
        zoom: 15
    });
}

const createPopUp = (store, index) => {
    var popUps = document.getElementsByClassName('mapboxgl-popup');

    /** Check if there is already a popup on the map and if so, remove it */
    if (popUps[0]) popUps[0].remove();

    var popup = new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(store.location.coordinates)
        .setHTML(
            `<div id="marker-${index}" class="popup-heading"> ${store.storeName} </div>
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
        `)
        .addTo(map);
}

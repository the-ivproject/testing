// Mapbox token
const mapbox_token = 'pk.eyJ1Ijoibm92dXMxMDIwIiwiYSI6ImNrcGltcnp0MzBmNzUybnFlbjlzb2R6cXEifQ.GjmiO9cPjoIozKaG7nJ4qA'

//YOUR TURN: add your Mapbox token
mapboxgl.accessToken = mapbox_token
// mapboxgl.accessToken = 'pk.eyJ1Ijoibm92dXMxMDIwIiwiYSI6ImNrcGltcnp0MzBmNzUybnFlbjlzb2R6cXEifQ.GjmiO9cPjoIozKaG7nJ4qA'; let map = new mapboxgl.Map({ container: 'map', // container id style: 'mapbox://styles/mapbox/streets-v11', center: [-96, 37.8], // starting position zoom: 3 // starting zoom }); // Add geolocate control to the map. map.addControl( new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }) );

let map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // YOUR TURN: choose a style: https://docs.mapbox.com/api/maps/#styles
    center: [-101.67517342866886, 39.148784399009294], // starting position [lng, lat]
    // attributionControl: false
});

// geocoder/searchbar
let geocoder = new MapboxGeocoder({ // Initialize the geocoder
    accessToken: mapbox_token, // Set the access token
    mapboxgl: mapboxgl, // Set the mapbox-gl instance
});

// Add the geocoder to the map
map.addControl(geocoder);
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

let fetch = $.ajax({
    type: "GET",
    url: `https://api.mapbox.com/datasets/v1/novus1020/ckpmr3oan039k27ng6lp616xj/features?access_token=${mapbox_token}`,
    dataType: "json",
    success: function (data) {
        console.log('Data were loaded')
    }
}).done(geojson => {

    let list = document.getElementById('listing')
    let newEl = document.createElement('ul')
    newEl.id = 'newData'

    map.on('load', function () {

        map.addSource('novus', {
            'type': 'geojson',
            'data': geojson
        });

        map.addLayer({
            'id': 'novus',
            'source': 'novus',
            'type': 'circle',
            'paint': {
                'circle-color': '#4264fb',
                'circle-radius': 0,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
                'circle-opacity': 0
            },
        });

        map.on('movestart', function () {

        });

        let popup = new mapboxgl.Popup();

        let filterGroup = document.getElementById('menu');
        let id = []

        geojson.features.forEach((marker, i) => {
            popup = new mapboxgl.Popup();
            let type = marker.properties['type'];
            let layerID = type.replaceAll(" ", "-");
            let coors = marker.geometry.coordinates

            let provider = marker.properties['title']
            let address = marker.properties['address-display']
            let phone = marker.properties['phone']
            let web = marker.properties['provider-website']
            let filter = marker.properties['filter']

            let el = document.createElement('div');
            el.className = 'marker ' + layerID;

            let t = new mapboxgl.Marker(el)
                .setLngLat(coors)
                .setPopup(
                    popup
                    .setHTML(
                        `
                                <a>
                                <p class="query-res"><span class="small-date">${provider.replaceAll("Provider","")}</span>
                                <br>
                                <span style="font-weight:400;color:#0000008a;font-size:12px">${address}</span>
                                <br>
                                <span style="font-weight:normal;color:blue;font-size:12px">${phone} ${web}</span>
                                <br>
                                <span style="font-weight:normal;font-size:12px;;">${filter}</span>
                                </p>
                                </a>
                         `
                    )
                ).addTo(map);

            id.push(type.replaceAll(" ", "-"))
        })

        let distinct = (val, index, self) => {
            return self.indexOf(val) === index
        }

        let fil = id.filter(distinct)



        for (let i in fil) {

            let div = document.createElement('div')
            div.className = 'dbgCont'

            let lab = document.createElement('label')
            lab.innerText = fil[i].replaceAll("-", " ")
            lab.className = 'container'
            lab.setAttribute('for', fil[i])

            let input = document.createElement('input')
            input.id = fil[i]
            input.type = "checkbox"
            input.name = `radio${i}`
            input.checked = true

            let span = document.createElement('span')
            span.className = `checkmark c${i}`

            lab.appendChild(input)
            lab.appendChild(span)

            div.appendChild(lab);

            filterGroup.appendChild(div)

            document.getElementById(fil[i]).addEventListener('change', (val) => {
                let param = val.target.id

                let exist = document.querySelectorAll(`.${param}`)
                // let existList = document.querySelectorAll(`.${param}`)

                if (val.target.checked === false) {
                    for (let i in exist) {
                        exist[i].style.visibility = "hidden"
                        // exist[i].style.display = "none"
                    }
                } else {
                    for (let i in exist) {
                        exist[i].style.visibility = "visible"
                        // exist[i].style.display = "flex"
                    }
                }
            })

        }


        map.on('moveend', function () {
            let features = map.queryRenderedFeatures({
                layers: ['novus']
            });

            let list = document.getElementById('listing')

            if (features) {
                let newList = features.map(a => {
                    let coor = a.geometry.coordinates.map(c => {
                        return c.toFixed(3)
                    })
                    let data = `
                                <li class="sidebar-dropdown poi-${a.properties['type']}">
                                    <a>
                                        <p class="query-res"><span class="small-date">${a.properties['title'].replace("Provider", "")}</span>
                                        <br>
                                        <span style="font-weight:400;color:#0000008a;font-size:12px">${a.properties['address-display']}</span>
                                        <br>
                                        <span onclick="openInNewTab('${a.properties['provider-website']}')" style="font-weight:normal;color:blue;font-size:12px"> ${a.properties['phone']} | Website</span>
                                        <br>
                                        <span style="font-weight:normal;font-size:12px;;"> ${a.properties['filter']}</span>
                                        <input type="hidden" value=${coor[0]}>
                                        <input type="hidden" value=${coor[1]}>
                                        </p>
                                    </a>
                                </li>
                                `
                    return data
                })

                let newEl = document.createElement('ul')
                newEl.id = 'newData'

                if (newList.length !== 0) {
                    document.getElementById('default').style.display = "none"
                    newEl.innerHTML = newList.join(",").replaceAll(",", "")
                    list.appendChild(newEl)
                    document.getElementById('query-count').innerText = `${newList.length}`
                } else {
                    document.getElementById('newData').style.display = "none"
                    document.getElementById('default').style.display = "block"
                    document.getElementById('query-count').innerText = '0'
                }

                let removeList = list.querySelectorAll('ul')

                if (removeList.length > 3) {
                    removeList[2].remove()
                }

                let u = list.querySelectorAll('li')

                for (let i in u) {
                    if (i > 1) {
                        let l = u[i]

                        l.addEventListener("mouseover", (event) => {
                            let c = event.target.querySelectorAll("input")
                            let content = event.target.querySelectorAll(".query-res span")

                            let lat = c[0].value
                            let long = c[1].value

                            popup.setLngLat([lat, long])
                                .setHTML(`
                             <a>
                             <p class="query-res"><span class="small-date">${content[0].innerText}</span>
                             <br>
                             <span style="font-weight:400;color:#0000008a;font-size:12px">${content[1].innerText}</span>
                             <br>
                             <span style="font-weight:normal;color:blue;font-size:12px">${content[2].innerText}</span>
                             <br>
                             <span style="font-weight:normal;font-size:12px;;">${content[3].innerText}</span>
                             </p>
                             </a>
                             `)
                                .addTo(map);
                        })
                    }
                }
            }
        });
    })
})
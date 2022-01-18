AFRAME.registerComponent('finder', {
    
    init: function () {
        this.data = [];
        this.loaded = false;

        window.addEventListener('gps-camera-update-position', e => {
            if (this.loaded === false) {
                this._loadLocations(e.detail.position.longitude, e.detail.position.latitude);
                this.loaded = true;
            }
        });
    },

    _loadLocations: function (longitude, latitude) {
        const API_KEY = 'AIzaSyD99Ihem-EZloUlpZthX8BT1Vc0LtxP6_4';
        var scale = 100;
        var el = this.el;
        var heights = [-100, -60, -20, 20, 60, 100, 140, 200, 240, 280];
        var stevec = 0;
        console.log('longitude' + longitude);
        console.log('latitude' + latitude);
        console.log(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&type=restaurant&rankby=distance&radius=2000&key=${API_KEY}`);
        fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&type=restaurant&rankby=distance&key=${API_KEY}`, {mode: 'no-cors'})
            .then(function (response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    return;
                }
                raycaster = "objects: [data-raycastable]";
                response.json().then(function (data) {
                    this.data = data;
                    console.log(data);
                    console.log(stevec);
                    console.log(heights);
                    data.results.forEach(element => {
                        if (stevec <= 10) {
                            var name = element.name;
                            var elementType = element.types[0];
                            console.log(elementType, name);
                            const entity = document.createElement('a-image');

                            var imageSrcDef = '/augmented-adventure//images/' + "landmark" + '.png'
                            var imageSrc = '/augmented-adventure/images/' + elementType + '.png';

                            entity.classList.add("clickable");
                            const entity_text = document.createElement('a-text');
                            entity_text.setAttribute("value", name);

                            entity_text.setAttribute("align", "center");
                            entity_text.setAttribute('position', {
                                x: 0,
                                y: -0.8,
                                z: 0
                            });
                            entity.appendChild(entity_text);

                            try {
                                entity.setAttribute('src', imageSrc);
                            }
                            catch (err) {
                                entity.setAttribute('src', imageSrcDef);
                            }
                            entity.setAttribute('look-at', '[gps-projected-camera]');
                            entity.setAttribute('value', element.name);

                            var modal = document.getElementById("myModal");
                            var span = document.getElementsByClassName("close")[0];

                            span.onclick = function () {
                                modal.style.display = "none";
                            }
                            window.onclick = function (event) {
                                if (event.target == modal) {
                                    modal.style.display = "none";
                                }
                            }
                            var rating = element.rating;
                            var openingHours = "";
                            if (typeof (element.opening_hours) !== 'undefined') var openingHours_boolean = element.opening_hours.open_now;
                            if (openingHours_boolean == true) openingHours = "Odprto"
                            if (openingHours_boolean == false) openingHours = "Zaprto"

                            entity.setAttribute('color', '#4CC3D9');
                            //  entity.setAttribute('event-set__enter', '_event: click; color: #8FF7FF');
                            //  entity.setAttribute('event-set__leave', '_event: click; color: #000000');    
                            lat = element.geometry.location.lat;
                            lng = element.geometry.location.lng;

                            var distance = getDistanceFromLatLonInKm(latitude, longitude, lat, lng);
                            normalized_distance = distance / 1.5
                            if (distance > 0.01)
                                scale = distance * 200;
                            else scale = 10;
                            entity.setAttribute('scale', {
                                x: scale,
                                y: scale,
                                z: scale
                            });
                            if (distance > 0.1) height = heights[stevec];
                            else height = 0;
                            entity.setAttribute('position', {
                                x: 0,
                                y: height,
                                z: 0
                            });
                            stevec++;
                            console.log(distance);
                            entity.setAttribute('gps-projected-entity-place', {
                                latitude: lat,
                                longitude: lng
                            });

                            var name = element.name;
                            var photoreference = element.photos[0].photo_reference;
                            var image_url = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoreference}&sensor=false&maxheight=1000&maxwidth=300&key=${API_KEY}`
                            console.log("imageurl", image_url);

                            entity.addEventListener('click', function () {
                         
                                modal.style.display = "block";
                                document.getElementById("name").innerHTML = name;
                                document.getElementById("image").src = image_url;
                                document.getElementById("rating").innerHTML = "ocena obiskovalcev: " + rating;
                                document.getElementById("distance").innerHTML = "zračna razdalja: " + distance.toFixed(2);

                                if (openingHours !== "")
                                    document.getElementById("opening_hours").innerHTML = openingHours;

                            });

                            el.appendChild(entity);

                        }
                    });

                })
            })
            .catch(function (err) {
                console.log('Fetch Error :-S', err);
            });



    }
});

function parse_location(locations) {
    var locations_str = "";
    for (i = 0; i < locations.length; i++) {
        if (i < locations.length - 1) locations_str = locations_str + locations[i][0] + "," + locations[i][1] + "|"
        else locations_str = locations_str + locations[i][0] + "," + locations[i][1]
    }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}


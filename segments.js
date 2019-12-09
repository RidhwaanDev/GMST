let map;

const locations = {
  lat: 40.499820,
  lng: -74.448530,
};

let poly;

const polyine_options = {
  "A": {

  },

  "LX": {

  },
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: { lat: locations.lat, lng: locations.lng }
  });

  poly = new google.maps.Polyline({
    strokeColor: '#000000',
    strokeOpacity: 1.0,
    strokeWeight: 5,
  });

  getSegmentsForRoute();
}

function getSegmentsForRoute() {
  // query Transloc API
  $.ajax({
    url: "https://transloc-api-1-2.p.rapidapi.com/segments.json",
    type: "GET",
    contentType: 'application/json; charset=utf-8',
    data: {
      "agencies": 1323,
      "routes": "4012628",
      "geo_area": "40.506831,-74.456645|15000",
    },
    headers: {
      "X-RapidAPI-Host": "transloc-api-1-2.p.rapidapi.com",
      "X-RapidAPI-Key": "hHcLr1qWHDmshwibREtIrhryL9bcp1Fw9AQjsnCiZyEzRrJKOS"
    },
    
    success: function (result) {
      parseSegments(clean(result));
    }
  });
}

function parseSegments(result) {
  const segments = result.data;
  for (let key of Object.keys(segments)) {
    let array_latlng = google.maps.geometry.encoding.decodePath(segments[key]);
    array_latlng.forEach(latlng => {addLatLngToPoly(latlng,poly)});
  }
  
  poly.setMap(map);

}

function addLatLngToPoly(latLng, poly) {
  const path = poly.getPath();
  // Because path is an MVCArray, we can simply append a new coordinate
  // and it will automatically appear
  path.push(latLng);
}

function clean(result) {
  const b = new Buffer(result.data,'binary');
  const str = b.toString();
  const regexp = /"(\d{9})"/;

  // replace each 9 digit number (the keys to each segment) with a random key.
  // This prevents JSON.parse from sorting the keys and messing with the segments

  // count the keys in the sorted/messed up object
  const result_sorted = JSON.parse(str);

  let i = 0;

  Object.keys(result_sorted['data']).forEach(key => {
      i++;
  });

  // do regex replace with "key" + key_cnt on each instance of the key
  let key_cnt = 0;
  let prev = str;
  let running_str = '';
  while(prev.match(regexp) != null){
      running_str = prev.replace(regexp,`\"segment${key_cnt}\"`);
      prev = running_str;
      key_cnt++;
  }
  // compare keys in the unsorted/cleaned object
  let j = 0;
  const final_segments = JSON.parse(running_str);
  Object.keys(final_segments).forEach(key => {
      j++;
  });

  return final_segments;
};

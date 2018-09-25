// REFRENCE: http://cwestblog.com/2018/03/25/google-sheets-data-as-json-jsonp/

// TODO: Try conversion sites
//http://gsx2json.com/api?id=1X0CUGPEY_Xb4JutGMhHe4aHQTNzNJkw94o1hv1lRlc4&sheet=1&q=QUERY
//var url = 'https://gsx2json.com/api?id=1X0CUGPEY_Xb4JutGMhHe4aHQTNzNJkw94o1hv1lRlc4&sheet=1';

// PARAMS
var DEBUG = 1;
var INIT_LAT_LNG = { lat: 39.0997265, lng: -94.5785667 };
var INIT_ZOOM = 12; // 1 = world, 2 = landmass/continent, 10 = city, 15 = streets, 20 = buildings
//var SHEET_ID = '14bZJLhtfwJColfjKufJIcGUDc5ZwtVQbh__3ZQCwMQk'; // Crestwood Painting 
var SHEET_ID = '1X0CUGPEY_Xb4JutGMhHe4aHQTNzNJkw94o1hv1lRlc4'; // Mine
var MAX_MARKERS = null;

function initMap() {
  // Create map  
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: INIT_ZOOM, 
    center: INIT_LAT_LNG
  });
    
  // Google Sheets: https://docs.google.com/spreadsheets/d/e/{sheet-id}/pubhtml
  // JSON: https://spreadsheets.google.com/feeds/list/1X0CUGPEY_Xb4JutGMhHe4aHQTNzNJkw94o1hv1lRlc4/od6/public/values?alt=json
  // JSONP: https://spreadsheets.google.com/feeds/list/{sheet-id}/od6/public/values?json=in-script&callback=myFunc
  
  // REFERENCE: https://stackoverflow.com/questions/24531351/retrieve-google-spreadsheet-worksheet-json
  // NOTE: Use od6 if 1 tab, tab # if multiple tabs
  var url = 'https://spreadsheets.google.com/feeds/list/' + SHEET_ID + '/1/public/values?alt=json';
    
  $.get(url, function(data) {
    var result = convertJsxToJson(data);
    
    // DEBUG
    if (DEBUG) console.log(result);
          
    var infoWindow = new google.maps.InfoWindow();
    
    for (var i = 0; i < result.rows.length; i++) {     
      var row = result.rows[i];
      
      // Check if coords exist, skip 
      if ((MAX_MARKERS != null && i >= MAX_MARKERS) || !row.lat || !row.lng) {
        continue;
      }
      
      var lat = parseFloat(row.lat);
      var lng = parseFloat(row.lng);
      var location = { lat: lat, lng: lng };

      // Add info window content
      var content = '<div class="info-window-title">' + row.address + '</div>';      
      if (row.photoUrl) {
        content += '<div class="info-window-photo"><img src="' + row.photoUrl + '" /></div>';
      }
      if (row.colors) {
        content += '<div class="info-window-description">' + row.colors + '</div>';
      }
                      
      // Create marker
      var marker = new google.maps.Marker({
        position: location,
        map: map,
        info: content,
        //icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        //icon: 'http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png'
        //icon: 'http://www.googlemapsmarkers.com/v1/ff0000/'
        //title: 'Marker ' + i
      });

      // Add info window
      // REFERENCE: https://tommcfarlin.com/multiple-infowindows-google-maps/
      marker.addListener('click', function() {
        if (DEBUG) console.log(this.info);
        
        infoWindow.setContent(this.info);
        infoWindow.open(map, this);
      });
    }
  });    
}

function convertJsxToJson(jsx) {  
  // Declare simplified JSON object
  var json = {};
  json.rows = [];
  
  var entries = jsx.feed.entry;
  
  for (var i = 0; i < entries.length; i++) {    
    var title = entries[i].gsx$address.$t;
    var address = entries[i].gsx$address.$t;
    var lat = entries[i].gsx$lat.$t;
    var lng = entries[i].gsx$lng.$t;
    var photoUrl = entries[i].gsx$photo.$t;
    var colors = entries[i].gsx$colors.$t;

    json.rows.push({
      title: title,
      address: address,
      lat: lat,
      lng: lng,
      photoUrl: photoUrl,
      colors: colors
    });
  }
    
  return json;
}
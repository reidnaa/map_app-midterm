const allInfoWindows = [];
const markers = [];
let savedMarkers = 0;
let uniqueId = 1;
let newMarkerLat = 0;
let newMarkerLong = 0;
let mapid = 0;
let currentMarker = 0;

function closeInfoWindows() {
  while (allInfoWindows.length > 0) {
    allInfoWindows[0].close();
    allInfoWindows.shift();
  }
}

function cancelMarker(id) {
  //Find and remove the marker from the Array
  //Doesn't always work, not sure what breaks it
  for (var i = 0; i < markers.length; i++) {
    if (markers[i].id === id) {
      //Remove the marker from Map
      markers[i].setMap(null);

      //Remove the marker from array.
      markers.splice(i, 1);
      return;
    }
  }
};


//won't work for some reason
function activateUpdateForm() {
  console.log('in activate update form function');
  $(".update-marker").css('visibility', 'visibile');
  var $openUpdate = $('.open-update');
  $openUpdate.click(function() {
    event.preventDefault();
    console.log('clicked the update button');
    $(".update-marker").css('visibility', 'visibile');
  });
}

function saveMarkerInfo(mapid) {
  var $saveButton = $('.save-button');
  $saveButton.click(function() {
    event.preventDefault();
    let newMarkerData = {
      map_id: mapid,
      lat: newMarkerLat,
      long: newMarkerLong,
      title: $('.marker-title').val(),
      description: $('.marker-description').val(),
      picture: $('.picture-url').val()
    };

    $.ajax ({
              url: '/new-marker',
              method: 'POST',
              data: newMarkerData,
              success: function (result) {
              // var obj = JSON.parse(data);
              console.log('IM THE RETURNED DATA', result);
              // var id = obj._id;
              document.location.reload();
              // location.href = `/maps/${result}`;
            }
    });

    $(".marker-info").css('visibility', 'hidden');
    console.log('data object', newMarkerData);
  });
}

function updateMarkerInfo(mapid) {
  var $updateButton = $('.update-button');
  $updateButton.click(function() {
    event.preventDefault();
    console.log('update button clicked');
    let updateMarkerData = {
      map_id: mapid,
      //where to define/update markerid?
      id: markerid,
      title: $('.marker-title').val(),
      description: $('.marker-description').val(),
      picture: $('.picture-url').val()
    };

    $.ajax ({
              url: '/update-marker',
              method: 'POST',
              data: updateMarkerData,
              success: function (result) {
              // var obj = JSON.parse(data);
              console.log('IM THE RETURNED DATA', result);
              // var id = obj._id;
              document.location.reload();
              // location.href = `/maps/${result}`;
            }
    });

    // $(".marker-info").css('visibility', 'hidden');
    // console.log('data object', newMarkerData);
  });
}

function deleteMarkerInfo() {
  var $deleteButton = $('.delete-button');
  $deleteButton.click(function() {
    event.preventDefault();
    console.log('delete button clicked');

    $.ajax ({
              url: '/delete-marker',
              method: 'POST',
              //markerid
              data: 'markerid',
              success: function() {
                document.location.reload();
              }
    });

    // $(".marker-info").css('visibility', 'hidden');
    // console.log('data object', newMarkerData);
  });
}

function removeMarker() {
  var $cancelButton = $('.cancel-button');
  $cancelButton.on('click', function() {
    event.preventDefault();

    // console.log('length', markers.length);
    // console.log('id', markers[markers.length-1].id);
    cancelMarker(markers.length);
    $(".marker-info").css('visibility', 'hidden');
  });
}


function drawMarkers(data, map) {
//   for(let j = 0; j < markers.length; j++) {
//     cancelMarker(j);
//   }

  data.forEach(function (point) {
    // console.log(point);
    let latLng = new google.maps.LatLng(point.lat, point.long);
    let infoBox = `<p>${point.title}</p>`;
    if(point.description) {
      infoBox += `<p>${point.description}</p>`;
    }
    if(point.picture) {
      infoBox += `<img src="${point.picture}" height="100" width="100">`;
    }
    // infoBox += "<input type = 'button' value = 'update' onclick = 'activateUpdateForm();' value = 'update' />";
    // infoBox += `<button class="open-update">update</button>`;
    let marker = new google.maps.Marker({
      position: latLng,
      map: map,
      databaseId: point.id,
      infoBox: infoBox
    });

    $("<p>").text(point.title).prependTo($(".markers-list"));
    marker.id = uniqueId;
    uniqueId++;
    savedMarkers ++;
    // console.log('saved markers', savedMarkers);
    // console.log('marker', marker.infoBox);
    google.maps.event.addListener(marker, "click", function () {
      closeInfoWindows();
      // console.log('clicked a marker');
      // console.log(marker.id);
      var content = marker.infoBox;
      var infoWindow = new google.maps.InfoWindow({
        content: content
      });
      currentMarker = marker.databaseId;
      allInfoWindows.push(infoWindow);
      // console.log('all infor windows', allInfoWindows);
      $(".update-marker").css('visibility', 'visibile');
      console.log('clicked a marker');
      infoWindow.open(map, marker);

    });

    markers.push(marker);
  });

}

function initMap() {
let mapData = {};

  let importData = JSON.parse(map_data);

  mapid = importData.map_data1.id;
  drawMap(importData);

}

function drawMap (data) {
  let markerArr = [];
  let mapData = data.map_data1;
  // console.log('in drawmap', mapData);
  // document.querySelector('#mapTitleInput').value = mapData.title;
  let pointsData = data.markers_input;
  // console.log('indrawmap', pointsData);

  let mapOptions = {
    center: new google.maps.LatLng(mapData.lat, mapData.long),
    zoom: Number(mapData.zoom),
    mapTypeId: google.maps.MapTypeId.ROADMAP,

  };

  const map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

  drawMarkers(pointsData, map);


  // console.log(markers);



  //Attach click event handler to the map.
  google.maps.event.addListener(map, 'click', function (e) {

    //Determine the location where the user has clicked.
    var location = e.latLng;

    //Create a marker and placed it on the map.
    var marker = new google.maps.Marker({
      position: location,
      map: map
    });

    var markerLocation = marker.getPosition();
    newMarkerLat = markerLocation.lat();
    newMarkerLong = markerLocation.lng();

    marker.id = uniqueId;
    uniqueId++;
    $(".marker-info").css('visibility', 'visible');
    // $(".update-marker").css('visibility', 'visible');

    markers.push(marker);
    console.log(markers);
  });
saveMarkerInfo(mapid);
removeMarker();
activateUpdateForm();
}


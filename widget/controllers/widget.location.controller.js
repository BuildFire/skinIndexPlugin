'use strict';

(function (angular) {
  angular
    .module('skinIndexPluginWidget')
    .controller('WidgetLocationCtrl', ['$scope', 'Buildfire', 'DataStore', 'TAG_NAMES', 'STATUS_CODE', 'ViewStack', 'Location', 'Modals',
      function ($scope, Buildfire, DataStore, TAG_NAMES, STATUS_CODE, ViewStack, Location, Modals) {
        var WidgetLocation = this;


        /*Init method call, it will bring all the pre saved data*/
        WidgetLocation.init = function () {
          WidgetLocation.success = function (result) {
            console.info('init success result:', result);
            if (result) {
              WidgetLocation.data = result.data;
              if (!WidgetLocation.data.widget)
                WidgetLocation.data.widget = {};
              if (WidgetLocation.data.widget.location)
                WidgetLocation.currentLocation = WidgetLocation.data.widget.location;
            }
          };
          WidgetLocation.error = function (err) {
            if (err && err.code !== STATUS_CODE.NOT_FOUND) {
              console.error('Error while getting data', err);
            }
          };
          DataStore.get(TAG_NAMES.UVO_INFO).then(WidgetLocation.success, WidgetLocation.error);
        };

        WidgetLocation.init();

        WidgetLocation.getWeatherData = function () {
          ViewStack.push({
            template: 'Info'
          });
        };

        WidgetLocation.setLocation = function (data) {
          WidgetLocation.success = function (result) {
            if (result) {
              WidgetLocation.data = result.data;
              if (!WidgetLocation.data.widget)
                WidgetLocation.data.widget = {};
            }
          };
          WidgetLocation.error = function (err) {
            console.error('Error while saving data:', err);
          };
          WidgetLocation.data.widget = {
            location: data.location,
            location_coordinates: data.coordinates
          };
          WidgetLocation.currentLocation = WidgetLocation.data.widget.location;
          WidgetLocation.currentCoordinates = WidgetLocation.data.widget.location_coordinates;
          DataStore.save(WidgetLocation.data, TAG_NAMES.UVO_INFO).then(WidgetLocation.success, WidgetLocation.error);
          $scope.$digest();
        };

        WidgetLocation.getCurrentLocation = function () {
          console.log("WidgetLocation.getCurrentLocation called");

          Modals.showMoreOptionsModal({})
            .then(function (data) {
              var locationPromise = Location.getCurrentLocation();
              locationPromise.then(function (response) {
                var geocoder = new google.maps.Geocoder;
                var latlng = {
                  lat: parseFloat(response.coords.latitude),
                  lng: parseFloat(response.coords.longitude)
                };
                geocoder.geocode({'location': latlng}, function (results, status) {
                  if (status === google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                      console.log(results[1].formatted_address);
                      WidgetLocation.currentLocation = results[1].formatted_address;
                      $scope.$digest();
                    } else {
                      console.log('No results found');
                    }
                  } else {
                    console.log('Geocoder failed due to: ' + status);
                  }
                });

              }, function (err) {

              });
            }, function (err) {
              console.log(err);
            });


        }

      }]);
})(window.angular);
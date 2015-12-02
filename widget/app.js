'use strict';
(function (angular, buildfire) {
  angular
    .module('eCommercePluginWidget', ['infinite-scroll', 'ngAnimate', 'ui.bootstrap'])
    .config(['$compileProvider', function ($compileProvider) {

      /**
       * To make href urls safe on mobile
       */
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|cdvfile|file):/);

    }])
    .directive("buildFireCarousel", ["$rootScope", function ($rootScope) {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          $rootScope.$broadcast("Carousel:LOADED");
        }
      };
    }])
    .directive("buildFireCarousel2", ["$rootScope", function ($rootScope) {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          $rootScope.$broadcast("Carousel2:LOADED");
        }
      };
    }])
    .directive("buildFireCarousel3", ["$rootScope", function ($rootScope) {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          $rootScope.$broadcast("Carousel3:LOADED");
        }
      };
    }])
    .run(['ViewStack', function (ViewStack) {
      buildfire.navigation.onBackButtonClick = function () {
        if (ViewStack.hasViews()) {
          ViewStack.pop();
        } else {
          buildfire.navigation.navigateHome();
        }
      };
    }]).filter('getImageUrl', ['Buildfire', function (Buildfire) {
      return function (url, width, height, type) {
        if (type == 'resize')
          return Buildfire.imageLib.resizeImage(url, {
            width: width,
            height: height
          });
        else
          return Buildfire.imageLib.cropImage(url, {
            width: width,
            height: height
          });
      }
    }])
    .directive("viewSwitcher", ["ViewStack", "$rootScope", '$compile', "$templateCache",
      function (ViewStack, $rootScope, $compile, $templateCache) {
        return {
          restrict: 'AE',
          link: function (scope, elem, attrs) {
            var views = 0;
            manageDisplay();
            $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
              if (type === 'PUSH') {
                var newScope = $rootScope.$new();
                newScope.currentItemListLayout = "templates/" + view.template + ".html";
                var _newView = '<div  id="' + view.template + '" ><div class="slide content" ng-if="currentItemListLayout" ng-include="currentItemListLayout" data-ng-attr-style="background:url({{ backgroundImage | cropImage:deviceWidth:deviceHeight:true}}) !important; background-size:cover; background-color:white !important"></div></div>';
                var parTpl = $compile(_newView)(newScope);

                newScope.$on("ITEM_LIST_LAYOUT_CHANGED", function(evt, layout, needDigest) {
                  newScope.currentItemListLayout = "templates/" + layout + ".html";
                  if(needDigest) {
                    newScope.$digest();
                  }
                });

                $(elem).append(parTpl);
                views++;

              } else if (type === 'POP') {
                var _elToRemove = $(elem).find('#' + view.template),
                    _child = _elToRemove.children("div").eq(0);

                _child.addClass("ng-enter ng-enter-active");
                _child.one("webkitTransitionEnd transitionend oTransitionEnd", function(e) {
                  _elToRemove.remove();
                  views--;
                });

                //$(elem).find('#' + view.template).remove();
              }
              else if (type === 'POPALL') {
                console.log(view);
                angular.forEach(view, function (value, key) {
                  $(elem).find('#' + value.template).remove();
                });
                views = 0;
              }
              manageDisplay();
            });

            function manageDisplay() {
              if (views) {
                $(elem).removeClass("ng-hide");
              } else {
                $(elem).addClass("ng-hide");
              }
            }

          }
        };
      }]).directive('backImg', function () {
      return function (scope, element, attrs) {
        attrs.$observe('backImg', function (value) {
          element.css({
            'background': 'url(' + value + ')',
            'background-size': 'cover',
            'background-color': 'white'
          });
        });
      };
    }).filter('cropImage', [function () {
      return function (url, width, height, noDefault) {
        if (noDefault) {
          if (!url)
            return '';
        }
        return buildfire.imageLib.cropImage(url, {
          width: width,
          height: height
        });
      };
    }]);
})(window.angular, window.buildfire);
'use strict';

(function (angular) {
  angular
    .module('eCommercePluginWidget')
    .controller('WidgetAddToCartCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'ECommerceSDK', '$sce', 'LAYOUTS', '$rootScope', 'PAGINATION', 'Buildfire', 'ViewStack',
      function ($scope, DataStore, TAG_NAMES, ECommerceSDK, $sce, LAYOUTS, $rootScope, PAGINATION, Buildfire, ViewStack) {

        var WidgetAddToCart = this;
        WidgetAddToCart.listeners = {};
        WidgetAddToCart.quantity = 1;
        WidgetAddToCart.currentAddedItemInCart = {
          Variant: null
        };

        $rootScope.addedToCart = null;
        var currentView = ViewStack.getCurrentView();
        console.log("currentView", currentView);
        var currentStoreName = "";


        WidgetAddToCart.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };

        var getProduct = function (storeName, handle) {
          Buildfire.spinner.show();
          var success = function (result) {
              Buildfire.spinner.hide();
              console.log("===============================", result);
              WidgetAddToCart.item = result;
              if (WidgetAddToCart.item.variants.length) {
                WidgetAddToCart.currentAddedItemInCart = {
                  Variant: {
                    title: WidgetAddToCart.item.variants[0].title,
                    id: WidgetAddToCart.item.variants[0].id
                  }
                };
              }
              console.log("WidgetAddToCart", WidgetAddToCart)
            }
            , error = function (err) {
              Buildfire.spinner.hide();
              console.error('Error In Fetching Single product Details', err);
            };
          ECommerceSDK.getProduct(storeName, handle).then(success, error);
        };

        var init = function () {
          var success = function (result) {
              WidgetAddToCart.data = result.data;
              if (!WidgetAddToCart.data.design)
                WidgetAddToCart.data.design = {};
              if (!WidgetAddToCart.data.content)
                WidgetAddToCart.data.content = {};
              if (!WidgetAddToCart.data.settings)
                WidgetAddToCart.data.settings = {};
              if (WidgetAddToCart.data.content.storeName) {
                currentStoreName = WidgetAddToCart.data.content.storeName;
              }
              if (!WidgetAddToCart.data.design.itemListLayout) {
                WidgetAddToCart.data.design.itemListLayout = LAYOUTS.itemListLayout[0].name;
              }
              if (WidgetAddToCart.data.content.storeName && currentView.params.handle)
                getProduct(WidgetAddToCart.data.content.storeName, currentView.params.handle);
            }
            , error = function (err) {
              console.error('Error while getting data', err);
            };
          DataStore.get(TAG_NAMES.SHOPIFY_INFO).then(success, error);
        };

        var onUpdateCallback = function (event) {
          setTimeout(function () {
            if (event && event.tag) {
              switch (event.tag) {
                case TAG_NAMES.SHOPIFY_INFO:
                  WidgetAddToCart.data = event.data;
                  if (!WidgetAddToCart.data.design)
                    WidgetAddToCart.data.design = {};
                  if (!WidgetAddToCart.data.design.itemListLayout) {
                    WidgetAddToCart.data.design.itemListLayout = LAYOUTS.itemListLayout[0].name;
                  }
                  if (!WidgetAddToCart.data.content.storeName) {
                    WidgetAddToCart.item = null;
                    currentStoreName = "";
                  }

                  if (WidgetAddToCart.data.content.storeName && currentStoreName != WidgetAddToCart.data.content.storeName) {
                    WidgetAddToCart.item = null;
                    getProduct(WidgetAddToCart.data.content.storeName, currentView.params.handle);
                  }
                  if (!WidgetAddToCart.data.content.storeName)
                    ViewStack.popAllViews();
                  break;
              }
              $scope.$digest();
            }
          }, 0);
        };

        /**
         * DataStore.onUpdate() is bound to listen any changes in datastore
         */
        DataStore.onUpdate().then(null, null, onUpdateCallback);

        WidgetAddToCart.selectVariant = function (variant) {
          WidgetAddToCart.currentAddedItemInCart.Variant = variant;
        };

        WidgetAddToCart.proceedToCart = function (handle) {
          console.log("****************", WidgetAddToCart.currentAddedItemInCart);
          $rootScope.addedToCart = {
            variantId: WidgetAddToCart.currentAddedItemInCart.Variant.id,
            title: WidgetAddToCart.currentAddedItemInCart.Variant.title,
            quantity: WidgetAddToCart.quantity
          };
          ViewStack.push({
            template: 'Add_To_Cart_2',
            params: {
              handle: handle
            }
          });
        };

        WidgetAddToCart.cancelClick = function(){
          ViewStack.pop();
        };

        $scope.$on("$destroy", function () {
          for (var i in WidgetAddToCart.listeners) {
            if (WidgetAddToCart.listeners.hasOwnProperty(i)) {
              WidgetAddToCart.listeners[i]();
            }
          }
          DataStore.clearListener();
        });

        WidgetAddToCart.listeners['CAROUSEL_LOADED'] = $rootScope.$on("Carousel3:LOADED", function () {
          WidgetAddToCart.view = null;
          if (!WidgetAddToCart.view) {
            WidgetAddToCart.view = new buildfire.components.carousel.view("#carousel3", [], "WideScreen");
          }
          if (WidgetAddToCart.item && WidgetAddToCart.item.images) {
            var imageArray = WidgetAddToCart.item.images.map(function (item) {
              return {iconUrl: item.src, title: ""};
            });
            WidgetAddToCart.view.loadItems(imageArray, null, "WideScreen");
          } else {
            WidgetAddToCart.view.loadItems([]);
          }
        });

        WidgetAddToCart.listeners['POP'] = $rootScope.$on('BEFORE_POP', function (e, view) {
          console.log("SINGLE:", view.template, 'Add_To_Cart_1');
          if (view.template === 'Add_To_Cart_1') {
            $scope.$destroy();
          }
        });
        init();
      }
    ])
})(window.angular);
'use strict';
(function (angular) {
    angular
        .module('eCommercePluginSettings')
        .controller('SettingsCtrl', ['$scope','TAG_NAMES','$sce',
            function ($scope,TAG_NAMES,$sce) {
                var SettingsHome = this;
                SettingsHome.data = null;
                SettingsHome.currency=[{
                    name:"USD, AUD, NZD, CAD, Peso, Real, etc. ",
                    symbol: '&#36;'
                },
                {
                name:"Euro",
                    symbol: '&#128;'
                },
                {
                    name:"Yuan and Yen",
                    symbol: "&#165;"
                },
                {
                    name:"Duetsche Mark",
                    symbol:"DM"
                },
                {
                    name:"Franc",
                    symbol:"&#8355;"
                },
                {
                    name:"Pound",
                    symbol:"&#163;"
                },
                {
                    name:"Lira",
                    symbol:"&#8356;"
                },
                {
                    name:"Rouble",
                    symbol:'<del>P</del>'
                },
                {
                    name:"Switz Franc",
                    symbol:"SFr"
                }];

                SettingsHome.newCurrency = [];

                var _data = {
                    "content": {
                        "carouselImages": [],
                        "description": '<p>&nbsp;<br></p>',
                        "storeName": ""
                    },
                    "design": {
                        "sectionListLayout": "",
                        "itemListLayout": "",
                        "itemDetailsBgImage": ""
                    },
                    "settings":{
                        currency:""
                    }
                };
                SettingsHome.masterData=[];
                updateMasterItem(_data);

                function updateMasterItem(data) {
                    SettingsHome.masterData = angular.copy(data);
                }
                function isUnchanged(data) {
                    return angular.equals(data, SettingsHome.masterData);
                }

                var init = function () {
                    buildfire.datastore.get(TAG_NAMES.SHOPIFY_INFO,function(err,data){
                        if(err)
                            console.error('Error while getting data', err);
                        else {
                            buildfire.datastore.get(TAG_NAMES.NEW_CURRENCY,function(err,currencyData){
                                if(err)
                                    console.error('Error while getting data', err);
                                else {
                                    if(currencyData.data && currencyData.data.length > 0)
                                        SettingsHome.newCurrency = currencyData.data;

                                    SettingsHome.data = data.data;
                                    $scope.$apply();
                                    updateMasterItem(SettingsHome.data);
                                    if (tmrDelay)clearTimeout(tmrDelay);
                                }
                            });
                        }
                    });
                };
                SettingsHome.changeCurrency = function(currency){
                    if(!SettingsHome.data.settings)
                        SettingsHome.data.settings = {};
                    SettingsHome.data.settings.currency = currency;
                };
                var saveData = function (newObj, tag) {
                    if (typeof newObj === 'undefined') {
                        return;
                    }
                    buildfire.datastore.save(newObj, tag,function(err,data){
                        if(err)
                            console.error('Error while saving data : ', err);
                        else {
                            console.info('Saved data result: ', data);
                            updateMasterItem(newObj);
                        }
                    });
                };
                var tmrDelay = null;
                SettingsHome.convertHtml=function(html){
                    return $sce.trustAsHtml(html)
                };
                var saveDataWithDelay = function (newObj) {
                    if (newObj) {
                        if (isUnchanged(newObj)) {
                            return;
                        }
                        if (tmrDelay) {
                            clearTimeout(tmrDelay);
                        }
                        tmrDelay = setTimeout(function () {
                            saveData(JSON.parse(angular.toJson(newObj)), TAG_NAMES.SHOPIFY_INFO);
                        }, 500);
                    }
                };
                $scope.$watch(function () {
                    return SettingsHome.data;
                }, saveDataWithDelay, true);

                SettingsHome.addNewCurrency = function () {
                    SettingsHome.newCurrency.push(SettingsHome.newSymbol);
                    SettingsHome.changeCurrency(SettingsHome.newSymbol);
                    SettingsHome.newSymbol =  {};
                    saveData(SettingsHome.newCurrency,TAG_NAMES.NEW_CURRENCY);
                };

                init();


            }]);
})(window.angular);

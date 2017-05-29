sap.ui.define([
    "jquery.sap.global",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/sinon"
], function (jQuery, JSONModel, sinon) {
    "use strict";

    return {
        /**
         * Initializes the mock server.
         * @public
         */
        init: function () {
            var sGroupsUrl = jQuery.sap.getModulePath("sap.ui.demo.iconexplorer", "/model/groups.json");
            var sTagsUrl = jQuery.sap.getModulePath("sap.ui.demo.iconexplorer", "/model/tags.json");

            // we need to load the models before configuring the fakeserver
            // faking the real call and load the real models (we just want to use a timer for opa tests)
            // at the same time is just impossible
            var oGroupsModel = this._loadModelFromDisk(sGroupsUrl);
            var oTagsModel = this._loadModelFromDisk(sTagsUrl);


            this.oServer = sinon.fakeServer.create();
            this.oServer.autoRespond = true;
            this.oServer.autoRespondAfter = 10;

            sinon.fakeServer.xhr.useFilters = true;
            this.oServer.xhr.addFilter(function (method, url) {
                // we can only fake our own url, otherwise ui5 source are not loaded correctly
                return !(url.match(sGroupsUrl) || url.match(sTagsUrl));
            });

            // icon groups request
            this.oServer.respondWith("GET", sGroupsUrl,
                [200, {"Content-Type": "application/json"}, oGroupsModel.getJSON()]
            );

            // icon tags request
            this.oServer.respondWith("GET", sTagsUrl,
                [200, {"Content-Type": "application/json"}, oTagsModel.getJSON()]
            );

            jQuery.sap.log.info("Running the app with mock data");
        },

        getMockServer: function () {
            return this;
        },

        _loadModelFromDisk: function (sPath) {
            var aNoParams = [];
            var oModel = new JSONModel();
            var bLoadSync = false;
            oModel.loadData(sPath, aNoParams, bLoadSync);
            return oModel;
        }
    };

});

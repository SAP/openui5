sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon"
], function (jQuery, JSONModel, sinon) {
	"use strict";

	var iAutoRespondAfterDefault = 10;

	return {
		/**
		 * Initializes the mock server.
		 * @public
		 */
		init: function () {
			var oUriParameters = jQuery.sap.getUriParameters();
			this._oMockModels = {

			};

			// load the mock fonts before initializing the mock server
			this._mockFont("SAP-icons");
			this._mockFont("SAP-icons-TNT");

			// create a fake server with configurable delay
			this.oServer = sinon.fakeServer.create();
			this.oServer.autoRespond = true;
			this.oServer.autoRespondAfter = parseInt(oUriParameters.get("serverDelay") || iAutoRespondAfterDefault, 10);

			// set up the filters for the mocked URLs
			sinon.fakeServer.xhr.useFilters = true;
			this.oServer.xhr.addFilter(function (method, url) {
				var bMockUrl = Object.keys(this._oMockModels).some(function (sMockUrl) {
					return url.match(sMockUrl);
				});
				return !bMockUrl;
			}.bind(this));

			// set up the responses for the mocked URLs
			Object.keys(this._oMockModels).forEach(function (sName) {
				this.oServer.respondWith("GET", sName,
					[200, {"Content-Type": "application/json"}, this._oMockModels[sName].getJSON()]
				);
			}.bind(this));

			jQuery.sap.log.info("Running the app with mock data");
		},

		getMockServer: function () {
			return this;
		},

		/**
		 * Sets the path and loads the mock data models for the current icon font
		 * @param {string} sName the font name to be mocked
		 * @private
		 */
		_mockFont: function (sName) {
			var sGroupsUrl = jQuery.sap.getModulePath("sap.ui.demo.iconexplorer", "/model/" + sName + "/groups.json");
			var sTagsUrl = jQuery.sap.getModulePath("sap.ui.demo.iconexplorer", "/model/" + sName + "/tags.json");

			var sGroupsMockUrl = jQuery.sap.getModulePath("sap.ui.demo.iconexplorer", "/localService/mockdata/" + sName + "/groups.json");
			var sTagsMockUrl = jQuery.sap.getModulePath("sap.ui.demo.iconexplorer", "/localService/mockdata/" + sName + "/tags.json");

			// we need to load the models before configuring the fakeserver
			// faking the real call and load the real models (we just want to use a timer for opa tests)
			// at the same time is just impossible
			var oGroupsModel = this._loadModelFromDisk(sGroupsMockUrl);
			var oTagsModel = this._loadModelFromDisk(sTagsMockUrl);

			this._oMockModels[sGroupsUrl] = oGroupsModel;
			this._oMockModels[sTagsUrl] = oTagsModel;
		},

		/**
		 * Loads the mock data models from the given path
		 * @param {string} sPath path to the mock data
		 * @returns {sap.ui.model.json.JSONModel} JSONModel containing the mock data
		 * @private
		 */
		_loadModelFromDisk: function (sPath) {
			var aNoParams = [];
			var oModel = new JSONModel();
			var bLoadSync = false;

			oModel.loadData(sPath, aNoParams, bLoadSync);

			return oModel;
		}
	};

});

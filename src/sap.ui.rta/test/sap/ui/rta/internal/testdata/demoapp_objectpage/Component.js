sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/rta/test/Demo/ObjectPage/localService/mockserver",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/rta/util/UrlParser"
], function(
	UIComponent,
	mockserver,
	ODataModel,
	JSONModel,
	FakeLrepConnectorLocalStorage,
	UrlParser
) {
	"use strict";

	return UIComponent.extend("sap.ui.rta.test.Demo.ObjectPage.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {

			// the model instantiation is triggered in the Component.init method
			// so that we can start up our mockserver

			// if the model is defined in the app-descriptor it will be created
			// automatically before the Component.init method

			// the mockserver is not started in the index.html file
			// because the launchpad only instanciates this Component.js file

			// app specific setup
			this._createFakeLrep();
			this._startMockServer();
			this._assignMainService();
			this._createODataModel();
			this._adaptButtonConfiguration();

			// default init methods
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
		},

		/**
		 * Adapt the visibility of the "Adapt UI" button
		 * @private
		 */
		_adaptButtonConfiguration: function () {

			var bShowAdaptButton = false;
			var oComponentData = this.getComponentData();

			if (oComponentData && oComponentData.showAdaptButton) {
				bShowAdaptButton = oComponentData.showAdaptButton;
			}

			var oModel = new JSONModel({
				showAdaptButton : bShowAdaptButton
			});

			this.setModel(oModel, "app");
		},

		/**
		 * Create the ODataModel for the app
		 * @private
		 */
		_createODataModel: function () {

			if (this._oMainService.uri) {

				var oModel = new ODataModel(this._oMainService.uri, {
					"settings": {
						"metadataUrlParams": {
							"sap-documentation": "heading"
						}
					}
				});
				this.setModel(oModel);
			}
		},

		/**
		 * Read the mainService configuration from the app descriptor
		 * @private
		 */
		_assignMainService: function () {

			var oAppEntry = this.getMetadata().getManifestEntry("sap.app");

			if (oAppEntry.dataSources.mainService) {
				this._oMainService = oAppEntry.dataSources.mainService;
			} else {
				this._oMainService = undefined;
			}
		},

		/**
		 * Start the MockServer
		 * @private
		 */
		_startMockServer: function () {

			mockserver.init(this._oMainService);
		},

		/**
		 * Create the FakeLrep with localStorage
		 * @private
		 */
		_createFakeLrep: function () {
			if (UrlParser.getParam('sap-rta-mock-lrep') !== false) {
				FakeLrepConnectorLocalStorage.enableFakeConnector();
			}
		}
	});
});

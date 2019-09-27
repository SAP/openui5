sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/base/util/UriParameters",
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Utils"
], function(
	UIComponent,
	FakeLrepConnectorLocalStorage,
	UriParameters,
	FakeLrepConnector,
	MockServer,
	ODataModel,
	JSONModel,
	FeaturesAPI,
	FlexUtils
) {
	"use strict";

	return UIComponent.extend("sap.ui.rta.test.embeddedComponent.Component", {

		metadata: {
			manifest: "json"
		},

		constructor: function () {
			UIComponent.prototype.constructor.apply(this, arguments);
			this.oUriParametersUtil = UriParameters.fromQuery(window.location.search);
			this._createFakeLrep();
		},

		init : function() {
			this._adaptButtonConfiguration();
			this._setModels(this._startMockServer());
			//this._bShowAdaptButton = this.getComponentData().showAdaptButton ? this.getComponentData().showAdaptButton : false;
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
		},

		_startMockServer: function () {
			var sURL = "/destinations/E91/sap/opu/odata/SAP/EmbeddedComponentTest/";
			var oMockServer = new MockServer({
				rootUri: sURL
			});
			this._sResourcePath = jQuery.sap.getResourcePath("sap/ui/rta/test/variantManagement");

			oMockServer.simulate(this._sResourcePath + "/mockserver/metadata.xml", this._sResourcePath + "/mockserver");

			oMockServer.start();

			return sURL;
		},

		_setModels: function (sURL) {
			var oModel = new ODataModel(sURL, {
				json: true,
				loadMetadataAsync: true
			});

			oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			this._oModel = oModel;

			this.setModel(oModel);

			var data = {
				readonly: false,
				mandatory: false,
				visible: true,
				enabled: true
			};

			var oStateModel = new JSONModel();
			oStateModel.setData(data);
			this.setModel(oStateModel, "state");
		},

		_adaptButtonConfiguration: function() {
			var oAppModel = new JSONModel({
				showAdaptButton: false // for embedded app
			});
			this.setModel(oAppModel, "app");

			if (!FlexUtils.getUshellContainer()) {
				FeaturesAPI.isKeyUser()
					.then(function (bIsKeyUser) {
						oAppModel.setProperty("/showOuterAdaptButton", bIsKeyUser);
					});
			}
		},

		_createFakeLrep: function () {
			if (this.oUriParametersUtil.get('sap-rta-mock-lrep') !== false) {
				var mAppManifest = this.getManifestEntry("sap.app");
				var mSettings = {};
				FakeLrepConnectorLocalStorage.enableFakeConnector(
					mSettings,
					mAppManifest.id + '.Component',
					mAppManifest.applicationVersion.version);
			}
		},

		destroy: function() {
			if (this.oUriParametersUtil.get('sap-rta-mock-lrep') !== false) {
				var mAppManifest = this.getManifestEntry("sap.app");
				FakeLrepConnector.disableFakeConnector(
					mAppManifest.id + '.Component',
					mAppManifest.applicationVersion.version
				);
			}
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		}

	});
});

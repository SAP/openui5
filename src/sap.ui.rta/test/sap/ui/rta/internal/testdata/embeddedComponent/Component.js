sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Utils"
], function(
	UIComponent,
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
		}
	});
});

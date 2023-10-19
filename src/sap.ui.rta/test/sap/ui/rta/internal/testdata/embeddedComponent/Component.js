sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/BindingMode",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Utils"
], function(
	UIComponent,
	MockServer,
	BindingMode,
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

		init(...aArgs) {
			this._adaptButtonConfiguration();
			this._setModels(this._startMockServer());
			UIComponent.prototype.init.apply(this, aArgs);
			this.getRouter().initialize();
		},

		_startMockServer() {
			var sURL = "/destinations/E91/sap/opu/odata/SAP/EmbeddedComponentTest/";
			var oMockServer = new MockServer({
				rootUri: sURL
			});
			this._sResourcePath = sap.ui.require.toUrl("sap/ui/rta/test/variantManagement");

			oMockServer.simulate(`${this._sResourcePath}/mockserver/metadata.xml`, `${this._sResourcePath}/mockserver`);
			oMockServer.start();

			return sURL;
		},

		_setModels(sURL) {
			var oModel = new ODataModel(sURL, {
				json: true,
				loadMetadataAsync: true
			});

			oModel.setDefaultBindingMode(BindingMode.TwoWay);
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

		_adaptButtonConfiguration() {
			var oAppModel = new JSONModel({
				showAdaptButton: false // for embedded app
			});
			this.setModel(oAppModel, "app");

			if (!FlexUtils.getUshellContainer()) {
				FeaturesAPI.isKeyUser()
				.then(function(bIsKeyUser) {
					oAppModel.setProperty("/showOuterAdaptButton", bIsKeyUser);
				});
			}
		}
	});
});

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/plugin/ControlVariant",
	"sap/ui/fl/Utils",
	"sap/ui/fl/FakeLrepConnector",
	"sap/uxap/ObjectPageLayout"
], function(Controller, MockServer, ResourceModel, ODataModel, JSONModel, RuntimeAuthoring, ControlVariantPlugin, flUtils, FakeLrepConnector, ObjectPageLayout) {
	"use strict";

	return Controller.extend("sap.ui.rta.test.variantManagement.controller.Main", {
		_data: [],

		onInit: function () {

			var oAppComponent = flUtils.getAppComponentForControl(this.getView());
			var oManifest = oAppComponent.getManifest();

			var sAppComponentName = flUtils.getComponentName(oAppComponent);
			var sAppVersion = flUtils.getAppVersionFromManifest(oManifest);
			FakeLrepConnector.enableFakeConnector("/testsuite/test-resources/sap/ui/fl/qunit/testResources/FakeVariantLrepResponse.json", sAppComponentName, sAppVersion);

			var sURL, oModel, oView;

			sURL = "/destinations/E91/sap/opu/odata/SAP/VariantManagementTest/";

			var oMockServer = new MockServer({
				rootUri: sURL
			});
			this._sResourcePath = jQuery.sap.getResourcePath("sap/ui/rta/test/variantManagement");

			oMockServer.simulate(this._sResourcePath + "/mockserver/metadata.xml", this._sResourcePath + "/mockserver");

			oMockServer.start();

			oModel = new ODataModel(sURL, {
				json: true,
				loadMetadataAsync: true
			});

			oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			this._oModel = oModel;


			oView = this.getView();
			oView.setModel(oModel);

			var i18nModel = new ResourceModel({
				bundleName: "sap.ui.rta.test.variantManagement.i18n.i18n"
			});
			oView.setModel(i18nModel, "i18n");

			var data = {
				readonly: false,
				mandatory: false,
				visible: true,
				enabled: true
			};

			var oStateModel = new JSONModel();
			oStateModel.setData(data);
			oView.setModel(oStateModel, "state");

			this._data.push(
				new Promise(function (resolve, reject) {
					oView.bindElement({
						path: "/EntityTypes(Property01='propValue01',Property02='propValue02',Property03='propValue03')",
						events: {
							dataReceived: resolve
						},
						parameters: {
							expand: "to_EntityType01Nav"
						}
					});
				}),

				new Promise(function (resolve, reject) {
					oView.byId("MainForm").bindElement({
						path: "/EntityTypes2(EntityType02_Property01='EntityType02Property01Value')",
						events: {
							dataReceived: resolve
						},
						parameters: {
							expand: "to_EntityType02Nav"
						}
					});
				})
			);

			/**
			 * Specifies the key of the Variant Management control.<br>
			 * For more information about SAPUI5 flexibility, refer to the Developer Guide.
			 * @since 1.50.0
			 variantManagement: {type: "string", group: "Misc"}, */

			ObjectPageLayout.prototype.variantManagement = "variantManagementOrdersTable";
			ObjectPageLayout.prototype.getVariantManagement = function () { return this.variantManagement; };
			ObjectPageLayout.prototype.setVariantManagement = function (sVarMgmt) { this.variantManagement = sVarMgmt; };
		},

		_getUrlParameter: function (sParam) {
			var sReturn = "";
			var sPageURL = window.location.search.substring(1);
			var sURLVariables = sPageURL.split('&');
			for (var i = 0; i < sURLVariables.length; i++) {
				var sParameterName = sURLVariables[i].split('=');
				if (sParameterName[0] == sParam) {
					sReturn = sParameterName[1];
				}
			}
			return sReturn;
		},

		switchToAdaptionMode: function () {

			jQuery.sap.require("sap.ui.rta.RuntimeAuthoring");
			var oRta = new RuntimeAuthoring({
				rootControl: this.getOwnerComponent().getAggregation("rootControl"),
				flexSettings: {
					developerMode: false
				}
			});
			var mPlugins = oRta.getDefaultPlugins();

			// Control Variant
			mPlugins["controlVariant"] = new ControlVariantPlugin();
			oRta.setPlugins(mPlugins);

			oRta.start();
		},

		isDataReady: function () {
			return Promise.all(this._data);
		}

	});


});

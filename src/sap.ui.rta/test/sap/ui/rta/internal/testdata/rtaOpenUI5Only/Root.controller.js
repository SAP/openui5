sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/BindingMode",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel"
], function(
	Controller,
	MockServer,
	BindingMode,
	ODataModel,
	ResourceModel,
	JSONModel
) {
	"use strict";

	return Controller.extend("sap.ui.rta.test.rtaOpenUI5Only.ComplexTest", {
		_aData: [],

		onInit() {
			var sURL = "/destinations/E91/sap/opu/odata/SAP/rtaOpenUI5OnlyTest/";

			var oMockServer = new MockServer({
				rootUri: sURL
			});
			var sResourcePath = sap.ui.require.toUrl("sap/ui/rta/test/rtaOpenUI5Only");

			oMockServer.simulate(`${sResourcePath}/mockserver/metadata.xml`, {
				sMockdataBaseUrl: `${sResourcePath}/mockserver`,
				bGenerateMissingMockData: true
			});

			oMockServer.start();

			var oModel = new ODataModel(sURL, {
				json: true,
				loadMetadataAsync: true
			});
			oModel.setDefaultBindingMode(BindingMode.TwoWay);

			var oView = this.getView();
			oView.setModel(oModel);

			var oI18nModel = new ResourceModel({
				bundleName: "sap.ui.rta.test.rtaOpenUI5Only.i18n.i18n"
			});
			oView.setModel(oI18nModel, "i18n");

			var oData = {
				readonly: false,
				mandatory: false,
				visible: true,
				enabled: true
			};

			var oStateModel = new JSONModel();
			oStateModel.setData(oData);
			oView.setModel(oStateModel, "state");

			const oExtraData = {
				data: {
					value1: "value1",
					value2: "value2"
				}
			};

			const oExtraModel = new JSONModel(oExtraData);
			oView.setModel(oExtraModel, "extraModel");

			this._aData.push(
				new Promise(function(resolve) {
					oView.byId("MainForm").bindElement({
						path: "/EntityTypes2(EntityType02_Property01='EntityType02Property01Value')",
						events: {
							dataReceived: resolve
						},
						parameters: {
							expand: "to_EntityType02Nav"
						}
					});
				}),
				new Promise(function(resolve) {
					oView.byId("GroupEntityType01").bindElement({
						path: "/EntityTypes(Property01='propValue01',Property02='propValue02',Property03='propValue03')",
						events: {
							dataReceived: resolve
						}
					});
				})
			);
		},

		switchToAdaptionMode() {
			sap.ui.require([
				"sap/ui/rta/api/startKeyUserAdaptation"
			], function(startKeyUserAdaptation) {
				startKeyUserAdaptation({
					rootControl: this.getOwnerComponent()
				});
			}.bind(this));
		},

		isDataReady() {
			return Promise.all(this._aData);
		}
	});
});

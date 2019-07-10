sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel"
], function(
	Controller,
	MockServer,
	ODataModel,
	ResourceModel,
	JSONModel
) {
	"use strict";

	return Controller.extend("sap.ui.rta.test.additionalElements.ComplexTest", {
		_data: [],

		onInit: function () {
			var sURL;
			var oModel;
			var oView;

			sURL = "/destinations/E91/sap/opu/odata/SAP/AdditionalElementsTest/";

			var oMockServer = new MockServer({
				rootUri: sURL
			});
			this._sResourcePath = jQuery.sap.getResourcePath("sap/ui/rta/test/additionalElements");

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
				bundleName: "sap.ui.rta.test.additionalElements.i18n.i18n"
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
				new Promise(function (resolve) {
					oView.bindElement({
						path: "/EntityTypes(Property01='propValue01',Property02='propValue02',Property03='propValue03')",
						events: {
							dataReceived: resolve
						}
					});
				}),
				new Promise(function (resolve) {
					oView.byId("GroupEntityType01").bindElement({
						path: "/EntityTypes(Property01='propValue01',Property02='propValue02',Property03='propValue03')",
						events: {
							dataReceived: resolve
						}
					});
				}),

				new Promise(function (resolve) {
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
		},

		_getUrlParameter: function (sParam) {
			var sReturn = "";
			var sPageURL = window.location.search.substring(1);
			var sURLVariables = sPageURL.split('&');
			for (var i = 0; i < sURLVariables.length; i++) {
				var sParameterName = sURLVariables[i].split('=');
				if (sParameterName[0] === sParam) {
					sReturn = sParameterName[1];
				}
			}
			return sReturn;
		},

		switchToAdaptionMode: function () {
			sap.ui.require([
				"sap/ui/rta/RuntimeAuthoring"
			], function(RuntimeAuthoring) {
				var oRta = new RuntimeAuthoring({
					rootControl: this.getOwnerComponent(),
					flexSettings: {
						developerMode: false
					}
				});
				oRta.attachEvent('stop', function() {
					oRta.destroy();
				});
				oRta.start();
			}.bind(this));
		},

		isDataReady: function () {
			return Promise.all(this._data);
		}
	});
});
(function () {
	"use strict";

	sap.ui.controller("sap.ui.rta.test.additionalElements.ComplexTest", {

		_data: [],

		onInit: function () {
			var sURL, oModel, oView;

			jQuery.sap.require("sap.ui.core.util.MockServer");
			jQuery.sap.require("sap.ui.model.resource.ResourceModel");

			sURL = "/destinations/E91/sap/opu/odata/SAP/AdditionalElementsTest/";

			var oMockServer = new sap.ui.core.util.MockServer({
				rootUri: sURL
			});
			this._sResourcePath = jQuery.sap.getResourcePath("sap/ui/rta/test/additionalElements");

			oMockServer.simulate(this._sResourcePath + "/mockserver/metadata.xml", this._sResourcePath + "/mockserver");

			oMockServer.start();

			oModel = new sap.ui.model.odata.v2.ODataModel(sURL, {
				json: true,
				loadMetadataAsync: true
			});

			oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			this._oModel = oModel;


			oView = this.getView();
			oView.setModel(oModel);

			var i18nModel = new sap.ui.model.resource.ResourceModel({
				bundleName: "sap.ui.rta.test.additionalElements.i18n.i18n"
			});
			oView.setModel(i18nModel, "i18n");

			var data = {
				readonly: false,
				mandatory: false,
				visible: true,
				enabled: true
			};

			var oStateModel = new sap.ui.model.json.JSONModel();
			oStateModel.setData(data);
			oView.setModel(oStateModel, "state");

			this._data.push(
				new Promise(function (resolve, reject) {
					oView.bindElement({
						path: "/EntityTypes(Property01='propValue01',Property02='propValue02',Property03='propValue03')",
						events: {
							dataReceived: resolve
						}
					});
				}),
				new Promise(function (resolve, reject) {
					oView.byId("GroupEntityType01").bindElement({
						path: "/EntityTypes(Property01='propValue01',Property02='propValue02',Property03='propValue03')",
						events: {
							dataReceived: resolve
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
			var oRta = new sap.ui.rta.RuntimeAuthoring({
				rootControl: this.getOwnerComponent().getAggregation("rootControl"),
				flexSettings: {
					developerMode: false
				}
			});
			oRta.attachEvent('stop', function() {
				oRta.destroy();
			});
			oRta.start();
		},

		isDataReady: function () {
			return Promise.all(this._data);
		}

	});

})();

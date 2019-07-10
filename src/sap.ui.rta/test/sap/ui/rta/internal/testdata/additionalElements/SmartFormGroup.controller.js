sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel"
], function(
	Controller,
	MockServer,
	ODataModel,
	JSONModel
) {
	"use strict";

	return Controller.extend("sap.ui.rta.test.additionalElements.SmartFormGroup", {
		onInit : function () {
			var sURL = "/destinations/E91/sap/opu/odata/SAP/AdditionalElementsTest/?sap-documentation=all";
			var oModel;
			var oView;

			var oMockServer = new MockServer({
				rootUri : sURL
			});
			this._sResourcePath = jQuery.sap.getResourcePath("sap/ui/rta/test/additionalElements");

			oMockServer.simulate(this._sResourcePath + "/mockserver/metadata.xml", this._sResourcePath + "/mockserver");

			oMockServer.start();

			oModel = new ODataModel(sURL, {
				json : true,
				loadMetadataAsync : true
			});

			oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			oModel.setCountSupported(false);
			this._oModel = oModel;


			oView = this.getView();
			oView.setModel(oModel);

			var data = {
				readonly : false,
				mandatory : false,
				visible : true,
				enabled : true
			};

			var oStateModel = new JSONModel();
			oStateModel.setData(data);
			oView.setModel(oStateModel, "state");

			this.byId("obheader0").bindElement("/EntityTypes(Property01='propValue01',Property02='propValue02',Property03='propValue03')");
			this.byId("MainForm").bindElement("/EntityTypes(Property01='propValue01',Property02='propValue02',Property03='propValue03')");
		},

		_getUrlParameter : function(sParam) {
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

		switchToAdaptionMode : function() {
			sap.ui.require([
				"sap/ui/rta/RuntimeAuthoring"
			], function(RuntimeAuthoring) {
				var oRta = new RuntimeAuthoring({
					rootControl : sap.ui.getCore().byId("Comp1---idMain1"),
					customFieldUrl : this._sResourcePath + "/testdata/rta/CustomField.html",
					showCreateCustomField : (this._getUrlParameter("sap-ui-xx-ccf") === "true")
				});
				oRta.attachEvent('stop', function() {
					oRta.destroy();
				});
				oRta.start();
			}.bind(this));
		}
	});
});
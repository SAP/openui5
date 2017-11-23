sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/RuntimeAuthoring"
], function(Controller, MockServer, ResourceModel, ODataModel, JSONModel, RuntimeAuthoring) {
	"use strict";

	return Controller.extend("sap.ui.rta.test.variantManagement.controller.Main", {
		_data: [],

		onInit: function () {
			var oView = this.getView();
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

			//TO scroll to Vertical Layout - Causes Flicker
			//var oView = this.getView()
			//jQuery.sap.delayedCall(ObjectPageLayout.HEADER_CALC_DELAY + 1, this, function() {
			//	oView.byId("page").scrollToElement(oView.byId("OutsideObjectPageForm"));
			//	oView.byId("page").setEnableScrolling(false);
			//});
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

			if (this.getView().getModel("app").getProperty("/showAdaptButton"))	{

				jQuery.sap.require("sap.ui.rta.RuntimeAuthoring");
				var oRta = new RuntimeAuthoring({
					rootControl: this.getOwnerComponent().getAggregation("rootControl"),
					flexSettings: {
						developerMode: false
					}
				});
				oRta.attachEvent('stop', function() {
					oRta.destroy();
				});
				oRta.start();
			}
		},

		isDataReady: function () {
			return Promise.all(this._data);
		}
	});


});

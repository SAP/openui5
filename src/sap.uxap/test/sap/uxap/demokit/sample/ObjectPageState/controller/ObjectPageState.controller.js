sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (jQuery, JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageState.controller.ObjectPageState", {
		onInit: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/SharedJSONData/HRData.json");

			this.getView().setModel(oJsonModel, "ObjectPageModel");

			//navigate to a specific subsection on open
			this.oObjectPageLayout = this.byId("ObjectPageLayout");
			this.oTargetSubSection = this.byId("paymentSubSection");
			this.oTargetSubSection.setMode("Expanded");

			this.oObjectPageLayout.addEventDelegate({
				onAfterRendering: function () {
					//need to wait for the scrollEnablement to be active
					jQuery.sap.delayedCall(500, this.oObjectPageLayout, this.oObjectPageLayout.scrollToSection, [this.oTargetSubSection.getId()]);
				}.bind(this)
			});
		}
	});
}, true);

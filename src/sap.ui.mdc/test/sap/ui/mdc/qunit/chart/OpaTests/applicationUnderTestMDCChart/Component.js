sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/mdc/link/FakeFlpConnector"
], function (UIComponent,  FakeFlpConnector) {
	"use strict";

	return UIComponent.extend("applicationUnderTestMDCChart.Component", {

		metadata : {
			manifest: "json"
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			this.getRouter().initialize();

			//this.__initFakeFlpConnector();
		}

	});
});

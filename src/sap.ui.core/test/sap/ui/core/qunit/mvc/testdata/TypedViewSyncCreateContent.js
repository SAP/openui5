sap.ui.define(["sap/ui/core/mvc/View", "sap/m/Panel"], function(View, Panel) {
	"use strict";
	return View.extend("testdata.mvc.TypedView", {

		getControllerName: function() {
			return "testdata.mvc.TypedController";
		},

		/**
		 *
		 * @param oController may be null
		 * @returns {Promise<sap.ui.core.Control[]>}
		 */
		createContent: function(oController) {
			return new Panel(this.createId("myPanel"));
		}
	});

});

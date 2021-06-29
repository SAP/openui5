sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/m/Panel"
], function(View, Panel) {
	"use strict";

	return View.extend("test.routing.target.TypedView", {
		/**
		 * Returns the content of the View
		 *
		 * @param {sap.ui.core.mvc.Controller} oController may be null
		 * @returns {Promise<sap.ui.core.Control[]>} Promise that resolves with the content
		 */
		createContent: function(oController) {
			return new Promise(function(resolve) {
				var oPanel = new Panel(this.createId("myPanel"));
				resolve([oPanel]);
			}.bind(this));
		}
	});

});

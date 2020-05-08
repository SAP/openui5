sap.ui.define(["sap/ui/core/mvc/View", "sap/m/Panel", "testdata/mvc/TypedViewWithRendererRenderer"], function(View, Panel, Renderer) {
	"use strict";
	return View.extend("testdata.mvc.TypedViewWithRenderer", {

		renderer: Renderer,

		getControllerName: function() {
			return "testdata.mvc.TypedController";
		},

		/**
		 *
		 * @param oController may be null
		 * @returns {Promise<sap.ui.core.Control[]>}
		 */
		createContent: function(oController) {
			return new Promise(function(resolve) {
				var oPanel = new Panel(this.createId("myPanel"));
				resolve([oPanel]);
			}.bind(this));
		}
	});
});

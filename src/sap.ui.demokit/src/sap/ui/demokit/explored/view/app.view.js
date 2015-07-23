/*!
 * @copyright@
 */

sap.ui.define(["sap/ui/core/mvc/JSView"], function (JSView) {
	"use strict";

	sap.ui.jsview("sap.ui.demokit.explored.view.app", {

		getControllerName : function () {
			return "sap.ui.demokit.explored.view.app";
		},
		
		createContent : function (oController) {

			// to avoid scrollbars on desktop the root view must be set to block display
			this.setDisplayBlock(true);

			// create split app
			return new sap.m.SplitApp("splitApp", {
				afterDetailNavigate: function () {
					this.hideMaster();
				}
			});
		}
	});
});

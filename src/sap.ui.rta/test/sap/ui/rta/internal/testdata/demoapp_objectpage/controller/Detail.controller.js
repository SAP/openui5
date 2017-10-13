/*global location*/
sap.ui.define([
	"sap/ui/rta/test/Demo/ObjectPage/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.rta.test.Demo.ObjectPage.controller.Detail", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		switchToAdaptionMode : function() {
			var that = this;
			sap.ui.require(["sap/ui/rta/RuntimeAuthoring"], function(RTA) {
				var oRta = new RTA({
					rootControl : that.getOwnerComponent().getAggregation("rootControl"),
					flexSettings: {
						developerMode: false
					}
				});
				oRta.attachEvent('stop', function() {
					oRta.destroy();
				});
				oRta.start();
			});
		}
	});

});
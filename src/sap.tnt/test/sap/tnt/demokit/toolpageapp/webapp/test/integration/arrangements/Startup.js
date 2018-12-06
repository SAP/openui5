/* global document */

sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	/**
	 *  Manually set OPA styles when running test with the TNT toolpage.
	 *  Function is executed after DOM is available
	 */
	function fnSetupTNTStyles() {
		// limit app to 80% screen size to see QUnit test results
		var oBody = document.body;
		oBody.style.width = "80%";
		oBody.style.left = "20%";
		oBody.style.position = "absolute";

		// set OPA component class
		if (!oBody.classList.contains("sapUiOpaBodyComponent")) {
			oBody.classList.add("sapUiOpaBodyComponent");
		}
	}

	(document.readyState === "loading") ? document.addEventListener("DOMContentLoaded", fnSetupTNTStyles) : fnSetupTNTStyles();

	return Opa5.extend("sap.ui.demo.toolpageapp.test.integration.arrangements.Startup", {

		iStartMyApp : function (oOptionsParameter) {
			var oOptions = oOptionsParameter || {};

			// start the app UI component
			this.iStartMyUIComponent({
				componentConfig: {
					name: "sap.ui.demo.toolpageapp",
					async: true
				},
				hash: oOptions.hash,
				autoWait: oOptions.autoWait
			});
		}

	});
});

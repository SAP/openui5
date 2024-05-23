(function() {
	"use strict";

	var oLink = document.createElement("link");
	oLink.rel = "stylesheet";
	oLink.href = "test-resources/sap/ui/core/qunit/bootstrap/preloadedCss/themes/base/library.css";
	oLink.setAttribute("id", "sap-ui-theme-fantasyLib");

	function listener(oEvent) {
		var bError = oEvent.type === "error";
		oLink.setAttribute("data-sap-ui-ready", !bError);
		oLink.removeEventListener("load", listener);
		oLink.removeEventListener("error", listener);
	}

	oLink.addEventListener("load", listener);
	oLink.addEventListener("error", listener);

	document.head.appendChild(oLink);
}());

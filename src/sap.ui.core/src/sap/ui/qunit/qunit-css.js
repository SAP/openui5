/*!
 * ${copyright}
 */

(function() {
	"use strict";

	var oLink = document.createElement("link");
	oLink.rel = "stylesheet";
	oLink.href = sap.ui.require.toUrl("sap/ui/thirdparty/qunit.css");
	document.head.appendChild(oLink);
}());
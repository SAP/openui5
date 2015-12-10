/*!
 * @copyright@
 */

sap.ui.getCore().attachInit(function () {
	"use strict";

	/*global jQuery */
	jQuery.sap.includeStyleSheet(jQuery.sap.getResourcePath("sap/ui/demokit/demoapps/css/style.css"));

	sap.ui.require(["sap/ui/core/ComponentContainer"], function (ComponentContainer) {

		new ComponentContainer({
			name : "sap.ui.demokit.demoapps"
		}).placeAt("content");

	});

});

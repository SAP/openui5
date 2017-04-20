/*!
 * @copyright@
 */

sap.ui.getCore().attachInit(function () {
	"use strict";

	/*global jQuery */
	jQuery.sap.includeStyleSheet(jQuery.sap.getResourcePath("sap/ui/documentation/demoapps/css/style.css"));

	sap.ui.require(["sap/ui/core/ComponentContainer"], function (ComponentContainer) {
		new ComponentContainer({
			name : "sap.ui.documentation.demoapps"
		}).placeAt("content");
	});

});
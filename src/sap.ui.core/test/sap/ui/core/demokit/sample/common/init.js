/*!
 * ${copyright}
 */

(function () {
	"use strict";
	/* eslint-disable no-alert */

	sap.ui.getCore().attachInit(function () {
		var sComponentName = jQuery.sap.getUriParameters().get("component");

		if (!sComponentName) {
			alert("Missing URL parameter 'component', e.g. '?component=ViewTemplate.scenario'");
		} else {
			jQuery.sap.registerModulePath(
				"sap.ui.core.sample", "test-resources/sap/ui/core/demokit/sample");
			try {
				new sap.ui.core.ComponentContainer({
					component : sap.ui.component({
						name : "sap.ui.core.sample." + sComponentName,
						settings : {
							id : sComponentName
						}
					})}
				).placeAt('content');
			} catch (e) {
				alert("Error while instantiating sap.ui.core.sample." + sComponentName + ":" + e);
			}
		}
	});
}());
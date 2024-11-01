sap.ui.define(['testdata/customizing/async/viewExtensions/sap/Component'],
	function(Component) {
	"use strict";

	// extends from testdata.customizing.async.viewExtensions.sap.Component
	// ui5lint-disable-next-line async-component-flags
	return Component.extend("testdata.customizing.async.viewExtensions.customer.Component", {
		metadata : {
			version : "1.0"
		}
	});
});

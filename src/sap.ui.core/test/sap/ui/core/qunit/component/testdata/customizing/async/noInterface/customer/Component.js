sap.ui.define(['testdata/customizing/async/noInterface/sap/Component'],
	function(Component) {
	"use strict";

	// extends from testdata.customizing.async.noInterface.sap.Component
	// ui5lint-disable-next-line async-component-flags
	return Component.extend("testdata.customizing.async.noInterface.customer.Component", {
		metadata : {
			version : "1.0"
		}
	});
});

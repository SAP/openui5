sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	var oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.ui.layout",
		objectCapabilities: {
			"sap.ui.layout.BlockLayoutRow": {
				rendererHasDependencies: true // renderer expects a parent with fn getBackground
			},
			"sap.ui.layout.form.ResponsiveGridLayoutPanel": {
				moduleName: "sap/ui/layout/form/ResponsiveGridLayout",
				rendererHasDependencies: true
			},
			"sap.ui.layout.form.ResponsiveLayoutPanel": {
				moduleName: "sap/ui/layout/form/ResponsiveLayout"
			}
		}
	});

	return oConfig;
});
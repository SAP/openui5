sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	var oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.ui.documentation",
		objectCapabilities: {
			"sap.ui.documentation.Container": {
				moduleName: "sap/ui/documentation/ObjectPageSubSection"
			}
		}
	});

	return oConfig;
});
sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	const oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.ui.table"
	});

	return oConfig;
});
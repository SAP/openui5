sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	var oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.ui.fl",
		objectCapabilities: {
			"sap.ui.fl.util.ManagedObjectModel": {
				properties: {
					data: GenericTestCollection.ExcludeReason.NotChangeableAfterInit,
					name: GenericTestCollection.ExcludeReason.NotChangeableAfterInit,
					object: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				}
			}
		}
	});

	return oConfig;
});
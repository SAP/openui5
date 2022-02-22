sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	var oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.uxap",
		objectCapabilities: {
			"sap.uxap.BreadCrumbs": {
				create: function (BreadCrumbs, mParameters) {
					return new Promise(function (resolve, reject) {
						sap.ui.require(["sap/m/Text"], function (Text) {
							mParameters = mParameters || {};
							mParameters.currentLocation = new Text({ text: "Test"});
							resolve(new BreadCrumbs(mParameters));
						}, reject);
					});
				}
			}
		}
	});

	return oConfig;
});
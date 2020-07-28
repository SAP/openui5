/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/flp/FlpLinkDelegate"
], function(LinkDelegate) {
	"use strict";

	var SampleLinkDelegate = Object.assign({}, LinkDelegate);

	SampleLinkDelegate.beforeNavigationCallback = function(oPayload, oEvent) {
		return new Promise(function(resolve) {
			setTimeout(function() {
				resolve(true);
			}, 3000);
		});
	};

	return SampleLinkDelegate;
}, /* bExport= */ true);

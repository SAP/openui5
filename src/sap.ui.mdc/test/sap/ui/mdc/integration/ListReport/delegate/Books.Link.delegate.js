/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/mdc/LinkDelegate",
    "sap/ui/mdc/link/LinkItem"
], function(LinkDelegate, LinkItem) {
	"use strict";

	var SampleLinkDelegate = Object.assign({}, LinkDelegate);

    SampleLinkDelegate.fetchLinkItems = function() {
		var aLinkItems = [
			new LinkItem({
				key: "L1_1",
				text: "Manage author",
				href: self.location.pathname + "#/Authors/{author_ID}",
				target: "_blank"
            })
		];
		return Promise.resolve(aLinkItems);
    };

	return SampleLinkDelegate;
}, /* bExport= */ true);

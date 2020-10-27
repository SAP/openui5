/*
 * ! ${copyright}
 */
sap.ui.define([
    "sap/ui/mdc/LinkDelegate",
	"sap/ui/mdc/link/LinkItem"
], function(LinkDelegate, LinkItem) {
    "use strict";

    var SampleLinkDelegate = Object.assign({}, LinkDelegate);

	SampleLinkDelegate.fetchLinkType = function(oPayload) {
		var oLinkItem = new LinkItem({
			key: "L1_1",
			text: "Manage author",
			href: self.location.pathname + "#/Authors/{author_ID}",
                target: "_blank"
		});
		var oLinkType = {
			type: 1,
			directLink: oLinkItem
		};
		return Promise.resolve(oLinkType);
	};

    return SampleLinkDelegate;
}, /* bExport= */ true);

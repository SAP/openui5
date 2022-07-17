/*!
 * ${copyright}
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
			href: self.location.pathname + (self.location.search && self.location.search) +  "#/Authors/{author_ID}"
		});
		var oLinkType = {
			type: 1,
			directLink: oLinkItem
		};
		return Promise.resolve(oLinkType);
	};

    return SampleLinkDelegate;
});

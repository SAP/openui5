/*
 * ! ${copyright}
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
				key: "IDLinkItem00",
				text: "{ProductId}",
				description: "{Name}",
				icon: "{Image}",
				href: "#link00"
			}),
			new LinkItem({
				key: "IDLinkItem01",
				text: "Review Description",
				description: "Transaction code DR",
				icon: "sap-icon://to-be-reviewed",
				href: "#link01"
			}),
			new LinkItem({
				key: "IDLinkItem02",
				text: "Edit Description",
				description: "Transaction code DE",
				icon: "sap-icon://user-edit",
				href: "#link02"
			})
		];
		return Promise.resolve(aLinkItems);
	};

	return SampleLinkDelegate;
}, /* bExport= */ true);

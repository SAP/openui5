sap.ui.define([
	"sap/ui/mdc/LinkDelegate",
	"sap/ui/mdc/link/LinkItem"
], function(LinkDelegate, LinkItem) {
	'use strict';

	const oLinkDelegate = Object.assign({}, LinkDelegate);

	oLinkDelegate.fetchLinkItems = (oLink) => {
		return Promise.resolve([
			new LinkItem({
				text: "Link_1",
				href: "sap.com",
				initiallyVisible: true
			})
		]);
	};

	return oLinkDelegate;
});
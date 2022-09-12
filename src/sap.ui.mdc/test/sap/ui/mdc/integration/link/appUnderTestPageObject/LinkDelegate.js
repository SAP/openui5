/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/LinkDelegate",
	"sap/ui/mdc/link/LinkItem"
], function(LinkDelegate, LinkItem) {
	"use strict";

	var sBaseUrl = window.location.href;

	var SampleLinkDelegate = Object.assign({}, LinkDelegate);

	SampleLinkDelegate.fetchLinkItems = function() {
		var aLinkItems = [
			new LinkItem({
				key: "IDLinkItem00",
				text: "TextLinkItem00",
				href: sBaseUrl + "#link00",
				internalHref: sBaseUrl + "#internalLink00"
			}),
			new LinkItem({
				key: "IDLinkItem01",
				text: "TextLinkItem01",
				icon: "sap-icon://to-be-reviewed",
				href: sBaseUrl + "#link01",
				internalHref: sBaseUrl + "#internalLink01"
			}),
			new LinkItem({
				key: "IDLinkItem02",
				text: "TextLinkItem02",
				icon: "sap-icon://user-edit",
				href: sBaseUrl + "#link02",
				internalHref: sBaseUrl + "#internalLink02"
			})
		];
		return Promise.resolve(aLinkItems);
	};

	return SampleLinkDelegate;
});

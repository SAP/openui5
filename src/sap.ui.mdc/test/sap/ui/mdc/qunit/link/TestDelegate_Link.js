/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/LinkDelegate",
	"sap/ui/mdc/enums/LinkType"
], function(LinkDelegate, LinkType) {
	"use strict";

	const SampleLinkDelegate = Object.assign({}, LinkDelegate);

	SampleLinkDelegate.modifyLinkItems = function(oLink, oBindingContext, aLinkItems) {
		const oPayload = oLink.getPayload();
		if (oPayload.modfiedLinkItemTexts) {
			aLinkItems.forEach(function(oLinkItem) {
				oLinkItem.setText(oPayload.modfiedLinkItemTexts[oLinkItem.getText()]);
			});

			return Promise.resolve(aLinkItems);
		}
		return Promise.resolve(aLinkItems);
	};

	SampleLinkDelegate.fetchLinkItems = function(oLink) {
		const oPayload = oLink.getPayload();
		if (oPayload.items) {
			return Promise.resolve(oPayload.items);
		}
		return Promise.resolve([]);
	};

	SampleLinkDelegate.beforeNavigationCallback = function (oLink, oEvent) {
		const oPayload = oLink.getPayload();
		if (oPayload.beforeNavigationCallback) {
			return oPayload.beforeNavigationCallback();
		}
		return Promise.resolve(true);
	};

	SampleLinkDelegate.fetchLinkType = function(oLink) {
		const oPayload = oLink.getPayload();
		if (oPayload.fetchLinkType) {
			return oPayload.fetchLinkType(oPayload, oLink);
		}
		return Promise.resolve({
			linkType: {
				type: LinkType.Popover,
				directLink: undefined
			},
			newLinkTypePromise: null
		});
	};

	SampleLinkDelegate.fetchAdditionalContent = function(oLink) {
		const oPayload = oLink.getPayload();
		if (oPayload.additionalContent) {
			return Promise.resolve(oPayload.additionalContent);
		}
		return Promise.resolve([]);
	};

	return SampleLinkDelegate;
});

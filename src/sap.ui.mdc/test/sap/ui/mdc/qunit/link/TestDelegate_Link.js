/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/LinkDelegate"
], function(LinkDelegate) {
	"use strict";

	const SampleLinkDelegate = Object.assign({}, LinkDelegate);
	SampleLinkDelegate.apiVersion = 2;//CLEANUP_DELEGATE

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
				type: 2,
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

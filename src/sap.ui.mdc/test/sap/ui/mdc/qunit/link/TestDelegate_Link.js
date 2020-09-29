/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/LinkDelegate"
], function(LinkDelegate) {
	"use strict";

	var SampleLinkDelegate = Object.assign({}, LinkDelegate);

	SampleLinkDelegate.modifyLinkItems = function(oPayload, oBindingContext, aLinkItems) {
		if (oPayload.modfiedLinkItemTexts) {
			aLinkItems.forEach(function(oLinkItem) {
				oLinkItem.setText(oPayload.modfiedLinkItemTexts[oLinkItem.getText()]);
			});

			return Promise.resolve(aLinkItems);
		}
		return Promise.resolve(aLinkItems);
	};

	SampleLinkDelegate.fetchLinkItems = function(oPayload) {
		if (oPayload.items) {
			return Promise.resolve(oPayload.items);
		}
		return Promise.resolve([]);
	};

	SampleLinkDelegate.beforeNavigationCallback = function (oPayload, oEvent) {
		if (oPayload.beforeNavigationCallback) {
			return oPayload.beforeNavigationCallback();
		}
		return Promise.resolve(true);
	};

	SampleLinkDelegate.fetchLinkType = function(oPayload, oLink) {
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

	return SampleLinkDelegate;
}, /* bExport= */ true);

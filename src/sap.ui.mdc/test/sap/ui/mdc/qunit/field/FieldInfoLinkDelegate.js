/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/flp/FlpLinkDelegate",
	"sap/ui/mdc/link/ContactDetails"
], function (FlpLinkDelegate, ContactDetails) {
	"use strict";

	var SampleLinkDelegate = Object.assign({}, FlpLinkDelegate);
	SampleLinkDelegate.apiVersion = 2;//CLEANUP_DELEGATE

	SampleLinkDelegate.fetchAdditionalContent = function (oLink) {
		var oPayload = oLink.getPayload();
		if (oPayload.loadAdditionalContent) {
			var aAdditionalContent = [
				new ContactDetails()
			];
			if (oPayload && oPayload.addAdditionalContent) {
				aAdditionalContent.push(oPayload.addAdditionalContent);
			}
			return Promise.resolve(aAdditionalContent);
		}
		return Promise.resolve([]);
	};

	SampleLinkDelegate.fetchLinkItems = function(oLink) {
		var oPayload = oLink.getPayload();
		if (oPayload.items) {
			return Promise.resolve(oPayload.items);
		}
		return Promise.resolve([]);
	};

	SampleLinkDelegate.fetchLinkType = function(oLink) {
		var oPayload = oLink.getPayload();
		if (oPayload.linkType) {
			return Promise.resolve(oPayload.linkType);
		}
		return Promise.resolve({
			type: 2,
			directLink: undefined
		});
	};

	return SampleLinkDelegate;
});

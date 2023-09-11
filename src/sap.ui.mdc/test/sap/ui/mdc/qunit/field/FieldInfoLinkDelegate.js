/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/flp/FlpLinkDelegate",
	"sap/ui/mdc/link/ContactDetails"
], function (FlpLinkDelegate, ContactDetails) {
	"use strict";

	const SampleLinkDelegate = Object.assign({}, FlpLinkDelegate);

	SampleLinkDelegate.fetchAdditionalContent = function (oLink) {
		const oPayload = oLink.getPayload();
		if (oPayload.loadAdditionalContent) {
			const aAdditionalContent = [
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
		const oPayload = oLink.getPayload();
		if (oPayload.items) {
			return Promise.resolve(oPayload.items);
		}
		return Promise.resolve([]);
	};

	SampleLinkDelegate.fetchLinkType = function(oLink) {
		const oPayload = oLink.getPayload();
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

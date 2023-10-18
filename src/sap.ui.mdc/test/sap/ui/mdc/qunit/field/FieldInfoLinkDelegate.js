/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/ushell/LinkDelegate",
	"testutils/link/ContactDetails",
	"sap/ui/mdc/enums/LinkType"
], function (UShellLinkDelegate, ContactDetails, LinkType) {
	"use strict";

	const SampleLinkDelegate = Object.assign({}, UShellLinkDelegate);

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
			type: LinkType.Popover,
			directLink: undefined
		});
	};

	return SampleLinkDelegate;
});

/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/flp/FlpLinkDelegate",
	"sap/ui/mdc/link/ContactDetails"
], function (FlpLinkDelegate, ContactDetails) {
	"use strict";

	var SampleLinkDelegate = Object.assign({}, FlpLinkDelegate);

	SampleLinkDelegate.fetchAdditionalContent = function (oPayload) {
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

	SampleLinkDelegate.fetchLinkItems = function(oPayload) {
		if (oPayload.items) {
			return Promise.resolve(oPayload.items);
		}
		return Promise.resolve([]);
	};

	SampleLinkDelegate.fetchLinkType = function(oPayload) {
		if (oPayload.linkType) {
			return Promise.resolve(oPayload.linkType);
		}
		return Promise.resolve({
			type: 2,
			directLink: undefined
		});
	};

	return SampleLinkDelegate;
}, /* bExport= */ true);

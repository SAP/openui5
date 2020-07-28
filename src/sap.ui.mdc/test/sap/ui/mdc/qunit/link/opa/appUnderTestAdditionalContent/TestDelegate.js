/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/LinkDelegate",
	"sap/ui/mdc/link/LinkItem",
	"sap/ui/mdc/link/ContactDetails",
	"sap/ui/mdc/link/ContactDetailsItem"
], function(LinkDelegate, LinkItem, ContactDetails, ContactDetailsItem) {
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
			})
		];
		return Promise.resolve(aLinkItems);
	};

	SampleLinkDelegate.fetchAdditionalContent = function() {
		var aAdditionalConten = [
			new ContactDetails({
				items: new ContactDetailsItem({
					photo: "/testsuite/test-resources/sap/ui/documentation/sdk/images/johnDoe.png",
					formattedName: "John Doe",
					title: "Developer",
					role: "Research & Development",
					org: "New Economy"
				})
			})
		];
		return Promise.resolve(aAdditionalConten);
	};

	return SampleLinkDelegate;
}, /* bExport= */ true);

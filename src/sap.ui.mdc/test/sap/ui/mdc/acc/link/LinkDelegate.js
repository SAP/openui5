/*
 * ! ${copyright}
 */
sap.ui.define([
    "sap/ui/mdc/LinkDelegate",
	"sap/ui/mdc/link/LinkItem",
	"sap/ui/mdc/link/ContactDetails",
	"sap/ui/mdc/link/ContactDetailsItem",
	"sap/ui/mdc/link/ContactDetailsPhoneItem",
	"sap/ui/mdc/link/ContactDetailsEmailItem",
	"sap/ui/mdc/link/ContactDetailsAddressItem"
], function(LinkDelegate, LinkItem, ContactDetails, ContactDetailsItem, ContactDetailsPhoneItem, ContactDetailsEmailItem, ContactDetailsAddressItem) {
    "use strict";

    var SampleLinkDelegate = Object.assign({}, LinkDelegate);

    SampleLinkDelegate.fetchLinkItems = function() {
        var aLinkItems = [
			new LinkItem({
				key: "IDLinkItem00",
				text: "{Name}",
				description: "{Category}",
				icon: "/testsuite/test-resources/sap/ui/documentation/sdk/images/HT-1031.jpg",
				href: "?testsuite_mdc_acc_link_MainNavigationAction_00#link"
			}),
			new LinkItem({
				key: "IDLinkItem01",
				text: "Display Description",
				description: "Transaction code DD",
				href: "?testsuite_mdc_acc_link_Actions_01#link"
			}),
			new LinkItem({
				key: "IDLinkItem02",
				text: "Review Description",
				description: "Transaction code DR",
				icon: "sap-icon://to-be-reviewed",
				href: "?testsuite_mdc_acc_link_Actions_02#link"
			}),
			new LinkItem({
				key: "IDLinkItem03",
				text: "Edit Description",
				description: "Transaction code DE",
				icon: "sap-icon://user-edit",
				href: "?testsuite_mdc_acc_link_Actions_03#link"
			}),
			new LinkItem({
				key: "IDLinkItem04",
				initiallyVisible: true,
				text: "InitiallyVisible",
				description: "Transaction SHELL",
				icon: "sap-icon://mileage",
				href: "?testsuite_mdc_acc_link_Actions_04#link"
			}),
			new LinkItem({
				key: "IDLinkItem05",
				text: "Edit Description (Additional)",
				icon: "sap-icon://edit",
				href: "?testsuite_mdc_acc_link_AdditionalActions_01#link"
			}),
			new LinkItem({
				key: "IDLinkItem06",
				text: "Review Description (Additional)",
				icon: "sap-icon://pixelate",
				href: "?testsuite_mdc_acc_link_AdditionalActions_02#link"
			})
        ];
        return Promise.resolve(aLinkItems);
	};

	SampleLinkDelegate.fetchAdditionalContent = function() {
		var aAdditionalContent = [
			new ContactDetails({
				items: new ContactDetailsItem({
					photo: "/testsuite/test-resources/sap/ui/documentation/sdk/images/johnDoe.png",
					formattedName: "John Doe",
					title: "Developer",
					role: "Research & Development",
					org: "New Economy",
					phones: [
						new ContactDetailsPhoneItem({
							uri: "+0049 175 123456",
							types: [
								"cell",
								"preferred"
							]
						}),
						new ContactDetailsPhoneItem({
							uri: "+001 6101 34869-9",
							types: [
								"fax"
							]
						}),
						new ContactDetailsPhoneItem({
							uri: "+001 6101 34869-0",
							types: [
								"work"
							]
						})
					],
					emails: [
						new ContactDetailsEmailItem({
							uri: "john.doe@neweconomy.com",
							types: [
								"preferred", "work"
							]
						})
					],
					addresses: [
						new ContactDetailsAddressItem({
							street: "800 E 3rd St.",
							code: "90013",
							locality: "Los Angeles",
							region:"CA",
							country:"USA",
							types: [
								"work"
							]
						})
					]
				})
			})
		];

		return Promise.resolve(aAdditionalContent);
	};

    return SampleLinkDelegate;
}, /* bExport= */ true);
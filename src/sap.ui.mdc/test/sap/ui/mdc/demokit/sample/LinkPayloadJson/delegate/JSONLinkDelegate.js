/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/LinkDelegate",
	"sap/ui/mdc/link/LinkItem",
	"sap/m/Title",
	"sap/m/Text",
	"sap/m/Label",
	"sap/m/Image",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/mdc/enums/LinkType",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/library"
], function(LinkDelegate, LinkItem, Title, Text, Label, Image, SimpleForm, LinkType, Button, Dialog, mobileLibrary) {
	"use strict";

	const SampleLinkDelegate = Object.assign({}, LinkDelegate);

	const ButtonType = mobileLibrary.ButtonType;
	const DialogType = mobileLibrary.DialogType;

	SampleLinkDelegate.fetchLinkType = function(oLink) {
		const oPayload = oLink.getPayload();

		let sLinkType = LinkType.Text;
		if (oPayload?.displayAs == "Popover") {
			sLinkType = LinkType.Popover;
		}
		if (oPayload?.displayAs == "DirectLink") {
			sLinkType = LinkType.Popover;
		}
		if (oPayload?.displayAs == "Text") {
			sLinkType = LinkType.Text;
		}

		return Promise.resolve({
			initialType: {
				type: sLinkType,
				directLink: undefined
			},
			runtimeType: null
		});

	};

	SampleLinkDelegate.beforeNavigationCallback = function(oLink, oEvent) {
		const bAlwaysNavigate = oLink.getPayload()?.alwaysNavigate ?? false;
		if (bAlwaysNavigate) {
			return Promise.resolve(true);
		}

		return new Promise((resolve) => {
			const oApproveDialog = new Dialog({
				type: DialogType.Message,
				title: "Confirm",
				content: new Text({ text: "Do you want to navigate?" }),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: "Navigate",
					press: () => {
						resolve(true);
						oApproveDialog.close();
					}
				}),
				endButton: new Button({
					text: "Cancel",
					press: () => {
						resolve(false);
						oApproveDialog.close();
					}
				})
			});
			oApproveDialog.open();
		});
	};

	SampleLinkDelegate.fetchLinkItems = function(oLink) {
		const sProductId = oLink.getPayload()?.product ?? "product1";
		const oFirstLink = new LinkItem({
			key: oLink.getId() + "link01",
			text: `Product`,
			description: `{products>/${sProductId}/name}`,
			icon: `{products>/${sProductId}/image}`,
			href: `${self.location.pathname}${(self.location.search && self.location.search)}#product-display?productId=${sProductId}`,
			initiallyVisible: true
		});

		const oPayload = oLink.getPayload();
		if (oPayload?.displayAs === "DirectLink") {
			return Promise.resolve([oFirstLink]);
		}

		const aLinkItems = [
			oFirstLink,
			new LinkItem({
				key: oLink.getId() + "link02",
				text: "Second Link",
				description: "This is a second link",
				href: "#/controls"
			})
		];
		return Promise.resolve(aLinkItems);
	};

	SampleLinkDelegate.fetchAdditionalContent = function(oLink) {
		const oPayload = oLink.getPayload();
		if (oPayload?.displayAs === "DirectLink") {
			return Promise.resolve([]);
		}

		const aAdditionalContent = [
			_getProductAdditionalContent(oLink)
		];
		return Promise.resolve(aAdditionalContent);
	};

	function _getProductAdditionalContent(oLink) {
		const sProductId = oLink.getPayload()?.product ?? "product1";
		const oImage = new Image({
			src: `{products>/${sProductId}/image}`,
			width: "100px"
		});

		const oTitle = new Title({
			text: `{products>/${sProductId}/productId}`
		});

		const oTextName = new Text({
			text: `{products>/${sProductId}/name}`
		});

		const oLabelName = new Label({
			text: "Name"
		});

		const oTextCategory = new Text({
			text: `{products>/${sProductId}/category}`
		});

		const oLabelCategory = new Label({
			text: "Category"
		});

		const oForm = new SimpleForm({
			content: [
				oTitle,
				oImage,
				oLabelName,
				oTextName,
				oLabelCategory,
				oTextCategory
			]
		});

		return oForm;
	}

	return SampleLinkDelegate;
});

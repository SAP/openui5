/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/LinkDelegate",
	"sap/ui/mdc/link/LinkItem",
	"sap/ui/mdc/enums/LinkType",
	"sap/ui/core/Title",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/Text",
	"sap/m/MessageToast"
], function(LinkDelegate, LinkItem, LinkType, Title, SimpleForm, Text, MessageToast) {
	"use strict";

	const CustomLinkDelegate = Object.assign({}, LinkDelegate);

	/**
	 * Determines the link type - always Popover in this sample.
	 */
	CustomLinkDelegate.fetchLinkType = function(oLink) {
		return Promise.resolve({
			initialType: {
				type: LinkType.Popover,
				directLink: undefined
			},
			runtimeType: null
		});
	};

	/**
	 * Fetches link items based on the delegate payload.
	 * The payload contains a "process" key that maps to the JSON model data.
	 */
	CustomLinkDelegate.fetchLinkItems = function(oLink) {
		const oPayload = oLink.getPayload();
		const sProcess = oPayload?.process;

		if (!sProcess) {
			return Promise.resolve([]);
		}

		const oModel = oLink.getModel("processes");
		const oData = oModel?.getProperty("/" + sProcess);

		if (!oData || !oData.links) {
			return Promise.resolve([]);
		}

		const aLinkItems = oData.links.map(function(oLinkData) {
			return new LinkItem({
				key: oLinkData.key,
				text: oLinkData.text,
				href: oLinkData.href,
				initiallyVisible: true
			});
		});

		return Promise.resolve(aLinkItems);
	};

	/**
	 * Provides additional content for the popover - contextual details about the process step.
	 */
	CustomLinkDelegate.fetchAdditionalContent = function(oLink) {
		const oPayload = oLink.getPayload();
		const sProcess = oPayload?.process;

		if (!sProcess) {
			return Promise.resolve([]);
		}

		const oModel = oLink.getModel("processes");
		const oData = oModel?.getProperty("/" + sProcess);

		if (!oData || !oData.links) {
			return Promise.resolve([]);
		}

		const oForm = new SimpleForm({
			maxContainerCols: 1,
			content: [
				new Title({ text: oData.title }),
				new Text({ text: oData.detail })
			]
		});

		return Promise.resolve([oForm]);
	};

	/**
	 * Returns the popover title. The default implementation calls getParent().getValue()
	 * which assumes the Link is inside an mdc:Field. Since this Link is standalone,
	 * we provide a custom title based on the payload.
	 */
	CustomLinkDelegate.fetchPopoverTitle = function(oLink, oPanel) {
		const oPayload = oLink.getPayload();
		const sProcess = oPayload?.process;
		const oModel = oLink.getModel("processes");
		const oData = oModel?.getProperty("/" + sProcess);
		const sTitle = oData?.title || "Navigation";
		const oLabelledByControl = LinkDelegate._getLabelledByControl(oPanel);
		return Promise.resolve({ sTitle, oLabelledByControl });
	};

	/**
	 * Called before navigation - allows interception.
	 * In this sample, navigation always proceeds.
	 */
	CustomLinkDelegate.beforeNavigationCallback = function(oLink, oEvent) {
		return Promise.resolve(true);
	};

	CustomLinkDelegate.modifyLinkItems = function(oLink, oBindingContext, aLinkItems) {
		// Sample-scenario: notify the user when a process step has no navigation targets.
		if (aLinkItems.length === 0) {
			MessageToast.show("No navigation targets available for this step");
		}
		return Promise.resolve(aLinkItems);
	};

	return CustomLinkDelegate;
});

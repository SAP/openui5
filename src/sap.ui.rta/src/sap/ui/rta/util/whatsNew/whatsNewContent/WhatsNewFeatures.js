/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib"
], function(
	Lib
) {
	"use strict";

	const WhatsNewFeatures = {};

	const oTextResources = Lib.getResourceBundleFor("sap.ui.rta");

	/**
	 * @returns {object[]} All whats new features
	 */
	WhatsNewFeatures.getAllFeatures = function() {
		return aWhatsNewFeaturesContent;
	};

	/**
	 * @param {object[]} aDontShowAgainFeatureIds Array of feature ids that should be excluded from the whats new dialog
	 * @returns {object[]} Filtered whats new features
	 */
	WhatsNewFeatures.filterDontShowAgainFeatures = function(aDontShowAgainFeatureIds) {
		return aWhatsNewFeaturesContent.filter(function(oFeature) {
			return !aDontShowAgainFeatureIds?.includes(oFeature.featureId);
		});
	};

	/**
	 * The `aWhatsNewFeaturesContent` array defines the features that will be displayed inside the "What's New" dialog.
	 * To add a new feature, add a new object to this array. Each feature object should have the following structure:
	 *
	 *	{
	 *		featureId: <Unique identifier for the feature, saved in the backend>,
	 *		title: <Title of the new feature>,
	 *		description: <Description of the new feature>,
	 *		documentationUrls: {
	 *			btpUrl: <Url to the btp documentation of the feature>
	 *			s4HanaCloudUrl: <Url to the s4HanaCloud documentation of the feature>
	 *			s4HanaOnPremUrl: <Url to the ABAP on-Premise documentation of the feature>
	 *		}
	 *		information: [
	 *		to display content inside the dialog there are three options:
	 *		option 1: text and image to the left
	 *		{
	 *			text: <Text description of the feature>,
	 *			image: <URL or path to an image representing the feature>
	 *		}
	 *		option 2: text only
	 *		{
	 *			text: <Text description of the feature>,
	 *			image: null (the null is mandatory for spacing to work properly)
	 *		}
	 *		option 3: image only
	 *		{
	 *			text: null (the null is mandatory for spacing to work properly),
	 *			image: <URL or path to an image representing the feature>
	 *		}]
	 *	}
	 */
	const aWhatsNewFeaturesContent =
	[
		{
			featureId: "WhatsNewFeature",
			title: oTextResources.getText("TIT_WHATS_NEW_DIALOG_WHATS_NEW_FEATURE_TITLE"),
			description: oTextResources.getText("TXT_WHATS_NEW_DIALOG_WHATS_NEW_FEATURE_DESCRIPTION"),
			documentationUrls: {
				btpUrl: "https://help.sap.com/docs/ui5-flexibility-for-key-users/ui5-flexibility-for-key-users/adapting-ui",
				s4HanaCloudUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/4fc8d03390c342da8a60f8ee387bca1a/d868950a1e8c4b0f9b9453176939a19b.html",
				s4HanaOnPremUrl: "https://help.sap.com/docs/ABAP_PLATFORM_NEW/a7b390faab1140c087b8926571e942b7/d868950a1e8c4b0f9b9453176939a19b.html"
			},
			information: [
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_WHATS_NEW_FEATURE_TEXT"),
					image: null
				},
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_WHATS_NEW_OVERVIEW_TEXT"),
					image: "/resources/sap/ui/rta/util/whatsNew/whatsNewContent/whatsNewImages/WhatsNewOverview.png"
				}
			]
		},
		{
			featureId: "IFrameSandboxProperties",
			description: oTextResources.getText("TXT_WHATS_NEW_DIALOG_IFRAME_SANDBOX_DESCRIPTION"),
			documentationUrls: {
				btpUrl: "https://help.sap.com/docs/ui5-flexibility-for-key-users/ui5-flexibility-for-key-users/embedding-content",
				s4HanaCloudUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/4fc8d03390c342da8a60f8ee387bca1a/8db25610e91342919fcf63d4e5868ae9.html",
				s4HanaOnPremUrl: "https://help.sap.com/docs/ABAP_PLATFORM_NEW/a7b390faab1140c087b8926571e942b7/8db25610e91342919fcf63d4e5868ae9.html"
			},
			title: oTextResources.getText("TIT_WHATS_NEW_DIALOG_IFRAME_SANDBOX_TITLE"),
			information: [
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_IFRAME_SANDBOX_TEXT"),
					image: null
				},
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_IFRAME_SANDBOX_TEXT_2"),
					image: "/resources/sap/ui/rta/util/whatsNew/whatsNewContent/whatsNewImages/FullIframe.png"
				},
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_IFRAME_SANDBOX_TEXT_3"),
					image: "/resources/sap/ui/rta/util/whatsNew/whatsNewContent/whatsNewImages/AdvancedSettingsImage.png"
				}
			]
		 },
		 {
			 featureId: "MinimenuRemoval",
			 title: oTextResources.getText("TIT_WHATS_NEW_DIALOG_MINIMENU_REMOVAL_TITLE"),
			 description: oTextResources.getText("TXT_WHATS_NEW_DIALOG_MINIMENU_REMOVAL_DESCRIPTION"),
			 documentationUrls: {
				btpUrl: "https://help.sap.com/docs/ui5-flexibility-for-key-users/ui5-flexibility-for-key-users/adapting-ui",
				s4HanaCloudUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/4fc8d03390c342da8a60f8ee387bca1a/d868950a1e8c4b0f9b9453176939a19b.html",
				s4HanaOnPremUrl: "https://help.sap.com/docs/ABAP_PLATFORM_NEW/a7b390faab1140c087b8926571e942b7/d868950a1e8c4b0f9b9453176939a19b.html"
			},
			 information: [
				 {
					 text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_MINIMENU_REMOVAL_TEXT"),
					 image: null
				 }
			 ]
		 }
	];

	return WhatsNewFeatures;
});
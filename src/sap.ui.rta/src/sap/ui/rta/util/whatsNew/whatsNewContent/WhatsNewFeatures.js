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

	function getImagePath(sFileName) {
		const _sAppModulePath = "sap/ui/rta/util/";
		return `${sap.ui.require.toUrl(_sAppModulePath)}whatsNew/whatsNewContent/whatsNewImages/${sFileName}`;
	}

	/**
	 * Callback filter function to determine if the feature should be displayed in the dialog
	 * @typedef {function} sap.ui.rta.util.whatsNew.whatsNewContent.WhatsNewFeatures.isFeatureApplicable
	 * @param {sap.ui.fl.registry.Settings} oFlexSettings - Flex settings
	 * @returns {boolean} <code>false</code> if the feature shouldn't be displayed in the dialog
	 */

	/**
	 * The `aWhatsNewFeaturesContent` array defines the features that will be displayed inside the "What's New" dialog.
	 * The features are displayed in the order they are defined in this array.
	 * To add a new feature, add a new object to the BEGINNING of this array. Each feature object should have the following structure:
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
	 *		isFeatureApplicable: <Filter function that returns a boolean value to determine
	 * 			if the feature should be displayed in the dialog> (optional)
	 *  		<code>{@link sap.ui.rta.util.whatsNew.whatsNewContent.WhatsNewFeatures.isFeatureApplicable isFeatureApplicable}</code>
	 * 	}
	 *
	 */
	const aWhatsNewFeaturesContent =
	[
		{
			featureId: "GuidedTour",
			title: oTextResources.getText("TIT_WHATS_NEW_RTA_TOUR_TITLE"),
			description: oTextResources.getText("TXT_WHATS_NEW_DIALOG_RTA_TOUR_DESCRIPTION"),
			documentationUrls: {
				btpUrl: "https://help.sap.com/docs/ui5-flexibility-for-key-users/ui5-flexibility-for-key-users/adapting-ui",
				s4HanaCloudUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/4fc8d03390c342da8a60f8ee387bca1a/d868950a1e8c4b0f9b9453176939a19b.html",
				s4HanaOnPremUrl: "https://help.sap.com/docs/ABAP_PLATFORM_NEW/a7b390faab1140c087b8926571e942b7/d868950a1e8c4b0f9b9453176939a19b.html"
			},
			information: [
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_RTA_TOUR_TEXT"),
					image: getImagePath("GuidedTour.png")
				}
			]
		},
		{
			featureId: "RenameRework",
			title: oTextResources.getText("TIT_WHATS_NEW_RENAME_REWORK_TITLE"),
			description: oTextResources.getText("TXT_WHATS_NEW_DIALOG_RENAME_REWORK_DESCRIPTION"),
			documentationUrls: {
				btpUrl: "https://help.sap.com/docs/ui5-flexibility-for-key-users/ui5-flexibility-for-key-users/making-ui-changes#renaming-a-ui-element",
				s4HanaCloudUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/4fc8d03390c342da8a60f8ee387bca1a/54270a390b194c3e97be2424592c3352.html#renaming-a-ui-element",
				s4HanaOnPremUrl: "https://help.sap.com/docs/ABAP_PLATFORM_NEW/a7b390faab1140c087b8926571e942b7/54270a390b194c3e97be2424592c3352.html#renaming-a-ui-element"
			},
			information: [
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_RENAME_REWORK_TEXT_1"),
					image: getImagePath("RenameDialog.png")
				},
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_RENAME_REWORK_TEXT_2"),
					image: getImagePath("ChangeLabelsAction.png")
				},
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_RENAME_REWORK_TEXT_3"),
					image: getImagePath("ReloadButtonToolbar.png")
				}
			]
		},
		{
			featureId: "TextArrangement",
			title: oTextResources.getText("TIT_WHATS_NEW_TEXT_ARRANGEMENT_TITLE"),
			description: oTextResources.getText("TXT_WHATS_NEW_DIALOG_TEXT_ARRANGEMENT_DESCRIPTION"),
			documentationUrls: {
				btpUrl: "https://help.sap.com/docs/ui5-flexibility-for-key-users/ui5-flexibility-for-key-users/making-ui-changes#text-arrangement",
				s4HanaCloudUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/4fc8d03390c342da8a60f8ee387bca1a/54270a390b194c3e97be2424592c3352.html#text-arrangement",
				s4HanaOnPremUrl: "https://help.sap.com/docs/ABAP_PLATFORM_NEW/a7b390faab1140c087b8926571e942b7/54270a390b194c3e97be2424592c3352.html#text-arrangement"
			},
			information: [
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_TEXT_ARRANGEMENT_TEXT_1"),
					image: getImagePath("DisplayBehavior.png")
				},
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_TEXT_ARRANGEMENT_TEXT_2"),
					image: null
				},
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_TEXT_ARRANGEMENT_TEXT_3"),
					image: getImagePath("ReloadButtonToolbar.png")
				}
			]
		},
		{
			featureId: "ExtendedActions",
			title: oTextResources.getText("TIT_WHATS_NEW_EXTENDED_ACTIONS_TITLE"),
			description: oTextResources.getText("TXT_WHATS_NEW_DIALOG_EXTENDED_ACTIONS_DESCRIPTION"),
			documentationUrls: {
				btpUrl: "https://help.sap.com/docs/ui5-flexibility-for-key-users/ui5-flexibility-for-key-users/adapting-ui",
				s4HanaCloudUrl: "https://help.sap.com/docs/SAP_S4HANA_CLOUD/4fc8d03390c342da8a60f8ee387bca1a/d868950a1e8c4b0f9b9453176939a19b.html",
				s4HanaOnPremUrl: "https://help.sap.com/docs/ABAP_PLATFORM_NEW/a7b390faab1140c087b8926571e942b7/d868950a1e8c4b0f9b9453176939a19b.html"
			},
			information: [
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_EXTENDED_ACTIONS_TEXT_1"),
					image: null
				},
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_EXTENDED_ACTIONS_TEXT_2"),
					image: getImagePath("ExtendedActions.png")
				}
			]
		},
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
					image: getImagePath("WhatsNewOverview.png")
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
					image: getImagePath("FullIframe.png")
				},
				{
					text: oTextResources.getText("TXT_WHATS_NEW_DIALOG_IFRAME_SANDBOX_TEXT_3"),
					image: getImagePath("AdvancedSettingsImage.png")
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
					image: getImagePath("MiniMenu.png")
				}
			]
		}
	];

	/**
	 * @returns {object[]} All What's New features
	 */
	WhatsNewFeatures.getAllFeatures = function() {
		return aWhatsNewFeaturesContent;
	};

	return WhatsNewFeatures;
});
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
	 * The `aWhatsNewFeaturesContent` array defines the features that will be displayed inside the "What's New" dialog.
	 * To add a new feature, add a new object to this array. Each feature object should have the following structure:
	 *
	 *	{
	 *		featureId: <Unique identifier for the feature, saved in the backend>,
	 *		title: <Title of the new feature>,
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
			information: [
				{
					text: oTextResources.getText("TIT_WHATS_NEW_DIALOG_WHATS_NEW_FEATURE_TEXT"),
					image: "/resources/sap/ui/rta/util/whatsNew/whatsNewContent/whatsNewImages/WhatsNewFeatureImg.png"
				}
			]
		}
	];

	/**
	 * @returns {object[]} All whats new features
	 */
	WhatsNewFeatures.getAllFeatures = function() {
		return aWhatsNewFeaturesContent;
	};

	/**
	 * @param {object[]} aDontShowAgainFeatureIds array of feature ids that should be excluded from the whats new dialog
	 * @returns {object[]} filtered whats new features
	 */
	WhatsNewFeatures.filterDontShowAgainFeatures = function(aDontShowAgainFeatureIds) {
		return aWhatsNewFeaturesContent.filter(function(oFeature) {
			return !aDontShowAgainFeatureIds?.includes(oFeature.featureId);
		});
	};

	return WhatsNewFeatures;
});
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/core/Lib",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/rta/util/whatsNew/whatsNewContent/whatsNewFeatures"
], function(
	Element,
	Fragment,
	Lib,
	JSONModel,
	ResourceModel,
	WhatsNewFeatures
) {
	"use strict";

	const WhatsNew = {};
	const oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
	let oWhatsNewDialog;

	WhatsNew.openWhatsNewDialog = async function(aDontShowAgainFeatureIds) {
		const aFeatures = WhatsNewFeatures.filterDontShowAgainFeatures(aDontShowAgainFeatureIds);
		const oWhatsNewDialogModel = new JSONModel(WhatsNew.buildWhatsNewContent(aFeatures));
		if (!oWhatsNewDialog)	{
			await WhatsNew.createWhatsNewDialog(oWhatsNewDialogModel);
		}
		oWhatsNewDialog.open();

		return oWhatsNewDialog;
	};

	WhatsNew.createWhatsNewDialog = async function(oWhatsNewDialogModel) {
		const oRTAResourceModel = new ResourceModel({bundleName: "sap.ui.rta.messagebundle"});
		oWhatsNewDialog = await Fragment.load({
			name: "sap.ui.rta.util.whatsNew.WhatsNewDialog",
			controller: WhatsNew
		});
		oWhatsNewDialog.setModel(oRTAResourceModel, "i18n");
		oWhatsNewDialog.setModel(oWhatsNewDialogModel, "whatsNewModel");
	};

	WhatsNew.buildWhatsNewContent = function(aFeatures) {
		/**
		 * The `oWhatsNewContent` object defines the content that will be displayed inside the "What's New" dialog.
		 * The first object with index [0] in the `featureCollection` array is the overview page.
		 * The following objects are the features that are added dynamically
		 */
		const oWhatsNewContent = {
			featureCollection: [
				{
					featureId: "whatsNewOverview",
					overviewTitle: oTextResources.getText("TIT_WHATS_NEW_DIALOG_OVERVIEW"),
					overview: []
				}
			]
		};

		aFeatures.forEach(function(oFeature, iIndex) {
			const sFeatureTitle = oFeature.title;
			oWhatsNewContent.featureCollection[0].overview.push({
				newFeatureTitle: sFeatureTitle,
				// index [0] is the overview page, to correctly set the page index for the added features we need to shift it by 1
				index: iIndex + 1
			});
			oWhatsNewContent.featureCollection.push(oFeature);
		});
		return oWhatsNewContent;
	};

	WhatsNew.closeWhatsNewDialog = function() {
		if (oWhatsNewDialog) {
			oWhatsNewDialog.close();
		}
	};

	WhatsNew.scrollCarousel = function(sPageId, sIndex) {
		const oCarousel = Element.getElementById("sapWhatsNewDialogCarousel");
		oCarousel.setActivePage(sPageId + sIndex);
	};

	return WhatsNew;
});
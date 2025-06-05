/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/rta/util/whatsNew/WhatsNewUtils"
], function(
	mLibrary,
	Fragment,
	JSONModel,
	ResourceModel,
	WhatsNewUtils
) {
	"use strict";
	const WhatsNewOverview = {};
	const oURLHelper = mLibrary.URLHelper;
	let oWhatsNewOverviewDialog;
	let aWhatsNewOverviewContent;

	WhatsNewOverview.openWhatsNewOverviewDialog = async function() {
		const oWhatsNewDialogModel = new JSONModel();
		// Get the unseen features from WhatsNewUtils; newest features are the first in the array
		aWhatsNewOverviewContent = await WhatsNewUtils.getFilteredFeatures([]);
		oWhatsNewDialogModel.setData({ featureCollection: aWhatsNewOverviewContent });
		oWhatsNewDialogModel.setProperty("overviewActive", true);
		if (!oWhatsNewOverviewDialog) {
			await WhatsNewOverview.createWhatsNewOverviewDialog(oWhatsNewDialogModel);
		}
		oWhatsNewOverviewDialog.open();

		return oWhatsNewOverviewDialog;
	};

	WhatsNewOverview.createWhatsNewOverviewDialog = async function(oWhatsNewDialogModel) {
		const oRTAResourceModel = new ResourceModel({ bundleName: "sap.ui.rta.messagebundle" });
		oWhatsNewOverviewDialog = await Fragment.load(
			{
				name: "sap.ui.rta.util.whatsNew.WhatsNewOverviewDialog",
				controller: WhatsNewOverview
			}
		);
		oWhatsNewOverviewDialog.setModel(oRTAResourceModel, "i18n");
		oWhatsNewOverviewDialog.setModel(oWhatsNewDialogModel, "whatsNewModel");
	};

	WhatsNewOverview.closeWhatsNewOverviewDialog = function() {
		if (oWhatsNewOverviewDialog) {
			const oContext = oWhatsNewOverviewDialog.getBindingContext("whatsNewModel");
			oContext?.setProperty("overviewActive", true);
			oWhatsNewOverviewDialog.close();
		}
	};

	WhatsNewOverview.backToOverview = function() {
		const oContext = oWhatsNewOverviewDialog.getBindingContext("whatsNewModel");
		oContext.setProperty("overviewActive", true);
	};

	WhatsNewOverview.onSelectListItem = function(oEvent) {
		const oSelectedItem = oEvent.getSource();
		const oContext = oSelectedItem.getBindingContext("whatsNewModel");
		const sPath = oContext.getPath();
		oContext.setProperty("overviewActive", false);
		oWhatsNewOverviewDialog.bindElement({ path: sPath, model: "whatsNewModel" });
	};

	WhatsNewOverview.onLearnMorePress = function(oEvent) {
		const sPath = oEvent.getSource().getBindingContext("whatsNewModel").getPath();
		const sLearnMoreUrl = WhatsNewUtils.getLearnMoreURL(sPath, aWhatsNewOverviewContent);
		oURLHelper.redirect(sLearnMoreUrl, true);
	};

	return WhatsNewOverview;
});
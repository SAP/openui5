/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/rta/util/whatsNew/whatsNewContent/WhatsNewFeatures",
	"sap/ui/rta/util/whatsNew/WhatsNewUtils"
], function(
	mLibrary,
	ManagedObject,
	Element,
	Fragment,
	FeaturesAPI,
	JSONModel,
	ResourceModel,
	WhatsNewFeatures,
	WhatsNewUtils
) {
	"use strict";

	const oURLHelper = mLibrary.URLHelper;

	/**
	 * @class Constructor for a new sap.ui.rta.util.whatsNew.WhatsNew
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.129
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	const WhatsNew = ManagedObject.extend("sap.ui.rta.util.whatsNew.WhatsNew", {
		metadata: {
			properties: {
				dontShowAgainFeatureIds: { type: "array", defaultValue: [] },
				layer: { type: "string", defaultValue: "" }
			},
			aggregations: {
				whatsNewDialog: { type: "sap.m.Dialog", multiple: false }
			}
		}
	});

	WhatsNew.prototype.setDontShowAgainFeatureIds = function(aDontShowAgainFeatureIds) {
		this.setProperty("dontShowAgainFeatureIds", aDontShowAgainFeatureIds);
		this.aUnseenFeatures = WhatsNewFeatures.filterDontShowAgainFeatures(aDontShowAgainFeatureIds);
	};

	WhatsNew.prototype.initializeWhatsNewDialog = async function() {
		const aDontShowAgainFeatureIds = await FeaturesAPI.getSeenFeatureIds({ layer: this.getLayer() });
		this.setDontShowAgainFeatureIds(aDontShowAgainFeatureIds);
		if (this.aUnseenFeatures.length === 0 || this.getLayer() !== "CUSTOMER") {
			return;
		}
		const oWhatsNewDialogModel = new JSONModel();
		oWhatsNewDialogModel.setData({ featureCollection: this.aUnseenFeatures });
		if (!this.oWhatsNewDialog)	{
			await this.createWhatsNewDialog(oWhatsNewDialogModel);
		}
		this.oWhatsNewDialog.open();
	};

	WhatsNew.prototype.createWhatsNewDialog = async function(oWhatsNewDialogModel) {
		const oRTAResourceModel = new ResourceModel({ bundleName: "sap.ui.rta.messagebundle" });
		this.oWhatsNewDialog = await Fragment.load({
			name: "sap.ui.rta.util.whatsNew.WhatsNewDialog",
			controller: this
		});
		this.oWhatsNewDialog.setModel(oRTAResourceModel, "i18n");
		this.oWhatsNewDialog.setModel(oWhatsNewDialogModel, "whatsNewModel");
	};

	WhatsNew.prototype.closeWhatsNewDialog = function() {
		if (this.oWhatsNewDialog) {
			const oDontShowAgainCheckbox = Element.getElementById("whatsNewDialog_DontShowAgain");
			if (oDontShowAgainCheckbox.getSelected()) {
				const aUnseenFeatureIds = this.aUnseenFeatures.map((oUnseenFeature) => oUnseenFeature.featureId);
				const aSeenFeatureIds = [...this.getDontShowAgainFeatureIds(), ...aUnseenFeatureIds];
				const mPropertyBag = { layer: this.getLayer(), seenFeatureIds: aSeenFeatureIds };
				FeaturesAPI.setSeenFeatureIds(mPropertyBag);
			}
			this.oWhatsNewDialog.close();
		}
	};

	WhatsNew.prototype.onLearnMorePress = function() {
		const sActivePageId = Element.getElementById("sapWhatsNewDialogCarousel").getActivePage();
		const sLearnMoreUrl = WhatsNewUtils.getLearnMoreURL(sActivePageId, this.aUnseenFeatures);
		oURLHelper.redirect(sLearnMoreUrl, true);
	};

	WhatsNew.prototype.destroy = function(...aArgs) {
		ManagedObject.prototype.destroy.apply(this, aArgs);
		if (this.oWhatsNewDialog) {
			this.oWhatsNewDialog.destroy();
		}
	};

	return WhatsNew;
});
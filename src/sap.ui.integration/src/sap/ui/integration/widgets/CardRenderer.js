/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/f/CardRenderer",
	"sap/ui/integration/library"
], function (FCardRenderer, library) {
	"use strict";

	const MANIFEST_PATHS = {
		TYPE: "/sap.card/type",
		APP_ID: "/sap.app/id",
		CONFIG_HELP_ID: "/sap.card/configuration/helpId"
	};

	const CardDesign = library.CardDesign;
	const CardPreviewMode = library.CardPreviewMode;
	const CardDataMode = library.CardDataMode;

	return FCardRenderer.extend("sap.ui.integration.widgets.CardRenderer", {
		apiVersion: 2,

		/**
		 * @override
		 */
		renderContainerAttributes: function (oRm, oCard) {
			FCardRenderer.renderContainerAttributes.apply(this, arguments);

			oRm.class("sapUiIntCard");

			const oCardManifest = oCard._oCardManifest;

			if (oCardManifest && oCardManifest.get(MANIFEST_PATHS.TYPE) && oCardManifest.get(MANIFEST_PATHS.TYPE).toLowerCase() === "analytical") {
				oRm.class("sapUiIntCardAnalytical");
			}

			if (oCard.getCardFooter() && oCard.getCardFooter().getVisible()) {
				oRm.class("sapUiIntCardWithFooter");
			}

			if (oCard.getDesign() === CardDesign.Transparent) {
				oRm.class("sapFCardTransparent");
			}

			if (oCard.getPreviewMode() === CardPreviewMode.Abstract) {
				oRm.class("sapFCardPreview");
			}

			oRm.class("sapUiIntCard" + oCard.getDisplayVariant());

			this.renderCardAppId(oRm, oCard);

			this.renderHelpId(oRm, oCard);

			if (oCard.getManifest() && (!oCard.getCardHeader() || oCard._getActualDataMode() !== CardDataMode.Active)) {
				oRm.attr("tabindex", "0");
			}
		},

		renderCardAppId: function (oRm, oCard) {
			const oCardManifest = oCard._oCardManifest;
			const sAppId = oCardManifest && oCardManifest.get(MANIFEST_PATHS.APP_ID);
			if (sAppId) {
				oRm.attr("data-sap-ui-card-id", sAppId);
			}
		},

		renderHelpId: function (oRm, oCard) {
			if (oCard.data("help-id")) {
				// There is custom data-help-id, don't override it
				return;
			}

			const oCardManifest = oCard._oCardManifest;
			if (!oCardManifest) {
				return;
			}

			const sConfigHelpId = oCardManifest.get(MANIFEST_PATHS.CONFIG_HELP_ID);
			const sAppId = oCardManifest.get(MANIFEST_PATHS.APP_ID);

			const sHelpId = sConfigHelpId || sAppId;

			if (sHelpId) {
				oRm.attr("data-help-id", sHelpId);
			}
		},

		/**
		 * @override
		 */
		renderContentSection: function (oRm, oCard) {
			var oFilterBar = oCard.getAggregation("_filterBar");

			if (oFilterBar) {
				oRm.renderControl(oFilterBar);
			}

			FCardRenderer.renderContentSection.apply(this, arguments);
		},

		/**
		 * @override
		 */
		renderFooterSection: function (oRm, oCard) {
			var oFooter = oCard.getAggregation("_footer");

			if (oFooter) {
				oRm.renderControl(oFooter);
			}
		}
	});

});
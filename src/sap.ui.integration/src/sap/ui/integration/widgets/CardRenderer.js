/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/f/CardRenderer"
], function (FCardRenderer) {
	"use strict";

	var MANIFEST_PATHS = {
		TYPE: "/sap.card/type"
	};

	return FCardRenderer.extend("sap.ui.integration.widgets.CardRenderer", {
		apiVersion: 2,

		/**
		 * @override
		 */
		renderContainerAttributes: function (oRm, oCard) {
			FCardRenderer.renderContainerAttributes.apply(this, arguments);

			oRm.class("sapUiIntCard");

			var oCardManifest = oCard._oCardManifest;

			if (oCardManifest && oCardManifest.get(MANIFEST_PATHS.TYPE) && oCardManifest.get(MANIFEST_PATHS.TYPE).toLowerCase() === "analytical") {
				oRm.class("sapUiIntCardAnalytical");
			}

			if (oCard.getAggregation("_footer")) {
				oRm.class("sapUiIntCardWithFooter");
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
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
		},

		/**
		 * @override
		 */
		renderContentSection: function (oRm, oCard) {
			var oFilterBar = oCard.getAggregation("_filterBar");

			if (oFilterBar) {
				oRm.openStart("div")
					.class("sapFCardFilterBar")
					.openEnd();

				oRm.renderControl(oFilterBar);

				oRm.close("div");
			}

			FCardRenderer.renderContentSection.apply(this, arguments);
		}
	});

});
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Core"
], function (Control, Core) {
	"use strict";

	/**
	 * Constructor for a new <code>ListPlaceholder</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.76
	 * @alias sap.f.cards.loading.ListPlaceholder
	 */
	var ListPlaceholder = Control.extend("sap.f.cards.loading.ListPlaceholder", {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				 * The maximum number of items set to the list.
				 */
				maxItems: {
					type : "int",
					group : "Misc"
				},

				/**
				 * Item template form the list.
				 */
				item: {
					type: "any"
				},

				itemHeight: {
					type: "sap.ui.core.CSSSize"
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				var iMaxItems = oControl.getMaxItems(),
					oItem = oControl.getItem(),
					// set title for screen reader
					oResBundle = Core.getLibraryResourceBundle("sap.ui.core"),
					sTitle = oResBundle.getText("BUSY_TEXT");

				oRm.openStart("div", oControl)
					.class("sapFCardContentPlaceholder")
					.class("sapFCardContentListPlaceholder")
					.attr("tabindex", "0")
					.attr("title", sTitle);

				oRm.accessibilityState(oControl, {
					role: "progressbar",
					valuemin: "0",
					valuemax: "100"
				});

				oRm.openEnd();

				for (var i = 0; i < iMaxItems; i++) {
					oRm.openStart("div")
						.class("sapFCardListPlaceholderItem")
						.style("height", oControl.getItemHeight())
						.openEnd();

					if (oItem && oItem.icon) {
						oRm.openStart("div")
							.class("sapFCardListPlaceholderImg")
							.class("sapFCardLoadingShimmer")
							.openEnd()
							.close("div");
					}

					oRm.openStart("div")
						.class("sapFCardListPlaceholderRows")
						.openEnd();

					if (oItem) {
						this.renderTitleAndDescription(oRm, oItem);
						this.renderAttributes(oRm, oItem);

						if (oItem.chart) {
							this.renderRow(oRm);
						}

						if (oItem.actionsStrip) {
							this.renderRow(oRm);
						}
					}

					oRm.close("div");
					oRm.close("div");
				}
				oRm.close("div");
			},

			renderTitleAndDescription: function (oRm, oItem) {
				if (oItem.attributes && oItem.title && oItem.description) {
					this.renderRow(oRm, true);
					return;
				}

				if (oItem.title) {
					this.renderRow(oRm);
				}

				if (oItem.description) {
					this.renderRow(oRm);
				}
			},

			renderRow: function (oRm, bCombined) {
				oRm.openStart("div")
					.class("sapFCardListPlaceholderRow")
					.class("sapFCardLoadingShimmer");

				if (bCombined) {
					oRm.class("sapFCardListPlaceholderRowCombined");
				}

				oRm.openEnd()
					.close("div");
			},

			renderAttributes: function (oRm, oItem) {
				if (!oItem.attributes) {
					return;
				}

				var iAttrRows = oItem.attributes.length / 2 + 1;

				for (var j = 0; j < iAttrRows; j++) {
					oRm.openStart("div")
						.class("sapFCardListPlaceholderRow")
						.openEnd();

					var iAttrPerRow = j === iAttrRows - 1 ? 1 : 2; // render single attribute on the last row

					for (var i = 0; i < iAttrPerRow; i++) {
						oRm.openStart("div")
							.class("sapFCardListPlaceholderAttr")
							.class("sapFCardLoadingShimmer")
							.openEnd()
							.close("div");
					}
					oRm.close("div");
				}

			}
		}
	});

	return ListPlaceholder;
});

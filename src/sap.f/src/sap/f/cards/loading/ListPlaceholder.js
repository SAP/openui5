/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Core"
], function (Control, Core) {
	"use strict";

	/**
	 * Constructor for a new <code>loading</code>.
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
	 * @alias sap.f.cards.loading.ListLoadingContent
	 */
	var ListPlaceholder = Control.extend("sap.f.cards.loading.ListPlaceholder", {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				 * The maxItems set to the list.
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
						.class("sapFCardContentShimmerPlaceholderItem")
						.style("height", oControl.getItemHeight())
						.openEnd();

					if (oItem && oItem.icon) {
						oRm.openStart("div")
							.class("sapFCardContentShimmerPlaceholderImg")
							.class("sapFCardLoadingShimmer")
							.openEnd()
							.close("div");
					}

					oRm.openStart("div")
						.class("sapFCardContentShimmerPlaceholderRows")
						.openEnd();

					if (oItem && oItem.title) {
						this.renderRow(oRm);
					}

					if (oItem && oItem.description) {
						this.renderRow(oRm);
					}

					if (oItem && oItem.chart) {
						this.renderRow(oRm);
					}

					if (oItem && oItem.actionsStrip) {
						this.renderRow(oRm);
					}

					oRm.close("div");
					oRm.close("div");
				}
				oRm.close("div");
			},

			renderRow: function (oRm) {
				oRm.openStart("div")
					.class("sapFCardContentShimmerPlaceholderRow")
					.class("sapFCardLoadingShimmer")
					.openEnd()
					.close("div");
			}
		}
	});

	return ListPlaceholder;
});

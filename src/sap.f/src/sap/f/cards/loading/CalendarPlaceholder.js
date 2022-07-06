/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/cards/loading/ListPlaceholder",
	"sap/ui/core/Core"
], function (ListPlaceholder, Core) {
	"use strict";

	/**
	 * Constructor for a new <code>CalendarPlaceholder</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 *
	 * @extends sap.f.cards.loading.ListPlaceholder
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.99
	 * @alias sap.f.cards.loading.CalendarPlaceholder
	 */
	var CalendarPlaceholder = ListPlaceholder.extend("sap.f.cards.loading.CalendarPlaceholder", {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				 * The maxLegendItems set to the list.
				 */
				maxLegendItems: {
					type : "int",
					group : "Misc"
				},

				/**
				 * Item template form the list.
				 */
				legendItem: {
					type: "any"
				}
			}
		},
		renderer: {
			render: function (oRm, oControl) {
				var iMaxItems = oControl.getMaxItems(),
					iMaxLegendItems = oControl.getMaxLegendItems(),
					oItem = oControl.getItem(),
					oLegendItem = oControl.getLegendItem(),
					// set title for screen reader
					oResBundle = Core.getLibraryResourceBundle("sap.ui.core"),
					sTitle = oResBundle.getText("BUSY_TEXT"),
					i;

				// open wrapper
				oRm.openStart("div", oControl)
					.class("sapFCardContentPlaceholder")
					.class("sapFCardContentCalendarPlaceholder")
					.attr("tabindex", "0")
					.attr("title", sTitle);

				oRm.accessibilityState(oControl, {
					role: "progressbar",
					valuemin: "0",
					valuemax: "100"
				});

				oRm.openEnd();

					// open left side
					oRm.openStart("div")
						.class("sapFCalCardPlaceholderLeftSide")
						.attr("tabindex", "0");

					oRm.openEnd();

						// open calendar part
						oRm.openStart("div")
							.class("sapFCardContentCalendarPartPlaceholder")
							.class("sapFCardLoadingShimmer")
							.attr("tabindex", "0");

						oRm.openEnd();

						// close calendar part
						oRm.close("div");

						// open legend items part
						oRm.openStart("div")
							.class("sapFCardContentListPlaceholder")
							.class("sapFCardContentLegendItemsListPlaceholder")
							.attr("tabindex", "0");

						oRm.openEnd();

						for (i = 0; i < iMaxLegendItems; i++) {
							oRm.openStart("div")
								.class("sapFCardListPlaceholderLegendItem")
								.class("sapFCardListPlaceholderItem")
								.style("height", oControl.getItemHeight())
								.openEnd();

							if (oLegendItem) {
								oRm.openStart("div")
									.class("sapFCardListPlaceholderImg")
									.class("sapFCardLoadingShimmer")
									.openEnd()
									.close("div");

								oRm.openStart("div")
									.class("sapFCardListPlaceholderRows")
									.openEnd();
								this.renderRow(oRm);
								oRm.close("div");
							}

							oRm.close("div");
						}

						// close legend items part
						oRm.close("div");

					// close left side
					oRm.close("div");

					// open right side
					oRm.openStart("div")
						.class("sapFCardContentListPlaceholder")
						.class("sapFCardContentItemsListPlaceholder")
						.class("sapFCalCardPlaceholderRightSide")
						.attr("tabindex", "0");

					oRm.openEnd();

					for (i = 0; i < iMaxItems; i++) {
						oRm.openStart("div")
							.class("sapFCardListPlaceholderItem")
							.style("height", oControl.getItemHeight())
							.openEnd();

						oRm.openStart("div")
							.class("sapFCardListPlaceholderFromTo")
							.class("sapFCardLoadingShimmer")
							.openEnd()
							.close("div");

						oRm.openStart("div")
							.class("sapFCardListPlaceholderRows")
							.openEnd();

						if (oItem) {
							if (oItem.title) {
								this.renderRow(oRm);
							}

							if (oItem.text) {
								this.renderTextRow(oRm);
							}
						}

						oRm.close("div");
						oRm.close("div");
					}
					// close right side
					oRm.close("div");

				// close wrapper
				oRm.close("div");
			},

			renderTextRow: function (oRm) {
				oRm.openStart("div")
					.class("sapFCardListPlaceholderRow")
					.class("sapFCardListPlaceholderTextRow")
					.class("sapFCardLoadingShimmer");

				oRm.openEnd()
					.close("div");
			}
		}
	});

	return CalendarPlaceholder;
});

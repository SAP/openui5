/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Core"
], function (Control, Core) {
	"use strict";

	/**
	 * Constructor for a new <code>TimelinePlaceholder</code>.
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
	 * @since 1.106
	 * @alias sap.f.cards.loading.TimelinePlaceholder
	 */
	var TimelinePlaceholder = Control.extend("sap.f.cards.loading.TimelinePlaceholder", {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				 * The maximum number of items set to the timeline.
				 */
				maxItems: {
					type : "int",
					group : "Misc"
				},

				/**
				 * Item template form the timeline.
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
					.class("sapFCardContentTimelinePlaceholder")
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
						.class("sapFCardTimelinePlaceholderItem")
						.style("height", oControl.getItemHeight())
						.openEnd();

					if (oItem) {
						oRm.openStart("div")
							.class("sapFCardTimelineNavGroup")
							.openEnd();

						oRm.openStart("div")
							.class("sapFCardTimelinePlaceholderImg")
							.class("sapFCardLoadingShimmer")
							.openEnd()
							.close("div");

						if (i !== iMaxItems - 1) {
							oRm.openStart("div")
								.class("sapFCardTimelinePlaceholderLine")
								.class("sapFCardLoadingShimmer")
								.openEnd()
								.close("div");
						}

						oRm.close("div");
					}

					oRm.openStart("div")
						.class("sapFCardTimelinePlaceholderRows")
						.openEnd();

					if (oItem) {
						this.renderRow(oRm, 100);
						this.renderRow(oRm, 40);
						this.renderRow(oRm, 60);
					}

					oRm.close("div");
					oRm.close("div");
				}
				oRm.close("div");
			},

			renderRow: function (oRm, iWidth) {
				oRm.openStart("div")
					.class("sapFCardTimelinePlaceholderRow")
					.class("sapFCardTimelinePlaceholderRow" + iWidth)
					.class("sapFCardLoadingShimmer")
					.openEnd()
					.close("div");
			}
		}
	});

	return TimelinePlaceholder;
});

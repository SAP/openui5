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
				}
			}
		},
		renderer: function (oRm, oControl) {
			var iMaxItems = oControl.getMaxItems(),
				oItem = oControl.getItem(),
				// set title for screen reader
				oResBundle = Core.getLibraryResourceBundle("sap.ui.core"),
				sTitle = oResBundle.getText("BUSY_TEXT");
			oRm.write("<div");
			oRm.addClass("sapFCardContentPlaceholder");
			oRm.addClass("sapFCardContentListPlaceholder");
			oRm.attr("tabindex", "0");
			oRm.attr("title", sTitle);
			oRm.accessibilityState(oControl, {
				role: "progressbar",
				valuemin: "0",
				valuemax: "100"
			});
			oRm.writeClasses();
			oRm.writeElementData(oControl);
			oRm.write(">");

			for (var i = 0; i < iMaxItems; i++) {
				oRm.write("<div");
				oRm.addClass("sapFCardContentShimmerPlaceholderItem");
				if (oItem && !oItem.icon && !oItem.description) {
					oRm.addClass("sapFCardContentShimmerPlaceholderNoIcon");
				}
				oRm.writeClasses();
				oRm.write(">");
				if (oItem && oItem.icon) {
					oRm.write("<div");
					oRm.addClass("sapFCardContentShimmerPlaceholderImg");
					oRm.addClass("sapFCardLoadingShimmer");
					oRm.writeClasses();
					oRm.write(">");
					oRm.write("</div>");
				}
				oRm.write("<div");
				oRm.addClass("sapFCardContentShimmerPlaceholderRows");
				oRm.writeClasses();
				oRm.write(">");
				if (oItem && oItem.title) {
					oRm.write("<div");
					oRm.addClass("sapFCardContentShimmerPlaceholderItemText");
					oRm.addClass("sapFCardLoadingShimmer");
					oRm.writeClasses();
					oRm.write(">");
					oRm.write("</div>");
				}
				if (oItem && oItem.description) {
					oRm.write("<div");
					oRm.addClass("sapFCardContentShimmerPlaceholderItemText");
					oRm.addClass("sapFCardLoadingShimmer");
					oRm.writeClasses();
					oRm.write(">");
					oRm.write("</div>");
				}
				oRm.write("</div>");
				oRm.write("</div>");
			}
			oRm.write("</div>");
		}
	});

	return ListPlaceholder;
});

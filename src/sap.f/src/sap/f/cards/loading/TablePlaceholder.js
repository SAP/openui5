/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Core"
], function (Control, Core) {
	"use strict";

	/**
	 * Constructor for a new <code>TablePlaceholder</code>.
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
	 * @since 1.104
	 * @alias sap.f.cards.loading.TablePlaceholder
	 */
	var TablePlaceholder = Control.extend("sap.f.cards.loading.TablePlaceholder", {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				 * The maximum number of items (table rows) set to the table
				 */
				maxItems: {
					type : "int",
					group : "Misc"
				},

				itemHeight: {
					type: "sap.ui.core.CSSSize"
				},

				columns: {
					type : "int",
					group : "Misc"
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				var iMaxItems = oControl.getMaxItems(),
					iColumns = oControl.getColumns(),
					bHasActualContent = oControl.getParent()._getTable().getColumns().length,
					// set title for screen reader
					oResBundle = Core.getLibraryResourceBundle("sap.ui.core"),
					sTitle = oResBundle.getText("BUSY_TEXT");

				if (!bHasActualContent) {
					return;
				}

				oRm.openStart("div", oControl)
					.class("sapFCardContentPlaceholder")
					.class("sapFCardContentTablePlaceholder")
					.attr("tabindex", "0")
					.attr("title", sTitle);

				oRm.accessibilityState(oControl, {
					role: "progressbar",
					valuemin: "0",
					valuemax: "100"
				});

				oRm.openEnd();

				for (var i = 0; i < iMaxItems + 1; i++) { // number of rows + header
					oRm.openStart("div")
						.class("sapFCardTablePlaceholderItem")
						.style("height", oControl.getItemHeight())
						.openEnd();

					oRm.openStart("div")
						.class("sapFCardTablePlaceholderRows")
						.openEnd();

						if (iColumns > 1) {
							for (var j = 0; j < iColumns; j++) {
								oRm.openStart("div")
								.class("sapFCardTablePlaceholderColumns")
								.class("sapFCardLoadingShimmer")
								.openEnd();
								oRm.close("div");
							}
						}

					oRm.close("div");
					oRm.close("div");
				}
				oRm.close("div");
			}
		}
	});

	return TablePlaceholder;
});

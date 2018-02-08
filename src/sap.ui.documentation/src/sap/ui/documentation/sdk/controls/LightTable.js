/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Control'],
	function(Control) {
	"use strict";

		/**
		 * @class
		 * Provides a light table control used in the API Reference section.
		 * @extends sap.ui.core.Control
		 */
		return Control.extend("sap.ui.documentation.sdk.controls.LightTable", {
			metadata : {
				properties: {
					/**
					 * Determines the list of names for the table columns. For example, <code>["Name", "Cardinality", "Type", "Description"]</code>.
					 */
					columnTitles: {type: "string[]"},
					/**
					 * Determines the number of columns the table will have. Keep in mind that this number should correspond to the length of
					 * the array provided with the <code>columnTitles</code> property.
					 */
					columnCount: {type: "int"}
				},
				defaultAggregation : "rows",
				aggregations: {
					/**
					 * Rows of the table.
					 */
					rows: {type: "sap.ui.documentation.sdk.controls.Row", multiple: true}
				}
			},
			renderer: function(oRm, oControl) {
				var aRows = oControl.getRows(),
					aControls,
					aColumnTitles = oControl.getColumnTitles(),
					aLen,
					a,
					iLen,
					i;

				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.addClass("sapUiDocLightTable");
				oRm.addClass("columns-" + oControl.getColumnCount());
				oRm.writeClasses();
				oRm.write(">");

				// Column titles
				oRm.write("<div class='head'>");
				for (i = 0, iLen = aColumnTitles.length; i < iLen; i++) {
					oRm.write("<div class='cell'>");
					oRm.writeEscaped(aColumnTitles[i]);
					oRm.write("</div>");
				}
				oRm.write("</div>");

				// Rows
				for (i = 0, iLen = aRows.length; i < iLen; i++) {
					oRm.write("<div class='row'>");

					aControls = aRows[i].getContent();
					for (a = 0, aLen = aControls.length; a < aLen; a++) {
						oRm.write("<div class='cell'>");

						// Handle inline title
						if (a > 0) {
							oRm.write("<div class='inTitle'>");
							oRm.writeEscaped(aColumnTitles[a]);
							oRm.write(":</div>");
						}

						oRm.renderControl(aControls[a]);
						oRm.write("</div>");
					}

					oRm.write("</div>");
				}

				oRm.write("</div>");
			}
		});

	});
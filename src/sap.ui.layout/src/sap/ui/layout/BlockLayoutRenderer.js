/*!
 * ${copyright}
 */

sap.ui.define(['./library'],
	function (library) {
		"use strict";

		// shortcut for sap.ui.layout.BlockRowColorSets
		var BlockRowColorSets = library.BlockRowColorSets;

		var BlockLayoutRenderer = {};

		BlockLayoutRenderer.render = function (oRm, oBlockLayout) {
			this.startLayout(oRm, oBlockLayout);
			this.addContent(oRm, oBlockLayout);
			this.endLayout(oRm);
		};

		BlockLayoutRenderer.startLayout = function (oRm, oBlockLayout) {
			var backgroundType = oBlockLayout.getBackground();

			oBlockLayout.addStyleClass("sapUiBlockLayoutBackground" + backgroundType);

			oRm.write("<div");
			oRm.writeControlData(oBlockLayout);
			oRm.addClass("sapUiBlockLayout");
			if (oBlockLayout.getKeepFontSize()) {
				oRm.addClass("sapUiBlockLayoutKeepFontSize");
			}
			oRm.writeStyles();
			oRm.writeClasses();
			oRm.write(">");
		};

		BlockLayoutRenderer.addContent = function (oRm, blockLayout) {
			var aContent = blockLayout.getContent(),
				oBlockRowType = BlockRowColorSets,
				aTypes = Object.keys(oBlockRowType).map(function (sKey) {
					return oBlockRowType[sKey];
				}),
				iNumTypes = aTypes.length;


			aContent.forEach(function (oBlockRow, iIndex, aRows) {
				var sType = oBlockRow.getRowColorSet() || aTypes[iIndex % iNumTypes], // Get the type or fetch it from the stack
					sClass = "sapUiBlockLayoutBackground" + sType, // Build the CSS class
					oPrevBlockRow = (iIndex && aRows[iIndex - 1]) || null;

				if (oPrevBlockRow && oPrevBlockRow.hasStyleClass(sClass)) {
					oBlockRow.removeStyleClass(sClass);
					sClass += "Inverted";
				}

				if (sClass) {
					oBlockRow.addStyleClass(sClass);
				}

				oRm.renderControl(oBlockRow);
			});
		};

		BlockLayoutRenderer.endLayout = function (oRm) {
			oRm.write("</div>");
		};

		return BlockLayoutRenderer;
	}, /* bExport= */ true);

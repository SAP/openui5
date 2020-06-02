/*!
 * ${copyright}
 */

sap.ui.define(['./library'],
	function (library) {
		"use strict";

		// shortcut for sap.ui.layout.BlockRowColorSets
		var BlockRowColorSets = library.BlockRowColorSets;

		var BlockLayoutRenderer = {
			apiVersion: 2
		};

		BlockLayoutRenderer.render = function (oRm, oBlockLayout) {
			this.startLayout(oRm, oBlockLayout);
			this.addContent(oRm, oBlockLayout);
			this.endLayout(oRm);
		};

		BlockLayoutRenderer.startLayout = function (oRm, oBlockLayout) {
			oRm.openStart("div", oBlockLayout)
				.class("sapUiBlockLayout")
				.class("sapUiBlockLayoutBackground" + oBlockLayout.getBackground());

			if (oBlockLayout.getKeepFontSize()) {
				oRm.class("sapUiBlockLayoutKeepFontSize");
			}
			oRm.openEnd();
		};

		BlockLayoutRenderer.addContent = function (oRm, blockLayout) {
			var aContent = blockLayout.getContent(),
				aTypes = Object.keys(BlockRowColorSets).map(function (sKey) {
					return BlockRowColorSets[sKey];
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
			oRm.close("div");
		};

		return BlockLayoutRenderer;
	}, /* bExport= */ true);

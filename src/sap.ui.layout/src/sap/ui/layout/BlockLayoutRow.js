/*!
 * ${copyright}
 */

 /**
  * @typedef {Object} sap.ui.layout.BlockRowColorSets
  * @typedef {Object} sap.ui.layout.BlockLayoutRow
  */
sap.ui.define([
    'jquery.sap.global',
    'sap/ui/core/Control',
    './library',
    'sap/ui/layout/BlockLayoutCellData',
    "./BlockLayoutRowRenderer"
],
	function(jQuery, Control, library, BlockLayoutCellData, BlockLayoutRowRenderer) {
		"use strict";

		// shortcut for sap.ui.layout.BlockBackgroundType
		var BlockBackgroundType = library.BlockBackgroundType;

		// shortcut for sap.ui.layout.BlockRowColorSets
		var BlockRowColorSets = library.BlockRowColorSets;

		/**
		 * Constructor for a new BlockLayoutRow.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The BlockLayoutRow is used as an aggregation to the BlockLayout. It aggregates Block Layout  cells.
		 * The BlockLayoutRow has 2 rendering modes - scrollable and non scrollable.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.ui.layout.BlockLayoutRow
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var BlockLayoutRow = Control.extend("sap.ui.layout.BlockLayoutRow", {
			metadata: {

				library: "sap.ui.layout",

				properties: {

					/**
					 * Sets the rendering mode of the BlockLayoutRow to scrollable. In scrollable mode, the cells get
					 * aligned side by side, with horizontal scroll bar for the row.
					 */
					scrollable: {type: "boolean", group: "Appearance", defaultValue: false},

					/**
					 * Defines background type for that row.
					 * There might be several rows with the same type
					 * @since 1.42
					 */
					rowColorSet: {type: "sap.ui.layout.BlockRowColorSets", group: "Appearance"}
				},
				defaultAggregation: "content",
				aggregations: {
					/**
					 * The content cells to be included in the row.
					 */
					content: {type: "sap.ui.layout.BlockLayoutCell", multiple: true, singularName: "content"}
				},
				associations: {
					/**
					 * Cells that would be accented.
					 * *Note:* This association has visual impact only for BlockLayouts with background types "Mixed" and "Accent".
					 *
					 * Mixed: In this type, areas of 25% (on desktop) can have a dark background color. Per section one area can be dark.
					 * Accent: Every section can contain multiple gray blocks, which are used alternately, beginning with the bright one
					 *
					 * @since 1.42
					 */
					accentCells: {type: "sap.ui.layout.BlockLayoutCell", multiple: true, singularName: "accentCell"}
				},
				designtime: "sap/ui/layout/designtime/BlockLayoutRow.designtime"
			}
		});

		BlockLayoutRow.prototype.init = function () {
			this._applyLayoutData = {};
		};

		BlockLayoutRow.prototype.addContent = function (oContent) {
			this._ensureLayoutData(oContent);
			return this.addAggregation("content", oContent);
		};

		BlockLayoutRow.prototype.insertContent = function(oContent, index) {
			this._ensureLayoutData(oContent);
			return this.insertAggregation("content", oContent, index);
		};

		/**
		 * Performs guidelines check
		 */
		BlockLayoutRow.prototype.onBeforeRendering = function () {
			var aCells = this.getContent(),
				that = this;

			aCells.forEach(function (oCell, index) {
				oCell._setParentRowScrollable(that.getScrollable());
			});

			this._calculateBreakpointRendering();
		};

		/**
		 * Changes dynamically row color set
		 * Note: this might invalidate cells inside and also change color sets of the other BlockLayoutRow-s below it.
		 * @public
		 * @method
		 * @param {sap.ui.layout.BlockRowColorSets} sType
		 * @since 1.42
		 * @returns {sap.ui.layout.BlockLayoutRow}
		 */
		BlockLayoutRow.prototype.setRowColorSet = function (sType) {
			// Apply here so if there's an exception the code bellow won't be executed
			var aArgs = Array.prototype.slice.call(arguments),
				oObject = Control.prototype.setProperty.apply(this, ["rowColorSet"].concat(aArgs)),
				sClassName = "sapUiBlockLayoutBackground" + sType,
				oBlockLayout = this.getParent(),
				sBackground = oBlockLayout && oBlockLayout.getBackground(),
				iThisIndexInParent = oBlockLayout && oBlockLayout.indexOfAggregation("content", this),
				aParentContent = oBlockLayout && oBlockLayout.getContent(),
				oPrevBlockRow = (iThisIndexInParent && aParentContent[iThisIndexInParent - 1]) || null,
				oNextBlockRow = (aParentContent && aParentContent[iThisIndexInParent + 1]) || null,
				oBlockRowColorSets = BlockRowColorSets,
				aColorSets = Object.keys(oBlockRowColorSets).map(function (sKey) {
					return oBlockRowColorSets[sKey];
				}),
				bInvertedColorSet = false;

			if (oPrevBlockRow && oPrevBlockRow._hasStyleClass(sClassName, sBackground, bInvertedColorSet, sType)) {
				sClassName += "Inverted";
				bInvertedColorSet = true;
			}

			aColorSets.forEach(function (sCurType) {
				var sColorSetStyle = "sapUiBlockLayoutBackground" + sCurType,
					sInvertedColorSetStyle = sColorSetStyle + "Inverted";

				if (this._hasStyleClass(sColorSetStyle, sBackground, false, sCurType)) {
					this.removeStyleClass(sColorSetStyle, true);
				} else if (this._hasStyleClass(sInvertedColorSetStyle, sBackground, true, sCurType)) {
					this.removeStyleClass(sInvertedColorSetStyle, true);
				}
			}, this);
			this.addStyleClass(sClassName, true);

			// If the next row is of the same type and has the same CSS class, recalculate it and cascade
			if (oNextBlockRow && oNextBlockRow._hasStyleClass(sClassName, sBackground, bInvertedColorSet, sType)) {
				oNextBlockRow.setRowColorSet.apply(oNextBlockRow, aArgs);
			}

			// Invalidate the whole row as the background dependencies, row color sets and accent cells should be resolved properly
			this.invalidate();

			return oObject;
		};

		BlockLayoutRow.prototype.addAccentCell = function (vId) {
			var oObject,
				sId = vId && vId.getId ? vId.getId() : vId,
				args = Array.prototype.slice.call(arguments),
				oBackgrounds = BlockBackgroundType,
				oBlockLayout = this.getParent(),
				sLayoutBackground = oBlockLayout && (oBlockLayout.getBackground() || "");

			oObject = this.addAssociation.apply(this, ["accentCells"].concat(args));

			if (!oBlockLayout) {
				return this;
			}

			if ([oBackgrounds.Accent, oBackgrounds.Mixed].indexOf(sLayoutBackground) === -1) {
				jQuery.sap.log.warning(sId + " was not se as accent cell. Accent cells could be set only for 'Accent' and 'Mixed' layout backgrounds.");
				return this;
			}

			if (oBackgrounds.Mixed === sLayoutBackground) {
				this._processMixedCellStyles(sId, this.getContent());
			} else if (oBackgrounds.Accent === sLayoutBackground) {
				this._processAccentCellStyles(this.getAccentCells(), this.getContent());
			}

			return oObject;
		};

		BlockLayoutRow.prototype._ensureLayoutData = function (oContent) {
			var oOldData = oContent.getLayoutData();
			if (!oOldData || !(oOldData instanceof BlockLayoutCellData)) {
				oContent.setLayoutData(new BlockLayoutCellData());
			}
		};

		BlockLayoutRow.prototype._onParentSizeChange = function (currentSize) {
			this._currentSize = currentSize;
			this._calculateBreakpointRendering();
			this.invalidate();
		};

		BlockLayoutRow.prototype._getCellArangementForCurrentSize = function () {
			if (!this._arrangements || !this._currentSize) {
				return null;
			}

			return this._arrangements[this._currentSize];
		};

		BlockLayoutRow.prototype._calculateBreakpointRendering = function () {
			if (!this._currentSize) {
				return;
			}

			this._arrangements = {
				//For S we take the data from the LayoutData of the cells
				"S": this._calcArrangementForSize("S"),
				//For M we take the data from the LayoutData of the cells
				"M": this._calcArrangementForSize("M"),
				//For L we take the data from the LayoutData of the cells
				"L": this._calcArrangementForSize("L"),
				//For Xl we take the data from the LayoutData of the cells
				"XL": this._calcArrangementForSize("Xl")
			};
		};

		/**
		 * Calculates each row for the corresponding arrangement size.
		 * @private
		 * @method
		 * @param {string} sSizeName The size that needs to be calculated
		 * @returns {any[][]}
		 */
		BlockLayoutRow.prototype._calcArrangementForSize = function (sSizeName) {
			var aContent = this.getContent();
			if (aContent.length >= 3 && sSizeName === "M" && aContent.length < 5) {
				return this._generateArrangementForMCase();
			} else {
				return this._generateArrangement(sSizeName);
			}
		};

		BlockLayoutRow.prototype._generateArrangement = function (sSizeName) {
			var oLayoutData,
				iIndex = 0,
				aFlatData = [],
				aBreakOn = [],
				aArrangement = [[]],
				aContent = this.getContent();

			aContent.forEach(function (oCell) {
				oLayoutData = oCell.getLayoutData();
				aBreakOn.push(oLayoutData["breakRowOn" + sSizeName + "Size"]);
				aFlatData.push(oLayoutData["get" + sSizeName + "Size"]());
			});

			aFlatData.forEach(function (iData, i) {
				aArrangement[iIndex].push(iData);

				if (aBreakOn[i + 1]) {
					iIndex++;
					aArrangement[iIndex] = [];
				}
			});

			return aArrangement;
		};

		BlockLayoutRow.prototype._generateArrangementForMCase = function () {
			var aContent = this.getContent();

			if (aContent.length === 3 && this._isAllCellsHasSameWidth("M")) {
				return [[1, 1, 1]];
			} else if (aContent.length === 3) {
				return [[1, 1], [1]]; // This is the case where we have for example 25% 25% 50%
			} else if (aContent.length === 4) {
				return [[1, 1], [1, 1]];
			}
		};

		BlockLayoutRow.prototype._isAllCellsHasSameWidth = function (sSizeName) {
			var iCurrentRowSize,
				aContent = this.getContent(),
				iFirstRowSize = aContent[0].getLayoutData()["get" + sSizeName + "Size"]();

			for (var i = 1; i < aContent.length; i++) {
				iCurrentRowSize = aContent[i].getLayoutData()["get" + sSizeName + "Size"]();

				if (iCurrentRowSize !== iFirstRowSize) {
					return false;
				}
			}
			return true;
		};

		/**
		 * Adjusts accents cells for Mixed background layout
		 * @private
		 * @method
		 * @param {string} sId The ID of the row that will be processed
		 * @param {Array} aCells Cells in the current row
		 * @returns {sap.ui.layout.BlockLayoutRow}
		 */
		BlockLayoutRow.prototype._processMixedCellStyles = function (sId, aCells) {
			var oBlockLayout, bProcessAccentCells;

			if (!aCells || !aCells.length) {
				return this;
			}

			oBlockLayout = this.getParent();
			bProcessAccentCells = oBlockLayout && (oBlockLayout.hasStyleClass("sapUiBlockLayoutSizeL") || oBlockLayout.hasStyleClass("sapUiBlockLayoutSizeXL"));

			aCells.forEach(function (oCell) {
				var oColorSets, bUseContrast2;

				// Accent only on a cell with 25% width and L, XL sizes
				if (bProcessAccentCells && oCell.getId() === sId && oCell.getWidth() === 1) {
					oCell.addStyleClass("sapContrast").addStyleClass("sapContrastPlus");

					oColorSets = BlockRowColorSets;
					bUseContrast2 = this._hasStyleClass("sapUiBlockLayoutBackground" + oColorSets.ColorSet1, BlockBackgroundType.Mixed, false, oColorSets.ColorSet1) ||
						this._hasStyleClass("sapUiBlockLayoutBackground" + oColorSets.ColorSet1, BlockBackgroundType.Mixed, true, oColorSets.ColorSet1);

					if (bUseContrast2) {
						oCell.addStyleClass("sapUiBlockLayoutBackgroundContrast2");
					}
				} else if ((!bProcessAccentCells || oCell.getId() !== sId) && (oCell.hasStyleClass("sapContrast") || oCell.hasStyleClass("sapContrastPlus"))) {
					oCell.removeStyleClass("sapContrast").removeStyleClass("sapContrastPlus").removeStyleClass("sapUiBlockLayoutBackgroundContrast2");

					this.removeAssociation("accentCells", oCell);

					jQuery.sap.log.warning(sId + " was removed as accent cell. Only one cell at a time could be accented for Mixed layout background");
				}
			}, this);

			return this;
		};

		/**
		 * Adjusts accents cells for Accent background layout.
		 * @private
		 * @method
		 * @param {Array} aAccentCells Cells with accent contrast
		 * @param {Array} aRowCells All cells in the row
		 * @returns {sap.ui.layout.BlockLayoutRow}
		 */
		BlockLayoutRow.prototype._processAccentCellStyles = function (aAccentCells, aRowCells) {
			var oCell, sCellId, sCalculatedStyleClass,
				iIndex = 0,
				iInvertCellColorsModulo = 0,
				aAccentCellsCopy = Array.prototype.slice.call(aAccentCells);

			if (!aAccentCells || !aAccentCells.length) {
				return this;
			}

			// Find the index of current accented cell and check if it should be of Accent type 1 OR 2
			for (iIndex = 0; iIndex < aRowCells.length; iIndex++) {
				oCell = aRowCells[iIndex];
				sCellId = oCell.getId();

				if (!aAccentCellsCopy.length) {
					break;
				}

				if (aAccentCellsCopy.indexOf(sCellId) > -1) {
					iInvertCellColorsModulo++;

					sCalculatedStyleClass = "sapUiBlockLayoutBackgroundColorSetGray" + ((iInvertCellColorsModulo % 2) + 1);

					// If the cell already has the expected class, shouldn't loop further as everything below is already adjusted
					if (oCell.hasStyleClass(sCalculatedStyleClass)) {
						continue;
					}

					// Optimise a bit the next loop iteration
					aAccentCellsCopy.splice(aAccentCellsCopy.indexOf(sCellId), 1);

					oCell
						.removeStyleClass("sapUiBlockLayoutBackgroundColorSetGray1")
						.removeStyleClass("sapUiBlockLayoutBackgroundColorSetGray2")
						.addStyleClass(sCalculatedStyleClass);
				}
			}

			return this;
		};

		/**
		 * Checks for specific cases when two row color sets share the same colors e.g. Light and Mixed backgrounds.
		 * @private
		 * @method
		 * @param {string} sStyleClass
		 * @param {sap.ui.layout.BlockBackgroundType} sLayoutBackground Background type of the <code>BlockLayout</code>
		 * @param {boolean} bIsColorInverted Determines if the color inverted
		 * @param {sap.ui.layout.BlockRowColorSets} sType The current color set of the given row
		 * @returns {boolean} Determines if the row contains the class
		 */
		BlockLayoutRow.prototype._hasStyleClass = function (sStyleClass, sLayoutBackground, bIsColorInverted, sType) {
			var oBackgrounds = BlockBackgroundType,
				oColorSets = BlockRowColorSets,
				i, aStyleClasses, aEqualSets;

			// Check if this is NOT Mixed or Light background and just do the normal check
			if ([oBackgrounds.Light, oBackgrounds.Mixed].indexOf(sLayoutBackground) === -1) {
				return this.hasStyleClass(sStyleClass);
			} else if (this.hasStyleClass(sStyleClass)) { // Check if this class is there and don't continue further
				return true;
			}

			// Define array with equal sets
			aEqualSets = [
				[oColorSets.ColorSet1, oColorSets.ColorSet3],
				[oColorSets.ColorSet2, oColorSets.ColorSet4]
			];

			// Find on which index is sType
			for (i = 0; i <= aEqualSets.length; i++) {
				if (aEqualSets[i] && aEqualSets[i].indexOf(sType) > -1) {
					break;
				}
			}

			// If it's not found there, then return false, as if the class was inside, it would fulfill the first hasStyleClass above
			if (!aEqualSets[i]) {
				return false;
			}

			// Build class strings to check against
			aStyleClasses = aEqualSets[i].map(function (sColorSet) {
				return "sapUiBlockLayoutBackground" + sColorSet + (bIsColorInverted ? "Inverted" : "");
			});

			// Check if any of the classes is inside
			return aStyleClasses.some(this.hasStyleClass, this);
		};

		return BlockLayoutRow;
	});

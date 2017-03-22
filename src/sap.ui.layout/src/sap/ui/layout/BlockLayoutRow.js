/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', './library'],
	function(jQuery, Control, library) {
		"use strict";

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
				}
			}
		});

		BlockLayoutRow.CONSTANTS = {
			maxScrollableCellsPerRow : 10,
			minScrollableCellsPerRow: 3,
			guidelineRatios: [0.25, 0.5, 0.75, 1.0]
		};

		/**
		 * Performs guidelines check
		 */
		BlockLayoutRow.prototype.onBeforeRendering = function () {
			this._checkGuidelinesAndUpdateCells();
		};

		/**
		 * Changes dynamically row's color set
		 * Note: this might invalidate cells inside and also change color sets of the other BlockLayoutRow-s below it.
		 *
		 * @param sType
		 * @returns {BlockLayoutRow}
		 * @since 1.42
		 */
		BlockLayoutRow.prototype.setRowColorSet = function (sType) {
			// Apply here so if there's an exception the code bellow won't be executed
			var aArgs = Array.prototype.slice.call(arguments),
				oObject = Control.prototype.setProperty.apply(this, ["rowColorSet"].concat(aArgs)),
				sClassName = "sapUiBlockLayoutBackground" + sType,
				oParent = this.getParent(),
				sBackground = oParent && oParent.getBackground(),
				iThisIndexInParent = oParent && oParent.indexOfAggregation("content", this),
				aParentContent = oParent && oParent.getContent(),
				oPrevBlockRow = (iThisIndexInParent && aParentContent[iThisIndexInParent - 1]) || null,
				oNextBlockRow = (aParentContent && aParentContent[iThisIndexInParent + 1]) || null,
				oBlockRowColorSets = sap.ui.layout.BlockRowColorSets,
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
				oBackgrounds = sap.ui.layout.BlockBackgroundType,
				oParent = this.getParent(),
				sLayoutBackground = oParent && (oParent.getBackground() || "");

			oObject = this.addAssociation.apply(this, ["accentCells"].concat(args));

			if (!oParent) {
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

		/**
		 * Adjusts accents cells for Mixed background layout
		 *
		 * @param {string} sId
		 * @param {Array} aCells
		 * @returns {sap.ui.layout.BlockLayoutRow}
		 * @private
		 */
		BlockLayoutRow.prototype._processMixedCellStyles = function (sId, aCells) {
			var oParent, bProcessAccentCells;

			if (!aCells || !aCells.length) {
				jQuery.sap.log.warning("No accent cells were set");
				return this;
			}

			oParent = this.getParent();
			bProcessAccentCells = oParent && (oParent.hasStyleClass("sapUiBlockLayoutSizeL") || oParent.hasStyleClass("sapUiBlockLayoutSizeXL"));

			aCells.forEach(function (oCell) {
				var oColorSets, bUseContrast2;

				// Accent only on a cell with 25% width and L, XL sizes
				if (bProcessAccentCells && oCell.getId() === sId && oCell.getWidth() === 1) {
					oCell.addStyleClass("sapContrast").addStyleClass("sapContrastPlus");

					oColorSets = sap.ui.layout.BlockRowColorSets;
					bUseContrast2 = this._hasStyleClass("sapUiBlockLayoutBackground" + oColorSets.ColorSet1, sap.ui.layout.BlockBackgroundType.Mixed, false, oColorSets.ColorSet1) ||
						this._hasStyleClass("sapUiBlockLayoutBackground" + oColorSets.ColorSet1, sap.ui.layout.BlockBackgroundType.Mixed, true, oColorSets.ColorSet1);

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
		 * Adjusts accents cells for Accent background layout
		 *
		 * @param {Array} aAccentCells
		 * @param {Array} aRowCells
		 * @returns {sap.ui.layout.BlockLayoutRow}
		 * @private
		 */
		BlockLayoutRow.prototype._processAccentCellStyles = function (aAccentCells, aRowCells) {
			var oCell, sCellId, sCalculatedStyleClass,
				iIndex = 0,
				iInvertCellColorsModulo = 0,
				aAccentCellsCopy = Array.prototype.slice.call(aAccentCells);

			if (!aAccentCells || !aAccentCells.length) {
				jQuery.sap.log.warning("No accent cells were set");
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

					// If the the cell already has the expected class, shouldn't loop further as everything below is already adjusted
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

		BlockLayoutRow.prototype._checkGuidelinesAndUpdateCells = function () {
			var that = this,
				cells = this.getContent(),
				cellRatios = this._calcCellRatios(),
				differentSBreakpoint = this._checkDifferentSBreakpointCase(),
				guidelinesFollowed = this._guidelinesCheck();

			cells.forEach(function (cell, index) {
				cell._clearState();
				if (that.getScrollable()) {
					cell._setParentRowScrollable(true);
				} else if (differentSBreakpoint && guidelinesFollowed) {
					cell._setDifferentSBreakpointSize(true, cellRatios[index]);
				}
			});

			if (!this.getScrollable() && differentSBreakpoint && guidelinesFollowed) {
				this._rowSCase = true;
				this.addStyleClass("sapUiBlockRowSCase", true);
			} else {
				this._rowSCase = false;
				this.removeStyleClass("sapUiBlockRowSCase", true);
			}
		};

		/**
		 * Depending on the scrolling mode, chooses which guidelines check to execute
		 * @private
		 */
		BlockLayoutRow.prototype._guidelinesCheck = function () {
			if (this.getScrollable()) {
				return this._checkScrollableCellsCount();
			} else {
				return this._checkNonScrollableGuidelines();
			}
		};

		/**
		 * Calculates the cell ratio of each cell compared to the total width of the Row
		 * @returns {Array}
		 * @private
		 */
		BlockLayoutRow.prototype._calcCellRatios = function () {
			var cellRatios = [],
				totalRowWidth = 0,
				content = this.getContent();

			content.forEach(function (cell) {
				var cellWidth = (cell.getWidth() == 0 ) ? 1 : cell.getWidth();
				totalRowWidth += cellWidth;
			});

			content.forEach(function (cell) {
				var cellWidth = (cell.getWidth() == 0 ) ? 1 : cell.getWidth(),
					cellRatio = cellWidth / totalRowWidth;

				cellRatios.push(cellRatio);
			});

			return cellRatios;
		};

		/**
		 * For the non scrollable Row - 4 types of cells are allowed - cells with 25% 50% 75% and 100% width
		 * @private
		 */
		BlockLayoutRow.prototype._checkNonScrollableGuidelines = function () {
			var that = this,
				cellRatios = this._calcCellRatios(),
				guidelinesFollowed = true;

			cellRatios.forEach(function (cellRatio) {
				if (!that._isCellRatioIncluded(cellRatio)) {
					guidelinesFollowed = false;
				}
			});

			if (!guidelinesFollowed) {
				jQuery.sap.log.error("In your BlockLayoutRow " + this.getId() + " you are using cell ratios that are " +
				"not recommended in the guidelines. Cells can be with width of 25% 50% 75% or 100% according to the guidelines.");
			}

			return guidelinesFollowed;
		};

		/**
		 * If the row contains (25% 25% 50%) (50% 25% 25%) or (25% 25% 25% 25%) cells
		 * there is special behavior for the S Breakpoint defined, that transforms the row
		 * into two rows: (50% 50% 100%) (100% 50% 50%) or (50% 50% 50% 50%)
		 * @private
		 */
		BlockLayoutRow.prototype._checkDifferentSBreakpointCase = function () {
			var cellRatios = this._calcCellRatios(),
				cells = this.getContent();

			if (cells.length == 4 || (cells.length == 3 && cellRatios[1] != 0.5)) {
				return true;
			}

			return false;
		};

		/**
		 * Checks whether a given cell ratio is included in the guidelines ratios
		 * @param ratio
		 * @returns {boolean}
		 * @private
		 */
		BlockLayoutRow.prototype._isCellRatioIncluded = function (ratio) {
			var guidelineRatios = BlockLayoutRow.CONSTANTS.guidelineRatios;
			for (var i = 0; i < guidelineRatios.length; i++) {
				if (guidelineRatios[i] === ratio) {
					return true;
				}
			}

			return false;
		};

		/**
		 * Checks the total cell count of the row when in scrollable mode.
		 * The row should contain between 3 and 10 cells.
		 * @private
		 */
		BlockLayoutRow.prototype._checkScrollableCellsCount = function () {
			if (this.getContent().length > BlockLayoutRow.CONSTANTS.maxScrollableCellsPerRow) {
				jQuery.sap.log.error("You are using too much cells in your scrollable row: " + this.getId() + "." +
				"This is violating the BlockLayout guidelines, please consider changing your implementation. Max cells allowed: 10.");
				return false;
			}

			if (this.getContent().length < BlockLayoutRow.CONSTANTS.minScrollableCellsPerRow) {
				jQuery.sap.log.error("You are using not enough cells in your scrollable row: " + this.getId() + "." +
				"This is violating the BlockLayout guidelines, please consider changing your implementation. Min cells allowed: 3.");
				return false;
			}

			return true;
		};

		/**
		 * Checks for specific cases when two row color sets share the same colors e.g. Light and Mixed backgrounds
		 *
		 * @param sStyleClass
		 * @param sLayoutBackground
		 * @param bIsColorInverted
		 * @param sType
		 * @returns {boolean}
		 * @private
		 */
		BlockLayoutRow.prototype._hasStyleClass = function (sStyleClass, sLayoutBackground, bIsColorInverted, sType) {
			var oBackgrounds = sap.ui.layout.BlockBackgroundType,
				oColorSets = sap.ui.layout.BlockRowColorSets,
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

	}, /* bExport= */ true);

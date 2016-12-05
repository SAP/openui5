/*!
 * ${copyright}
 */

/**
 * FlexibleColumnLayout semantic helper
 */

sap.ui.define([
	"jquery.sap.global",
	"./library",
	"sap/ui/base/Metadata",
	"sap/f/FlexibleColumnLayout"
], function (jQuery, library, Metadata, FlexibleColumnLayout) {
	"use strict";

	var FlexibleColumnLayoutSemanticHelper = Metadata.createClass("sap.f.FlexibleColumnLayoutSemanticHelper", {

		/**
		 * @private
		 */
		constructor: function (oFlexibleColumnLayout, sMode) {
			this.oFCL = oFlexibleColumnLayout;
			this.sMode = sMode || "Default";
		}
	});

	/**
	 * Instances of the class per flexible column layout object
	 * @type {{}}
	 * @private
	 */
	FlexibleColumnLayoutSemanticHelper._oInstances = {};

	/**
	 * Returns (and stores for future calls) an instance of the sap.f.FlexibleColumnLayoutSemanticHelper for a given instance of sap.f.FlexibleColumnLayout.
	 * @param oFlexibleColumnLayout
	 * @returns {*}
	 */
	FlexibleColumnLayoutSemanticHelper.getInstanceFor = function (oFlexibleColumnLayout, sMode) {

		jQuery.sap.assert(oFlexibleColumnLayout instanceof FlexibleColumnLayout, "Passed control is not FlexibleColumnLayout");

		var sId = oFlexibleColumnLayout.getId();

		if (typeof FlexibleColumnLayoutSemanticHelper._oInstances[sId] === "undefined") {
			FlexibleColumnLayoutSemanticHelper._oInstances[sId] = new FlexibleColumnLayoutSemanticHelper(oFlexibleColumnLayout, sMode);
		}

		return FlexibleColumnLayoutSemanticHelper._oInstances[sId];
	};

	/**
	 * Returns information about the current state of the control
	 * @returns {{layout: *, columnsSizes: {beginColumn, midColumn, endColumn}, columnsVisibility: {beginColumn, midColumn, endColumn}, isFullScreen, isLogicallyFullScreen, actionButtonsInfo: {midColumn, endColumn}}}
	 */
	FlexibleColumnLayoutSemanticHelper.prototype.getCurrentUIState = function () {
		var sCurrentLayout = this.oFCL.getLayout();
		return this._getUIStateForLayout(sCurrentLayout);
	};

	/**
	 * Returns information about the state that the control will have after navigating to the next logical level (i.e. from 1 column to 2 columns)
	 * @param sColumn - the column, from which the navigation will be triggered - begin/mid/end
	 * @returns {{layout: *, columnsSizes: {beginColumn, midColumn, endColumn}, columnsVisibility: {beginColumn, midColumn, endColumn}, isFullScreen, isLogicallyFullScreen, actionButtonsInfo: {midColumn, endColumn}}}
	 */
	FlexibleColumnLayoutSemanticHelper.prototype.getNextUIState = function (sColumn) {

		var sCurrentLayout = this.oFCL.getLayout(),
			sNextLayout;

		// 1 column
		if (sCurrentLayout === sap.f.LayoutType.OneColumn) {

			// Clicking an item in the begin column opens the mid column
			sNextLayout = sap.f.LayoutType.TwoColumnsBeginExpanded;

		}

		// 2 columns
		if ([sap.f.LayoutType.TwoColumnsBeginExpanded, sap.f.LayoutType.TwoColumnsMidExpanded].indexOf(sCurrentLayout) !== -1) {
			if (sColumn === "begin") {

				// Clicking the begin column when in 2-column layout should preserve the current layout (and not reset the default 2-column layout)
				sNextLayout = sCurrentLayout;

			} else {

				if (this.sMode === "MasterDetail") {
					// Clicking the mid column when in 2-column layout should open the third column in fullscreen mode
					sNextLayout = sap.f.LayoutType.EndColumnFullScreen;
				} else {
					// Clicking the mid column when in 2-column layout should switch to 3 column layout
					sNextLayout = sap.f.LayoutType.ThreeColumnsMidExpanded;
				}

			}
		}

		// mid fullscreen => end fullscreen
		if (sCurrentLayout === sap.f.LayoutType.MidColumnFullScreen) {

			// Clicking an item in the mid column from fullscreen always opens the end column in fullscreen
			sNextLayout = sap.f.LayoutType.EndColumnFullScreen;

		}

		// 3 columns
		if ([sap.f.LayoutType.ThreeColumnsMidExpanded, sap.f.LayoutType.ThreeColumnsEndExpanded, sap.f.LayoutType.ThreeColumnsMidExpandedEndHidden, sap.f.LayoutType.ThreeColumnsBeginExpandedEndHidden].indexOf(sCurrentLayout) !== -1) {
			if (sColumn === "begin") {

				// Clicking the begin column in 3-column layout should switch to 2-column layout
				sNextLayout = sap.f.LayoutType.TwoColumnsBeginExpanded;

			} else if (sColumn === "mid") {

				if ([sap.f.LayoutType.ThreeColumnsMidExpandedEndHidden, sap.f.LayoutType.ThreeColumnsBeginExpandedEndHidden].indexOf(sCurrentLayout) !== -1) {
					// Clicking the mid column when in 3-column layout where end column is hidden, should reveal the end column again
					sNextLayout = sap.f.LayoutType.ThreeColumnsMidExpanded;
				} else {
					// Clicking the mid column when in 3-column layout where end column is visible, should preserve the current layout
					sNextLayout = sCurrentLayout;
				}

			} else {

				// Clicking the end column when in 3-column layout should always open fullscreen
				sNextLayout = sap.f.LayoutType.EndColumnFullScreen;

			}
		}

		// end fullscreen => another end fullscreen
		if (sCurrentLayout === sap.f.LayoutType.EndColumnFullScreen) {
			sNextLayout = sap.f.LayoutType.EndColumnFullScreen;
		}

		return this._getUIStateForLayout(sNextLayout);

	};

	/**
	 * Returns information about the current layout
	 * @returns {{layout: *, columnsSizes: {beginColumn, midColumn, endColumn}, columnsVisibility: {beginColumn, midColumn, endColumn}, isFullScreen, isLogicallyFullScreen, actionButtonsInfo: {midColumn, endColumn}}}
	 */
	FlexibleColumnLayoutSemanticHelper.prototype._getUIStateForLayout = function (sLayout) {

		var aSizes = this.oFCL._getColumnWidthDistributionForLayout(sLayout, true);

		return {
			layout: sLayout,
			columnsSizes: this._getColumnsSizes(aSizes),
			columnsVisibility: this._getColumnsVisibility(aSizes),
			isFullScreen: this._getIsFullScreen(aSizes),
			isLogicallyFullScreen: this._getIsLogicallyFullScreen(sLayout),
			actionButtonsInfo: this._getActionButtonsInfo(aSizes)
		};

	};

	FlexibleColumnLayoutSemanticHelper.prototype._getColumnsSizes = function (aSizes) {

		return {
			beginColumn: aSizes[0],
			midColumn: aSizes[1],
			endColumn: aSizes[2]
		};
	};

	FlexibleColumnLayoutSemanticHelper.prototype._getColumnsVisibility = function (aSizes) {

		return {
			beginColumn: aSizes[0] !== 0,
			midColumn: aSizes[1] !== 0,
			endColumn: aSizes[2] !== 0
		};
	};

	FlexibleColumnLayoutSemanticHelper.prototype._getIsFullScreen = function (aSizes) {

		return aSizes.indexOf(100) !== -1;
	};

	FlexibleColumnLayoutSemanticHelper.prototype._getIsLogicallyFullScreen = function (sLayout) {

		return [sap.f.LayoutType.OneColumn, sap.f.LayoutType.MidColumnFullScreen, sap.f.LayoutType.EndColumnFullScreen].indexOf(sLayout) !== -1;
	};

	FlexibleColumnLayoutSemanticHelper.prototype._getActionButtonsInfo = function (aSizes) {

		var iMaxColumnsCount = this.oFCL._getMaxColumnsCount(),
			sColumnWidthDistribution = aSizes.join("/"),
			oMidColumn = {
				fullScreen: null,
				exitFullScreen: null,
				closeColumn: null
			},
			oEndColumn = {
				fullScreen: null,
				exitFullScreen: null,
				closeColumn: null
			},
			aEligibleLayouts,
			sExitFullScreen;

		if (iMaxColumnsCount === 1) {

			oMidColumn.closeColumn = "";
			oEndColumn.closeColumn = sap.f.LayoutType.TwoColumnsBeginExpanded;

		} else {

			if (sColumnWidthDistribution === "67/33/0" || sColumnWidthDistribution === "33/67/0") {

				oMidColumn.fullScreen = sap.f.LayoutType.MidColumnFullScreen;
				oMidColumn.closeColumn = "";

			}

			if (sColumnWidthDistribution === "25/50/25" || sColumnWidthDistribution === "25/25/50" || sColumnWidthDistribution === "0/67/33") {

				oEndColumn.fullScreen = sap.f.LayoutType.EndColumnFullScreen;
				oEndColumn.closeColumn = sap.f.LayoutType.TwoColumnsBeginExpanded;

			}

			if (sColumnWidthDistribution === "0/100/0") {

				aEligibleLayouts = [sap.f.LayoutType.TwoColumnsBeginExpanded, sap.f.LayoutType.TwoColumnsMidExpanded, sap.f.LayoutType.ThreeColumnsBeginExpandedEndHidden, sap.f.LayoutType.ThreeColumnsMidExpandedEndHidden];
				sExitFullScreen = this.oFCL._getLayoutHistory().getClosestEntryThatMatches(aEligibleLayouts) || sap.f.LayoutType.TwoColumnsBeginExpanded;

				oMidColumn.exitFullScreen = sExitFullScreen;
				oMidColumn.closeColumn = "";

			}

			if (sColumnWidthDistribution === "0/0/100") {

				if (this.sMode === "MasterDetail") {
					// Closing the third column goes back to the 1-column layout
					oEndColumn.closeColumn = sap.f.LayoutType.OneColumn;
				} else {
					aEligibleLayouts = [sap.f.LayoutType.ThreeColumnsMidExpanded, sap.f.LayoutType.ThreeColumnsEndExpanded];
					sExitFullScreen = this.oFCL._getLayoutHistory().getClosestEntryThatMatches(aEligibleLayouts) || sap.f.LayoutType.ThreeColumnsMidExpanded;

					oEndColumn.exitFullScreen = sExitFullScreen;
					oEndColumn.closeColumn = sap.f.LayoutType.TwoColumnsBeginExpanded;
				}

			}
		}

		return {
			midColumn: oMidColumn,
			endColumn: oEndColumn
		};
	};


	return FlexibleColumnLayoutSemanticHelper;

}, /* bExport= */ false);
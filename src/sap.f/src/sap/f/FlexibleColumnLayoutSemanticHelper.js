/*!
 * ${copyright}
 */

/**
 * FlexibleColumnLayout semantic helper
 */

sap.ui.define([
	"jquery.sap.global",
	"./library",
	"./LayoutType",
	"sap/ui/base/Metadata",
	"sap/f/FlexibleColumnLayout"
], function (jQuery, library, LT, Metadata, FlexibleColumnLayout) {
	"use strict";

	var FlexibleColumnLayoutSemanticHelper = Metadata.createClass("sap.f.FlexibleColumnLayoutSemanticHelper", {

		/**
		 *
		 * @param oFlexibleColumnLayout - an instance to the FlexibleColumnLayout object whose state will be queried
		 * @param oSettings - settings, describing the exact UI rules to be used by the helper
		 *  - oSettings.mode - Normal (3 columns max, default) or MasterDetail (2 columns max)
		 *  - oSettings.defaultThreeColumnLayoutType - sap.f.LayoutType.ThreeColumnsMidExpanded (default) or sap.f.LayoutType.ThreeColumnsEndExpanded
		 * @public
		 */
		constructor: function (oFlexibleColumnLayout, oSettings) {
			this._oFCL = oFlexibleColumnLayout;
			this._mode = ["Normal", "MasterDetail"].indexOf(oSettings.mode) !== -1 ? oSettings.mode : "Normal";

			// Currently on the the 3-column type is configurable
			this._defaultLayoutType = LT.OneColumn;
			this._defaultTwoColumnLayoutType = LT.TwoColumnsBeginExpanded;
			this._defaultThreeColumnLayoutType = [LT.ThreeColumnsMidExpanded, LT.ThreeColumnsEndExpanded].indexOf(oSettings.defaultThreeColumnLayoutType) !== -1 ?
				oSettings.defaultThreeColumnLayoutType : LT.ThreeColumnsMidExpanded;
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
	 * @public
	 * @returns {*}
	 */
	FlexibleColumnLayoutSemanticHelper.getInstanceFor = function (oFlexibleColumnLayout, oSettings) {

		jQuery.sap.assert(oFlexibleColumnLayout instanceof FlexibleColumnLayout, "Passed control is not FlexibleColumnLayout");

		var sId = oFlexibleColumnLayout.getId();

		if (typeof FlexibleColumnLayoutSemanticHelper._oInstances[sId] === "undefined") {
			FlexibleColumnLayoutSemanticHelper._oInstances[sId] = new FlexibleColumnLayoutSemanticHelper(oFlexibleColumnLayout, oSettings);
		}

		return FlexibleColumnLayoutSemanticHelper._oInstances[sId];
	};

	/**
	 * Returns information about the current state of the control
	 * @public
	 * @returns {{layout: string, maxColumnsCount: number, columnsSizes: {beginColumn, midColumn, endColumn}, columnsVisibility: {beginColumn, midColumn, endColumn}, isFullScreen, isLogicallyFullScreen, actionButtonsInfo: {midColumn, endColumn}}}
	 */
	FlexibleColumnLayoutSemanticHelper.prototype.getCurrentUIState = function () {
		var sCurrentLayout = this._oFCL.getLayout();
		return this._getUIStateForLayout(sCurrentLayout);
	};

	/**
	 * Returns information about the state that the control will have after navigating to a different logical level
	 * @param iLevel - the logical level that should be displayed. 1 means master-detail, 2 - master-detail-detail, 3 and above - fullscreen pages that follow
	 * @public
	 * @returns {{layout: string, maxColumnsCount: number, columnsSizes: {beginColumn, midColumn, endColumn}, columnsVisibility: {beginColumn, midColumn, endColumn}, isFullScreen, isLogicallyFullScreen, actionButtonsInfo: {midColumn, endColumn}}}
	 */
	FlexibleColumnLayoutSemanticHelper.prototype.getNextUIState = function (iNextLevel) {

		var sCurrentLayout = this._oFCL.getLayout(),
			sNextLayout;

		// Level 0 - the first page
		if (iNextLevel === 0) {
			// From any layout, going to level 0 is always showing the begin column only
			sNextLayout = LT.OneColumn;
		}

		// Level 1 - the second page
		if (iNextLevel === 1) {

			if ([LT.TwoColumnsBeginExpanded, LT.TwoColumnsMidExpanded].indexOf(sCurrentLayout) !== -1) {
				// From a 2-column layout - preserve
				sNextLayout = sCurrentLayout;
			} else if ([LT.MidColumnFullScreen, LT.EndColumnFullScreen].indexOf(sCurrentLayout) !== -1) {
				// From any fullscreen layout - should go to mid fullscreen
				sNextLayout = LT.MidColumnFullScreen;
			} else {
				// From 1-column layout or any 3-column layout - default 2-column layout
				sNextLayout = this._defaultTwoColumnLayoutType;
			}
		}

		// Level 2 - the third page
		if (iNextLevel === 2) {

			if (this._mode === "MasterDetail") {

				// Clicking the mid column when in 2-column layout should open the third column in fullscreen mode
				sNextLayout = LT.EndColumnFullScreen;

			} else {

				if ([LT.ThreeColumnsMidExpandedEndHidden, LT.ThreeColumnsBeginExpandedEndHidden].indexOf(sCurrentLayout) !== -1) {
					// From a 3-column layout where end column is hidden, should reveal the end column again
					sNextLayout = this._defaultThreeColumnLayoutType;
				} else if ([LT.ThreeColumnsMidExpanded, LT.ThreeColumnsEndExpanded].indexOf(sCurrentLayout) !== -1) {
					// From a 3-column layout where end column is visible, should preserve the current layout
					sNextLayout = sCurrentLayout;
				} else if ([LT.MidColumnFullScreen, LT.EndColumnFullScreen].indexOf(sCurrentLayout) !== -1) {
					// From any fullscreen layout, should go to end fullscreen
					sNextLayout = LT.EndColumnFullScreen;
				} else {
					// From 1-column layout or any 2-column layout - should go to default 3-column layout
					sNextLayout = this._defaultThreeColumnLayoutType;
				}
			}
		}

		// Level 3 and above - further pages
		if (iNextLevel > 2) {
			// Any level above 2 is unconditionally shown in end fullscreen
			sNextLayout = LT.EndColumnFullScreen;
		}

		return this._getUIStateForLayout(sNextLayout);
	};

	/**
	 * Returns information about the current layout
	 * @param sLayout
	 * @returns {{layout: string, maxColumnsCount: number, columnsSizes: {beginColumn, midColumn, endColumn}, columnsVisibility: {beginColumn, midColumn, endColumn}, isFullScreen, isLogicallyFullScreen, actionButtonsInfo: {midColumn, endColumn}}}
	 * @private
	 */
	FlexibleColumnLayoutSemanticHelper.prototype._getUIStateForLayout = function (sLayout) {

		var aSizes = this._oFCL._getColumnWidthDistributionForLayout(sLayout, true),
			sColumnWidthDistribution = aSizes.join("/"),
			iMaxColumnsCount = this._oFCL.getMaxColumnsCount();

		return {
			layout: sLayout,
			maxColumnsCount: iMaxColumnsCount,
			columnsSizes: this._getColumnsSizes(aSizes),
			columnsVisibility: this._getColumnsVisibility(aSizes),
			isFullScreen: this._getIsFullScreen(aSizes),
			isLogicallyFullScreen: this._getIsLogicallyFullScreen(sLayout),
			actionButtonsInfo: this._getActionButtonsInfo(sColumnWidthDistribution, iMaxColumnsCount)
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

		return [LT.OneColumn, LT.MidColumnFullScreen, LT.EndColumnFullScreen].indexOf(sLayout) !== -1;
	};

	FlexibleColumnLayoutSemanticHelper.prototype._getActionButtonsInfo = function (sColumnWidthDistribution, iMaxColumnsCount) {

		var oMidColumn = {
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

			oMidColumn.closeColumn = this._defaultLayoutType;
			oEndColumn.closeColumn = this._defaultTwoColumnLayoutType;

		} else {

			if (sColumnWidthDistribution === "67/33/0" || sColumnWidthDistribution === "33/67/0") {

				oMidColumn.fullScreen = LT.MidColumnFullScreen;
				oMidColumn.closeColumn = this._defaultLayoutType;

			}

			if (sColumnWidthDistribution === "25/50/25" || sColumnWidthDistribution === "25/25/50" || sColumnWidthDistribution === "0/67/33") {

				oEndColumn.fullScreen = LT.EndColumnFullScreen;
				oEndColumn.closeColumn = this._defaultTwoColumnLayoutType;

			}

			if (sColumnWidthDistribution === "0/100/0") {

				aEligibleLayouts = [LT.TwoColumnsBeginExpanded, LT.TwoColumnsMidExpanded, LT.ThreeColumnsBeginExpandedEndHidden, LT.ThreeColumnsMidExpandedEndHidden];
				sExitFullScreen = this._oFCL._getLayoutHistory().getClosestEntryThatMatches(aEligibleLayouts) || this._defaultTwoColumnLayoutType;

				oMidColumn.exitFullScreen = sExitFullScreen;
				oMidColumn.closeColumn = this._defaultLayoutType;

			}

			if (sColumnWidthDistribution === "0/0/100") {

				if (this._mode !== "MasterDetail") {
					aEligibleLayouts = [LT.ThreeColumnsMidExpanded, LT.ThreeColumnsEndExpanded];
					sExitFullScreen = this._oFCL._getLayoutHistory().getClosestEntryThatMatches(aEligibleLayouts) || this._defaultThreeColumnLayoutType;

					oEndColumn.exitFullScreen = sExitFullScreen;
					oEndColumn.closeColumn = this._defaultTwoColumnLayoutType;
				}

			}
		}

		return {
			midColumn: oMidColumn,
			endColumn: oEndColumn
		};
	};

	/**
	 * Returns the default layout types for the different numbers of columns
	 * @public
	 * @returns {{defaultLayoutType: string, defaultTwoColumnLayoutType: string, defaultThreeColumnLayoutType: string}}
	 */
	FlexibleColumnLayoutSemanticHelper.prototype.getDefaultLayouts = function () {
		return {
			defaultLayoutType: this._defaultLayoutType,
			defaultTwoColumnLayoutType: this._defaultTwoColumnLayoutType,
			defaultThreeColumnLayoutType: this._defaultThreeColumnLayoutType
		};
	};

	return FlexibleColumnLayoutSemanticHelper;

}, /* bExport= */ false);
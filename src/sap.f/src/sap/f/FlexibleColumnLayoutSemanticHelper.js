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
		constructor: function (oFlexibleColumnLayout) {
			this.oFCL = oFlexibleColumnLayout;
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
	FlexibleColumnLayoutSemanticHelper.getInstanceFor = function (oFlexibleColumnLayout) {

		jQuery.sap.assert(oFlexibleColumnLayout instanceof FlexibleColumnLayout, "Passed control is not FlexibleColumnLayout");

		var sId = oFlexibleColumnLayout.getId();

		if (typeof FlexibleColumnLayoutSemanticHelper._oInstances[sId] === "undefined") {
			FlexibleColumnLayoutSemanticHelper._oInstances[sId] = new FlexibleColumnLayoutSemanticHelper(oFlexibleColumnLayout);
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
		if (sCurrentLayout === "OneColumn") {

			// Clicking an item in the begin column opens the mid column
			sNextLayout = "TwoColumnsDefault";

		}

		// 2 columns
		if (["TwoColumnsDefault", "TwoColumnsBeginEmphasized", "TwoColumnsMidEmphasized"].indexOf(sCurrentLayout) !== -1) {
			if (sColumn === "begin") {

				// Clicking the begin column when in 2-column layout should preserve the current layout (and not reset the default 2-column layout)
				sNextLayout = sCurrentLayout;

			} else {

				// Clicking the mid colum when in 2-column layout should switch to 3 column layout
				sNextLayout = "ThreeColumnsDefault";

			}
		}

		// mid fullscreen => end fullscreen
		if (sCurrentLayout === "MidFullScreen") {

			// Clicking an item in the mid column from fullscreen always opens the end column in fullscreen
			sNextLayout = "EndFullScreen";

		}

		// 3 columns
		if (["ThreeColumnsDefault", "ThreeColumnsMidEmphasized", "ThreeColumnsEndEmphasized", "ThreeColumnsMidEmphasizedEndHidden", "ThreeColumnsBeginEmphasizedEndHidden"].indexOf(sCurrentLayout) !== -1) {
			if (sColumn === "begin") {

				// Clicking the begin column in 3-column layout should switch to 2-column layout
				sNextLayout = "TwoColumnsDefault";

			} else if (sColumn === "mid") {

				if (["ThreeColumnsMidEmphasizedEndHidden", "ThreeColumnsBeginEmphasizedEndHidden"].indexOf(sCurrentLayout) !== -1) {
					// Clicking the mid column when in 3-column layout where end column is hidden, should reveal the end column again
					sNextLayout = "ThreeColumnsDefault";
				} else {
					// Clicking the mid column when in 3-column layout where end column is visible, should preserve the current layout
					sNextLayout = sCurrentLayout;
				}

			} else {

				// Clicking the end column when in 3-column layout should always open fullscreen
				sNextLayout = "EndFullScreen";

			}
		}

		// end fullscreen => another end fullscreen
		if (sCurrentLayout === "EndFullScreen") {
			sNextLayout = "EndFullScreen";
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

		return ["OneColumn", "MidFullScreen", "EndFullScreen"].indexOf(sLayout) !== -1;
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
			oEndColumn.closeColumn = "TwoColumnsDefault";

		} else {

			if (sColumnWidthDistribution === "67/33/0" || sColumnWidthDistribution === "33/67/0") {

				oMidColumn.fullScreen = "MidFullScreen";
				oMidColumn.closeColumn = "";

			}

			if (sColumnWidthDistribution === "25/50/25" || sColumnWidthDistribution === "25/25/50" || sColumnWidthDistribution === "0/67/33") {

				oEndColumn.fullScreen = "EndFullScreen";
				oEndColumn.closeColumn = "TwoColumnsDefault";

			}

			if (sColumnWidthDistribution === "0/100/0") {

				aEligibleLayouts = ["TwoColumnsDefault", "TwoColumnsBeginEmphasized", "TwoColumnsMidEmphasized", "ThreeColumnsBeginEmphasizedEndHidden", "ThreeColumnsMidEmphasizedEndHidden"];
				sExitFullScreen = this.oFCL._getLayoutHistory().getClosestEntryThatMatches(aEligibleLayouts) || "TwoColumnsDefault";

				oMidColumn.exitFullScreen = sExitFullScreen;
				oMidColumn.closeColumn = "";

			}

			if (sColumnWidthDistribution === "0/0/100") {

				aEligibleLayouts = ["ThreeColumnsDefault", "ThreeColumnsMidEmphasized", "ThreeColumnsEndEmphasized"];
				sExitFullScreen = this.oFCL._getLayoutHistory().getClosestEntryThatMatches(aEligibleLayouts) || "ThreeColumnsDefault";

				oEndColumn.exitFullScreen = sExitFullScreen;
				oEndColumn.closeColumn = "TwoColumnsDefault";

			}
		}

		return {
			midColumn: oMidColumn,
			endColumn: oEndColumn
		};
	};


	return FlexibleColumnLayoutSemanticHelper;

}, /* bExport= */ false);
/*!
 * ${copyright}
 */

// Provides control sap.f.SemanticFlexibleColumnLayout.
sap.ui.define([
	"jquery.sap.global",
	"./library",
	"./FlexibleColumnLayout",
	"./FlexibleColumnLayoutRenderer"
], function (jQuery, library, FlexibleColumnLayout, FlexibleColumnLayoutRenderer) {
	"use strict";


	/**
	 * Constructor for a new Semantic Flexible Column Layout.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The FlexibleColumnLayout control implements the master-detail-detail paradigm by allowing the user to display up to three pages at a time.
	 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.f.SemanticFlexibleColumnLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SemanticFlexibleColumnLayout = FlexibleColumnLayout.extend("sap.f.SemanticFlexibleColumnLayout", {
		metadata: {
		},
		renderer: FlexibleColumnLayoutRenderer
	});

	/**
	 * Returns information about the current layout of the control
	 * @returns {{layout: *, columnsSizes: {beginColumn, midColumn, endColumn}, columnsVisibility: {beginColumn, midColumn, endColumn}, isFullScreen, isLogicallyFullScreen, actionButtonsInfo: {midColumn, endColumn}}}
	 */
	SemanticFlexibleColumnLayout.prototype.getCurrentUIState = function () {
		var sCurrentLayout = this.getLayout();
		return this._getUIStateForLayout(sCurrentLayout);
	};

	/**
	 * Returns information about the layout that the control will have after navigating to the next logical level (i.e. from 1 column to 2 columns)
	 * @returns {{layout: *, columnsSizes: {beginColumn, midColumn, endColumn}, columnsVisibility: {beginColumn, midColumn, endColumn}, isFullScreen, isLogicallyFullScreen, actionButtonsInfo: {midColumn, endColumn}}}
	 */
	SemanticFlexibleColumnLayout.prototype.getNextUIState = function () {

		var sCurrentLayout = this.getLayout(),
			sNextLayout;

		// 1 column => 2 columns
		if (sCurrentLayout === "OneColumn") {
			sNextLayout = "TwoColumnsDefault";
		}

		// 2 columns => 3 columns
		if (["TwoColumnsDefault", "TwoColumnsBeginEmphasized", "TwoColumnsMidEmphasized"].indexOf(sCurrentLayout) !== -1) {
			sNextLayout = "ThreeColumnsDefault";
		}

		// mid fullscreen => end fullscreen
		if (sCurrentLayout === "MidFullScreen") {
			sNextLayout = "EndFullScreen";
		}

		// 3 columns => 4th level page (which is always shown in fullscreen)
		if (["ThreeColumnsDefault", "ThreeColumnsMidEmphasized", "ThreeColumnsEndEmphasized", "ThreeColumnsMidEmphasizedEndHidden", "ThreeColumnsBeginEmphasizedEndHidden"].indexOf(sCurrentLayout) !== -1) {
			sNextLayout = "EndFullScreen";
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
	SemanticFlexibleColumnLayout.prototype._getUIStateForLayout = function (sLayout) {

		return {
			layout: sLayout,
			columnsSizes: this._getColumnsSizes(sLayout),
			columnsVisibility: this._getColumnsVisibility(sLayout),
			isFullScreen: this._getIsFullScreen(sLayout),
			isLogicallyFullScreen: this._getIsLogicallyFullScreen(sLayout),
			actionButtonsInfo: this._getActionButtonsInfo(sLayout)
		};

	};

	SemanticFlexibleColumnLayout.prototype._getColumnsSizes = function (sLayout) {
		return {
			beginColumn: this._getColumnSizeForLayout("begin", sLayout),
			midColumn: this._getColumnSizeForLayout("mid", sLayout),
			endColumn: this._getColumnSizeForLayout("end", sLayout)
		};
	};

	SemanticFlexibleColumnLayout.prototype._getColumnsVisibility = function (sLayout) {
		return {
			beginColumn: this._getColumnSizeForLayout("begin", sLayout) !== 0,
			midColumn: this._getColumnSizeForLayout("mid", sLayout) !== 0,
			endColumn: this._getColumnSizeForLayout("end", sLayout) !== 0
		};
	};

	SemanticFlexibleColumnLayout.prototype._getIsFullScreen = function (sLayout) {
		return this._getColumnSizeForLayout("begin", sLayout) === 100 ||
			this._getColumnSizeForLayout("mid", sLayout) === 100 ||
			this._getColumnSizeForLayout("end", sLayout) === 100;
	};

	SemanticFlexibleColumnLayout.prototype._getIsLogicallyFullScreen = function (sLayout) {

		return ["OneColumn", "MidFullScreen", "EndFullScreen"].indexOf(sLayout) !== -1;
	};

	SemanticFlexibleColumnLayout.prototype._getActionButtonsInfo = function (sLayout) {

		var iMaxColumnsCount = this._getMaxColumnsCount(),
			sColumnWidthDistribution = this._getColumnWidthDistributionForLayout(sLayout),
			oMidColumn = {
				fullScreen: null,
				exitFullScreen: null,
				closeColumn: null
			},
			oEndColumn = {
				fullScreen: null,
				exitFullScreen: null,
				closeColumn: null
			};

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

				var aEligibleLayouts = ["TwoColumnsDefault", "TwoColumnsBeginEmphasized", "TwoColumnsMidEmphasized", "ThreeColumnsBeginEmphasizedEndHidden", "ThreeColumnsMidEmphasizedEndHidden"];
				var sExitFullScreen = this._getClosestHistoryEntryThatMatches(aEligibleLayouts) || "TwoColumnsDefault";

				oMidColumn.exitFullScreen = sExitFullScreen;
				oMidColumn.closeColumn = "";

			}

			if (sColumnWidthDistribution === "0/0/100") {

				var aEligibleLayouts = ["ThreeColumnsDefault", "ThreeColumnsMidEmphasized", "ThreeColumnsEndEmphasized"];
				var sExitFullScreen = this._getClosestHistoryEntryThatMatches(aEligibleLayouts) || "ThreeColumnsDefault";

				oEndColumn.exitFullScreen = sExitFullScreen;
				oEndColumn.closeColumn = "TwoColumnsDefault";

			}
		}

		return {
			midColumn: oMidColumn,
			endColumn: oEndColumn
		};
	};

	SemanticFlexibleColumnLayout.prototype._getClosestHistoryEntryThatMatches = function (aLayouts) {
		var i;

		for (i = this._aLayoutHistory.length - 1; i >= 0; i--) {
			if (aLayouts.indexOf(this._aLayoutHistory[i]) !== -1) {
				return this._aLayoutHistory[i];
			}
		}

	};


	return SemanticFlexibleColumnLayout;

}, /* bExport= */ false);
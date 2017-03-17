/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"./library",
	"./LayoutType",
	"./FlexibleColumnLayout"
], function (jQuery, library, LT, FlexibleColumnLayout) {
	"use strict";

	/**
	 * Constructor for a sap.f.FlexibleColumnLayoutSemanticHelper.
	 *
	 * @class
	 * Helper class, facilitating the implementation of the recommended UX design of a <code>sap.f.FlexibleColumnLayout</code>-based app.
	 *
	 * <b>Note:</b> Using this class is not mandatory in order to build an app with <code>sap.f.FlexibleColumnLayout</code>, but exists for convenience only.
	 *
	 * <ul>The usage of <code>sap.f.FlexibleColumnLayoutSemanticHelper</code> revolves around two main methods:
	 * <li><code>getCurrentUIState</code>Suggests which action buttons to show in each <code>sap.f.FlexibleColumnLayout</code> column,
	 * based on the current control state (number and visibility of columns, layout, etc..)</li>
	 * <li><code>getNextUIState</code>Suggests which <code>layout</code> to use when navigating to another view level (e.g. from one view to two views).</li></ul>
	 *
	 * Sample usage of the class:
	 *
	 * <pre>
 	 * <code>
	 *  var helper = sap.f.FlexibleColumnLayoutSemanticHelper.getInstanceFor(myFlexibleColumnLayout);
	 *  helper.getCurrentUIState();
	 *  helper.getNextUIState(2);
	 *  helper.getNextUIState(0);
	 * </code>
	 * </pre>
	 *
	 * Calling <code>getCurrentUIState()</code> will return information which action buttons (Close, FullScreen, ExitFullScreen)
	 * must be currently shown in which column, according to UX guidelines, as well as to what layout clicking them should lead.
	 *
	 * Calling <code>getNextUIState(2)</code> will return information about the expected layout and action buttons if the
	 * application should display three views (master-detail-detail), based on the current state.
	 *
	 * Similarly, calling <code>getNextUIState(0)</code> will return information about the expected layout and action buttons
	 * if the application should display the initial view only (master), based on the current state.
	 *
	 * For more information, see {@link sap.f.FlexibleColumnLayoutSemanticHelper#getCurrentUIState} and {@link sap.f.FlexibleColumnLayoutSemanticHelper#getNextUIState}
	 *
	 * @version ${version}
	 * @param {sap.f.FlexibleColumnLayout} oFlexibleColumnLayout The <code>sap.f.FlexibleColumnLayout</code> object whose state will be manipulated
	 * @param {object} oSettings Determines the rules that will be used by the helper
	 * @param {sap.f.LayoutType} oSettings.defaultTwoColumnLayoutType Determines what two-column layout type will be suggested by default: <code>sap.f.LayoutType.TwoColumnsBeginExpanded</code> (default) or <code>sap.f.LayoutType.TwoColumnsMidExpanded</code>
	 * @param {sap.f.LayoutType} oSettings.defaultThreeColumnLayoutType Determines what three-column layout type will be suggested by default: <code>sap.f.LayoutType.ThreeColumnsMidExpanded</code> (default) or <code>sap.f.LayoutType.ThreeColumnsEndExpanded</code>
	 * @public
	 * @since 1.46.0
	 * @alias sap.f.FlexibleColumnLayoutSemanticHelper
	 */
	var FlexibleColumnLayoutSemanticHelper = function (oFlexibleColumnLayout, oSettings) {
		this._oFCL = oFlexibleColumnLayout;
		this._mode = "Normal";

		// Currently only the the default 3-column type is configurable
		this._defaultLayoutType = LT.OneColumn;
		this._defaultTwoColumnLayoutType = [LT.TwoColumnsBeginExpanded, LT.TwoColumnsMidExpanded].indexOf(oSettings.defaultTwoColumnLayoutType) !== -1 ?
			oSettings.defaultTwoColumnLayoutType : LT.TwoColumnsBeginExpanded;
		this._defaultThreeColumnLayoutType = [LT.ThreeColumnsMidExpanded, LT.ThreeColumnsEndExpanded].indexOf(oSettings.defaultThreeColumnLayoutType) !== -1 ?
			oSettings.defaultThreeColumnLayoutType : LT.ThreeColumnsMidExpanded;
	};

	/**
	 * Instances of the class per flexible column layout object.
	 *
	 * @type {{}}
	 * @private
	 */
	FlexibleColumnLayoutSemanticHelper._oInstances = {};

	/**
	 * Returns an instance of the <code>sap.f.FlexibleColumnLayoutSemanticHelper</code> class for a given <code>sap.f.FlexibleColumnLayout</code> object.
	 *
	 * @param {sap.f.FlexibleColumnLayout} oFlexibleColumnLayout The <code>sap.f.FlexibleColumnLayout</code> object to get a semantic helper instance for
	 * @param {object} [oSettings] An optional settings object to be used when creating the instance.
	 * <b>Note:</b> will be considered only for the first <code>getInstanceFor</code> call for the given <code>sap.f.FlexibleColumnLayout</code> object.
	 *
	 * @public
	 * @static
	 * @returns {sap.f.FlexibleColumnLayoutSemanticHelper}
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
	 *  Returns an object, describing the current state of the control and the expected action buttons for each column.
	 *
	 *  <ul>The returned object has the following structure:
	 * 	<li>layout - the value of the <code>layout</code> property</li>
	 * 	<li>maxColumnsCount - the maximum number of columns that can be displayed at once based on the control width. See {@link sap.f.FlexibleColumnLayout#getMaxColumnsCount}</li>
	 * 	<li>columnsSizes -  an object with fields <code>beginColumn, midColumn, endColumn</code>, representing the relative percentage sizes of the three columns as integers</li>
	 * 	<li>columnsVisibility -  an object with fields <code>beginColumn, midColumn, endColumn</code>, representing the visibility of the three columns</li>
	 * 	<li>isFullScreen - <code>true</code> if only one column is visible at the moment, <code>false</code> otherwise
	 * 	<b>Note:</b> This may be due to small screen size (phone) or due to a layout, for which a single column takes up the whole width</li>
	 * 	<li>isLogicallyFullScreen - <code>true</code> if the current <code>layout</code> is one of the following: <code>sap.f.LayoutType.OneColumn, sap.f.LayoutType.MidColumnFullScreen, sap.f.LayoutType.EndColumnFullScreen</code>, <code>false</code> otherwise
	 * 	<b>Note:</b> While <code>isFullScreen</code> can be <code>true</code> for any layout, due to small screen size, <code>isLogicallyFullScreen</code> will only be <code>true</code> for the layout values, listed above.</li>
	 * 	<li>actionButtonsInfo - an object with fields <code>midColumn, endColumn</code>, each containing an object, telling whether action buttons should be shown in the <code>mid</code> and <code>end</code> columns, and what value of the <code>layout</code> property should be set upon clicking these buttons.
	 * 	Each of these objects has the following fields: <code>closeColumn, fullScreen, exitFullScreen</code>. If <code>null</code>, then the respective action button should not be shown, otherwise provides the value of <code>layout</code> property for the action button.</li></ul>
	 *
	 * 	Example value:
	 *
	 *  <pre>
	 *  <code>
	 *  {
	 *	   "layout":"ThreeColumnsMidExpanded",
	 *	   "maxColumnsCount":3,
	 *	   "columnsSizes":{
	 *		  "beginColumn":25,
	 *		  "midColumn":50,
	 *		  "endColumn":25
	 *	   },
	 *	   "columnsVisibility":{
	 *		  "beginColumn":true,
	 *		  "midColumn":true,
	 *		  "endColumn":true
	 *	   },
	 *	   "isFullScreen":false,
	 *	   "isLogicallyFullScreen":false,
	 *	   "actionButtonsInfo":{
	 *		  "midColumn":{
	 *			 "fullScreen":null,
	 *			 "exitFullScreen":null,
	 *			 "closeColumn":null
	 *		  },
	 *		  "endColumn":{
	 *			 "fullScreen":"EndColumnFullScreen",
	 *			 "exitFullScreen":null,
	 *			 "closeColumn":"TwoColumnsBeginExpanded"
	 *		  }
	 *	   }
	 *	}
	 *  </code>
	 *  </pre>
	 * @public
	 * @returns {{layout: string, maxColumnsCount: number, columnsSizes: {beginColumn, midColumn, endColumn}, columnsVisibility: {beginColumn, midColumn, endColumn}, isFullScreen, isLogicallyFullScreen, actionButtonsInfo: {midColumn, endColumn}}}
	 */
	FlexibleColumnLayoutSemanticHelper.prototype.getCurrentUIState = function () {
		var sCurrentLayout = this._oFCL.getLayout();
		return this._getUIStateForLayout(sCurrentLayout);
	};

	/**
	 * Returns an object, describing the state that the control will have after navigating to a different view level.
	 *
	 * About the format of return value, see: {@link sap.f.FlexibleColumnLayoutSemanticHelper#getCurrentUIState}
	 *
	 * @param iLevel - the view level that should be represented. 0 means initial (master only), 1 - master-detail,
	 * 2 - master-detail-detail, 3 and above - subsequent views
	 *
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
	 * Returns the default layout types for the different numbers of columns.
	 *
	 * <ul>The returned object has the following fields:
	 * <li>defaultLayoutType - the layout that will be suggested by default when only 1 column needs to be shown</li>
	 * <li>defaultTwoColumnLayoutType - the layout that will be suggested by default when 2 columns have to be shown side by side</li>
	 * <li>defaultThreeColumnLayoutType - the layout that will be suggested by default when 3 columns have to be shown side by side</li></ul>
	 *
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

}, /* bExport= */ true);
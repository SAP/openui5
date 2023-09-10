/*!
 * ${copyright}
 */

sap.ui.define([
	"./library",
	"./FlexibleColumnLayout",
	"sap/base/assert"
], function (library, FlexibleColumnLayout, assert) {
	"use strict";

	// shortcut for sap.f.LayoutType
	var LT = library.LayoutType;

	/**
	 * Constructor for an sap.f.FlexibleColumnLayoutSemanticHelper.
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
	 * application should display three views (list-detail-detail), based on the current state.
	 *
	 * Similarly, calling <code>getNextUIState(0)</code> will return information about the expected layout and action buttons
	 * if the application should display the initial view only (list), based on the current state.
	 *
	 * For more information, see {@link sap.f.FlexibleColumnLayoutSemanticHelper#getCurrentUIState} and {@link sap.f.FlexibleColumnLayoutSemanticHelper#getNextUIState}
	 *
	 * @version ${version}
	 * @param {sap.f.FlexibleColumnLayout} oFlexibleColumnLayout
	 * The <code>sap.f.FlexibleColumnLayout</code> object whose state will be manipulated.
	 *
	 * @param {object} oSettings Determines the rules that will be used by the helper.
	 *
	 * @param {sap.f.LayoutType} [oSettings.defaultTwoColumnLayoutType=sap.f.LayoutType.TwoColumnsBeginExpanded]
	 * Determines what two-column layout type will be suggested by default:
	 * <code>sap.f.LayoutType.TwoColumnsBeginExpanded</code> or <code>sap.f.LayoutType.TwoColumnsMidExpanded</code>.
	 *
	 * @param {sap.f.LayoutType} [oSettings.defaultThreeColumnLayoutType=sap.f.LayoutType.ThreeColumnsMidExpanded]
	 * Determines what three-column layout type will be suggested by default:
	 * <code>sap.f.LayoutType.ThreeColumnsMidExpanded</code> or <code>sap.f.LayoutType.ThreeColumnsEndExpanded</code>.
	 *
	 * @param {int} oSettings.maxColumnsCount
	 * Determines the maximum number of columns that will be displayed side by side.
	 *
	 * <ul>Possible values:
	 *
	 * <li>Value of <code>1</code> only single-column layouts will be suggested.</li>
	 *
	 * <li>Value of <code>2</code> Up to 2-column layouts will be suggested.</li>
	 *
	 * <li>Value of <code>3</code> (default) - Up to 3-column layouts will be suggested.</li></ul>
	 *
	 * @param {int} oSettings.initialColumnsCount
	 * Determines whether a single-column or a 2-column layout will be suggested
	 * for logical level 0.
	 *
	 * <ul>Possible values:
	 *
	 * <li>Value of <code>1</code> (default) - A single-column layout will be suggested
	 * for logical level 0.</li>
	 *
	 * <li>Value of <code>2</code> - A 2-column layout will be suggested for logical level 0.</li></ul>
	 *
	 * @param {string} [oSettings.mode]
	 * <b>Deprecated as of version 1.50</b>, use <code>maxColumnsCount</code> param
	 * instead.
	 *
	 * Determines the suggested layout types: <code>Normal</code> (3-column layouts),
	 * <code>MasterDetail</code> (2-column layouts for the first two pages, all other
	 * pages will open in fullscreen), and <code>SingleColumn</code> (one page at a
	 * time only).
	 *
	 * @public
	 * @since 1.46.0
	 * @alias sap.f.FlexibleColumnLayoutSemanticHelper
	 */
	var FlexibleColumnLayoutSemanticHelper = function (oFlexibleColumnLayout, oSettings) {
		var oModeToMaxColumnsCountMapping = {
				Normal: 3,
				MasterDetail: 2,
				SingleColumn: 1
			},
			iInitial,
			iMax;
		oSettings || (oSettings = {});
		this._oFCL = oFlexibleColumnLayout;

		// Layout types
		this._defaultLayoutType = LT.OneColumn;
		this._defaultTwoColumnLayoutType = [LT.TwoColumnsBeginExpanded, LT.TwoColumnsMidExpanded].indexOf(oSettings.defaultTwoColumnLayoutType) !== -1 ?
			oSettings.defaultTwoColumnLayoutType : LT.TwoColumnsBeginExpanded;
		this._defaultThreeColumnLayoutType = [LT.ThreeColumnsMidExpanded, LT.ThreeColumnsEndExpanded].indexOf(oSettings.defaultThreeColumnLayoutType) !== -1 ?
			oSettings.defaultThreeColumnLayoutType : LT.ThreeColumnsMidExpanded;

		// Maximum number of columns and mode (deprecated)
		if (["Normal", "MasterDetail", "SingleColumn"].indexOf(oSettings.mode) !== -1 && !oSettings.maxColumnsCount) {
			iMax = oModeToMaxColumnsCountMapping[oSettings.mode];
		} else {
			iMax = oSettings.maxColumnsCount ? parseInt(oSettings.maxColumnsCount) : 3;
			if (iMax < 1 || iMax > 3) {
				iMax = 3;
			}
		}
		this._maxColumnsCount = iMax;

		// Initial number of columns (1 by default, can be set to 2 for MasterDetail or Normal modes only)
		iInitial = oSettings.initialColumnsCount ? parseInt(oSettings.initialColumnsCount) : 1;
		if (iInitial < 1 || iInitial > 2 || this._maxColumnsCount === 1) {
			iInitial = 1;
		}
		this._initialColumnsCount = iInitial;
	};

	/**
	 * Instances of the class per flexible column layout object.
	 *
	 * @type {Object<string,sap.m.FlexibleColumnLayoutSemanticHelper>}
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
	 * @returns {sap.f.FlexibleColumnLayoutSemanticHelper} The <code>sap.f.FlexibleColumnLayoutSemanticHelper</code> instance
	 */
	FlexibleColumnLayoutSemanticHelper.getInstanceFor = function (oFlexibleColumnLayout, oSettings) {

		assert(oFlexibleColumnLayout instanceof FlexibleColumnLayout, "Passed control is not FlexibleColumnLayout");

		var sId = oFlexibleColumnLayout.getId();

		if (typeof FlexibleColumnLayoutSemanticHelper._oInstances[sId] === "undefined") {
			FlexibleColumnLayoutSemanticHelper._oInstances[sId] = new FlexibleColumnLayoutSemanticHelper(oFlexibleColumnLayout, oSettings);

			var oDelegate = {
				onDestroy: function() {
					delete FlexibleColumnLayoutSemanticHelper._oInstances[sId];
				}
			};
			oFlexibleColumnLayout.addEventDelegate(oDelegate);
		}

		return FlexibleColumnLayoutSemanticHelper._oInstances[sId];
	};

	/**
	 * Represents the relative percentage sizes of all columns as integers.
	 *
	 * @typedef {object} sap.f.FlexibleColumnLayoutSemanticHelper.ColumnsSizes
	 *
	 * @property {number} [beginColumn]
	 *   The relative percentage width of the begin column as integer.
	 * @property {number} [midColumn]
	 *   The relative percentage width of the mid column as integer.
	 * @property {number} [endColumn]
	 *   The relative percentage width of the end column as integer.
	 * @public
	 */

	/**
	 * Represents the visibility of the columns.
	 *
	 * @typedef {object} sap.f.FlexibleColumnLayoutSemanticHelper.ColumnsVisibility
	 *
	 * @property {boolean} [beginColumn]
	 *   The visibility of the begin column.
	 * @property {boolean} [midColumn]
	 *   The visibility of the mid column.
	 * @property {boolean} [endColumn]
	 *   The visibility of the end column.
	 * @public
	 */

	/**
	 * The configuration of the navigation actions in the columns.
	 *
	 * @typedef {object} sap.f.FlexibleColumnLayoutSemanticHelper.ColumnsNavigationActions
	 *
	 * @property {sap.f.FlexibleColumnLayoutSemanticHelper.NavigationActionsTargets} [midColumn]
	 *   Configuration of the navigation actions of the mid column.
	 * @property {sap.f.FlexibleColumnLayoutSemanticHelper.NavigationActionsTargets} [endColumn]
	 *   Configuration of the navigation actions of the end column.
	 * @public
	 */

	/**
	 * Configures the target layouts of the navigation acion buttons in a column.
	 *
	 * @typedef {object} sap.f.FlexibleColumnLayoutSemanticHelper.NavigationActionsTargets
	 *
	 * @property {string|null} [fullScreen]
	 *   The target {@link sap.f.FlexibleColumnLayout#getLayout layout} when the <code>fullscreen</code> navigation action button is pressed.
	 *   If null, then the respective action button should not be shown.
	 * @property {string|null} [exitFullScreen]
	 *   The target {@link sap.f.FlexibleColumnLayout#getLayout layout} when the <code>exitFullScreen</code> navigation action button is pressed.
	 *   If null, then the respective action button should not be shown.
	 * @property {string|null} [closeColumn]
	 *   The target {@link sap.f.FlexibleColumnLayout#getLayout layout} when the <code>closeColumn</code> navigation action button is pressed.
	 *   If null, then the respective action button should not be shown.
	 * @public
	 */

	/**
	 * Configuration of the state of the <code>FlexibleColumnLayout</code> control and the expected action buttons for each column.
	 *
	 * Example value:
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
	 *
	 * @typedef {object} sap.f.FlexibleColumnLayoutSemanticHelper.UIState
	 *
	 * @property {sap.f.LayoutType} [layout]
	 *  The value of the {@link sap.f.FlexibleColumnLayout#getLayout layout} property.
	 * @property {number} [maxColumnsCount]
	 *  The maximum number of columns that can be displayed at once based on the control width. See {@link sap.f.FlexibleColumnLayout#getMaxColumnsCount}
	 * @property {sap.f.FlexibleColumnLayoutSemanticHelper.ColumnsSizes} [columnsSizes]
	 *  Represents the relative percentage sizes of all columns as integers.
	 * @property {sap.f.FlexibleColumnLayoutSemanticHelper.ColumnsVisibility} [columnsVisibility]
	 *  Represents the visibility of the columns.
	 * @property {boolean} [isFullScreen]
	 *  The value is <code>true</code> if only one column is visible at the moment, <code>false</code> otherwise.
	 *
	 *  <b>Note:</b> This may be due to small screen size (phone) or due to a layout, for which a single column takes up the whole width.
	 * @property {boolean} [isLogicallyFullScreen]
	 *  The value is <code>true</code> if the current <code>layout</code> is one of the following: <code>sap.f.LayoutType.OneColumn, sap.f.LayoutType.MidColumnFullScreen, sap.f.LayoutType.EndColumnFullScreen</code>, <code>false</code> otherwise.
	 *
	 *  <b>Note:</b> While <code>isFullScreen</code> can be <code>true</code> for any layout, due to small screen size, <code>isLogicallyFullScreen</code> will only be <code>true</code> for the layout values, listed above.
	 * @property {sap.f.FlexibleColumnLayoutSemanticHelper.ColumnsNavigationActions} [actionButtonsInfo]
	 *  The configuration of the navigation actions in the columns.
	 *
	 * @public
	 */

	/**
	 * Returns an object describing the current state of the control and the expected action buttons for each column.
	 *
	 * <b>Note:</b> This method relies on the internal <code>FlexibleColumnLayout</code> reference to be rendered in the DOM tree. For convenience, use methods {@link sap.f.FlexibleColumnLayoutSemanticHelper#isDOMReady} and {@link sap.f.FlexibleColumnLayoutSemanticHelper#whenDOMReady}.
	 *
	 * @public
	 * @returns {sap.f.FlexibleColumnLayoutSemanticHelper.UIState} The object describing the current UI state
	 */
	FlexibleColumnLayoutSemanticHelper.prototype.getCurrentUIState = function () {
		var sCurrentLayout = this._oFCL.getLayout();
		return this._getUIStateForLayout(sCurrentLayout);
	};

	/**
	 * Returns an object, describing the state that the control will have after navigating to a different view level.
	 *
	 * @param {int} iNextLevel - the view level that should be represented. 0 means initial (list only), 1 - list-detail,
	 * 2 - list-detail-detail, 3 and above - subsequent views
	 *
	 * @public
	 * @returns {sap.f.FlexibleColumnLayoutSemanticHelper.UIState} The object describing the next UI state
	 */
	FlexibleColumnLayoutSemanticHelper.prototype.getNextUIState = function (iNextLevel) {

		var sCurrentLayout = this._oFCL.getLayout(),
			iInitial = this._initialColumnsCount,
			sNextLayout;

		// Level 0 - the first page
		if (iNextLevel === 0) {
			// From any layout, going to level 0 is always showing the begin column only, unless initialColumnsCount=2. Then a 2-column layout is suggested even for level 0
			// However, a 2-column layout should only be suggested if there is enough space for 2 columns, hence the additional check
			if (iInitial === 2 && this._canShowTwoColumns()) {
				sNextLayout = this._defaultTwoColumnLayoutType;
			} else {
				sNextLayout = LT.OneColumn;
			}
		}

		// Level 1 - the second page
		if (iNextLevel === 1) {

			if (this._maxColumnsCount === 1) {

				sNextLayout = LT.MidColumnFullScreen;

			} else {

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
		}

		// Level 2 - the third page
		if (iNextLevel === 2) {

			if (this._maxColumnsCount < 3) {

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
	 * @param {sap.f.LayoutType} sLayout
	 * @returns {{layout: string, maxColumnsCount: number, columnsSizes: {beginColumn: number, midColumn: number, endColumn: number}, columnsVisibility: {beginColumn: boolean, midColumn: boolean, endColumn: boolean}, isFullScreen: boolean, isLogicallyFullScreen: boolean, actionButtonsInfo: {midColumn: object, endColumn: object}}}
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

		if (this._maxColumnsCount === 1) {
			return {
				midColumn: oMidColumn,
				endColumn: oEndColumn
			};
		}

		if (iMaxColumnsCount === 1) {

			oMidColumn.closeColumn = this._defaultLayoutType;
			oEndColumn.closeColumn = this._defaultTwoColumnLayoutType;

		} else {

			if (sColumnWidthDistribution === "67/33/0" || sColumnWidthDistribution === "33/67/0") {

				oMidColumn.fullScreen = LT.MidColumnFullScreen;
				oMidColumn.closeColumn = this._defaultLayoutType;

			}

			if (sColumnWidthDistribution === "25/50/25" || sColumnWidthDistribution === "25/25/50" || sColumnWidthDistribution === "0/67/33" || sColumnWidthDistribution === "0/33/67") {

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

				if (this._maxColumnsCount !== 2) {
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
	 * @returns {object} The object describing the default layout types for the different numbers of columns
	 */
	FlexibleColumnLayoutSemanticHelper.prototype.getDefaultLayouts = function () {
		return {
			defaultLayoutType: this._defaultLayoutType,
			defaultTwoColumnLayoutType: this._defaultTwoColumnLayoutType,
			defaultThreeColumnLayoutType: this._defaultThreeColumnLayoutType
		};
	};

	/**
	 * Determines whether the FCL can display 2 columns side by side.
	 * This check can only be performed reliably if the control is rendered (so that its width can be measured).
	 * Otherwise, only a best guess can be made, based on the window size, instead.
	 *
	 * @returns {boolean}
	 * @private
	 */
	FlexibleColumnLayoutSemanticHelper.prototype._canShowTwoColumns = function () {
		var iControlWidth = this._oFCL._getControlWidth(),
			iMaxColumnsCount = this._oFCL._getMaxColumnsCountForWidth( iControlWidth || window.innerWidth);

		return iMaxColumnsCount > 1;
	};

	/**
	 * Abstract wrapper for {@link sap.f.FlexibleColumnLayoutSemanticHelper#isDOMReady}.
	 * Returns <code>true</code> if criteria are met for the APIs in this helper to be used.
	 *
	 * @returns {boolean} true if this helper's API reliability criteria are met
	 * @since 1.72
	 * @public
	 */
	FlexibleColumnLayoutSemanticHelper.prototype.isReady = function () {
		return this.isDOMReady();
	};

	/**
	 * Returns <code>true</code> if internal <code>FlexibleColumnLayout</code> reference is rendered in the DOM tree.
	 *
	 * @returns {boolean} true if the associated <code>FlexibleColumnLayout</code> is rendered
	 * @since 1.72
	 * @public
	 */
	FlexibleColumnLayoutSemanticHelper.prototype.isDOMReady = function () {
		return this._oFCL.getDomRef() !== null;
	};

	/**
	 * Returns promise which can be used to find out when internal criteria for this helper's
	 * API reliability are met.
	 *
	 * @returns {Promise} A promise that resolves after internal criteria are met
	 * @since 1.72
	 * @public
	 */
	FlexibleColumnLayoutSemanticHelper.prototype.whenReady = function () {
		var that = this;

		return new Promise(function (resolve, reject) {
			that.whenDOMReady()
				.then(function () {
					resolve();
				})
				.catch(function (arg) {
					reject(arg);
				});
		});
	};

	/**
	 * Returns promise which can be used to find out when the internal <code>FlexibleColumnLayout</code> is rendered.
	 * This is needed because methods in <code>FlexibleColumnLayout</code> rely on the control
	 * being rendered.
	 *
	 * @returns {Promise} A promise that resolves after <code>FlexibleColumnLayout</code> is rendered
	 * @since 1.72
	 * @public
	 */
	 FlexibleColumnLayoutSemanticHelper.prototype.whenDOMReady = function () {
		var that = this;

		var oDomReadyPromise = new Promise(function (resolve, reject) {
			if (!that._oFCL || that._oFCL.bIsDestroyed) {
				reject('FlexibleColumnLayout reference missing. Please make sure FlexibleColumnLayoutSemanticHelper is properly initialized.');
			}


			if (that._oFCL.getDomRef()) {
				resolve();
			} else {
				var oDelegate = {
					onAfterRendering: function () {
						that._oFCL.removeEventDelegate(oDelegate);
						resolve();
					}
				};
				that._oFCL.addEventDelegate(oDelegate);
			}
		});

		return oDomReadyPromise;
	};

	return FlexibleColumnLayoutSemanticHelper;

}, /* bExport= */ true);
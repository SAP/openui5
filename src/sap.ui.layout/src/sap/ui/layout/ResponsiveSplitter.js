/*!
* ${copyright}
*/

// Provides control sap.ui.layout.ResponsiveSplitter.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"./ResponsiveSplitterUtilities",
	"./ResponsiveSplitterPage",
	"./PaneContainer",
	"./SplitPane",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/core/ResizeHandler",
	"./ResponsiveSplitterRenderer",
	"sap/ui/thirdparty/jquery"
], function(
	library,
	Control,
	RSUtil,
	ResponsiveSplitterPage,
	PaneContainer,
	SplitPane,
	ItemNavigation,
	ResizeHandler,
	ResponsiveSplitterRenderer,
	jQuery
) {
	"use strict";

	/**
	 * Constructor for a new ResponsiveSplitter.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A responsive splitter which divides the application into several areas.
	 * <h3>Overview</h3>
	 * The responsive splitter layout structures complex applications into defined areas.
	 * These areas may be resizable and are either distributed across one or multiple screen areas, some of which may also be off-canvas.
	 *
	 * The control is intended for developing administrative tools and applications.
	 * <h3>Structure</h3>
	 * The responsive splitter holds the following hierarchy of containers and controls:
	 * <ul>
	 * <li>{@link sap.ui.layout.PaneContainer Pane Container} - holds one or more Split Panes and determines the pane orientation. The pane which is stored in <code>rootPaneContainer</code> holds all other pane containers and split panes.</li>
	 * <li>{@link sap.ui.layout.SplitPane Split Pane} - independent containers that may interact with one another. Each pane can hold only one control.</li>
	 * </ul>
	 * <h3>Usage</h3>
	 * <h4>When to use</h4>
	 * <ul>
	 * <li>The application has to display several areas side by side that must be resizable.</li>
	 * <li>The application must work on a range of different devices in a responsive manner.</li>
	 * </ul>
	 * <h3>Responsive Behavior</h3>
	 * <ul>
	 * <li>As soon as views are in the off-canvas mode, the pagination bar at the bottom of the application allows the user to switch between them.</li>
	 * <li>On touch-enabled devices, the splitters show explicit handles with larger touch areas.</li>
	 * <li>Double-clicking on a splitter will collapse or expand it back to its original position.</li>
	 * </ul>
	 *
	 * <b>Note:</b> We don't recommend dynamically inserting/removing panes into/from the PaneContainer since this might lead to inconsistent layout. If it is necessary, you need to ensure the sum of all sizes of the SplitPanes doesn't exceed the width of the PaneContainer.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.38
	 * @alias sap.ui.layout.ResponsiveSplitter
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/responsive-splitter/ Responsive Splitter}
	 */
	var ResponsiveSplitter = Control.extend("sap.ui.layout.ResponsiveSplitter", /** @lends sap.ui.layout.ResponsiveSplitter.prototype */ {
		metadata: {
			library: "sap.ui.layout",
			properties: {
				/**
				 * The width of the control
				 */
				width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : '100%'},

				/**
				 * The height of the control
				 */
				height : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : '100%'}
			},
			defaultAggregation : "rootPaneContainer",
			aggregations: {
				/**
				 * The root PaneContainer of the ResponsiveSplitter
				 */
				rootPaneContainer: { type: "sap.ui.layout.PaneContainer", multiple: false },
				/**
				 * Contains the internal pages that are used for pagination
				 */
				_pages: { type: "sap.ui.layout.ResponsiveSplitterPage", multiple : true, visibility: "hidden" }
			},
			associations: {
				/**
				 * The default pane that will remain always visible
				 * If no defaultPane is specified, the ResponsiveSplitter sets the first SplitPane that is added to a PaneContainer in it as a default.
				 */
				defaultPane: { type: "sap.ui.layout.SplitPane", multiple: false }
			},
			events: {

			}
		}
	});

	var CONSTANTS = {
		MAX_VISIBLE_BUTTONS: 7
	};

	ResponsiveSplitter.prototype.init = function () {
		this._aPaneContainers = [];
		this._aPanes = [];
		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.layout");
		this.addEventDelegate({
			onAfterRendering: function () {
				this._initItemNavigation();
			}
		}, this);
	};

	ResponsiveSplitter.prototype.onBeforeRendering = function () {
		var oRootContainer = this.getRootPaneContainer();
		if (oRootContainer) {
			oRootContainer._oSplitter.addEventDelegate({
				onAfterRendering: function () {
					this._setSplitterBarsTooltips(oRootContainer._oSplitter);
					this._updatePaginatorButtonsTooltips();
				}
			}, this);

			this._createWidthIntervals();
			this._createPages();
			this._detachResizeHandler();
		}
	};

	ResponsiveSplitter.prototype.onAfterRendering = function () {
		this._parentResizeHandler = ResizeHandler.register(this, this._onParentResize.bind(this));
		var oRootContainer = this.getRootPaneContainer();
		if (oRootContainer) {
			this._onParentResize();
		}
	};

	/**
	 * Detaches the resize handler on exit
	 */
	ResponsiveSplitter.prototype.exit = function () {
		this._detachResizeHandler();
	};

	/**
	 * Sets tooltips to the SplitterBars
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._setSplitterBarsTooltips = function (oContent, iParent) {
		var	aSplitterBars = oContent.$().find(" > .sapUiLoSplitterBar"),
			aContentAreas = oContent.$().find(" > .sapUiLoSplitterContent"),
			sTooltip = "",
			iCurrentPaneIndex, iNextPaneIndex, oAreaContent, sContentId;

		for (var i = 0; i < aContentAreas.length; i++) {
			sContentId = aContentAreas[i].childNodes[0].id;
			oAreaContent = sap.ui.getCore().byId(sContentId);
			iCurrentPaneIndex = i + 1;
			iNextPaneIndex = i + 2;

			if (iParent) {
				sTooltip += this._oResourceBundle.getText("RESPONSIVE_SPLITTER_RESIZE", [iParent + "." + iCurrentPaneIndex, iParent + "." + iNextPaneIndex]);
			} else {
				sTooltip += this._oResourceBundle.getText("RESPONSIVE_SPLITTER_RESIZE", [iCurrentPaneIndex, iNextPaneIndex]);
			}

			if (aSplitterBars[i]) {
				aSplitterBars[i].setAttribute("title", sTooltip);
				sTooltip = "";
			}
			if (oAreaContent instanceof sap.ui.layout.Splitter) {
				this._setSplitterBarsTooltips(oAreaContent, iCurrentPaneIndex);
			}
		}
	};

	/**
	 * Sets and updates the tooltips of the Paginator's buttons.E.g.
	 * Go to split screen 1 and 2
	 * Go to screen 3
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._updatePaginatorButtonsTooltips = function () {
		var aVisibleButtons = Array.prototype.slice.call(this._getVisibleButtons()),
			iHomePageCount = this.getRootPaneContainer()._oSplitter.getAssociatedContentAreas().length,
			sHomeTooltip = this._oResourceBundle.getText("RESPONSIVE_SPLITTER_HOME") + " ",
			sAnd = this._oResourceBundle.getText("RESPONSIVE_SPLITTER_AND"),
			sTooltip = "",
			that = this,
			oHomeButton;

		if (aVisibleButtons.length > 0) {
			oHomeButton = aVisibleButtons.shift();
			for (var i = 1; i <= iHomePageCount; i++) {
				sHomeTooltip += i;

				if (i < (iHomePageCount - 1)) {
					sHomeTooltip += ", ";
				} else if (i === iHomePageCount - 1){
					sHomeTooltip += " " + sAnd + " ";
				}
			}
			oHomeButton.setAttribute("title", sHomeTooltip);

			[].forEach.call(aVisibleButtons, function(oButton) {
				sTooltip = that._oResourceBundle.getText("RESPONSIVE_SPLITTER_GOTO") + " " + (iHomePageCount + 1);
				iHomePageCount += 1;
				oButton.setAttribute("title", sTooltip);
			});
		}
	};

	ResponsiveSplitter.prototype.onsapright = function (oEvent) {
		this._handleArrowNavigation(6, "Forward", oEvent);
	};

	ResponsiveSplitter.prototype.onsapleft = function (oEvent) {
		this._handleArrowNavigation(0, "Back", oEvent);
	};


	/**
	 * Creates an ItemNavigation
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._initItemNavigation = function () {
		if (this._oItemNavigation) {
			this._bPrevItemNavigation = true;
			this._clearItemNavigation();
		}
		this._oItemNavigation = new ItemNavigation();
		this._oItemNavigation.setCycling(false);
		this.addDelegate(this._oItemNavigation);
		this._setItemNavigation();

		if (this._bPrevItemNavigation) {
			this._oItemNavigation.focusItem(0);
		}
	};

	/**
	 * Enables ItemNavigation for Paginator
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._setItemNavigation = function () {
		var aButtons = this._getVisibleButtons(),
			aDomRefs = [];

		this._oItemNavigation.setRootDomRef(this.$().find(".sapUiResponsiveSplitterPaginator")[0]);
		for (var i = 0; i < aButtons.length; i++) {
			if (aButtons[i]) {
				aDomRefs.push(aButtons[i]);
			}
		}
		this._oItemNavigation.setItemDomRefs(aDomRefs);
	};

	/**
	 * Destroys the ItemNavigation
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._clearItemNavigation = function () {
		this.removeDelegate(this._oItemNavigation);
		this._oItemNavigation.destroy();
		delete this._oItemNavigation;
	};

	/**
	 * Handle for arrow keys
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._handleArrowNavigation = function (iButtonIndex, sDirection, oEvent) {
		if (oEvent.target === this._getVisibleButtons()[iButtonIndex]) {
			this["_handlePaginator" + sDirection](oEvent);
			this._setItemNavigation();
		} else {
			return;
		}
	};

	/**
	 * Handles the resize event of the parent
	 * @private
	 */
	ResponsiveSplitter.prototype._onParentResize = function () {
		var bIntervalHasChanged = this._intervalHasChanged(),
			oRootContainer = this.getRootPaneContainer();

		if (bIntervalHasChanged && oRootContainer) {
			this._arrangeContent();
			this._setPaginatorVisibility();
		}
	};

	/**
	 * Detaches the parent resize handler
	 * @private
	 */
	ResponsiveSplitter.prototype._detachResizeHandler = function () {
		if (this._parentResizeHandler) {
			ResizeHandler.deregister(this._parentResizeHandler);
			this._parentResizeHandler = null;
		}
	};

	/**
	 * The WidthIntervals is a sorted array in ascending order, containing all breakpoints for the splitter
	 * The interval is defined as 2 sequent array elements.
	 * This array includes Number.MIN_VALUE and Number.MAX_VALUE as -Infinity and +Infinity,
	 * and covers the whole numeric axis
	 * @private
	 */
	ResponsiveSplitter.prototype._createWidthIntervals = function () {
		var aBreakpoints = [];
		this._aIntervals = [];

		RSUtil.visitPanes(this.getRootPaneContainer(), function (oPane) {
			var iRequiredWidth = oPane.getRequiredParentWidth();
			if (aBreakpoints.indexOf(iRequiredWidth) == -1) {
				aBreakpoints.push(iRequiredWidth);
			}
		});

		aBreakpoints.push(Number.NEGATIVE_INFINITY); // -Infinity
		aBreakpoints.push(Number.POSITIVE_INFINITY); // +Infinity

		aBreakpoints.sort(function (a, b) {
			return a - b;
		});

		for (var i = 0; i < aBreakpoints.length - 1; i++) {
			var oInterval = new RSUtil.splitterInterval(aBreakpoints[i], aBreakpoints[i + 1], this.getRootPaneContainer());
			this._aIntervals.push(oInterval);
		}
	};

	/**
	 * Initiates the internal pages aggregation
	 * @private
	 */
	ResponsiveSplitter.prototype._createPages = function () {
		var iMaxPageCount = this._getMaxPageCount();
		this.destroyAggregation("_pages", true);
		for (var i = 0; i < iMaxPageCount; i++) {
			var oPage = new ResponsiveSplitterPage();
			this.addAggregation("_pages", oPage, true);
		}
	};

	/**
	 * Checks whether during the resizing the breakpoint interval has changed
	 * @returns {boolean}
	 * @private
	 */
	ResponsiveSplitter.prototype._intervalHasChanged = function () {
		var width = this.getDomRef().clientWidth,
			oInterval = null,
			aIntervals = this._aIntervals;

		for (var i = 0; i < aIntervals.length; i++) {
			if (aIntervals[i].iFrom < width && width <= aIntervals[i].iTo) {
				oInterval = aIntervals[i];
				break;
			}
		}

		if (this._currentInterval !== oInterval) {
			this._currentInterval = oInterval;
			return true;
		}

		return false;
	};

	/**
	 * Sets the visibility of the paginator buttons
	 * @private
	 */
	ResponsiveSplitter.prototype._setPaginatorVisibility = function () {
		var $Buttons = this.$().find(".sapUiResponsiveSplitterPaginatorButton"),
			$NavButtons = this.$().find(".sapUiResponsiveSplitterPaginatorNavButton"),
			$Paginator = this.$().find(".sapUiResponsiveSplitterPaginator"),
			iPageCount = (this._getHiddenPanes().length + 1),
			bShowNavButtons = iPageCount < CONSTANTS.MAX_VISIBLE_BUTTONS;

		$Buttons.addClass("sapUiResponsiveSplitterHiddenElement");
		if (iPageCount > 1) {
			this.getDomRef().classList.add("sapUiRSVisiblePaginator");
			$Buttons = $Buttons.slice(0, bShowNavButtons ? iPageCount : CONSTANTS.MAX_VISIBLE_BUTTONS);
			$Buttons.removeClass("sapUiResponsiveSplitterHiddenElement");
			$Buttons.removeClass("sapUiResponsiveSplitterHiddenPaginatorButton");
			$NavButtons.toggleClass("sapUiResponsiveSplitterHiddenPaginatorButton", bShowNavButtons);
			$Paginator.toggleClass("sapUiResponsiveSplitterWithNavButtons", !bShowNavButtons);
		} else {
			this.getDomRef().classList.remove("sapUiRSVisiblePaginator");
		}
	};

	/**
	 * Iterates all intervals, and returns the maximum page count found
	 * @private
	 */
	ResponsiveSplitter.prototype._getMaxPageCount = function () {
		var iTempMax = 0;

		this._aIntervals.forEach(function (oInterval) {
			if (oInterval.iPagesCount > iTempMax) {
				iTempMax = oInterval.iPagesCount;
			}
		});
		return iTempMax;
	};

	/**
	 * Clears the existing layout and activates the first page
	 * Invokes _fillPageContent to build a new layout
	 * @private
	 */
	ResponsiveSplitter.prototype._arrangeContent = function () {
		var aPages = this.getAggregation("_pages") || [];
		this._clearContent();
		aPages.forEach(function (oPage) {
			oPage.setVisible(false);
		});

		this._fillPageContent(this.getRootPaneContainer());

		this._activatePage(0);
	};

	/**
	 * Sets the indexed page to visible and changes the selected button in the paginator
	 * @param {int} iPageIndex
	 * @private
	 */
	ResponsiveSplitter.prototype._activatePage = function (iPageIndex) {
		var $PaginatorButtons = this.$().find(".sapUiResponsiveSplitterPaginatorButton"),
			$OldSelectedButton = this.$().find(".sapUiResponsiveSplitterPaginatorSelectedButton"),
			iOldActivePage = $PaginatorButtons.index($OldSelectedButton),
			aPages = this.getAggregation("_pages") || [];

		aPages[iOldActivePage] && aPages[iOldActivePage].setVisible(false);
		aPages[iPageIndex] && aPages[iPageIndex].setVisible(true);
		$OldSelectedButton.removeClass("sapUiResponsiveSplitterPaginatorSelectedButton");
		$PaginatorButtons.eq(iPageIndex).addClass("sapUiResponsiveSplitterPaginatorSelectedButton");
		$OldSelectedButton.attr("aria-checked", false);
		$PaginatorButtons.eq(iPageIndex).attr("aria-checked", true);
	};

	/**
	 * Goes through all SplitPanes and PaneContainers and defines which panes will be shown
	 * The content of the demand Panes which are not on the main page gets moved into pages
	 * @private
	 */
	ResponsiveSplitter.prototype._fillPageContent = function (oSplitterElement) {
		var bIsPaneContainer = oSplitterElement instanceof PaneContainer,
			bIsSplitPane = oSplitterElement instanceof SplitPane,
			oSplitterElementParent = oSplitterElement.getParent(),
			bIsParentPaneContainer = oSplitterElementParent instanceof PaneContainer,
			aPages = this.getAggregation("_pages"),
			aHiddenPanes, bHasPanesInCurrentInterval, oInternalSplitter, bDemandPane,
			iHiddenPanesCount, iMaxPageCount;

		if (bIsPaneContainer && aPages) {
			this._aPaneContainers.push(oSplitterElement);
			bHasPanesInCurrentInterval = this._getAllPanesInInterval(oSplitterElement, this._currentInterval.iFrom).length > 0;
			oInternalSplitter = oSplitterElement._oSplitter;

			if (bIsParentPaneContainer && bHasPanesInCurrentInterval) {
				oSplitterElementParent._oSplitter.addAssociatedContentArea(oInternalSplitter);
			} else if (!bIsParentPaneContainer) {
				aPages[0].setContent(oInternalSplitter);
			}
			oSplitterElement.getPanes().forEach(function(oPane) { this._fillPageContent(oPane); }, this);
		} else if (bIsSplitPane && aPages) {
			this._assignDefault(oSplitterElement);
			this._aPanes.push(oSplitterElement);
			bDemandPane = oSplitterElement.getDemandPane();
			aHiddenPanes = this._getHiddenPanes();
			iHiddenPanesCount = aHiddenPanes.length;
			iMaxPageCount = this._getMaxPageCount();

			var i;
			if (oSplitterElement._isInInterval(this._currentInterval.iFrom)) {
				oSplitterElementParent._oSplitter.addAssociatedContentArea(oSplitterElement.getContent());
			} else if (bDemandPane && (iHiddenPanesCount < iMaxPageCount)) {
				for (i = 0; i < iHiddenPanesCount; i++) {
					aPages[i + 1].setContent(aHiddenPanes[i].getContent());
				}
			} else if (bDemandPane && iHiddenPanesCount === iMaxPageCount) {
				for (i = 0; i < iHiddenPanesCount; i++) {
					aPages[i].setContent(aHiddenPanes[i].getContent());
				}
			} else if (this._isDefault(oSplitterElement)) {
				aPages[0].setContent(oSplitterElement.getContent());
			}
		}
	};

	ResponsiveSplitter.prototype._isDefault = function (oPane) {
		return this.getDefaultPane() === oPane.getId();
	};

	ResponsiveSplitter.prototype._assignDefault = function (oPane) {
		var oDefaultPane = this.getDefaultPane();
		this.setDefaultPane(oDefaultPane || oPane);
	};

	/**
	 * Returns an array of all nested panes which are suitable for the current interval
	 * @returns {array} An array of all nested panes
	 * @private
	 */
	ResponsiveSplitter.prototype._getAllPanesInInterval = function (oPaneContainer, iFrom) {
		var aPanes = [];

		function fnVisitAllContainers(oPaneContainer) {
			oPaneContainer.getPanes().forEach(function(oPane) {
				if (oPane instanceof PaneContainer) {
					fnVisitAllContainers(oPane);
				} else if (oPane._isInInterval(iFrom)) {
					aPanes.push(oPane);
				}
			});
			return aPanes;
		}
		return fnVisitAllContainers(oPaneContainer, iFrom);
	};

	/**
	 * Returns an array of all hidden panes which are with demand set to true
	 * @returns {array} An array of all hidden panes
	 * @private
	 */
	ResponsiveSplitter.prototype._getHiddenPanes = function () {
		return this._aPanes.filter(function(oPane) {
			return oPane.getDemandPane() && !oPane._isInInterval(this._currentInterval.iFrom);
		}, this);
	};

	/**
	 * Remove the internal AssociatedContentAreas of the AssociativeSplitters
	 * @private
	 */
	ResponsiveSplitter.prototype._clearContent = function () {
		this._aPaneContainers.forEach(function(oPaneContainer) {
			oPaneContainer._oSplitter.removeAllAssociatedContentAreas();
		});

		this._aPaneContainers = [];
		this._aPanes = [];
	};

	/**
	 * Returns an array of all visible buttons from the Paginator
	 * @returns {object} An array of all visible buttons
	 * @private
	 */
	ResponsiveSplitter.prototype._getVisibleButtons = function () {
		return this.$().find(".sapUiResponsiveSplitterPaginatorButton:not(.sapUiResponsiveSplitterHiddenElement, .sapUiResponsiveSplitterHiddenPaginatorButton)");
	};

	/**
	 * Handles tab / space / enter of Paginator's button
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._handlePaginatorButtonTap = function (oEvent) {
		var oTarget = oEvent.target,
			aTargetClassList = oEvent.target.classList,
			iPageIndex;

		if (aTargetClassList && aTargetClassList.contains("sapUiResponsiveSplitterPaginatorButton")) {
			iPageIndex = oTarget.getAttribute("page-index");
			this._activatePage(iPageIndex);
		} else if (aTargetClassList && aTargetClassList.contains("sapUiResponsiveSplitterPaginatorNavButton")) {
			if (aTargetClassList.contains("sapUiResponsiveSplitterPaginatorButtonForward")) {
				this._handlePaginatorForward(oEvent);
			} else {
				this._handlePaginatorBack(oEvent);
			}
		}
	};

	/**
	 * Handles when forward button in the paginator is pressed
	 * @param oEvent
	 * @private
	 */
	ResponsiveSplitter.prototype._handlePaginatorForward = function (oEvent) {
		var $VisibleButtons = this._getVisibleButtons(),
			iHiddenPaneCount = this._getHiddenPanes().length,
			$HiddenButtons = this.$().find(".sapUiResponsiveSplitterPaginatorButton.sapUiResponsiveSplitterHiddenElement"),
			$HiddenRightButtons = $HiddenButtons.filter(function() {
				return this.getAttribute("page-index") >= CONSTANTS.MAX_VISIBLE_BUTTONS &&
				 this.getAttribute("page-index") <= iHiddenPaneCount;
			});

		if ($HiddenRightButtons.length > 0) {
			$VisibleButtons.first().addClass("sapUiResponsiveSplitterHiddenElement");
			$HiddenRightButtons.last().removeClass("sapUiResponsiveSplitterHiddenElement");
		}
	};

	/**
	 * Handles when back button in the paginator is pressed
	 * @param oEvent
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._handlePaginatorBack = function (oEvent) {
		var $VisibleButtons = this._getVisibleButtons(),
			iMaxPageCount = this._getMaxPageCount() - CONSTANTS.MAX_VISIBLE_BUTTONS,
			$HiddenButtons = this.$().find(".sapUiResponsiveSplitterPaginatorButton.sapUiResponsiveSplitterHiddenElement"),
			$HiddenLeftButtons = $HiddenButtons.filter(function() { return this.getAttribute("page-index") < iMaxPageCount; });

		if ($HiddenLeftButtons.length > 0) {
			$VisibleButtons.last().addClass("sapUiResponsiveSplitterHiddenElement");
			$HiddenLeftButtons.last().removeClass("sapUiResponsiveSplitterHiddenElement");
		}
	};

	ResponsiveSplitter.prototype.ontap = ResponsiveSplitter.prototype._handlePaginatorButtonTap;

	ResponsiveSplitter.prototype.onsapenter = ResponsiveSplitter.prototype._handlePaginatorButtonTap;

	ResponsiveSplitter.prototype.onsapspace = ResponsiveSplitter.prototype._handlePaginatorButtonTap;

	return ResponsiveSplitter;

});
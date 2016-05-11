/*!
* ${copyright}
*/

// Provides control sap.ui.layout.ResponsiveSplitter.
sap.ui.define(["jquery.sap.global", "./library", "sap/ui/core/Control", "./ResponsiveSplitterUtilities", "./ResponsiveSplitterPage", "sap/ui/core/delegate/ItemNavigation"], function (jQuery, library, Control, RSUtil, ResponsiveSplitterPage, ItemNavigation) {
	"use strict";

	/**
	 * Constructor for a new ResponsiveSplitter.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * ResponsiveSplitter is a control that enables responsiveness of normal Splitter.
	 * ResponsiveSplitter consists of PaneContainers that further  agregate other PaneContainers and SplitPanes.
	 * SplitPanes can be moved to the pagination when a minimum width of their parent is reached.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.38
	 * @alias sap.ui.layout.ResponsiveSplitter
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
				pages: { type: "sap.ui.layout.ResponsiveSplitterPage", multiple : true, visibility: "hidden" }
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

	ResponsiveSplitter.prototype.init = function () {
		this.addEventDelegate({
			onAfterRendering: function () {
				this._initItemNavigation();
			}
		}, this);
	};

	ResponsiveSplitter.prototype.onBeforeRendering = function () {
		var bDefaultPane = this._checkForDefault();
		if (!bDefaultPane) {
			var sFirstPaneId = this._getfirstPaneId();
			if (sFirstPaneId) {
				this.setAssociation("defaultPane", sFirstPaneId);
				jQuery.sap.log.warning("No defaultPane association defined so the first pane added in the ResponsiveSplitter is set as а default");
			} else {
				return;
			}
		}

		this._detachResizeHandler();
		this._createWidthIntervals();
		this._createPages();
	};

	ResponsiveSplitter.prototype.onAfterRendering = function () {
		this._parentResizeHandler = sap.ui.core.ResizeHandler.register(this, this._onParentResize.bind(this));

		if (this.getAggregation("pages")) {
			this._onParentResize();
		}
	};

	/**
	 * Handles tab / space / enter of Paginator's button
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._handlePaginatorButtonTap = function (oEvent) {
		var iOldFocusedIndex = this._oItemNavigation.getFocusedIndex();
		if (jQuery(oEvent.target).hasClass("sapUiResponsiveSplitterPaginatorButton")) {
			jQuery(oEvent.target).attr("tabindex", 0);
			var iPageIndex = parseInt(jQuery(oEvent.target).attr("page-index"), 10);
			this.getAggregation("pages").forEach(function (page) {
				page.setVisible(false);
			});

			if (iPageIndex !== 0) {
				var aDemandPanes = this._currentInterval.pages.filter(function(page) { return page.demandPane; });

				iPageIndex = this._currentInterval.pages.indexOf(aDemandPanes[iPageIndex - 1]);
			}

			this._activatePage(iPageIndex, parseInt(jQuery(oEvent.target).attr("page-index"), 10));
		}

		if (jQuery(oEvent.target).hasClass("sapUiResponsiveSplitterPaginatorNavButton")) {
			if (jQuery(oEvent.target).hasClass("sapUiResponsiveSplitterPaginatorButtonForward")) {
				this._handlePaginatorForward(oEvent);
			} else {
				this._handlePaginatorBack(oEvent);
			}
			this._setItemNavigation();
			this._oItemNavigation.focusItem(iOldFocusedIndex);
		}
		this._setItemNavigation();
	};

	ResponsiveSplitter.prototype.ontap = ResponsiveSplitter.prototype._handlePaginatorButtonTap;

	ResponsiveSplitter.prototype.onsapenter = ResponsiveSplitter.prototype._handlePaginatorButtonTap;

	ResponsiveSplitter.prototype.onsapspace = ResponsiveSplitter.prototype._handlePaginatorButtonTap;

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
	 * Returns whether this.currentInterval[0] is an object or an Array
	 * @returns {boolean}
	 * @private
	 */
	ResponsiveSplitter.prototype._isFirstPageArray = function () {
		var oFirstPage = this._currentInterval.pages[0];
		return Array.isArray(oFirstPage) ? true : false;
	};

	/**
	 * @returns {boolean}
	 * @private
	 */
	ResponsiveSplitter.prototype._checkForDefault = function () {
		return this.getAssociation("defaultPane") ? true : false;
	};

	/**
	 * Returns an array of all visible buttons from the Paginator
	 * @returns {array}
	 * @private
	 */
	ResponsiveSplitter.prototype._getVisibleButtons = function () {
		var aPaginatorButtons = this.$().find(".sapUiResponsiveSplitterPaginatorButton:not(.sapUiResponsiveSplitterHiddenElement):not(.sapUiResponsiveSplitterHiddenPaginatorButton)");

		return Array.prototype.slice.call(aPaginatorButtons);
	};

	/**
	 * @returns {*} Returns the ID of the first SplitPane found in a PaneContainer or false if there are no SplitPanes
	 * @private
	 */
	ResponsiveSplitter.prototype._getfirstPaneId = function () {
		var bFirstPane = true,
			sFirstPaneId;
		RSUtil.visitPanes(this.getRootPaneContainer(), function (oPane) {
			if (bFirstPane) {
				sFirstPaneId = oPane.getId();
				bFirstPane = false;
			}
		});

		return sFirstPaneId ? sFirstPaneId : false;
	};

	/**
	 * Handles when forward button in the paginator is pressed
	 * @param oEvent
	 * @private
	 */
	ResponsiveSplitter.prototype._handlePaginatorForward = function(oEvent) {
		var aVisibleButtons = this._getVisibleButtons(),
			aHiddenRightButtons = this.$().find(".sapUiResponsiveSplitterPaginatorButton.sapUiResponsiveSplitterHiddenElement");

		// To check when restoring the visibility of paginator
		aHiddenRightButtons = Array.prototype.splice.call(aHiddenRightButtons, 0, aHiddenRightButtons.length - ((this._currentInterval.pages[0].length || 0) - 1) -
			((this._currentInterval.pagesCount - 1) - this._currentInterval.pages.filter(function(page) { return page.demandPane; }).length));

		if (aHiddenRightButtons.length === 0) {
			return;
		}

		jQuery(aVisibleButtons[0]).addClass("sapUiResponsiveSplitterHiddenPaginatorButton");
		jQuery(aHiddenRightButtons[0]).removeClass("sapUiResponsiveSplitterHiddenElement");
	};

	/**
	 * Handles when back button in the paginator is pressed
	 * @param oEvent
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._handlePaginatorBack = function(oEvent) {
		var aVisibleButtons = this._getVisibleButtons(),
			aHiddenLeftButtons = this.$().find(".sapUiResponsiveSplitterPaginatorButton.sapUiResponsiveSplitterHiddenPaginatorButton"),
			iLastHiddenLeftButton = aHiddenLeftButtons.length - 1;

		if (aHiddenLeftButtons.length === 0) {
			return;
		}

		jQuery(aVisibleButtons[aVisibleButtons.length - 1]).addClass("sapUiResponsiveSplitterHiddenElement");
		jQuery(aHiddenLeftButtons[iLastHiddenLeftButton]).removeClass("sapUiResponsiveSplitterHiddenPaginatorButton");
	};


	/**
	 * Sets the indexed page to visible and changes the selected button in the paginator
	 * @param index
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._activatePage = function (iPageIndex, iButtonIndex) {
		iButtonIndex = iButtonIndex || iPageIndex;
		this.getAggregation("pages")[iPageIndex].setVisible(true);
		this.$().find(".sapUiResponsiveSplitterPaginatorButton").removeClass("sapUiResponsiveSplitterPaginatorSelectedButton");
		jQuery(this.$().find(".sapUiResponsiveSplitterPaginatorButton")[iButtonIndex]).addClass("sapUiResponsiveSplitterPaginatorSelectedButton");
		jQuery(this.$().find(".sapUiResponsiveSplitterPaginatorButton")[iButtonIndex]).attr("tabindex", 0);
	};

	/**
	 * After the rendering of the control is done, and the outer width is known
	 * The content of the Layout gets moved into pages (If pages are needed)
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._arrangeContent = function () {
		this._setPaginatorVisibility();
		this._restoreAggregations();
		var sDefaultPaneId = this.getAssociation("defaultPane");

		this._oDefaultPaneLD = sDefaultPaneId ? sap.ui.getCore().byId(sDefaultPaneId).getLayoutData() : undefined;

		for (var i = 1; i < this._currentInterval.pages.length; i++) {
			var content = this._currentInterval.pages[i].content;
			this._currentInterval.pages[i].parent.removeAssociatedContentArea(content);
			if (this._currentInterval.pages[i].demandPane || this._currentInterval.pages[i].content.getId() === sap.ui.getCore().byId(this.getAssociation("defaultPane")).getContent().getId()) {
				this.getAggregation("pages")[i].setContent(content);
			}
		}

		for (var i = 1; i < this._currentInterval.splitters.length; i++) {
			var content = this._currentInterval.splitters[i];
			this._currentInterval.splitters[i].parent._oSplitter.removeAssociatedContentArea(content);
		}

		this.getAggregation("pages")[0].setContent(this.getRootPaneContainer()._oSplitter);
		this._activatePage(0);

		RSUtil.visitViews(this.getRootPaneContainer(), function(view) {
			var splitter = view._oSplitter;
			if (splitter.getAssociatedContentAreas().length === 0) {
				view.getParent()._oSplitter.removeAssociatedContentArea(sap.ui.getCore().byId(splitter.getId()));
			}
		});

		if (!Array.isArray(this._currentInterval.pages[0])) {
			var oDefaultPane = sap.ui.getCore().byId(this.getAssociation("defaultPane"));
			var content = this._currentInterval.pages[0].content;
			oDefaultPane.setLayoutData(new sap.ui.layout.SplitterLayoutData({
				size: "100%"
			}));
			this.getAggregation("pages")[0].setContent(content);

			this.getAggregation("pages")[0].setVisible(false);
			// var iButtonIndex = this._currentInterval.pages.filter(function(pane) { return pane.demandPane && pane.content.getId() === oDefaultPane.getContent().getId()})[0].contentIndex
			var iDemandPanes = this._currentInterval.pages.filter(function(pane) { return pane.demandPane; }).length;
			var iPageIndex = this._currentInterval.pages.map(function(page) { return page.content; }).indexOf(oDefaultPane.getContent());
			var iButtonIndex = null;

			if (iDemandPanes === 0) {
				this.getAggregation("pages")[iPageIndex].setContent(oDefaultPane.getContent());
			} else if (iDemandPanes === 1) {
				// TODO .. handle
			} else {
				iButtonIndex = 1;
				//this._currentInterval.pages.filter(function(pane) { return pane.demandPane && pane.content.getId() === oDefaultPane.getContent().getId()})[0].contentIndex
			}

			this._activatePage(iPageIndex, iButtonIndex);
		} else {
			this._revertDefaultPaneLD();
		}
	};

	ResponsiveSplitter.prototype._revertDefaultPaneLD = function () {
		var oDefaultPane = sap.ui.getCore().byId(this.getAssociation("defaultPane"));
		oDefaultPane.setLayoutData(this._oDefaultPaneLD ? this._oDefaultPaneLD : new sap.ui.layout.SplitterLayoutData( {size: "auto"} ));
	};

	ResponsiveSplitter.prototype._getActivePage = function () {
		return this.getAggregation("pages").indexOf(this.getAggregation("pages").filter(function(page) { return page.getVisible(); })[0]);
	};


	/**
	 * This method gets the pages from the currentInterval, then uses the pageDescriptors to rearrange the content,
	 * moving back the splitPane contents to the parent content.
	 * This method gets called when the interval gets changed.
	 * @private
	 */
	ResponsiveSplitter.prototype._restoreAggregations = function () {
		var restoreAggregation = function (paneDescriptor) {
			var content = paneDescriptor.content;
			var contentIndex = paneDescriptor.contentIndex;
			var parent = paneDescriptor.parent;
			parent.insertAssociatedContentArea(content, contentIndex);
		};

		// TODO REFACTOR

		var restoreViews = function(viewDescriptor) {
			var splitter = viewDescriptor.splitter;
			var parent = viewDescriptor.parent;
			var viewIndex = viewDescriptor.viewIndex;
			parent._oSplitter.insertAssociatedContentArea(splitter, viewIndex);
		};

		if (this._currentInterval.pages.filter(function(oPage) { return oPage.demandPane; }).length >= 7) {
			this.$().find(".sapUiResponsiveSplitterPaginatorNavButton").each(function () {
				jQuery(this).removeClass("sapUiResponsiveSplitterHiddenPaginatorButton");
			});

			this.$().find(".sapUiResponsiveSplitterPaginator").addClass("sapUiResponsiveSplitterWithNavButtons");
		} else {
			this.$().find(".sapUiResponsiveSplitterPaginator").removeClass("sapUiResponsiveSplitterWithNavButtons");
			this.$().find(".sapUiResponsiveSplitterPaginatorNavButton").each(function () {
				jQuery(this).addClass("sapUiResponsiveSplitterHiddenPaginatorButton");
			});
		}



		if (this._currentInterval.splitters.forEach) {
			this._currentInterval.splitters.forEach(function(viewDescriptor) {
				restoreViews(viewDescriptor);
			});
		}

		for (var i = 1; i < this._currentInterval.splitters.length; i++) {
			restoreViews(this._currentInterval.splitters[i]);
		}

		//Main page
		if (this._currentInterval.pages[0].forEach) {
			this._currentInterval.pages[0].forEach(function (paneDescriptor) {
				restoreAggregation(paneDescriptor);
			});
		} else {
			restoreAggregation(this._currentInterval.pages[0]);
		}

		for (var i = 1; i < this._currentInterval.pages.length; i++) {
			restoreAggregation(this._currentInterval.pages[i]);
		}

		this.getAggregation("pages").forEach(function (page) {
			page.setVisible(false);
		});
	};

	/**
	 * Detaches the resize handler on exit
	 */
	ResponsiveSplitter.prototype.exit = function () {
		this._detachResizeHandler();
	};

	/**
	 * Sets the visibility of the paginator buttons
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._setPaginatorVisibility = function () {
		var buttons = this.$().find(".sapUiResponsiveSplitterPaginatorButton"),
			pagesCount = this._currentInterval.pages.filter(function(page) { return page.demandPane; }).length + 1,
			sDefaultPane = this.getAssociation("defaultPane"),
			oDefaultPaneContentId;

		if (sDefaultPane) {
			oDefaultPaneContentId = sap.ui.getCore().byId(sDefaultPane).getContent().getId();
		}

		var aDemandContents = this._currentInterval.pages.filter(function(page) { return page.demandPane; }).map(function(page) { return page.content.getId(); });

		if (this._currentInterval.pages[0].demandPane && aDemandContents.indexOf(oDefaultPaneContentId)) {
			pagesCount -= 1;
		}

		buttons.addClass("sapUiResponsiveSplitterHiddenElement");
		if (pagesCount > 1) {
			this.addStyleClass("sapUiRSVisiblePaginator");
			buttons = buttons.slice(0, pagesCount > 7 ? 7 : pagesCount);
			buttons.removeClass("sapUiResponsiveSplitterHiddenElement");
			buttons.removeClass("sapUiResponsiveSplitterHiddenPaginatorButton");
		} else {
			this.removeStyleClass("sapUiRSVisiblePaginator");
		}
	};

	/**
	 * Initiates the internal pages aggregation
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._createPages = function () {
		var maxPageCount = this._getMaxPageCount();

		for (var i = 0; i < maxPageCount; i++) {
			var page = new ResponsiveSplitterPage();
			this.addAggregation("pages", page, true);
		}
	};

	/**
	 * Iterates all intervals, and returns the maximum page count found
	 * @returns {number}
	 * @private
	 */
	ResponsiveSplitter.prototype._getMaxPageCount = function () {
		var max = 0;

		this._intervals.forEach(function (interval) {
			if (interval.pagesCount > max) {
				max = interval.pagesCount;
			}
		});
		return max;
	};

	/**
	 * The WidthIntervals is a sorted array in ascdending order, containing all breakpoints for the splitter
	 * The interval is defined as 2 sequent array elements.
	 * This array includes Number.MIN_VALUE and Number.MAX_VALUE as -Infinity and +Infinity,
	 * and covers the whole numeric axis
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._createWidthIntervals = function () {
		var breakpoints = [];
		this._intervals = [];

		RSUtil.visitPanes(this.getRootPaneContainer(), function (pane) {
			var requiredWidth = pane.getRequiredParentWidth();
			if (jQuery.inArray(requiredWidth, breakpoints) == -1) {
				breakpoints.push(requiredWidth);
			}
		});

		breakpoints.push(Number.NEGATIVE_INFINITY); // -Infinity
		breakpoints.push(Number.POSITIVE_INFINITY); // +Infinity

		breakpoints.sort( function (a, b) {
			return a - b;
		});

		for (var i = 0; i < breakpoints.length - 1; i++) {
			var interval = new RSUtil.splitterInterval(breakpoints[i], breakpoints[i + 1], this.getRootPaneContainer());
			this._intervals.push(interval);
		}
	};

	/**
	 * Detaches the parent resize handler
	 * @returns {void}
	 * @private
	 */
	ResponsiveSplitter.prototype._detachResizeHandler = function () {
		if (this._parentResizeHandler) {
			sap.ui.core.ResizeHandler.deregister(this._parentResizeHandler);
			this._parentResizeHandler = null;
		}
	};

	/**
	 * Checks whether during the resizing the breakpoint interval has changed
	 * @returns {boolean}
	 * @private
	 */
	ResponsiveSplitter.prototype._intervalHasChanged = function () {
		var width = this.getDomRef().clientWidth,
			interval = null,
			intervals = this._intervals;

		for (var i = 0; i < intervals.length; i++) {
			if (intervals[i].from < width && width <= intervals[i].to) {
				interval = intervals[i];
				break;
			}
		}

		if (this._currentInterval !== interval) {
			this._currentInterval = interval;
			return true;
		}

		return false;
	};

	/**
	 * Handles the resize event of the parent
	 * @private
	 */
	ResponsiveSplitter.prototype._onParentResize = function () {
		if (this._intervalHasChanged()) {
			this._arrangeContent();
		}
	};

	return ResponsiveSplitter;

}, /* bExport= */ true);

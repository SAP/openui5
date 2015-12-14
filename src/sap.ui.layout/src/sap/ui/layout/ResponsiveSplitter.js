/*!
* ${copyright}
*/

// Provides control sap.ui.layout.ResponsiveSplitter.
sap.ui.define(["jquery.sap.global", "./library", "sap/ui/core/Control", "./ResponsiveSplitterUtilities", "./ResponsiveSplitterPage"], function (jQuery, library, Control, RSUtil, ResponsiveSplitterPage) {
	"use strict";

	/**
	 * Constructor for a new ResponsiveSplitter.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * ResponsiveSplitter is a control that enables responsibility of normal Splitter.
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
				 */
				defaultPane: { type: "sap.ui.layout.SplitPane", multiple: false }
			},
			events: {

			}
		}
	});

	ResponsiveSplitter.prototype.onBeforeRendering = function() {
		this._detachResizeHandler();
		this._createWidthIntervals();
		this._createPages();

	};

	ResponsiveSplitter.prototype.onAfterRendering = function() {
		this._parentResizeHandler = sap.ui.core.ResizeHandler.register(this, this._onParentResize.bind(this));

		if (this.getAggregation("pages")) {
			this._onParentResize();
		}
	};

	ResponsiveSplitter.prototype.ontap = function (oEvent) {
		if (jQuery(oEvent.target).hasClass("sapUiResponsiveSplitterPaginatorButton")) {

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
		}
	};

	ResponsiveSplitter.prototype._handlePaginatorForward = function(oEvent) {
		var aVisibleButtons = this.$().find(".sapUiResponsiveSplitterPaginatorButton:not(.sapUiResponsiveSplitterHiddenElement):not(.sapUiResponsiveSplitterHiddenPaginatorButton)");
		var aHiddenRightButtons = this.$().find(".sapUiResponsiveSplitterPaginatorButton.sapUiResponsiveSplitterHiddenElement");

		// FIX THIS!!
		// To check when restoring the visibility of paginator
		aHiddenRightButtons = Array.prototype.splice.call(aHiddenRightButtons, 0, aHiddenRightButtons.length - ((this._currentInterval.pages[0].length || 0) - 1) -
			((this._currentInterval.pagesCount - 1) - this._currentInterval.pages.filter(function(page) { return page.demandPane; }).length));

		if (aHiddenRightButtons.length === 0) {
			return;
		}

		jQuery(aVisibleButtons[0]).addClass("sapUiResponsiveSplitterHiddenPaginatorButton");
		jQuery(aHiddenRightButtons[0]).removeClass("sapUiResponsiveSplitterHiddenElement");
	};

	ResponsiveSplitter.prototype._handlePaginatorBack = function(oEvent) {
		var aVisibleButtons = this.$().find(".sapUiResponsiveSplitterPaginatorButton:not(.sapUiResponsiveSplitterHiddenElement):not(.sapUiResponsiveSplitterHiddenPaginatorButton)");
		var aHiddenLeftButtons = this.$().find(".sapUiResponsiveSplitterPaginatorButton.sapUiResponsiveSplitterHiddenPaginatorButton");


		var iLastHiddenLeftButton = aHiddenLeftButtons.length - 1;

		if (aHiddenLeftButtons.length === 0) {
			return;
		}

		jQuery(aVisibleButtons[aVisibleButtons.length - 1]).addClass("sapUiResponsiveSplitterHiddenElement");
		jQuery(aHiddenLeftButtons[iLastHiddenLeftButton]).removeClass("sapUiResponsiveSplitterHiddenPaginatorButton");
	};


	/**
	 * Sets the indexed page to visible and changes the selected button in the paginator
	 * @param index
	 * @private
	 */
	ResponsiveSplitter.prototype._activatePage = function (iPageIndex, iButtonIndex) {
		iButtonIndex = iButtonIndex || iPageIndex;


		this.getAggregation("pages")[iPageIndex].setVisible(true);
		this.$().find(".sapUiResponsiveSplitterPaginatorButton").removeClass("sapUiResponsiveSplitterPaginatorSelectedButton");
		jQuery(this.$().find(".sapUiResponsiveSplitterPaginatorButton")[iButtonIndex]).addClass("sapUiResponsiveSplitterPaginatorSelectedButton");
	};

	/**
	 * After the rendering of the control is done, and the outer width is known
	 * The content of the Layout gets moved into pages (If pages are needed)
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

	ResponsiveSplitter.prototype._revertDefaultPaneLD = function() {
		var oDefaultPane = sap.ui.getCore().byId(this.getAssociation("defaultPane"));
		oDefaultPane.setLayoutData(this._oDefaultPaneLD ? this._oDefaultPaneLD : new sap.ui.layout.SplitterLayoutData( {size: "auto"} ));
	};

	ResponsiveSplitter.prototype._getActivePage = function() {
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
			this.$().find(".sapUiResponsiveSplitterPaginatorNavButton").each(function() {
				jQuery(this).removeClass("sapUiResponsiveSplitterHiddenPaginatorButton");
			});

			this.$().find(".sapUiResponsiveSplitterPaginator").addClass("sapUiResponsiveSplitterWithNavButtons");
		} else {
			this.$().find(".sapUiResponsiveSplitterPaginator").removeClass("sapUiResponsiveSplitterWithNavButtons");
			this.$().find(".sapUiResponsiveSplitterPaginatorNavButton").each(function() {
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
	 * @param width
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

		breakpoints.push(Number.MIN_VALUE); // -Infinity
		breakpoints.push(Number.MAX_VALUE); // +Infinity

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

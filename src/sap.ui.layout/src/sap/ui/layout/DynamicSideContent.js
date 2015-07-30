/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.DynamicSideContent.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/ResizeHandler'],
	function (jQuery, Control, ResizeHandler) {
		"use strict";

		/**
		 * Constructor for a new DynamicSideContent control.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * The DynamicSideContent control allows additional (side) content to be displayed alongside or below the main
		 * content, within the container the control is used in. There are different size ratios between the main and
		 * the side content for the different breakpoints. The side content position (alongside/below the main content)
		 * and visibility (visible/hidden) can be configured per breakpoint. There are 4 predefined breakpoints:
		 * - Screen width > 1440 px (XL breakpoint)
		 * - Screen width <= 1440 px (L breakpoint)
		 * - Main content width <= 600 px (M breakpoint)
		 * - Screen width <= 720 px (S breakpoint)
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.30
		 * @alias sap.ui.layout.DynamicSideContent
		 */
		var DynamicSideContent = Control.extend("sap.ui.layout.DynamicSideContent", /** @lends sap.ui.layout.DynamicSideContent.prototype */ { metadata : {
			library : "sap.ui.layout",
			properties : {

				/**
				 * Determines whether the side content is visible or hidden.
				 */
				showSideContent : {type : "boolean", group : "Appearance", defaultValue : true},

				 /**
				 * Determines whether the main content is visible or hidden.
				 */
				showMainContent : {type : "boolean", group : "Appearance", defaultValue : true},

				/**
				 * Determines on which breakpoints the side content is visible
				 */
				sideContentVisibility : {type : "sap.ui.layout.SideContentVisibility", group : "Appearance", defaultValue : sap.ui.layout.SideContentVisibility.ShowAboveS},

				/**
				 * Determines on which breakpoints the side content falls down below the main content.
				 */
				sideContentFallDown : {type : "sap.ui.layout.SideContentFallDown", group : "Appearance", defaultValue : sap.ui.layout.SideContentFallDown.OnMinimumWidth},

				/**
				 * Defines whether the control is in equal split mode. In this mode, the side and the main content
				 * take 50:50 percent of the container on all screen sizes except for phone, where the main and
				 * side contents are switching visibility using the toggle method.
				 */
				equalSplit : {type : "boolean", group : "Appearance", defaultValue : false},

				/**
				 * If set to TRUE, then not the media Query (device screen size) but the size of the container, surrounding the control, defines the current range.
				 */
				containerQuery : {type : "boolean", group : "Behavior", defaultValue : false}
			},
			defaultAggregation : "mainContent",
			events : {
				/**
				 * The event indicates that the current breakpoint has been changed.
				 * @since 1.32
				 */
				breakpointChanged : {
					parameters : {
						currentBreakpoint : {type : "string"}
					}
				}
			},
			aggregations : {

				/**
				 * Main content controls
				 */
				mainContent : {type: "sap.ui.core.Control", multiple:  true},

				/**
				 * Side content controls
				 */
				sideContent : {type: "sap.ui.core.Control", multiple:  true}
			}
		}});

		var	S = "S",
			M = "M",
			L = "L",
			XL = "XL",
			HIDDEN_CLASS = "sapUiHidden",
			SPAN_SIZE_12_CLASS = "sapUiSCSpan12",
			SPAN_SIZE_3 = 3,
			SPAN_SIZE_4 = 4,
			SPAN_SIZE_6 = 6,
			SPAN_SIZE_8 = 8,
			SPAN_SIZE_9 = 9,
			SPAN_SIZE_12 = 12,
			INVALID_BREAKPOINT_ERROR_MSG = "Invalid Breakpoint. Expected: S, M, L or XL",
			INVALID_PARENT_WIDTH_ERROR_MSG = "Invalid input. Only values greater then 0 are allowed",
			SC_GRID_CELL_SELECTOR = "SCGridCell",
			MC_GRID_CELL_SELECTOR = "MCGridCell",
			S_M_BREAKPOINT = 720,
			M_L_BREAKPOINT = 1024,
			L_XL_BREAKPOINT = 1440;

		/**
		 * Setter for the showSideContent property
		 * @param {boolean} bVisible determines if the side content part is visible
		 * @param {boolean} bSuppressVisualUpdate determines if the visual state is updated
		 * @returns {object} {DynamicSideContent} for chaining
		 * @override
		 * @public
		 */
		DynamicSideContent.prototype.setShowSideContent = function (bVisible, bSuppressVisualUpdate) {
			this.setProperty("showSideContent", bVisible, true);
			if (!bSuppressVisualUpdate) {
				this._changeGridState();
			}
			return this;
		};

		/**
		 * Setter for the showMainContent property
		 * @param {boolean} bVisible determines if the main content part is visible
		 * @param {boolean} bSuppressVisualUpdate determines if the visual state is updated
		 * @returns {object} {DynamicSideContent} for chaining
		 * @override
		 * @public
		 */
		DynamicSideContent.prototype.setShowMainContent = function (bVisible, bSuppressVisualUpdate) {
			this.setProperty("showMainContent", bVisible, true);
			if (!bSuppressVisualUpdate) {
				this._changeGridState();
			}
			return this;
		};

		/**
		 * Set or unset the page in equalSplit mode
		 * @param {boolean}[bState] determines if the page is set to equalSplit mode
		 * @returns {object} {DynamicSideContent} for chaining
		 * @override
		 * @public
		 */
		DynamicSideContent.prototype.setEqualSplit = function (bState) {
			this.setShowMainContent(true, true);
			this.setShowSideContent(true, true);
			this.setProperty("equalSplit", bState, true);
			if (this._currentBreakpoint) {
				this._setResizeData(this._currentBreakpoint, bState);
				this._changeGridState();
			}
			return this;
		};

		/**
		 * Adds control to the side content area. Only the side content part in the aggregation is re-rendered
		 * @param {object} oControl object to be added in the aggregation
		 * @returns {object} {DynamicSideContent} for chaining
		 * @override
		 * @public
		 */
		DynamicSideContent.prototype.addSideContent = function (oControl) {
			this.addAggregation("sideContent", oControl, true);
			// Rerender only the part of the control that is changed
			this._rerenderControl(this.getAggregation("sideContent"), this.$(SC_GRID_CELL_SELECTOR));
			return this;
		};

		/**
		 * Adds control to the main content area. Only the main content part in the aggregation is re-rendered
		 * @param {object} oControl object to be added in the aggregation
		 * @returns {object} {DynamicSideContent} for chaining
		 * @override
		 * @public
		 */
		DynamicSideContent.prototype.addMainContent = function (oControl) {
			this.addAggregation("mainContent", oControl, true);
			// Rerender only the part of the control that is changed
			this._rerenderControl(this.getAggregation("mainContent"), this.$(MC_GRID_CELL_SELECTOR));
			return this;
		};

		/**
		 * Used for the toggle button functionality. When the control is on a phone screen size only
		 * one control area is visible. This helper method is used to implement a button/switch for changing
		 * between the main and side content areas.
		 * Only works if the current breakpoint is "S"
		 * @returns {object} {DynamicSideContent} for chaining
		 * @public
		 */
		DynamicSideContent.prototype.toggle = function () {
			if (this._currentBreakpoint === S) {
				if (this.getShowMainContent() && !this.getShowSideContent()) {
					this.setShowMainContent(false, true);
					this.setShowSideContent(true, true);
				} else if (!this.getShowMainContent() && this.getShowSideContent()) {
					this.setShowMainContent(true, true);
					this.setShowSideContent(false, true);
				}
				this._changeGridState();
			}
			return this;
		};

		/**
		 * Returns the breakpoint for the current state of the control
		 * @returns {String} currentBreakpoint
		 * @public
		 */
		DynamicSideContent.prototype.getCurrentBreakpoint = function () {
			return this._currentBreakpoint;
		};

		/**
		 * Function is called before the control is rendered.
		 * @private
		 * @override
		 */
		DynamicSideContent.prototype.onBeforeRendering = function () {
			this._detachContainerResizeListener();

			if (!this.getContainerQuery()) {
				this._iWindowWidth = jQuery(window).width();
				this._currentBreakpoint = this._getBreakPointFromWidth(this._iWindowWidth);
				this._setResizeData(this._currentBreakpoint, this.getEqualSplit());
			}
		};

		/**
		 * Function is called after the control is rendered.
		 * @private
		 * @override
		 */
		DynamicSideContent.prototype.onAfterRendering = function () {
			if (this.getContainerQuery()) {
				this._attachContainerResizeListener();
			} else {
				var that = this;
				jQuery(window).resize(function() {
					that._handleMediaChange();
				});
				this._changeGridState();
			}
			this._initScrolling();
		};

		/**
		 * Function is called when exiting the control.
		 * @private
		 */
		DynamicSideContent.prototype.exit = function () {
			this._detachContainerResizeListener();

			if (this._oSCScroller) {
				this._oSCScroller.destroy();
				this._oSCScroller = null;
			}

			if (this._oMCScroller) {
				this._oMCScroller.destroy();
				this._oMCScroller = null;
			}
		};

		/**
		 * Re-renders only part of the control that is changed
		 * @param {object} {aControls} array containing the passed aggregation controls
		 * @param {object} {$domElement} dom reference of the control to be re-rendered
		 * @returns {object} {DynamicSideContent} for chaining
		 * @private
		 */
		DynamicSideContent.prototype._rerenderControl = function (aControls, $domElement) {
			if (this.getDomRef()) {
				var oRm = sap.ui.getCore().createRenderManager();
				this.getRenderer().renderControls(oRm, aControls);
				oRm.flush($domElement[0]);
				oRm.destroy();
			}
			return this;
		};

		/**
		 * Initializes scroll for side and main content
		 * @private
		 */
		DynamicSideContent.prototype._initScrolling = function () {
			var sControlId = this.getId(),
				sSideContentId = sControlId + "-" + SC_GRID_CELL_SELECTOR,
				sMainContentId = sControlId + "-" + MC_GRID_CELL_SELECTOR;

			if (!this._oSCScroller && !this._oMCScroller) {
				jQuery.sap.require("sap.ui.core.delegate.ScrollEnablement");
				this._oSCScroller = new sap.ui.core.delegate.ScrollEnablement(this, null, {
					scrollContainerId: sSideContentId,
					horizontal: false,
					vertical: true
				});
				this._oMCScroller = new sap.ui.core.delegate.ScrollEnablement(this, null, {
					scrollContainerId: sMainContentId,
					horizontal: false,
					vertical: true
				});
			}
		};

		/**
		 * Attaches the event listener for the needed breakpoints to the container
		 * @private
		 */
		DynamicSideContent.prototype._attachContainerResizeListener = function () {
			if (!this._sContainerResizeListener) {
				this._sContainerResizeListener = ResizeHandler.register(this, jQuery.proxy(this._handleMediaChange, this));
			}
		};

		/**
		 * Detaches the event listener for the needed breakpoints to the container
		 * @private
		 */
		DynamicSideContent.prototype._detachContainerResizeListener = function () {
			if (this._sContainerResizeListener) {
				ResizeHandler.deregister(this._sContainerResizeListener);
				this._sContainerResizeListener = null;
			}
		};

		/**
		 * Gets the current breakpoint, related to the width, which is passed to the method
		 * @private
		 * @param {integer} iWidth is the parent container width
		 * @returns {String} breakpoint corresponding to the width passed
		 */
		DynamicSideContent.prototype._getBreakPointFromWidth = function (iWidth) {
			if (iWidth <= 0) {
				throw new Error(INVALID_PARENT_WIDTH_ERROR_MSG);
			}

			if (iWidth <= S_M_BREAKPOINT && this._currentBreakpoint !== S) {
				this.fireBreakpointChanged({currentBreakpoint : S});
				return S;
			} else if ((iWidth > S_M_BREAKPOINT) && (iWidth <= M_L_BREAKPOINT) && this._currentBreakpoint !== M) {
				this.fireBreakpointChanged({currentBreakpoint : M});
				return M;
			} else if ((iWidth > M_L_BREAKPOINT) && (iWidth <= L_XL_BREAKPOINT) && this._currentBreakpoint !== L) {
				this.fireBreakpointChanged({currentBreakpoint : L});
				return L;
			} else if (iWidth > L_XL_BREAKPOINT && this._currentBreakpoint !== XL) {
				this.fireBreakpointChanged({currentBreakpoint : XL});
				return XL;
			}
			return this._currentBreakpoint;
		};

		/**
		 * Handles the screen size breakpoints
		 * @private
		 */
		DynamicSideContent.prototype._handleMediaChange = function () {
			if (this.getContainerQuery()){
				this._iWindowWidth = this.$().parent().width();
			} else {
				this._iWindowWidth = jQuery(window).width();
			}

			if (this._iWindowWidth !== this._iOldWindowWidth) {
				this._iOldWindowWidth = this._iWindowWidth;

				this._oldBreakPoint = this._currentBreakpoint;
				this._currentBreakpoint = this._getBreakPointFromWidth(this._iWindowWidth);

				if ((this._oldBreakPoint !== this._currentBreakpoint) || this._currentBreakpoint === M) {
					this._setResizeData(this._currentBreakpoint, this.getEqualSplit());
					this._changeGridState();
				}
			}
		};

		/**
		 * Returns object with data about the size of the main and the side content, based on the screen breakpoint and
		 * control mode
		 * @param {string}[sSizeName] possible values S, M, L, XL
		 * @param {boolean}[bComparison] checks if the page is in equalSplit mode
		 * @returns {object} [DynamicSideContent] for chaining
		 * @private
		 */
		DynamicSideContent.prototype._setResizeData = function (sSizeName, bComparison) {

			var sideContentVisibility = this.getSideContentVisibility(),
				sideContentFallDown = this.getSideContentFallDown();

			if (!bComparison) {
				// Normal mode
				switch (sSizeName) {
					case S:
						this._setSpanSize(SPAN_SIZE_12, SPAN_SIZE_12);
						if (sideContentVisibility === sap.ui.layout.SideContentVisibility.AlwaysShow) {
							this.setShowSideContent(true, true);
						} else {
							this.setShowSideContent(false, true);
						}
						break;
					case M:
						var iSideContentWidth = Math.ceil((33.333 / 100) * this._iWindowWidth);
						if (sideContentFallDown === sap.ui.layout.SideContentFallDown.BelowL ||
							sideContentFallDown === sap.ui.layout.SideContentFallDown.BelowXL ||
							(iSideContentWidth <= 320 && sideContentFallDown === sap.ui.layout.SideContentFallDown.OnMinimumWidth)) {
							this._setSpanSize(SPAN_SIZE_12, SPAN_SIZE_12);
						} else {
							this._setSpanSize(SPAN_SIZE_4, SPAN_SIZE_8);
						}
						if (sideContentVisibility === sap.ui.layout.SideContentVisibility.ShowAboveS ||
							sideContentVisibility === sap.ui.layout.SideContentVisibility.AlwaysShow) {
							this.setShowSideContent(true, true);
						} else {
							this.setShowSideContent(false, true);
						}
						this.setShowMainContent(true, true);
						break;
					case L:
						if (sideContentFallDown === sap.ui.layout.SideContentFallDown.BelowXL) {
							this._setSpanSize(SPAN_SIZE_12, SPAN_SIZE_12);
						} else {
							this._setSpanSize(SPAN_SIZE_4, SPAN_SIZE_8);
						}
						if (sideContentVisibility === sap.ui.layout.SideContentVisibility.ShowAboveS ||
							sideContentVisibility === sap.ui.layout.SideContentVisibility.ShowAboveM ||
							sideContentVisibility === sap.ui.layout.SideContentVisibility.AlwaysShow) {
							this.setShowSideContent(true, true);
						} else {
							this.setShowSideContent(false, true);
						}
						this.setShowMainContent(true, true);
						break;
					case XL:
						this._setSpanSize(SPAN_SIZE_3, SPAN_SIZE_9);
						if (sideContentVisibility !== sap.ui.layout.SideContentVisibility.NeverShow) {
							this.setShowSideContent(true, true);
						} else {
							this.setShowSideContent(false, true);
						}
						this.setShowMainContent(true, true);
						break;
					default:
						throw new Error(INVALID_BREAKPOINT_ERROR_MSG);
				}
			} else {
				// Equal split mode
				switch (sSizeName) {
					case S:
						this._setSpanSize(SPAN_SIZE_12, SPAN_SIZE_12);
						this.setShowSideContent(false, true);
						break;
					default:
						this._setSpanSize(SPAN_SIZE_6, SPAN_SIZE_6);
						this.setShowSideContent(true, true);
						this.setShowMainContent(true, true);
				}
			}

			return this;
		};

		/**
		 * Determines if the control sets height, based on the control state
		 * @private
		 * @return {boolean}
		 */
		DynamicSideContent.prototype._shouldSetHeight = function () {
			if ((this._iScSpan + this._iMcSpan) === SPAN_SIZE_12 && this.getShowMainContent() && this.getShowSideContent()) {
				return true;
			}
			return false;
		};

		/**
		 * Changes the state of the grid without re-rendering the control
		 * Shows and hides the main and side content
		 * @private
		 */
		DynamicSideContent.prototype._changeGridState = function () {
			var $sideContent = this.$(SC_GRID_CELL_SELECTOR),
				$mainContent = this.$(MC_GRID_CELL_SELECTOR);

			if (this.getShowSideContent() && this.getShowMainContent()) {

				$mainContent.removeClass().addClass("sapUiDSCSpan" + this._iMcSpan);
				$sideContent.removeClass().addClass("sapUiDSCSpan" + this._iScSpan);

				if (this._shouldSetHeight()) {
					$sideContent.css("height", "100%").css("float", "left");
					$mainContent.css("height", "100%").css("float", "left");
				} else {
					$sideContent.css("height", "auto").css("float", "none");
					$mainContent.css("height", "auto").css("float", "none");
				}
			} else if (!this.getShowSideContent() && !this.getShowMainContent()) {
				$mainContent.addClass(HIDDEN_CLASS);
				$sideContent.addClass(HIDDEN_CLASS);

			} else if (this.getShowMainContent()) {
				$mainContent.removeClass().addClass(SPAN_SIZE_12_CLASS);
				$sideContent.addClass(HIDDEN_CLASS);

			} else if (this.getShowSideContent()) {
				$sideContent.removeClass().addClass(SPAN_SIZE_12_CLASS);
				$mainContent.addClass(HIDDEN_CLASS);
			}
		};

		/**
		 * Sets the main and side content span size
		 * @param {integer} [iScSpan] side content span size
		 * @param {integer} [iMcSpan] main content span size
		 * @private
		 */
		DynamicSideContent.prototype._setSpanSize = function (iScSpan, iMcSpan) {
			this._iScSpan = iScSpan;
			this._iMcSpan = iMcSpan;
		};

		return DynamicSideContent;
	}, /* bExport= */ true);

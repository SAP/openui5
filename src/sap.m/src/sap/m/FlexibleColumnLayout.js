/*!
 * ${copyright}
 */

// Provides control sap.m.FlexibleColumnLayout.
sap.ui.define([
	"jquery.sap.global",
	"./library",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/Control",
	"sap/m/Button"
], function (jQuery, library, ResizeHandler, Control, Button) {
	"use strict";


	/**
	 * Constructor for a new Flexible Column Layout
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The FlexibleColumnLayout control implements the master-detail-detail paradigm by allowing the user to display up to three pages at a time
	 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.m.FlexibleColumnLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FlexibleColumnLayout = Control.extend("sap.m.FlexibleColumnLayout", {
		metadata: {
			properties: {
				/**
				 * Forces the control to only show two columns at a time on Desktop (as it would normally on Tablet)
				 */
				twoColumnLayoutOnDesktop: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Determines the default three-column layout: MidColumnEmphasized (25/50/25) or EndColumnEmphasized (25/25/50)
				 */
				threeColumnLayoutType: {type: "sap.m.ThreeColumnLayoutType", group: "Behavior", defaultValue: sap.m.ThreeColumnLayoutType.MidColumnEmphasized},

				/**
				 * Set to false to allow switching between the MidColumnEmphasized (25/50/25) and EndColumnEmphasized (25/25/50) three-column layouts via an additional navigation button
				 */
				threeColumnLayoutTypeFixed: {type: "boolean", group: "Behavior", defaultValue: true}
			},
			aggregations: {
				/**
				 * The content of the begin column
				 */
				beginColumn: {type: "sap.ui.core.Control", multiple: false},
				/**
				 * The content of the mid column
				 */
				midColumn: {type: "sap.ui.core.Control", multiple: false},
				/**
				 * The content of the end column
				 */
				endColumn: {type: "sap.ui.core.Control", multiple: false},

				_beginColumnBackArrow: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_midColumnForwardArrow: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_midColumnBackArrow: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_endColumnForwardArrow: {type: "sap.m.Button", multiple: false, visibility: "hidden"}
			},
			associations: {
				/**
				 * When set, the respective column will be switched to full screen and the others will be hidden
				 */
				fullScreenColumn: {type: "sap.ui.core.Control", multiple: false}
			},
			events: {
				/**
				 * Event is fired when the layout changes (on resize, when a new column is added or when the user clicks the expand/collapse arrows)
				 */
				layoutChange: {
					parameters: {
						/**
						 * The width (as percentage) of the begin column
						 */
						beginColumnWidth: {
							type: "int"
						},
						/**
						 * The width (as percentage) of the mid column
						 */
						midColumnWidth: {
							type: "int"
						},
						/**
						 * The width (as percentage) of the end column
						 */
						endColumnWidth: {
							type: "int"
						}
					}
				}
			}
		}
	});

	FlexibleColumnLayout.prototype.init = function () {

		// Create the expand/collapse arrows
		this._initButtons();

		// Used for flushing the column containers without rerendering the whole control
		this._oRm = sap.ui.getCore().createRenderManager();

		// Holds the current width of the control - set on onAfterRendering, updated on resize
		this._iControlWidth = null;

		// Holds the current layout of the control
		this._sLayout = null;
	};

	FlexibleColumnLayout.prototype.onAfterRendering = function () {

		this._deregisterResizeHandler();
		this._registerResizeHandler();

		this._cacheDOMElements();
		this._iControlWidth = this.$().width();
		this._adjustLayout(null, true);
	};

	FlexibleColumnLayout.prototype.exit = function () {
		this._deregisterResizeHandler();

		this._oRm.destroy();
	};

	FlexibleColumnLayout.prototype._registerResizeHandler = function () {
		jQuery.sap.assert(!this._iResizeHandlerId, "Resize handler already registered");
		this._iResizeHandlerId = ResizeHandler.register(this, this._onResize.bind(this));
	};

	FlexibleColumnLayout.prototype._deregisterResizeHandler = function () {
		if (this._iResizeHandlerId) {
			ResizeHandler.deregister(this._iResizeHandlerId);
		}
	};

	/**
	 * Creates the buttons for the arrows, which are initially hidden and will only be shown on demand without rerendering
	 * @private
	 */
	FlexibleColumnLayout.prototype._initButtons = function () {
		var oBeginColumnBackArrow = new Button(this.getId() + "-beginBack", {
			icon: "sap-icon://slim-arrow-left",
			press: this._adjustLayout.bind(this, "left", false)
		}).addStyleClass("sapMFCLNavigationButton").addStyleClass("sapMFCLNavigationButtonRight");
		this.setAggregation("_beginColumnBackArrow", oBeginColumnBackArrow, true);

		var oMidColumnForwardArrow = new Button(this.getId() + "-midForward", {
			icon: "sap-icon://slim-arrow-right",
			press: this._adjustLayout.bind(this, "right", false)
		}).addStyleClass("sapMFCLNavigationButton").addStyleClass("sapMFCLNavigationButtonLeft");
		this.setAggregation("_midColumnForwardArrow", oMidColumnForwardArrow, true);

		var oMidColumnBackArrow = new Button(this.getId() + "-midBack", {
			icon: "sap-icon://slim-arrow-left",
			press: this._adjustLayout.bind(this, "left", false)
		}).addStyleClass("sapMFCLNavigationButton").addStyleClass("sapMFCLNavigationButtonRight");
		this.setAggregation("_midColumnBackArrow", oMidColumnBackArrow, true);

		var oEndColumnForwardArrow = new Button(this.getId() + "-endForward", {
			icon: "sap-icon://slim-arrow-right",
			press: this._adjustLayout.bind(this, "right", false)
		}).addStyleClass("sapMFCLNavigationButton").addStyleClass("sapMFCLNavigationButtonLeft");
		this.setAggregation("_endColumnForwardArrow", oEndColumnForwardArrow, true);

	};

	/**
	 * Saves the DOM references of the columns, containers and arrows
	 * @private
	 */
	FlexibleColumnLayout.prototype._cacheDOMElements = function () {
		this._$columns = {
			begin: this.$("beginColumn"),
			mid: this.$("midColumn"),
			end: this.$("endColumn")
		};
		this._$columnContainers = {
			begin: this.$("beginColumn-container"),
			mid: this.$("midColumn-container"),
			end: this.$("endColumn-container")
		};
		this._$columnButtons = {
			beginBack: this.$("beginBack"),
			midForward: this.$("midForward"),
			midBack: this.$("midBack"),
			endForward: this.$("endForward")
		};
	};

	/**
	 * Updates the content of a column by flushing its container div only
	 * @param sColumn
	 * @param oControl
	 * @private
	 */
	FlexibleColumnLayout.prototype._flushColumnContent = function (sColumn, oControl) {
		if (this.getDomRef()) {
			this._oRm.renderControl(oControl);
			this._oRm.flush(this._$columnContainers[sColumn][0]);
		}
	};

	/**
	 * Setter for aggregation beginColumn
	 * @param oControl
	 * @returns {*}
	 */
	FlexibleColumnLayout.prototype.setBeginColumn = function (oControl) {

		if (this.getBeginColumn() === oControl) {
			return this;
		}

		var vResult = this.setAggregation("beginColumn", oControl, true);
		if (typeof this._$columns === "undefined") {
			return vResult;
		}

		this._flushColumnContent("begin", oControl);
		this._adjustLayout(null, false);
		return vResult;
	};

	/**
	 * Setter for aggregation midColumn
	 * @param oControl
	 * @returns {*}
	 */
	FlexibleColumnLayout.prototype.setMidColumn = function (oControl) {

		if (this.getMidColumn() === oControl) {
			return this;
		}

		jQuery.sap.assert(this.getBeginColumn(), "The beginColumn must be set before setting midColumn");

		var vResult = this.setAggregation("midColumn", oControl, true);
		if (typeof this._$columns === "undefined") {
			return vResult;
		}

		this._flushColumnContent("mid", oControl);
		this._adjustLayout(null, false);
		return vResult;
	};

	/**
	 * Setter for aggregation endColumn
	 * @param oControl
	 * @returns {*}
	 */
	FlexibleColumnLayout.prototype.setEndColumn = function (oControl) {

		if (this.getEndColumn() === oControl) {
			return this;
		}

		jQuery.sap.assert(this.getBeginColumn(), "The beginColumn must be set before setting endColumn");
		jQuery.sap.assert(this.getMidColumn(), "The midColumn must be set before setting endColumn");

		var vResult = this.setAggregation("endColumn", oControl, true);
		if (typeof this._$columns === "undefined") {
			return vResult;
		}

		this._flushColumnContent("end", oControl);
		this._adjustLayout(null, false);
		return vResult;
	};


	/**
	 * Setter for association fullScreenColumn
	 * @param sId
	 * @returns {*}
	 */
	FlexibleColumnLayout.prototype.setFullScreenColumn = function (sId) {

		if (this.getFullScreenColumn() === sId) {
			return this;
		}

		var vResult = this.setAssociation("fullScreenColumn", sId, true);
		if (typeof this._$columns === "undefined") {
			return vResult;
		}

		this._adjustLayout(null, false);
		return vResult;
	};

	/**
	 * Setter for property twoColumnLayoutOnDesktop
	 * @param oControl
	 * @returns {*}
	 */
	FlexibleColumnLayout.prototype.setTwoColumnLayoutOnDesktop = function (bValue) {

		var vResult = this.setProperty("twoColumnLayoutOnDesktop", bValue, true);
		if (typeof this._$columns === "undefined") {
			return vResult;
		}

		this._adjustLayout(null, false);
		return vResult;
	};

	/**
	 * Returns the number of columns that have width > 0
	 * @returns {Array.<string>}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getVisibleColumnsCount = function () {
		return ["begin", "mid", "end"].filter(function (sColumn) {
			return this._getColumnSize(sColumn) > 0;
		}, this).length;
	};

	/**
	 * Changes the width and margins of the columns according to the current layout
	 * @private
	 */
	FlexibleColumnLayout.prototype._resizeColumns = function () {
		var iPercentWidth,
			sNewWidth,
			iTotalMargin,
			iAvailableWidth,
			bNeedsMargin = false,
			aColumns = ["begin", "mid", "end"],
			bRtl = sap.ui.getCore().getConfiguration().getRTL(),
			aActiveColumns;

		// Stop here if the control isn't rendered yet
		if (typeof this._$columns === "undefined") {
			return;
		}

		// Calculate the total margin between columns (f.e. for 3 columns - 2 * 8px)
		iTotalMargin = (this._getVisibleColumnsCount() - 1) * FlexibleColumnLayout.COLUMN_MARGIN;

		// Calculate the width available for the columns
		iAvailableWidth = this._iControlWidth - iTotalMargin;

		aColumns.forEach(function (sColumn) {
			iPercentWidth = this._getColumnSize(sColumn);

			// Add the left margin if the column has width and there was already a non-zero width column before it (bNeedsMargin = true)
			this._$columns[sColumn].toggleClass("sapMFCLColumnMargin", bNeedsMargin && iPercentWidth > 0);

			// Add the active class to the column if it shows something
			this._$columns[sColumn].toggleClass("sapMFCLColumnActive", iPercentWidth > 0);

			// Remove all the classes that are used for HCB theme borders, they will be set again later
			this._$columns[sColumn].removeClass("sapMFCLColumnOnlyActive");
			this._$columns[sColumn].removeClass("sapMFCLColumnLastActive");
			this._$columns[sColumn].removeClass("sapMFCLColumnFirstActive");

			// Change the width of the column
			if ([100, 0].indexOf(iPercentWidth) !== -1) {
				sNewWidth = iPercentWidth + "%";
			} else {
				sNewWidth = Math.round(iAvailableWidth * (iPercentWidth / 100)) + "px";
			}
			this._$columns[sColumn].width(sNewWidth);

			// After the first non-zero width column is shown, set the flag to enable margins for all other non-zero width columns that will follow
			if (iPercentWidth > 0) {
				bNeedsMargin = true;
			}

		}, this);

		aActiveColumns = aColumns.filter(function (sColumn) {
			return this._getColumnSize(sColumn) > 0;
		}, this);

		if (bRtl) {
			aColumns.reverse();
		}

		if (aActiveColumns.length === 1) {
			this._$columns[aActiveColumns[0]].addClass("sapMFCLColumnOnlyActive");
		}

		if (aActiveColumns.length > 1) {
			this._$columns[aActiveColumns[0]].addClass("sapMFCLColumnFirstActive");
			this._$columns[aActiveColumns[aActiveColumns.length - 1]].addClass("sapMFCLColumnLastActive");
		}
	};

	/**
	 * Gets the size (in %) of a column based on the current layout
	 * @param sColumn - string: begin/mid/end
	 * @returns {*}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getColumnSize = function (sColumn) {
		var aSizes = this._sLayout.split("/"),
			aMap = {
				begin: 0,
				mid: 1,
				end: 2
			},
			sSize = aSizes[aMap[sColumn]];

		return sSize;
	};

	FlexibleColumnLayout.prototype._onResize = function (oEvent) {
		var iNewWidth = oEvent.size.width;

		// If the size didn't change or the control is resized to 0, don't do anything
		if (iNewWidth === 0 || iNewWidth === this._iControlWidth) {
			return;
		}

		this._iControlWidth = oEvent.size.width;

		if (!this.getFullScreenColumn()) {
			this._adjustLayout(null, true);
		}
	};

	/**
	 * Recalculates the layout and if it changed, updates the columns, arrows and fires the change event
	 * @param sShift
	 * @param bResize
	 * @private
	 */
	FlexibleColumnLayout.prototype._adjustLayout = function (sShift, bResize) {
		var sNewLayout = this._sLayout,
			bBegin = this.getBeginColumn() ? true : false,
			bMid = this.getMidColumn() ? true : false,
			bEnd = this.getEndColumn() ? true : false,
			sFullScreenId = this.getFullScreenColumn(),
			iMaxColumns = this._getMaxColumns(),
			sThreeColumnLayoutType = this.getThreeColumnLayoutType() === library.ThreeColumnLayoutType.EndColumnEmphasized ? "25/25/50" : "25/50/25",
			aPossibleLayouts,
			sDefaultLayout,
			iCurrentPos;

		// Fullscreen
		if (sFullScreenId) {

			if (this.getBeginColumn() && this.getBeginColumn().getId() === sFullScreenId) {
				sNewLayout = "100/0/0";
			} else if (this.getMidColumn() && this.getMidColumn().getId() === sFullScreenId) {
				sNewLayout = "0/100/0";
			} else if (this.getEndColumn() && this.getEndColumn().getId() === sFullScreenId) {
				sNewLayout = "0/0/100";
			} else {
				jQuery.sap.assert(false, "Cannot set an unknown column to full screen: " + sFullScreenId);
			}


		} else {

			// Desktop
			if (iMaxColumns === 3) {

				if (!bBegin || !bMid) {
					aPossibleLayouts = ["100/0/0"];
					sDefaultLayout = "100/0/0";
				} else if (!bEnd) {
					aPossibleLayouts = ["33/67/0", "67/33/0"];
					sDefaultLayout = "67/33/0";
				} else {
					if (this.getThreeColumnLayoutTypeFixed()) {
						aPossibleLayouts = [sThreeColumnLayoutType, "33/67/0", "67/33/0"];
					} else {
						aPossibleLayouts = ["25/25/50", "25/50/25", "33/67/0", "67/33/0"];
					}
					sDefaultLayout = sThreeColumnLayoutType;
				}

				// Tablet
			} else if (iMaxColumns === 2) {

				if (!bBegin || !bMid) {
					aPossibleLayouts = ["100/0/0"];
					sDefaultLayout = "100/0/0";
				} else if (!bEnd) {
					aPossibleLayouts = ["33/67/0", "67/33/0"];
					sDefaultLayout = "67/33/0";
				} else {
					aPossibleLayouts = ["0/67/33", "33/67/0", "67/33/0"];
					sDefaultLayout = "0/67/33";
				}

				// Phone
			} else {
				if (!bBegin || !bMid) {
					aPossibleLayouts = ["100/0/0"];
					sDefaultLayout = "100/0/0";
				} else if (!bEnd) {
					aPossibleLayouts = ["0/100/0", "100/0/0"];
					sDefaultLayout = "0/100/0";
				} else {
					aPossibleLayouts = ["0/0/100", "0/100/0", "100/0/0"];
					sDefaultLayout = "0/0/100";
				}
			}

			// When an arrow is clicked (sShift = left/right), select the previous/next layout in the list of possible ones
			if (sShift) {
				iCurrentPos = aPossibleLayouts.indexOf(sNewLayout);
				if (sShift === "left" && iCurrentPos > 0) {
					sNewLayout = aPossibleLayouts[iCurrentPos - 1];
				} else if (sShift === "right" && iCurrentPos < aPossibleLayouts.length - 1) {
					sNewLayout = aPossibleLayouts[iCurrentPos + 1];
				}
				// When no arrow is clicked
			} else {
				// Keep the existing layout when resizing, if it is allowed. If the resize caused a breakpoint switch, take the default for the new size
				if (!bResize || aPossibleLayouts.indexOf(sNewLayout) === -1) {
					sNewLayout = sDefaultLayout;
				}
			}
		}


		// The layout did not change as result of the performed operation
		if (this._sLayout === sNewLayout) {
			this._resizeColumns();
			this._hideShowArrows();
			return;
		}

		this._sLayout = sNewLayout;
		this._resizeColumns();
		this._hideShowArrows();

		if (!sFullScreenId) {
			this.fireLayoutChange({
				beginColumnWidth: this._getColumnSize("begin"),
				midColumnWidth: this._getColumnSize("mid"),
				endColumnWidth: this._getColumnSize("end")
			});
		}
	};

	/**
	 * Updates the visibility of the arrows according to the current layout
	 * @private
	 */
	FlexibleColumnLayout.prototype._hideShowArrows = function () {
		var bBegin = this.getBeginColumn() ? true : false,
			bMid = this.getMidColumn() ? true : false,
			bEnd = this.getEndColumn() ? true : false,
			iMaxColumns = this._getMaxColumns(),
			aNeededArrows = [];

		// Stop here if the control isn't rendered yet
		if (typeof this._$columns === "undefined") {
			return;
		}

		// Desktop
		if (iMaxColumns === 3) {

			if (!bBegin || !bMid) {
				aNeededArrows = [];
			} else if (!bEnd) {
				if (this._sLayout === "33/67/0") {
					aNeededArrows = ["midForward"];
				} else {
					aNeededArrows = ["beginBack"];
				}
			} else {
				if (this._sLayout === "25/50/25") {
					if (this.getThreeColumnLayoutTypeFixed()) {
						aNeededArrows = ["midForward"];
					} else {
						aNeededArrows = ["midForward", "midBack"];
					}
				} else if (this._sLayout === "25/25/50") {
					aNeededArrows = ["endForward"];
				} else if (this._sLayout === "33/67/0") {
					aNeededArrows = ["midForward", "midBack"];
				} else {
					aNeededArrows = ["beginBack"];
				}
			}

			// Tablet
		} else if (iMaxColumns === 2) {

			if (!bBegin || !bMid) {
				aNeededArrows = [];
			} else if (!bEnd) {
				if (this._sLayout === "33/67/0") {
					aNeededArrows = ["midForward"];
				} else {
					aNeededArrows = ["midBack"];
				}
			} else {
				if (this._sLayout === "0/67/33") {
					aNeededArrows = ["midForward"];
				} else if (this._sLayout === "33/67/0") {
					aNeededArrows = ["midForward", "midBack"];
				} else {
					aNeededArrows = ["beginBack"];
				}
			}
		}

		this._toggleButton("beginBack", aNeededArrows.indexOf("beginBack") !== -1);
		this._toggleButton("midForward", aNeededArrows.indexOf("midForward") !== -1);
		this._toggleButton("midBack", aNeededArrows.indexOf("midBack") !== -1);
		this._toggleButton("endForward", aNeededArrows.indexOf("endForward") !== -1);
	};

	/**
	 * Changes the visibility of a navigation button
	 * @param sButton
	 * @param bShow
	 * @private
	 */
	FlexibleColumnLayout.prototype._toggleButton = function (sButton, bShow) {
		this._$columnButtons[sButton].toggle(bShow);
	};

	/**
	 * Returns the maximum number of columns that can be displayed at once based on the control size and settings
	 * @returns {number}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getMaxColumns = function () {
		if (this._iControlWidth >= FlexibleColumnLayout.DESKTOP_BREAKPOINT) {
			if (this.getTwoColumnLayoutOnDesktop()) {
				return 2;
			}
			return 3;
		}

		if (this._iControlWidth >= FlexibleColumnLayout.TABLET_BREAKPOINT && this._iControlWidth < FlexibleColumnLayout.DESKTOP_BREAKPOINT) {
			return 2;
		}

		return 1;
	};

	// The margin between columns in pixels
	FlexibleColumnLayout.COLUMN_MARGIN = 8;

	// The width above which (inclusive) we are in desktop mode
	FlexibleColumnLayout.DESKTOP_BREAKPOINT = 1280;

	// The width above which (inclusive) we are in tablet mode
	FlexibleColumnLayout.TABLET_BREAKPOINT = 960;

	return FlexibleColumnLayout;

}, /* bExport= */ false);
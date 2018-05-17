/*!
 * ${copyright}
 */

// Provides control sap.m.Column.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element', 'sap/ui/core/Renderer', 'sap/ui/core/library', 'sap/ui/Device'],
	function(jQuery, library, Element, Renderer, coreLibrary, Device) {
	"use strict";



	// shortcut for sap.m.PopinDisplay
	var PopinDisplay = library.PopinDisplay;

	// shortcut for sap.ui.core.VerticalAlign
	var VerticalAlign = coreLibrary.VerticalAlign;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;



	/**
	 * Constructor for a new Column.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.Column</code> allows to define column specific properties that will be applied when rendering the <code>sap.m.Table</code>.
	 *
	 * See section "{@link topic:6f778a805bc3453dbb66e246d8271839 Defining Column Width}"
	 * in the documentation to understand how to define the <code>width</code> property of the <code>sap.m.Column</code> to render a <code>sap.m.Table</code> control properly.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @alias sap.m.Column
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Column = Element.extend("sap.m.Column", /** @lends sap.m.Column.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Defines the width of the column. If you leave it empty then this column covers the remaining space.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Defines the horizontal alignment of the column content.
			 *
			 * <b>Note:</b> Text controls with a <code>textAlign</code> property inherits the horizontal alignment.
			 */
			hAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : TextAlign.Begin},

			/**
			 * Defines the vertical alignment of the cells in a column.
			 * This property does not affect the vertical alignment of header and footer.
			 */
			vAlign : {type : "sap.ui.core.VerticalAlign", group : "Appearance", defaultValue : VerticalAlign.Inherit},

			/**
			 * CSS class name for column contents(header, cells and footer of column). This property can be used for different column styling. If column is shown as pop-in then this class name is applied to related pop-in row.
			 */
			styleClass : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Specifies whether or not the column is visible. Invisible columns are not rendered.
			 */
			visible : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Defines the minimum screen width to show or hide this column. By default column is always shown.
			 * The responsive behavior of the <code>sap.m.Table</code> is determined by this property. As an example by setting <code>minScreenWidth</code> property to "40em" (or "640px" or "Tablet") shows this column on tablet (and desktop) but hides on mobile.
			 * As you can give specific CSS sizes (e.g: "480px" or "40em"), you can also use the {@link sap.m.ScreenSize} enumeration (e.g: "Phone", "Tablet", "Desktop", "Small", "Medium", "Large", ....).
			 * Please also see <code>demandPopin</code> property for further responsive design options.
			 */
			minScreenWidth : {type : "string", group : "Behavior", defaultValue : null},

			/**
			 * According to your minScreenWidth settings, the column can be hidden in different screen sizes.
			 * Setting this property to true, shows this column as pop-in instead of hiding it.
			 */
			demandPopin : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Horizontal alignment of the pop-in content. Available alignment settings are "Begin", "Center", "End", "Left", and "Right".
			 *
			 * <b>Note:</b> Controls with a text align do not inherit the horizontal alignment.
			 * @deprecated Since version 1.14.
			 * Use popinDisplay property instead.
			 */
			popinHAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : TextAlign.Begin, deprecated: true},

			/**
			 * Defines enumerated display options for the pop-in.
			 * @since 1.13.2
			 */
			popinDisplay : {type : "sap.m.PopinDisplay", group : "Appearance", defaultValue : PopinDisplay.Block},

			/**
			 * Set <code>true</code> to merge repeating/duplicate cells into one cell block. See <code>mergeFunctionName</code> property to customize.
			 * <b>Note:</b> Merging only happens at the rendering of the <code>sap.m.Table</code> control, subsequent changes on the cell or item do not have any effect on the merged state of the cells, therefore this feature should not be used together with two-way binding.
			 * This property is ignored if any column is configured to be shown as a pop-in.
			 * @since 1.16
			 */
			mergeDuplicates : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Defines the control serialization function if <code>mergeDuplicates<code> property is set to <code>true</code>. The control itself uses this function to compare values of two repeating cells.
			 * Default value "getText" is suitable for <code>sap.m.Label</code> and <code>sap.m.Text</code> controls but for the <code>sap.ui.core.Icon</code> control "getSrc" function should be used to merge icons.
			 * <b>Note:</b> You can pass one string parameter to given function after "#" sign. e.g. "data#myparameter"
			 * @since 1.16
			 */
			mergeFunctionName : {type : "string", group : "Misc", defaultValue : 'getText'}
		},
		defaultAggregation : "header",
		aggregations : {

			/**
			 * Control to be displayed in the column header.
			 */
			header : {type : "sap.ui.core.Control", multiple : false},

			/**
			 * Control to be displayed in the column footer.
			 */
			footer : {type : "sap.ui.core.Control", multiple : false}
		},
		designtime: "sap/m/designtime/Column.designtime"
	}});


	// default index
	Column.prototype._index = -1;

	// predefined screen size
	Column.prototype._screen = "";

	// default media value
	Column.prototype._media = null;

	Column.prototype.exit = function() {
		this._clearMedia();
	};

	Column.prototype.getTable = function() {
		var oParent = this.getParent();
		if (oParent && oParent.isA("sap.m.Table")) {
			return oParent;
		}
	};

	Column.prototype.informTable = function(sEvent, vParam1, vParam2) {
		var oTable = this.getTable();
		if (oTable) {
			var sMethod = "onColumn" + sEvent;
			if (oTable[sMethod]) {
				oTable[sMethod](this, vParam1, vParam2);
			}
		}
	};

	Column.prototype.ontouchstart = function(oEvent) {
		this._bTouchStartMarked = oEvent.isMarked();
	};

	Column.prototype.ontap = function(oEvent) {
		if (!this._bTouchStartMarked && !oEvent.isMarked()) {
			this.informTable("Press");
		}
	};

	Column.prototype.onsapspace = function(oEvent) {
		if (oEvent.srcControl === this) {
			this.informTable("Press");
			oEvent.preventDefault();
		}
	};

	Column.prototype.onsapenter = Column.prototype.onsapspace;

	Column.prototype._clearMedia = function() {
		if (this._media && this._minWidth) {
			this._detachMediaContainerWidthChange(this._notifyResize, this, this.getId());
			Device.media.removeRangeSet(this.getId());
			this._media = null;
		}
	};

	Column.prototype._addMedia = function() {
		delete this._bShouldAddMedia;
		if (this._minWidth) {
			Device.media.initRangeSet(this.getId(), [parseFloat(this._minWidth)]);
			this._attachMediaContainerWidthChange(this._notifyResize, this, this.getId());
			this._media = this._getCurrentMediaContainerRange(this.getId());
			if (this._media) {
				this._media.matches = !!this._media.from;
			}
		}
	};

	/**
	 * Notify parent to re-render
	 * Also fire media event for listeners
	 *
	 * @private
	 */
	Column.prototype._notifyResize = function(oMedia) {
		// do nothing if media did not change
		if (this._media.from === oMedia.from) {
			return;
		}

		// keep media info
		this._media = oMedia;
		this._media.matches = !!oMedia.from;

		// inform parent delayed
		jQuery.sap.delayedCall(0, this, function() {
			this.fireEvent("media", this);
			this.informTable("Resize");
		});
	};

	Column.prototype._validateMinWidth = function(sWidth) {
		if (!sWidth) {
			return;
		}
		if (Object.prototype.toString.call(sWidth) != "[object String]") {
			throw new Error('expected string for property "minScreenWidth" of ' + this);
		}
		if (Object.keys(library.ScreenSizes).indexOf(sWidth.toLowerCase()) != -1) {
			return;
		}
		if (!/^\d+(\.\d+)?(px|em|rem)$/i.test(sWidth)) {
			throw new Error('invalid CSS size("px", "em", "rem" required) or sap.m.ScreenSize enumeration for property "minScreenWidth" of ' + this);
		}
	};


	// Checks the given width(px or em), if it is a predefined screen value
	Column.prototype._isWidthPredefined = function(sWidth) {
		var that = this,
			unit = sWidth.replace(/[^a-z]/ig, ""),
			baseFontSize = parseFloat(library.BaseFontSize) || 16;

		jQuery.each(library.ScreenSizes, function(screen, size) {
			if (unit != "px") {
				size /= baseFontSize;
			}
			if (size + unit == sWidth) {
				that._minWidth = this + "px";
				that._screen = screen;
				return false;
			}
		});

		if (this._minWidth) {
			return true;
		}

		if (unit == "px") {
			this._minWidth = sWidth;
		} else {
			this._minWidth = parseFloat(sWidth) * baseFontSize + "px";
		}
	};

	/**
	 * Apply text alignment of the Column to the Text controls
	 *
	 * @param {sap.ui.core.Control} oControl List control
	 * @param {String} [sAlign] TextAlign enumeration
	 * @return {sap.ui.core.Control} oControl
	 * @protected
	 */
	Column.prototype.applyAlignTo = function(oControl, sAlign) {
		// TODO: This is so ugly to check content functions
		// instead we should document how to use our controls
		// to inherit text-alignment and we should add a new
		// sap.ui.core.TextAlign type called "Inherit"
		sAlign = sAlign || this.getHAlign();
		if (sAlign === TextAlign.Initial ||
			!oControl.getMetadata().getProperties().textAlign ||
			oControl.getTextAlign() === sAlign) {
			return oControl;
		}

		oControl.setProperty("textAlign", sAlign, true);
		var oDomRef = oControl.getDomRef();
		sAlign = this.getCssAlign(sAlign);

		if (oDomRef && sAlign) {
			oDomRef.style.textAlign = sAlign;
		}

		return oControl;
	};


	/**
	 * Returns CSS alignment according to column hAlign setting or given parameter
	 * for Begin/End values checks the locale settings
	 *
	 * @param {String} [sAlign] TextAlign enumeration
	 * @return {String} left|center|right
	 * @protected
	 */
	Column.prototype.getCssAlign = function(sAlign) {
		sAlign = sAlign || this.getHAlign();

		if (sAlign === TextAlign.Begin || sAlign === TextAlign.End || sAlign === TextAlign.Initial) {
			sAlign = Renderer.getTextAlign(sAlign);
		}

		return sAlign.toLowerCase();
	};


	// Returns styleClass property with extra responsive class if second parameter is set true
	Column.prototype.getStyleClass = function(bResponsive) {
		var cls = this.getProperty("styleClass");
		if (!bResponsive) {
			return cls;
		}
		if (this._screen && (!this.getDemandPopin() || !window.matchMedia)) {
			cls += " sapMSize-" + this._screen;
		} else if (this._media && !this._media.matches) {
			cls += " sapMListTblNone";
		}
		return cls.trim();
	};

	/**
	 * Sets the visible column index
	 * Negative index values can be used to clear
	 *
	 * @param {int} nIndex index of the visible column
	 * @protected
	 */
	Column.prototype.setIndex = function(nIndex) {
		this._index = +nIndex;
	};


	/**
	 * Sets the order of the column
	 * Does not do the visual effect
	 * Table should be invalidate to re-render
	 *
	 * @param {int} nOrder order of the column
	 * @protected
	 */
	Column.prototype.setOrder = function(nOrder) {
		this._order = +nOrder;
	};

	/**
	 * Gets the order of the column
	 *
	 * @returns {int} nOrder order of the column
	 * @protected
	 */
	Column.prototype.getOrder = function() {
		return this.hasOwnProperty("_order") ? this._order : this.getInitialOrder();
	};

	/**
	 * Sets the initial order of the column
	 *
	 * @param {int} nOrder initial order of the column
	 * @protected
	 */
	Column.prototype.setInitialOrder = function(nOrder) {
		this._initialOrder = +nOrder;
	};

	/**
	 * Gets the initial order of the column
	 *
	 * @returns {int} initial order of the column
	 * @protected
	 */
	Column.prototype.getInitialOrder = function() {
		if (this.hasOwnProperty("_initialOrder")) {
			return this._initialOrder;
		}

		var oTable = this.getTable();
		if (!oTable) {
			return -1;
		}

		return oTable.indexOfColumn(this);
	};

	/**
	 * Display or hide the column from given table
	 * This does not set the visibility property of the column
	 *
	 * @param {Object} oTableDomRef Table DOM reference
	 * @param {boolean} [bDisplay] whether visible or not
	 * @protected
	 */
	Column.prototype.setDisplay = function(oTableDomRef, bDisplay) {
		if (!oTableDomRef || this._index < 0) {
			return;
		}

		// go with native we need speed
		var i = this._index + 1,
			parent =  this.getParent(),
			display = bDisplay ? "table-cell" : "none",
			header = oTableDomRef.querySelector("tr > th:nth-child(" + i + ")"),
			cells = oTableDomRef.querySelectorAll("tr > td:nth-child(" + i + ")"),
			length = cells.length;

		// set display and aria
		header.style.display = display;
		header.setAttribute("aria-hidden", !bDisplay);
		for (i = 0; i < length; i++) {
			cells[i].style.display = display;
			cells[i].setAttribute("aria-hidden", !bDisplay);
		}

		// let the parent know the visibility change
		if (parent && parent.setTableHeaderVisibility) {
			// make it sure rendering phase is done with timeout
			setTimeout(function() {
				parent.setTableHeaderVisibility(bDisplay);
			}, 0);
		}
	};

	/**
	 * Display or hide the column from given table via checking media query changes
	 *
	 * @param {Object} oTableDomRef Table DOM reference
	 * @protected
	 */
	Column.prototype.setDisplayViaMedia = function(oTableDomRef) {
		var oParent = this.getParent(),
			bDisplay = this._media && this._media.matches;

		if (!this.getDemandPopin() && this._screen && oParent && oParent.setTableHeaderVisibility) {
			// this means CSS media queries already change the column visibility
			// let the parent know the visibility change
			// make it sure rendering phase is done with timeout
			setTimeout(function() {
				oParent.setTableHeaderVisibility(bDisplay);
			}, 0);
		} else {
			this.setDisplay(oTableDomRef, bDisplay);
		}
	};

	Column.prototype.setVisible = function(bVisible) {
		if (bVisible == this.getVisible()) {
			return this;
		}

		var oParent = this.getParent(),
			oTableDomRef = oParent && oParent.getTableDomRef && oParent.getTableDomRef(),
			bSupressInvalidate = oTableDomRef && this._index >= 0;

		this.setProperty("visible", bVisible, bSupressInvalidate);
		if (bSupressInvalidate) {
			this.setDisplay(oTableDomRef, bVisible);
		}

		return this;
	};

	/*
	 * Decides if we need media query or not according to given settings
	 * Checks the given width is known screen size
	 */
	Column.prototype.setMinScreenWidth = function(sWidth) {
		var parent = this.getParent();

		// check if setting the old value
		if (sWidth == this.getMinScreenWidth()) {
			return this;
		}

		// first validate the value
		this._validateMinWidth(sWidth);

		// initialize
		this._clearMedia();
		this._minWidth = 0;
		this._screen = "";

		if (sWidth) {
			// check given width is known screen-size
			sWidth = sWidth.toLowerCase();
			var width = library.ScreenSizes[sWidth];
			if (width) {
				this._screen = sWidth;
				this._minWidth = width + "px";
			} else {
				this._isWidthPredefined(sWidth);
			}

			if (parent && parent.isActive()) {
				this._addMedia();
			} else {
				this._bShouldAddMedia = true;
			}
		}

		return this.setProperty("minScreenWidth", sWidth);
	};

	/*
	 * Decides if we need media query or not according to given settings
	 * if pop-in is demanded then we always need JS media queries
	 * if not demanded but if screen size is known CSS media query can handle
	 */
	Column.prototype.setDemandPopin = function(bValue) {
		// check if setting the old value
		if (bValue == this.getDemandPopin()) {
			return this;
		}

		// minimum width should have been set
		if (!this.getMinScreenWidth()) {
			return this.setProperty("demandPopin", bValue, true);
		}

		return this.setProperty("demandPopin", bValue);
	};


	/**
	 * Determines whether the column will be shown as pop-in or not
	 *
	 * @protected
	 */
	Column.prototype.isPopin = function() {
		if (!this.getDemandPopin()) {
			return false;
		}
		if (this._media) {
			return !this._media.matches;
		}
		return false;
	};

	/**
	 * Determines whether the column will be hidden via media queries or not
	 *
	 * @protected
	 */
	Column.prototype.isHidden = function() {
		if (this._media) {
			return !this._media.matches;
		}

		if (this._screen && this._minWidth) {
			return parseFloat(this._minWidth) > window.innerWidth;
		}
		return false;
	};

	/**
	 * Sets the last value of the column if mergeDuplicates property is true
	 *
	 * @param {any} value Any Value
	 * @returns {sap.m.Column}
	 * @since 1.16
	 * @protected
	 */
	Column.prototype.setLastValue = function(value) {
		if (this.getMergeDuplicates()) {
			this._lastValue = value;
		}
		return this;
	};

	/**
	 * Clears the last value of the column if mergeDuplicates property is true
	 *
	 * @returns {sap.m.Column}
	 * @since 1.20.4
	 * @protected
	 */
	Column.prototype.clearLastValue = function() {
		return this.setLastValue(NaN);
	};

	/**
	 * Gets the last value of the column
	 *
	 * @since 1.16
	 * @protected
	 */
	Column.prototype.getLastValue = function() {
		return this._lastValue;
	};

	/**
	 * Gets called from the Table when the all items are removed
	 *
	 * @since 1.16
	 * @protected
	 */
	Column.prototype.onItemsRemoved = function() {
		this.clearLastValue();
	};

	return Column;

});

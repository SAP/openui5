/*!
 * ${copyright}
 */

// Provides control sap.m.Column.
sap.ui.define([
	"./library",
	"sap/ui/core/Element",
	"sap/ui/core/Renderer",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/core/InvisibleText"
],
	function(library, Element, Renderer, coreLibrary, Device, InvisibleText) {
	"use strict";


	// shortcut for sap.m.PopinDisplay
	var PopinDisplay = library.PopinDisplay;

	// shortcut for sap.ui.core.VerticalAlign
	var VerticalAlign = coreLibrary.VerticalAlign;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.SortOrder
	var SortOrder = coreLibrary.SortOrder;



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
	 */
	var Column = Element.extend("sap.m.Column", /** @lends sap.m.Column.prototype */ { metadata : {

		library : "sap.m",
		properties : {
			/**
			 * Defines the width of the column. If you leave it empty then this column covers the remaining space.
			 * <b>Note:</b> When setting <code>autoPopinMode=true</code> on the table, the columns with a fixed width must
			 * either be in px, rem, or em as the table internally calculates the <code>minScreenWidth</code> property for the column.
			 * If a column has a fixed width, then this width is used to calculate the <code>minScreenWidth</code> for the
			 * <code>autoPopinMode</code>.
			 * If a column has a flexible width, such as % or auto, the <code>autoPopinWidth</code> property is used
			 * to calculate the <code>minScreenWidth</code>.
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
			 * <b>Note:</b> This property gets overwritten if the <code>sap.m.Table</code> control
			 * is configured with <code>autoPopinMode=true</code>.
			 * See {@link sap.m.Table#getAutoPopinMode}
			 */
			minScreenWidth : {type : "string", group : "Behavior", defaultValue : null},

			/**
			 * According to your minScreenWidth settings, the column can be hidden in different screen sizes.
			 * Setting this property to true, shows this column as pop-in instead of hiding it.
			 * <b>Note:</b> This property gets overwritten if the <code>sap.m.Table</code> control
			 * is configured with <code>autoPopinMode=true</code>.
			 * See {@link sap.m.Table#getAutoPopinMode}
			 */
			demandPopin : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Defines enumerated display options for the pop-in.
			 * @since 1.13.2
			 */
			popinDisplay : {type : "sap.m.PopinDisplay", group : "Appearance", defaultValue : PopinDisplay.Block},

			/**
			 * Set <code>true</code> to merge repeating/duplicate cells into one cell block. See <code>mergeFunctionName</code> property to customize.
			 *
			 * <b>Note:</b>
			 * Merging only happens when rendering the <code>sap.m.Table</code> control, subsequent changes on the cell or item do not have any
			 * effect on the merged state of the cells, therefore this feature should not be used together with two-way binding.
			 * This property is ignored if any column is configured to be shown as a pop-in.
			 * Don't set this property for cells for which the content provides a user interaction, such as <code>sap.m.Link</code>.
			 *
			 * @since 1.16
			 */
			mergeDuplicates : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Defines the control serialization function if <code>mergeDuplicates</code> property is set to <code>true</code>. The control itself uses this function to compare values of two repeating cells.
			 * Default value "getText" is suitable for <code>sap.m.Label</code> and <code>sap.m.Text</code> controls but for the <code>sap.ui.core.Icon</code> control "getSrc" function should be used to merge icons.
			 * <b>Note:</b> You can pass one string parameter to given function after "#" sign. e.g. "data#myparameter"
			 * @since 1.16
			 */
			mergeFunctionName : {type : "string", group : "Misc", defaultValue : 'getText'},

			/**
			 * Defines if a column is sorted by setting the sort indicator for this column.
			 *
			 * <b>Note:</b> Defining this property does not trigger the sorting.
			 * @since 1.61
			 */
			sortIndicator : {type : "sap.ui.core.SortOrder", group : "Appearance", defaultValue : SortOrder.None},

			/**
			 * Defines the column importance.
			 *
			 * If the <code>sap.m.Table</code> control is configured with <code>autoPopinMode=true</code>,
			 * then the column importance is taken into consideration for calculating the <code>minScreenWidth</code>
			 * property and for setting the <code>demandPopin</code> property of the column.
			 * See {@link sap.m.Table#getAutoPopinMode}
			 *
			 * @since 1.76
			 */
			importance : {type : "sap.ui.core.Priority", group : "Behavior", defaultValue : "None"},

			/**
			 * Defines the auto pop-in width for the column.
			 *
			 * If the <code>sap.m.Table</code> control is configured with <code>autoPopinMode=true</code>,
			 * then the <code>autoPopinWidth</code> property is used to calculate the <code>minScreenWidth</code>
			 * property of the column in case a fixed width is not set for the column.
			 * See {@link sap.m.Column#getWidth} and {@link sap.m.Table#getAutoPopinMode}.
			 * <b>Note:</b> A float value is set for the <code>autoPopinWidth</code> property
			 * which is internally treated as a rem value.
			 *
			 * @since 1.76
			 */
			autoPopinWidth : {type : "float", group : "Behavior", defaultValue : 8}
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
		associations: {
			/**
			 * Provides a menu that is used by the column.
			 * The given menu has to follow the same pattern as the <code>sap.ui.core.IColumnHeaderMenu</code> interface.
			 *
			 * @since 1.98.0
			 */
			headerMenu: {type: "sap.ui.core.IColumnHeaderMenu", multiple: false}
		},
		designtime: "sap/m/designtime/Column.designtime"
	}});


	// default index
	Column.prototype._index = -1;

	// default media value
	Column.prototype._media = null;

	// default forced column value
	Column.prototype._bForcedColumn = false;

	Column.prototype.exit = function() {
		this._clearMedia();
	};

	Column.prototype.setParent = function(oParent) {
		Element.prototype.setParent.apply(this, arguments);
		if (!oParent) {
			delete this._initialOrder;
		}

		return this;
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

	Column.prototype.oncontextmenu = function (oEvent) {
		var oMenu = this.getHeaderMenuInstance();
		if (oMenu) {
			oMenu.openBy(this);
			oEvent.preventDefault();
		}
	};

	Column.prototype.invalidate = function() {
		var oParent = this.getParent();
		if (oParent && oParent.bOutput) {
			Element.prototype.invalidate.apply(this, arguments);
		}
	};

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
	 * Notify table to re-render
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

		if (this.getVisible()) {
			this.informTable("Resize");
		}
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

	/**
	 * Returns CSS alignment according to column hAlign setting or given parameter
	 * for Begin/End values checks the locale settings
	 *
	 * @param {string} [sAlign] TextAlign enumeration
	 * @return {string} left|center|right
	 * @protected
	 */
	Column.prototype.getCssAlign = function(sAlign) {
		sAlign = sAlign || this.getHAlign();

		if (sAlign === TextAlign.Begin || sAlign === TextAlign.End || sAlign === TextAlign.Initial) {
			sAlign = Renderer.getTextAlign(sAlign);
		}

		return sAlign.toLowerCase();
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
	 * Gets the rendering index of the column
	 *
	 * @protected
	 */
	Column.prototype.getIndex = function() {
		return this._index;
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

	// sets the internals for the minScreenWidth property
	Column.prototype._setMinScreenWidth = function(sWidth) {
		// initialize
		this._clearMedia();
		this._minWidth = 0;

		if (sWidth) {
			// check given width is known screen-size
			sWidth = sWidth.toLowerCase();
			var sPredefinedWidth = library.ScreenSizes[sWidth];
			if (sPredefinedWidth) {
				this._minWidth = sPredefinedWidth + "px";
			} else if (sWidth.endsWith("px")) {
				this._minWidth = sWidth;
			} else {
				var fBaseFontSize = parseFloat(library.BaseFontSize);
				this._minWidth = parseFloat(sWidth) * fBaseFontSize + "px";
			}

			var oTable = this.getTable();
			if (oTable && oTable.isActive()) {
				this._addMedia();
			} else {
				this._bShouldAddMedia = true;
			}
		}
	};

	/*
	 * Decides if we need media query or not according to given settings
	 * Checks the given width is known screen size
	 */
	Column.prototype.setMinScreenWidth = function(sWidth) {
		sWidth = sWidth || "";

		// check if setting the old value
		if (sWidth == this.getMinScreenWidth()) {
			return this;
		}

		// first validate the value
		this._validateMinWidth(sWidth);

		// set internal values
		this._setMinScreenWidth(sWidth);

		return this.setProperty("minScreenWidth", sWidth);
	};

	Column.prototype.setSortIndicator = function(sSortIndicator) {
		this.setProperty("sortIndicator", sSortIndicator, true);
		this.$().attr("aria-sort", this.getSortIndicator().toLowerCase());
		return this;
	};

	/**
	 * Determines whether the column is shown as pop-in or not
	 *
	 * @protected
	 */
	Column.prototype.isPopin = function() {
		if (!this.getDemandPopin()) {
			return false;
		}

		var oTable = this.getTable();
		if (oTable) {
			var aHiddenInPopin = oTable.getHiddenInPopin() || [];
			var bHideColumn = aHiddenInPopin.includes(this.getImportance());
			if (bHideColumn) {
				return false;
			}
		}

		return this.isHidden();
	};

	/**
	 * Determines whether the column is hidden without being in the popin area
	 *
	 * @protected
	 */
	Column.prototype.isHidden = function() {
		return (this._media) ? !this._media.matches : false;
	};

	/**
	 * Sets the last value of the column if mergeDuplicates property is true
	 *
	 * @param {any} value Any Value
	 * @returns {this}
	 * @since 1.16
	 * @protected
	 */
	Column.prototype.setLastValue = function(value) {
		this._lastValue = value;
		return this;
	};

	/**
	 * Clears the last value of the column if mergeDuplicates property is true
	 *
	 * @returns {this}
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

	Column.prototype.onTableRendering = function() {
		this.clearLastValue();
		if (this._bShouldAddMedia) {
			this._addMedia();
		}
	};

	// returns the minScreenWidth property in pixel as integer
	Column.prototype.getCalculatedMinScreenWidth = function() {
		return parseInt(this._minWidth) || 0;
	};

	// forces the column not to be shown as a popin
	Column.prototype.setForcedColumn = function(bForcedColumn) {
		if (this._bForcedColumn == bForcedColumn) {
			return;
		}

		this._bForcedColumn = bForcedColumn;
		this._setMinScreenWidth(bForcedColumn ? "" : this.getMinScreenWidth());
	};

	/**
	 * Returns the column header menu instance that this column is associated with via the <code>headerMenu</code> association.
	 *
	 * @returns {sap.ui.core.IColumnHeaderMenu | undefined} The column header menu instance
	 * @private
	 */
	Column.prototype.getHeaderMenuInstance = function () {
		return Element.getElementById(this.getHeaderMenu());
	};

	Column.prototype.setHeader = function (oControl) {
		var oOldHeader = this.getHeader();
		if (oOldHeader && oOldHeader.isA("sap.m.Label")) {
			oOldHeader.detachEvent("_change", this._onLabelPropertyChange, this);
			oOldHeader.setIsInColumnHeaderContext(false);
		}

		this.setAggregation("header", oControl);

		var oNewHeader = this.getHeader();
		if (oNewHeader && oNewHeader.isA("sap.m.Label")) {
			oNewHeader.attachEvent("_change", this._onLabelPropertyChange, this);
			oNewHeader.setIsInColumnHeaderContext(true);
		}

		return this;
	};

	Column.prototype._onLabelPropertyChange = function (oEvent) {
		var oTable = this.getTable();
		if (!oTable || oEvent.getParameter("name") != "required") {
			return;
		}

		if (oTable.bActiveHeaders || this.getHeaderMenuInstance()) {
			this.$()[oEvent.getSource().getRequired() ? "addAriaDescribedBy" : "removeAriaDescribedBy"](InvisibleText.getStaticId("sap.m", "CONTROL_IN_COLUMN_REQUIRED"));
		}
	};

	Column.prototype.getFieldHelpInfo = function() {
		return {
			label: this.getHeader()?.getText?.() || ""
		};
	};

	return Column;

});
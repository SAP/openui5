/*!
 * ${copyright}
 */

// Provides control sap.m.Table.
sap.ui.define([
	"sap/ui/core/ControlBehavior",
	"./library",
	"./ListBase",
	"./ListItemBase",
	"./CheckBox",
	"./TableRenderer",
	"sap/ui/base/Object",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/util/PasteHelper",
	"sap/ui/thirdparty/jquery",
	"sap/m/ListBaseRenderer",
	"sap/ui/core/Icon",
	"sap/m/table/Util",
	"sap/ui/core/Lib",
	// jQuery custom selectors ":sapTabbable"
	"sap/ui/dom/jquery/Selectors"
],
	function(ControlBehavior, library, ListBase, ListItemBase, CheckBox, TableRenderer, BaseObject, ResizeHandler, PasteHelper, jQuery, ListBaseRenderer, Icon, Util, Library) {
	"use strict";


	// shortcut for sap.m.ListGrowingDirection
	var ListGrowingDirection = library.ListGrowingDirection;

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;

	// shortcut for sap.m.PopinLayout
	var PopinLayout = library.PopinLayout;

	// shortcut for sap.m.Screensize
	var ScreenSizes = library.ScreenSizes;

	/**
	 * Constructor for a new Table.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.Table</code> control provides a set of sophisticated and easy-to-use functions for responsive table design.
	 *
	 * To render the <code>sap.m.Table</code> control properly, the order of the <code>columns</code> aggregation should match with the order of the <code>cells</code> aggregation (<code>sap.m.ColumnListItem</code>).
	 *
	 * The <code>sap.m.Table</code> control requires at least one visible <code>sap.m.Column</code> in the <code>columns</code> aggregation, therefore applications must avoid configuring all columns to be shown in the pop-in.
	 * If such a conflict is detected, then the table prevents one column from moving to the pop-in.
	 *
	 * For mobile devices, the recommended limit of table rows is 100 (based on 4 columns) to assure proper performance. To improve initial rendering of large tables, use the <code>growing</code> feature.
	 *
	 * <b>Note:</b> In the <code>items</code> aggregation only items which implements the <code>sap.m.ITableItem</code> interface must be used.
	 *
	 * See section "{@link topic:5eb6f63e0cc547d0bdc934d3652fdc9b Creating Tables}" and "{@link topic:38855e06486f4910bfa6f4485f7c2bac Configuring Responsive Behavior of a Table}"
	 * in the documentation for an introduction to <code>sap.m.Table</code> control.
	 *
	 *
	 * @extends sap.m.ListBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16
	 * @alias sap.m.Table
	 * @see {@link fiori:/responsive-table/ Responsive Table}
	 */
	var Table = ListBase.extend("sap.m.Table", /** @lends sap.m.Table.prototype */ {
		metadata : {

			library : "sap.m",
			properties : {

				/**
				 * Sets the background style of the table. Depending on the theme, you can change the state of the background from <code>Solid</code> to <code>Translucent</code> or to <code>Transparent</code>.
				 */
				backgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance", defaultValue : BackgroundDesign.Translucent},

				/**
				 * Defines the algorithm to be used to layout the table cells, rows, and columns.
				 * This property allows three possible values:
				 * <ul>
				 * <li><code>true</code></li>
				 * <li><code>false</code></li>
				 * <li><code>Strict</code></li>
				 * </ul>
				 *
				 * By default, the table is rendered with a fixed layout algorithm (<code>fixedLayout=true</code>). This means the horizontal layout only depends on the table's width and the width of the columns, not the content of the cells. Cells in subsequent rows do not affect column width. This allows a browser to provide a faster table layout since the browser can begin to display the table once the first row has been analyzed.
				 *
				 * If this property is set to <code>false</code>, <code>sap.m.Table</code> is rendered with an auto layout algorithm. This means, the width of the table and its cells depends on the content of the cells. The column width is set by the widest unbreakable content inside the cells. This can make the rendering slow, since the browser needs to go through all the content in the table before determining the final layout.<br>
				 *
				 * If this property is set to <code>Strict</code> and the <code>width</code> property is defined for all columns (and not the expected "auto" value), then the <code>sap.m.Table</code> control renders a placeholder column which occupies the remaining width of the control to ensure the column width setting is strictly applied.<br>
				 *
				 * If there is only one remaining column with a width larger than the table, then this column gets the maximum width available in the table. If the column width is smaller than the table, then the column width is retained, and the remaining width of the table is occupied by the placeholder column.<br>
				 *
				 * The placeholder column gets rendered only if there are no columns in the pop-in area.<br>
				 *
				 * <b>Note:</b> Since <code>sap.m.Table</code> does not have its own scrollbars, setting <code>fixedLayout</code> to false can force the table to overflow, which may cause visual problems. It is suggested to use this property when a table has a few columns in wide screens or within the horizontal scroll container (e.g <code>sap.m.Dialog</code>) to handle overflow.
				 * In auto layout mode the <code>width</code> property of <code>sap.m.Column</code> is taken into account as a minimum width.
				 * @since 1.22
				 */
				fixedLayout : {type : "any", group : "Behavior", defaultValue : true},

				/**
				 * Setting this property to <code>true</code> will show an overlay on top of the table content and prevents the user interaction with it.
				 * @since 1.22.1
				 */
				showOverlay : {type : "boolean", group : "Appearance", defaultValue : false},

				/**
				 * Enables alternating table row colors.
				 * <b>Note:</b> This property can only be used with the Belize and Belize Deep themes.
				 * Alternate row coloring is not available for the High Contrast Black/White themes.
				 * @since 1.52
				 */
				alternateRowColors : {type : "boolean", group : "Appearance", defaultValue : false},

				/**
				 * Defines the layout in which the table pop-in rows are rendered.
				 * <b>Note:</b> The <code>demandPopin</code> and <code>minScreenWidth</code> properties of the <code>Column</code> control must be configured appropriately.
				 * @since 1.52
				 */
				popinLayout : {type : "sap.m.PopinLayout", group : "Appearance", defaultValue : PopinLayout.Block},

				/**
				 * Defines the contextual width for the <code>sap.m.Table</code> control. By defining this property the table adapts the pop-in behavior based on the container in which the table is placed or the configured contextual width.
				 * By default, <code>sap.m.Table</code> renders in pop-in behavior only depending on the window size or device.
				 *
				 * For example, by setting the <code>contextualWidth</code> property to 600px or Tablet, the table can be placed in a container with 600px width, where the pop-in is used.
				 * You can use specific CSS sizes (for example, 600px or 600), you can also use the <code>sap.m.ScreenSize</code> enumeration (for example, Phone, Tablet, Desktop, Small, Medium, Large, ....).
				 * If this property is set to <code>Auto</code>, the <code>ResizeHandler</code> will manage the contextual width of the table.
				 * <b>Note:</b> Only "Inherit", "Auto", and pixel-based CSS sizes (for example, 200, 200px) can be applied to the <code>contextualWidth</code> property. Due to the rendering cost, we recommend to use the valid value mentioned before except for "Auto".
				 * @since 1.60
				 */
				contextualWidth : {type: "string", group: "Behavior", defaultValue: "Inherit"},

				/**
				 * Enables the auto pop-in behavior for the table control.
				 *
				 * If this property is set to <code>true</code>, the table control overwrites the <code>demandPopin</code>
				 * and the <code>minScreenWidth</code> properties of the <code>sap.m.Column</code> control.
				 * The pop-in behavior depends on the <code>importance</code> property of the <code>sap.m.Column</code> control.
				 * Columns configured with this property are moved to the pop-in area in the following order:
				 *
				 * <ul>
				 * 	<li>With importance <code>High</code>: moved last</li>
				 * 	<li>With importance <code>Medium</code> or <code>None</code>: moved second</li>
				 * 	<li>With importance <code>Low</code>: moved first</li>
				 * </ul>
				 *
				 * <b>Note:</b> If this property is changed from <code>true</code> to <code>false</code>,
				 * the application must reconfigure the <code>demandPopin</code> and <code>minScreenWidth</code>
				 * properties of the <code>sap.m.Column</code> control by itself.
				 * There is no automatic mechanism that restores the old values if <code>autoPopinMode</code> was set
				 * from <code>false</code> to <code>true</code> before.
				 *
				 * @since 1.76
				 */
				autoPopinMode: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Defines which columns should be hidden instead of moved into the pop-in area
				 * depending on their importance. See {@link sap.m.Column#getImportance}
				 *
				 * <b>Note:</b> To hide columns based on their importance, it's mandatory to set <code>demandPopin="true"</code>
				 * for the <code>sap.m.Column</code> control or set <code>autoPopinMode="true"</code> for the <code>sap.m.Table</code> control.
				 * See {@link topic:38855e06486f4910bfa6f4485f7c2bac Configuring Responsive Behavior of a Table}
				 * and {@link sap.m.Table#getAutoPopinMode}.
				 *
				 * @since 1.77
				 */
				hiddenInPopin: {type: "sap.ui.core.Priority[]", group: "Behavior"}
			},
			aggregations : {

				/**
				 * Defines the columns of the table.
				 */
				columns : {type : "sap.m.Column", multiple : true, singularName : "column", dnd : {draggable : true, droppable : true, layout : "Horizontal"} },

				/**
				 * Provides a message if no visible columns are available.
				 */
				_noColumnsMessage : {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
			},
			events : {
				/**
				 * Fired when the context menu is opened.
				 * When the context menu is opened, the binding context of the item is set to the given <code>contextMenu</code>.
				 * @since 1.54
				 */
				beforeOpenContextMenu : {
					allowPreventDefault : true,
					parameters : {
						/**
						 * Item in which the context menu was opened.
						 */
						listItem : {type : "sap.m.ColumnListItem"},
						/**
						 * Column in which the context menu was opened.
						 * <b>Note:</b> This parameter might be undefined for the items that are not part of a column definition.
						 */
						column : {type : "sap.m.Column"}
					}
				},
				/**
				 * This event gets fired when the user pastes content from the clipboard to the table.
				 * Pasting can be done via the context menu or the standard paste keyboard shortcut, if the focus is inside the table.
				 * @since 1.60
				 */
				paste : {
					allowPreventDefault: true,
					parameters : {
						/**
						 * 2D array of strings with data from the clipboard. The first dimension represents the rows, and the
						 * second dimension represents the cells of the tabular data.
						 */
						data : {type : "string[][]"}
					}
				},
				/**
				 * Fired when the table pop-in has changed.
				 * @since 1.77
				 */
				popinChanged: {
					parameters: {
						/**
						 * Returns true if there are visible columns in the pop-in area
						 */
						hasPopin: {type: "boolean"},
						/**
						 * Returns array of all visible columns in the pop-in area.
						 */
						visibleInPopin: {type: "sap.m.Column[]"},
						/**
						 * Returns array of columns that are hidden in the pop-in based on their importance.
						 * See {@link sap.m.Column#getImportance}
						 */
						hiddenInPopin: {type: "sap.m.Column[]"}
					}
				}
			},
			designtime: "sap/m/designtime/Table.designtime"
		},

		renderer: TableRenderer
	});

	// class name for the navigation items
	Table.prototype.sNavItemClass = "sapMListTblRow";

	Table.prototype.init = function() {
		this._iItemNeedsTypeColumn = 0;
		ListBase.prototype.init.call(this);
	};

	Table.prototype.setContextualWidth = function (sWidth) {
		var sOldWidth = this.getContextualWidth();
		// check if setting the old value
		if (sWidth == sOldWidth) {
			return this;
		}

		if (typeof sWidth === "number"){
			this._sContextualWidth = sWidth + "px";
			this._sContextualWidth = this._sContextualWidth.toLowerCase();
		} else {
			// to convert the capital screen width
			var width = sWidth.toLowerCase(),
				iWidth = ScreenSizes[width];
			if (iWidth) {
				// screen size
				this._sContextualWidth = iWidth + "px";
			} else {
				//auto or inherit
				this._sContextualWidth = sWidth;
			}
		}

		// validate the value
		var bWidthValidated = this._validateContextualWidth(this._sContextualWidth);

		this._iLastContextualWidth = sOldWidth;

		if (bWidthValidated) {
			// set property, suppressInvalidate
			this.setProperty("contextualWidth", sWidth, true);
		} else {
			return this;
		}

		// if the old value is auto, remove resizeHandler
		if (this._iLastContextualWidth.toLowerCase() === "auto" ) {
			this._deregisterResizeHandler();
		}

		if (this._sContextualWidth.toLowerCase() === "auto") {
			// if auto, register resizeHandler and apply the contextual width
			this._registerResizeHandler();
			this._applyContextualWidth(this.$().width());
		} else {
			// if px value, apply contextualWidth
			this._applyContextualWidth(this._sContextualWidth);
		}

		return this;
	};

	Table.prototype._validateContextualWidth = function(sWidth) {

		if (!sWidth) {
			return;
		}
		if ( typeof sWidth != "string") {
			throw new Error('expected string for property "contextualWidth" of ' + this);
		}
		if (sWidth.toLowerCase() === "auto" || sWidth.toLowerCase() === "inherit") {
			return true;
		}
		if (!/^\d+(\.\d+)?(px)$/i.test(sWidth)) {
			throw new Error('invalid CSS size("px", "Auto", "auto", Inherit", "inherit" required) or sap.m.ScreenSize enumeration for property "contextualWidth" of ' + this);
		}

		return true;
	};

	Table.prototype._applyContextualWidth = function(iWidth) {
		iWidth = parseFloat(iWidth) || 0;

		// when hiddenInPopin is configured, the table size increases due to popins and later decreases as popins are removed due to hiddenInPopin
		// this can cause scrollbar to appear and disappear causing popin and popout jumping
		// hence, the table does not change the contextual width if it is less than or equal to 16 (approx. scrollbar size)
		if (Math.abs(this._oContextualSettings.contextualWidth - iWidth) <= 16) {
			return;
		}

		if (iWidth && this._oContextualSettings.contextualWidth != iWidth) {
			this._applyContextualSettings({
				contextualWidth : iWidth
			});
		}
	};

	Table.prototype.setNoData = function (vNoData) {
		ListBase.prototype.setNoData.apply(this, arguments);

		if (vNoData && typeof vNoData !== "string" && vNoData.isA("sap.m.IllustratedMessage")) {
			var oNoColumns = this.getAggregation("_noColumnsMessage");
			if (!oNoColumns) {
				oNoColumns = Util.getNoColumnsIllustratedMessage();
				this.setAggregation("_noColumnsMessage", oNoColumns);
			}
		} else if (vNoData && (typeof vNoData === "string" || !vNoData.isA("sap.m.IllustratedMessage"))) {
			// If the given vNoData is not an IllustratedMessage remove the according column message
			this.removeAllAggregation("_noColumnsMessage");
		}

		if (!this.shouldRenderItems()) {
			if (this.getAggregation("_noColumnsMessage")) {
				// Invalidate table, if there is an illustrated message present, to prevent possible replacement with plain text
				this.invalidate();
			} else {
				// Only set the no columns string, if there is no illustrated message present
				this.$("nodata-text").text(Library.getResourceBundleFor("sap.m").getText("TABLE_NO_COLUMNS"));
			}
		}

		return this;
	};

	Table.prototype._onResize = function(mParams) {
		this._applyContextualWidth(mParams.size.width);
	};

	Table.prototype._registerResizeHandler = function () {
		if (!this._iResizeHandlerId) {
			var that = this;
			window.requestAnimationFrame(function() {
				that._iResizeHandlerId = ResizeHandler.register(that, that._onResize.bind(that));
			});
		}
	};

	/**
	 * Deregisters resize handler
	 *
	 * @private
	 */
	Table.prototype._deregisterResizeHandler = function () {
		if (this._iResizeHandlerId) {
			ResizeHandler.deregister(this._iResizeHandlerId);
			this._iResizeHandlerId = null;
		}
	};

	Table.prototype.onBeforeRendering = function() {
		ListBase.prototype.onBeforeRendering.call(this);

		this._configureAutoPopin();
		this._applyContextualWidth(this._sContextualWidth);
		this._notifyColumns("TableRendering");
	};

	Table.prototype.onAfterRendering = function() {
		ListBase.prototype.onAfterRendering.call(this);

		if (this.shouldRenderItems()) {
			var oNavigationRoot = this.getNavigationRoot();
			oNavigationRoot.setAttribute("aria-colcount", this._colHeaderAriaOwns.length);
			oNavigationRoot.setAttribute("aria-rowcount", this.getAccessbilityPosition().setsize);
			if (this._hasPopin) {
				this.getDomRef("tblHeader").setAttribute("aria-owns", this._colHeaderAriaOwns.join(" "));
			}
		}

		if (!this.isPropertyInitial("showOverlay")) {
			this._handleOverlay();
		}

		if (this._bFirePopinChanged) {
			this._firePopinChangedEvent();
		} else {
			var aPopins = this._getPopins();
			if (this._aPopins && this.getVisibleItems().length) {
				if (this._aPopins.length != aPopins.length || !aPopins.every(function(oPopinCol) {
					return this._aPopins.indexOf(oPopinCol) > -1;
				}, this)) {
					this._aPopins = aPopins;
					this._firePopinChangedEvent();
				}
			} else if (this._aPopins == null) {
				this._aPopins = aPopins;
			}
		}

		if (this._bCheckLastColumnWidth && Util.isThemeApplied()) {
			window.requestAnimationFrame(this._checkLastColumnWidth.bind(this));
		}
	};

	Table.prototype.setHiddenInPopin = function(aPriorities) {
		var aOldPriorities = this.getHiddenInPopin() || [],
			aNewPriorities = aPriorities || [];

		this.setProperty("hiddenInPopin", aPriorities);

		if (aNewPriorities.length !== aOldPriorities.length) {
			this._bFirePopinChanged = true;
		} else {
			this._bFirePopinChanged = !aNewPriorities.every(function(sPriority) {
				return aOldPriorities.includes(sPriority);
			});
		}

		this._aPopins = this._getPopins();
		return this;
	};

	Table.prototype._handleOverlay = function() {
		var $Overlay = this.$("overlay");
		if (this.getShowOverlay()) {
			var oDomRef = this.getDomRef();
			if (!$Overlay[0]) {
				$Overlay = jQuery("<div></div>", {
					"id": this.getId() + "-overlay",
					"class": "sapUiOverlay sapMTableOverlay",
					"role": "region",
					"tabindex": "0",
					"aria-labelledby": [
						TableRenderer.getAriaLabelledBy(this),
						TableRenderer.getAriaAnnouncement("TABLE_INVALID")
					].join(" ").trimLeft()
				}).appendTo(oDomRef);
			}
			if (oDomRef.contains(document.activeElement)) {
				this._bIgnoreFocusIn = true;
				$Overlay.trigger("focus");
			}
		} else {
			if (document.activeElement == $Overlay[0]) {
				this.focus();
			}
			$Overlay.remove();
		}
	};

	/**
	 * Checks if the only remaining column is larger than the table, then the column width style
	 * is removed and dummy cell is also adapted according.
	 * This is to ensure that the the column does not overflow the table.
	 * @private
	 */
	Table.prototype._checkLastColumnWidth = function() {
		var $this = this.$();
		var oTableDomRef = this.getTableDomRef();

		if (!$this.length || !oTableDomRef) {
			return;
		}

		if ($this[0].clientWidth < oTableDomRef.clientWidth) {
			$this.find(".sapMListTblCell:visible").eq(0).addClass("sapMTableForcedColumn").width("");
		}

		this._bCheckLastColumnWidth = false;
	};

	Table.prototype.setShowOverlay = function(bShow) {
		var bSuppressInvalidate = (this.getDomRef() != null);
		this.setProperty("showOverlay", bShow, bSuppressInvalidate);
		if (bSuppressInvalidate) {
			this._handleOverlay();
		}
		return this;
	};

	Table.prototype.exit = function () {
		ListBase.prototype.exit.call(this);
		if (this._selectAllCheckBox) {
			this._selectAllCheckBox.destroy();
			this._selectAllCheckBox = null;
		}
		if (this._clearAllButton) {
			this._clearAllButton.destroy();
			this._clearAllButton = null;
		}
		if (this._aPopinHeaders) {
			this._aPopinHeaders.forEach(function(oPopinHeader) {
				oPopinHeader.destroy();
			});
			this._aPopinHeaders = null;
		}
	};

	Table.prototype.destroyItems = function() {
		this._notifyColumns("ItemsRemoved");
		return ListBase.prototype.destroyItems.apply(this, arguments);
	};

	Table.prototype.removeSelections = function() {
		ListBase.prototype.removeSelections.apply(this, arguments);
		this.updateSelectAllCheckbox();
		return this;
	};

	Table.prototype.selectAll = function () {
		ListBase.prototype.selectAll.apply(this, arguments);
		this.updateSelectAllCheckbox();
		return this;
	};

	/**
	 * Getter for aggregation columns.
	 *
	 * @param {boolean} [bSort] Set true to get the columns in an order that respects personalization settings.
	 * @returns {sap.m.Column[]} Columns of the Table
	 * @public
	 */
	Table.prototype.getColumns = function(bSort) {
		var aColumns = this.getAggregation("columns", []);
		if (bSort) {
			aColumns.sort(function(c1, c2) {
				return c1.getOrder() - c2.getOrder();
			});
		}
		return aColumns;
	};

	/**
	 * Returns the columns of the table, including the column in the popin, in the rendering order.
	 *
	 * @returns {sap.m.Column[]} Columns of the Table in the rendering order.
	 * @private
	 */
	Table.prototype.getRenderedColumns = function() {
		return this.getColumns(true).filter(function(oColumn) {
			return oColumn.getVisible() && (oColumn.isPopin() || !oColumn.isHidden());
		}).sort(function(oCol1, oCol2) {
			var iCol1Index = oCol1.getIndex(), iCol2Index = oCol2.getIndex(), iIndexDiff = iCol1Index - iCol2Index;
			if (iIndexDiff == 0) { return 0; }
			if (iCol1Index < 0) { return 1; }
			if (iCol2Index < 0) { return -1; }
			return iIndexDiff;
		});
	};

	// @see JSDoc generated by SAPUI5 control
	Table.prototype.setFixedLayout = function(vFixedLayout) {

		// handle the default value and stringified version of booleans for the XML view
		if (vFixedLayout == undefined || vFixedLayout == "true") {
			vFixedLayout = true;
		} else if (vFixedLayout == "false") {
			vFixedLayout = false;
		}

		if (typeof vFixedLayout == "boolean" || vFixedLayout == "Strict") {
			return this.setProperty("fixedLayout", vFixedLayout);
		}

		throw new Error('"' + vFixedLayout + '" is an invalid value, expected false, true or "Strict" for the property fixedLayout of ' + this);
	};

	/*
	 * This hook method is called from renderer to determine whether items should render or not
	 * @override
	 */
	Table.prototype.shouldRenderItems = function() {
		return this.getColumns().some(function(oColumn) {
			return oColumn.getVisible();
		});
	};

	/*
	 * This hook method is called from GrowingEnablement to determine whether
	 * growing should suppress Table invalidation
	 * @override
	 */
	Table.prototype.shouldGrowingSuppressInvalidation = function() {
		if (this.getAutoPopinMode()) {
			return false;
		}

		return ListBase.prototype.shouldGrowingSuppressInvalidation.call(this);
	};

	// this gets called when item type column requirement is changed
	Table.prototype.onItemTypeColumnChange = function(oItem, bNeedsTypeColumn) {
		this._iItemNeedsTypeColumn += (bNeedsTypeColumn ? 1 : -1);

		// update type column visibility
		if (this._iItemNeedsTypeColumn == 1 && bNeedsTypeColumn) {
			this._setTypeColumnVisibility(true);
		} else if (this._iItemNeedsTypeColumn == 0) {
			this._setTypeColumnVisibility(false);
		}
	};

	// this gets called when selected property of the item is changed
	Table.prototype.onItemSelectedChange = function(oItem, bSelect) {
		clearTimeout(this._iSelectAllCheckboxTimer);
		this._iSelectAllCheckboxTimer = setTimeout(this.updateSelectAllCheckbox.bind(this));
		ListBase.prototype.onItemSelectedChange.apply(this, arguments);
	};

	/*
	 * Returns the <table> DOM reference
	 * @protected
	 */
	Table.prototype.getTableDomRef = function() {
		return this.getDomRef("listUl");
	};

	/*
	 * Returns items container DOM reference
	 * @override
	 */
	Table.prototype.getItemsContainerDomRef = function() {
		return this.getDomRef("tblBody");
	};

	Table.prototype.onmousedown = function(oEvent) {
		this._bMouseDown = true;
		var sOldTabIndex;
		var oFocusableCell = oEvent.target.closest(".sapMTblCellFocusable:not([aria-haspopup])");
		if (oFocusableCell && !document.activeElement.classList.contains("sapMTblCellFocusable")) {
			sOldTabIndex = oFocusableCell.getAttribute("tabindex");
			oFocusableCell.removeAttribute("tabindex");
		}
		setTimeout(function() {
			this._bMouseDown = false;
			sOldTabIndex && oFocusableCell.setAttribute("tabindex", sOldTabIndex);
		}.bind(this));
		ListBase.prototype.onmousedown.apply(this, arguments);
	};

	Table.prototype._onItemNavigationBeforeFocus = function(oUI5Event) {
		var oEvent = oUI5Event.getParameter("event");
		if (this._bMouseDown && !oEvent.target.hasAttribute("tabindex")) {
			return;
		}

		var iFocusedIndex;
		var iForwardIndex = -1;
		var iIndex = oUI5Event.getParameter("index");
		var iColumnCount = this._colHeaderAriaOwns.length + 1;
		var oItemNavigation = oUI5Event.getSource();

		if (this._bMouseDown) {
			var iRowIndex = iIndex - iIndex % iColumnCount;
			if (this._headerHidden || iRowIndex || !this._columnHeadersActive) {
				iForwardIndex = iRowIndex;
			}
		} else {
			var aItemDomRefs = oItemNavigation.getItemDomRefs();
			var oNavigationTarget = aItemDomRefs[iIndex];
			if (oEvent.target.classList.contains("sapMTblCellFocusable")) {
				var iTargetIndex = aItemDomRefs.indexOf(oEvent.target);
				if (oEvent.type == "saphome" && iTargetIndex % iColumnCount != 1) {
					iForwardIndex = iIndex - iIndex % iColumnCount + 1;
				} else if (oEvent.type == "sapend" && iTargetIndex % iColumnCount == iColumnCount - 1) {
					iForwardIndex = iTargetIndex - iColumnCount + 1;
				} else if (oEvent.type.startsWith("sappage") && iTargetIndex % iColumnCount != iIndex % iColumnCount) {
					iForwardIndex = iIndex - iIndex % iColumnCount + iTargetIndex % iColumnCount;
				}
			} else if (oEvent.target.classList.contains("sapMLIBFocusable")) {
				if (oEvent.type.startsWith("sappage")) {
					iForwardIndex = iIndex - iIndex % iColumnCount;
					if (oEvent.type == "sappageup" && iForwardIndex == 0 && oItemNavigation.getFocusedIndex() > iColumnCount) {
						iForwardIndex = iColumnCount;
					}
				} else if (oEvent.type == "saphome") {
					iForwardIndex = 0;
				} else if (oEvent.type == "sapend") {
					iForwardIndex = aItemDomRefs.length - iColumnCount;
				}
			}
			if (iForwardIndex == -1 && oNavigationTarget.classList.contains("sapMGHLICell")) {
				iForwardIndex = iIndex - 1;
				iFocusedIndex = iForwardIndex + oItemNavigation.getFocusedIndex() % iColumnCount;
			}
		}

		if (iForwardIndex != -1) {
			oEvent.preventDefault();
			oUI5Event.preventDefault();
			oItemNavigation.setFocusedIndex(iForwardIndex);
			oItemNavigation.getItemDomRefs()[iForwardIndex].focus();
			iFocusedIndex && oItemNavigation.setFocusedIndex(iFocusedIndex);
		}
	};

	/*
	 * Sets DOM References for keyboard navigation
	 * @override
	 */
	Table.prototype.setNavigationItems = function(oItemNavigation) {
		var oNavigationRoot = this.getNavigationRoot();
		var aItemDomRefs = oNavigationRoot.querySelectorAll(".sapMListTblRow,.sapMGHLI,.sapMTblCellFocusable,.sapMTblItemNav");
		oItemNavigation.setItemDomRefs(Array.from(aItemDomRefs));

		var iItemNavigationColumns = oItemNavigation.iColumns;
		var iColumns = this._colHeaderAriaOwns.length + 1;
		var iPageSize = Math.min(this.getVisibleItems().length, this.getGrowingThreshold());
		oItemNavigation.setTableMode(true, false);
		oItemNavigation.setColumns(iColumns);
		oItemNavigation.setPageSize(iPageSize * iColumns);

		oItemNavigation.detachEvent("BeforeFocus", this._onItemNavigationBeforeFocus, this);
		oItemNavigation.attachEvent("BeforeFocus", this._onItemNavigationBeforeFocus, this);
		oItemNavigation.detachEvent("FocusAgain", this._onItemNavigationBeforeFocus, this);
		oItemNavigation.attachEvent("FocusAgain", this._onItemNavigationBeforeFocus, this);

		// header and footer are in the item navigation but
		// initial focus should be at the first item row
		if (oItemNavigation.getFocusedIndex() == -1) {
			if (this.getGrowing() && this.getGrowingDirection() == ListGrowingDirection.Upwards) {
				oItemNavigation.setFocusedIndex(aItemDomRefs.length - iColumns);
			} else {
				oItemNavigation.setFocusedIndex(this._headerHidden ? 0 : iColumns);
			}
		} else if (oItemNavigation.getFocusedIndex() >= iItemNavigationColumns) {
			oItemNavigation.setFocusedIndex(oItemNavigation.getFocusedIndex() + iColumns - iItemNavigationColumns);
		}
	};

	/*
	 * Determines for growing feature to handle all data from scratch
	 * if column merging and growing feature are active at the same time
	 * it is complicated to remerge or demerge columns when we
	 * insert or delete items from the table with growing diff logic
	 *
	 * @protected
	 */
	Table.prototype.checkGrowingFromScratch = function() {
		// no merging for popin case
		if (this.hasPopin()) {
			return false;
		}

		// check visibility and merge feature of columns
		return this.getColumns().some(function(oColumn) {
			return oColumn.getVisible() && oColumn.getMergeDuplicates();
		});
	};

	Table.prototype.onColumnPress = function(oColumn) {
		var oMenu = oColumn.getHeaderMenuInstance();
		oMenu && oMenu.openBy(oColumn);
		if (this.bActiveHeaders && !oMenu) {
			this.fireEvent("columnPress", {
				column: oColumn
			});
		}
	};

	/*
	 * This method is called asynchronously if resize event comes from column
	 * @protected
	 */
	Table.prototype.onColumnResize = function(oColumn) {
		this._bFirePopinChanged = true;
		this.invalidate();
	};

	// updates the type column visibility and sets the aria flag
	Table.prototype._setTypeColumnVisibility = function(bVisible) {
		if (!this._bItemsBeingBound && !this._bRendering) {
			this.invalidate();
		}
	};

	// notify all columns with given action and param
	Table.prototype._notifyColumns = function(sAction, vParam1, vParam2) {
		this.getColumns().forEach(function(oColumn) {
			oColumn["on" + sAction](vParam1, vParam2);
		});
	};

	/**
	 * This method takes care of the clear all icon for table lists. It
	 * will automatically be created on demand and returned when needed
	 *
	 * @private
	 * @return {sap.ui.core.Icon} reference to the internal select all checkbox
	 */
	Table.prototype._getClearAllButton = function() {
		if (!this._clearAllButton) {
			this._clearAllButton = new Icon({
				id: this.getId() + "-clearSelection",
				src: "sap-icon://clear-all",
				tooltip: Library.getResourceBundleFor("sap.m").getText("TABLE_CLEARBUTTON_TOOLTIP"),
				decorative: false,
				press: this.removeSelections.bind(this, false, true, false)
			}).setParent(this, null, true).addEventDelegate({
				onAfterRendering: function() {
					this._clearAllButton.getDomRef().setAttribute("tabindex", -1);
				}
			}, this);
			this.updateSelectAllCheckbox();
		}

		return this._clearAllButton;
	};

	/**
	 * This method takes care of the select all checkbox for table lists. It
	 * will automatically be created on demand and returned when needed
	 *
	 * @private
	 * @return {sap.m.CheckBox} reference to the internal select all checkbox
	 */
	Table.prototype._getSelectAllCheckbox = function() {
		if (this.bPreventMassSelection) {
			return;
		}

		if (!this._selectAllCheckBox) {
			this._selectAllCheckBox = new CheckBox({
				id: this.getId("sa"),
				activeHandling: false,
				tooltip: Library.getResourceBundleFor("sap.m").getText("TABLE_SELECT_ALL_TOOLTIP")
			}).addStyleClass("sapMLIBSelectM").setParent(this, null, true).attachSelect(function () {
				if (this._selectAllCheckBox.getSelected()) {
					this.selectAll(true);
				} else {
					this.removeSelections(false, true);
				}
			}, this);
			this._selectAllCheckBox.useEnabledPropagator(false);
			this.updateSelectAllCheckbox();
		}

		return this._selectAllCheckBox;
	};

	/*
	 * Internal public function to update the selectAll checkbox
	 * according to the current selection on the list items.
	 *
	 * @protected
	 */
	Table.prototype.updateSelectAllCheckbox = function () {
		// checks if the list is in multi select mode and has selectAll checkbox
		if (this.getMode() !== "MultiSelect") {
			return;
		}

		Util.hideSelectionLimitPopover();

		if (this._selectAllCheckBox && this.getMultiSelectMode() != "ClearAll") {
			var aItems = this.getItems(),
				iSelectedItemCount = this.getSelectedItems().length,
				iSelectableItemCount = aItems.filter(function(oItem) {
					return oItem.isSelectable();
				}).length;

			// set state of the checkbox by comparing item length and selected item length
			var bSelected = aItems.length > 0 && iSelectedItemCount == iSelectableItemCount;
			this.$("tblHeader").find(".sapMTblCellFocusable").addBack().attr("aria-selected", bSelected);
			this._selectAllCheckBox.setSelected(bSelected);
		} else if (this._clearAllButton) {
			this._clearAllButton.toggleStyleClass("sapMTableDisableClearAll", !this.getSelectedItems().length);
		}
	};

	/**
	 * This method is a hook for the RenderManager that gets called
	 * during the rendering of child Controls. It allows to add,
	 * remove and update existing accessibility attributes (ARIA) of
	 * those controls.
	 *
	 * @param {sap.ui.core.Control} oElement - The Control that gets rendered by the RenderManager
	 * @param {object} mAriaProps - The mapping of "aria-" prefixed attributes
	 * @protected
	 */
	Table.prototype.enhanceAccessibilityState = function(oElement, mAriaProps) {
		if (oElement == this._clearAllButton) {
			mAriaProps.label = Library.getResourceBundleFor("sap.m").getText("TABLE_ICON_DESELECT_ALL");
		} else if (oElement == this._selectAllCheckBox) {
			mAriaProps.label = Library.getResourceBundleFor("sap.m").getText("TABLE_CHECKBOX_SELECT_ALL");
		}
	};

	/*
	 * Returns the number of <th> elements
	 * @protected
	 */
	Table.prototype.getColCount = function() {
		return this._colCount || 0;
	};

	/*
	 * Returns whether the dummy column should be rendered.
	 * @protected
	 */
	Table.prototype.shouldRenderDummyColumn = function() {
		return Boolean(this._dummyColumn);
	};

	/*
	 * Returns whether or not the table is in pop-in mode
	 * @protected
	 */
	Table.prototype.hasPopin = function() {
		return Boolean(this._hasPopin);
	};

	/*
	 * Returns whether or not the type column should be rendered
	 * @protected
	 */
	Table.prototype.doItemsNeedTypeColumn = function() {
		return Boolean(this._iItemNeedsTypeColumn);
	};

	/*
	 * Returns whether the header row is rendered or not
	 * @protected
	 */
	Table.prototype.hasHeaderRow = function() {
		return !this._headerHidden;
	};

	/*
	 * Returns whether given event is initialized within header row or not
	 * @protected
	 */
	Table.prototype.isHeaderRowEvent = function(oEvent) {
		var $Header = this.$("tblHeader");
		return !!jQuery(oEvent.target).closest($Header, this.getTableDomRef()).length;
	};

	/*
	 * Returns whether give event is initialized within footer row or not
	 * @protected
	 */
	Table.prototype.isFooterRowEvent = function(oEvent) {
		var $Footer = this.$("tblFooter");
		return !!jQuery(oEvent.target).closest($Footer, this.getTableDomRef()).length;
	};

	// returns accessibility role
	Table.prototype.getAccessibilityType = function() {
		return Library.getResourceBundleFor("sap.m").getText("TABLE_ROLE_DESCRIPTION");
	};

	Table.prototype.getAccessbilityPosition = function(oItem) {
		var mPosition = ListBase.prototype.getAccessbilityPosition.apply(this, arguments);
		if (oItem) {
			mPosition.posinset += !this._headerHidden;
		}
		if (mPosition.setsize != -1) {
			mPosition.setsize += !this._headerHidden + !!this._hasFooter;
		}
		return mPosition;
	};

	Table.prototype._setHeaderAnnouncement = function() {
		var oBundle = Library.getResourceBundleFor("sap.m"),
			sAnnouncement = oBundle.getText("ACC_CTR_TYPE_HEADER_ROW") + " ";

		if (this.getMultiSelectMode() !== "ClearAll" && this.isAllSelectableSelected()) {
			sAnnouncement += oBundle.getText("LIST_ALL_SELECTED");
		}

		this.getColumns(true).forEach(function(oColumn, i) {
			if (!oColumn.getVisible() || oColumn.isHidden()) {
				return;
			}

			var oHeader = oColumn.getHeader();
			if (oHeader && oHeader.getVisible()) {
				sAnnouncement += ListItemBase.getAccessibilityText(oHeader, false /* bDetectEmpty */, true /* bHeaderAnnouncement */) + " . ";
			}
		});

		this.updateInvisibleText(sAnnouncement);
	};

	Table.prototype._setFooterAnnouncement = function() {
		var sAnnouncement = Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_FOOTER_ROW") + " ";
		this.getColumns(true).forEach(function(oColumn, i) {
			if (!oColumn.getVisible() || oColumn.isHidden()) {
				return;
			}

			var oFooter = oColumn.getFooter();
			if (oFooter && oFooter.getVisible()) {
				// announce header as well
				var oHeader = oColumn.getHeader();
				if (oHeader && oHeader.getVisible()) {
					sAnnouncement += ListItemBase.getAccessibilityText(oHeader) + " ";
				}

				sAnnouncement += ListItemBase.getAccessibilityText(oFooter) + " ";
			}
		});

		this.updateInvisibleText(sAnnouncement);
	};

	Table.prototype._setNoColumnsMessageAnnouncement = function (oTarget) {
		if (!this.shouldRenderItems()) {
			var oNoData = this.getNoData();
			var sDescription = Library.getResourceBundleFor("sap.m").getText("TABLE_NO_COLUMNS");
			if (oNoData && typeof oNoData !== "string" && oNoData.isA("sap.m.IllustratedMessage")) {
				sDescription = ListItemBase.getAccessibilityText(this.getAggregation("_noColumnsMessage"));
			}
			this.updateInvisibleText(sDescription, oTarget);
		}
	};

	// keyboard handling
	Table.prototype.onsapspace = Table.prototype.onsapenter = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}

		if (oEvent.target.id == this.getId("tblHeader") || oEvent.target.id == this.getId("tblHeadModeCol")) {
			// prevent from scrolling
			oEvent.preventDefault();
			oEvent.setMarked();

			// toggle select all header checkbox and fire its event
			var sMultiSelectMode = this.getMultiSelectMode();
			if (this._selectAllCheckBox && sMultiSelectMode != "ClearAll") {
				this._selectAllCheckBox.setSelected(!this._selectAllCheckBox.getSelected()).fireSelect();
			} else if (this._clearAllButton && sMultiSelectMode == "ClearAll" && !this._clearAllButton.hasStyleClass("sapMTableDisableClearAll")) {
				this._clearAllButton.firePress();
			}
		}
	};

	// Handle shift-tab key
	Table.prototype.onsaptabprevious = function(oEvent) {
		if (oEvent.target.id === this.getId("overlay")) {
			this._bIgnoreFocusIn = true;
			this.$().attr("tabindex", "-1").trigger("focus").removeAttr("tabindex");
		} else {
			ListBase.prototype.onsaptabprevious.apply(this, arguments);
		}
	};

	/**
	 * Sets the focus on the stored focus DOM reference.
	 *
	 * If <code>oFocusInfo.targetInfo</code> is of type {@link sap.ui.core.message.Message},
	 * the focus will be set as accurately as possible according to the information provided by {@link sap.ui.core.message.Message}.
	 *
	 * @param {object} [oFocusInfo={}] Options for setting the focus
	 * @param {boolean} [oFocusInfo.preventScroll=false] @since 1.60 If set to <code>true</code>, the focused
	 *   element won't be moved into the viewport if it's not completely visible before the focus is set
	 * @param {any} [oFocusInfo.targetInfo] @since 1.98 Further control-specific setting of the focus target within the control
	 * @public
	 */
	Table.prototype.focus = function(oFocusInfo) {
		this._oFocusInfo = oFocusInfo;
		ListBase.prototype.focus.apply(this, arguments);
		delete this._oFocusInfo;
	};

	Table.prototype.getFocusDomRef = function() {
		var bHasMessage = this._oFocusInfo && this._oFocusInfo.targetInfo && BaseObject.isObjectA(this._oFocusInfo.targetInfo, "sap.ui.core.message.Message");

		if (bHasMessage) {
			var $TblHeader = this.$("tblHeader");
			var $VisibleColumns = $TblHeader.find(".sapMListTblCell:visible");

			if ($VisibleColumns.length) {
				return $TblHeader[0];
			}

			var $NoData = this.$("nodata");
			if ($NoData.length) {
				return $NoData[0];
			}
		}

		return ListBase.prototype.getFocusDomRef.apply(this, arguments);
	};

	Table.prototype.onfocusin = function(oEvent) {
		var oTarget = oEvent.target;
		if (oTarget.id == this.getId("tblHeader")) {
			this._setHeaderAnnouncement();
			this._setFirstLastVisibleCells(oTarget);
		} else if (oTarget.id == this.getId("tblFooter")) {
			this._setFooterAnnouncement();
			this._setFirstLastVisibleCells(oTarget);
		} else if (oTarget.id == this.getId("nodata")) {
			this._setFirstLastVisibleCells(oTarget);
		} else if (!this._bIgnoreFocusIn && this.getShowOverlay()) {
			this._bIgnoreFocusIn = true;
			this.$("overlay").trigger("focus");
		}

		ListBase.prototype.onfocusin.call(this, oEvent);
		this._setNoColumnsMessageAnnouncement(oTarget);
	};

	// event listener for theme changed
	Table.prototype.onThemeChanged = function() {
		ListBase.prototype.onThemeChanged.call(this);
		if (this._bCheckLastColumnWidth) {
			this._checkLastColumnWidth();
		}
	};

	/**
	 * Handles paste event and fires Paste event of the Table, so that it can be used in the application
	 * @private
	 * @param oEvent - browser paste event that occurs when a user pastes the data from the clipboard into the table
	 */
	Table.prototype.onpaste = function(oEvent) {

		// Check whether the paste event is already handled by input enabled control and avoid pasting into this input-enabled control when focus is in there.
		if (oEvent.isMarked() || (/^(input|textarea)$/i.test(document.activeElement.tagName)) /*see DINC0096526*/) {
			return;
		}

		// Get the data from the PasteHelper utility in format of 2D Array
		var aData = PasteHelper.getPastedDataAs2DArray(oEvent.originalEvent);
		if (!aData || aData.length === 0 /* no rows pasted */ || aData[0].length === 0 /* no columns pasted */) {
			return; // no pasted data
		}

		//var oRow = sap.ui.getCore().byId(jQuery(oEvent.target).closest(".sapMLIB").attr("id"));
		this.firePaste({data: aData});
	};

	Table.prototype.ondragenter = function(oEvent) {
		var oDragSession = oEvent.dragSession;
		if (!oDragSession || !oDragSession.getDropControl() || !oDragSession.getDropControl().isA("sap.m.Column")) {
			return;
		}

		oDragSession.setIndicatorConfig({
			height: this.getTableDomRef().clientHeight
		});
	};

	/**
	 * Function for configuring the autoPopinMode of the table control.
	 *
	 * @private
	 */
	Table.prototype._configureAutoPopin = function() {
		if (!this.getAutoPopinMode()) {
			return;
		}

		var aVisibleColumns = this.getColumns(true).filter(function(oColumn) {
			return oColumn.getVisible();
		});
		if (!aVisibleColumns.length) {
			return;
		}

		var aItems = this.getItems();
		var mPrioColumns = {
			High: [],
			Medium: [],
			Low: []
		};

		aVisibleColumns.forEach(function(oColumn) {
			var sImportance = oColumn.getImportance();
			if (sImportance === "None") {
				sImportance = "Medium";
			}
			mPrioColumns[sImportance].push(oColumn);
		});

		var aPrioColumns = Object.values(mPrioColumns);
		var oMostImportantColumn = aPrioColumns.find(String)[0];

		aPrioColumns.reduce(function(fTotalWidth, aColumns) {
			return Table._updateAccumulatedWidth(aColumns, oMostImportantColumn, fTotalWidth);
		}, this._getInitialAccumulatedWidth(aItems));
	};

	/**
	 * Returns the sum of internal columns that are created by the table like "Mode" & "Type" as a float value.
	 * This is required for accurately calculating the <code>minScreenWidth</code> property of the columns when the <code>autoPopinMode=true</code>.
	 *
	 * @param {sap.m.ColumnListItem[]} aItems - table items
	 * @returns {float} initial accumulated width
	 * @private
	 */
	Table.prototype._getInitialAccumulatedWidth = function(aItems) {
		// check if table has inset
		var iInset = this.getInset() ? 4 : 0;

		var $this = this.$(),
			iThemeDensityWidth = 3;

		if ($this.closest(".sapUiSizeCompact").length || jQuery(document.body).hasClass("sapUiSizeCompact")) {
			iThemeDensityWidth = 2;
		} else {
			var bThemeDensityWidthFound = false;
			$this.find(".sapMTableTH[aria-hidden=true]:not(.sapMListTblHighlightCol):not(.sapMListTblDummyCell):not(.sapMListTblNavigatedCol)").get().forEach(function(oTH) {
				var iWidth = jQuery(oTH).width();
				if (!bThemeDensityWidthFound && iWidth > 0) {
					iThemeDensityWidth = iWidth / parseFloat(library.BaseFontSize);
					bThemeDensityWidthFound = true;
				}
			});
		}

		// check if selection control is available
		var iSelectionWidth = ListBaseRenderer.ModeOrder[this.getMode()] ? iThemeDensityWidth : 0;

		// check if actions are available on the item
		var iActionWidth = aItems.some(function(oItem) {
			var sType = oItem.getType();
			return sType === "Detail" || sType === "DetailAndActive" || sType === "Navigation";
		}) ? iThemeDensityWidth : 0;

		// borders = ~0.25rem
		return iInset + iSelectionWidth + iActionWidth + 0.25;
	};

	/**
	 * Updates the <code>demandPopin</code> and <code>minScreenWidth</code> on the columns
	 *
	 * @param {array} aColumns - Array of sap.m.Column[] all with the same importance
	 * @param {sap.m.Column} oMostImportantColumn - skip demandPopin and minScreenWidth for the most importance column
	 * @param {float} fAccumulatedWidth - start point for the new  calculated fAccumulatedWidth
	 * @returns {float} new calculated fAccumulatedWidth
	 * @private
	 */
	Table._updateAccumulatedWidth = function(aColumns, oMostImportantColumn, fAccumulatedWidth) {
		aColumns.forEach(function(oColumn) {
			var sWidth = oColumn.getWidth();
			var sUnit = sWidth.replace(/[^a-z]/ig, "");
			var sBaseFontSize = parseFloat(library.BaseFontSize) || 16;

			// check for column width unit
			if (sUnit === "px") {
				// column has a fixed width -> convert column width from px into float rem value
				fAccumulatedWidth += parseFloat(sWidth) / sBaseFontSize;
			} else if (sUnit === "em" || sUnit === "rem") {
				// column has a fixed width -> convert to float in any case to get only the column width value
				fAccumulatedWidth += parseFloat(sWidth);
			} else {
				// column has a flexible width, such as % or auto, so we use autoPopinWidth property for the calculation
				fAccumulatedWidth += oColumn.getAutoPopinWidth();
			}

			oColumn.setDemandPopin(oColumn !== oMostImportantColumn);
			oColumn.setMinScreenWidth(oColumn !== oMostImportantColumn ? parseFloat(fAccumulatedWidth).toFixed(2) + "rem" : "");
		});

		return fAccumulatedWidth;
	};

	Table.prototype._getHiddenInPopin = function() {
		return this._getPopins().filter(function(oPopin) {
			return !oPopin.isPopin();
		});
	};

	Table.prototype._getVisiblePopin = function() {
		return this._getPopins().filter(function(oPopin) {
			return oPopin.isPopin();
		});
	};

	Table.prototype._getPopins = function() {
		return this.getColumns().filter(function(oColumn) {
			return oColumn.getVisible() && oColumn.getDemandPopin() && oColumn.isHidden();
		});
	};

	Table.prototype._firePopinChangedEvent = function() {
		this._bFirePopinChanged = false;
		this._iVisibleItemsLength = this.getVisibleItems().length;
		this.fireEvent("popinChanged", {
			hasPopin: this.hasPopin(),
			visibleInPopin: this._getVisiblePopin(),
			hiddenInPopin: this._getHiddenInPopin()
		});
	};

	Table.prototype._fireUpdateFinished = function(oInfo) {
		ListBase.prototype._fireUpdateFinished.apply(this, arguments);

		// handle the select all checkbox state
		this.updateSelectAllCheckbox();

		// after binding update we need to update the aria-rowcount
		var oNavigationRoot = this.getNavigationRoot();
		if (oNavigationRoot) {
			oNavigationRoot.setAttribute("aria-rowcount", this.getAccessbilityPosition().setsize);
		}

		// fire popinChanged when visible items length become 0 from greater than 0 as a result of binding changes
		// fire popinChanged when visible items length become greater than 0 from 0 as a result of binding changes
		var bHasVisibleItems = Boolean(this.getVisibleItems().length);
		var bHadVisibleItems = Boolean(this._iVisibleItemsLength);
		if (bHasVisibleItems ^ bHadVisibleItems) {
			this._firePopinChangedEvent();
		}
	};

	// this gets called when the focus is on the item or its content
	Table.prototype.onItemFocusIn = function(oItem, oFocusedControl) {
		ListBase.prototype.onItemFocusIn.apply(this, arguments);

		if (oItem != oFocusedControl || !ControlBehavior.isAccessibilityEnabled()) {
			return;
		}

		this._setFirstLastVisibleCells(oItem.getDomRef());
	};

	Table.prototype._setFirstLastVisibleCells = function(oDomRef, bIgnoreClassCheck) {
		var $DomRef = jQuery(oDomRef);
		if (!bIgnoreClassCheck && !$DomRef.hasClass("sapMTableRowCustomFocus")) {
			return;
		}

		$DomRef.find(".sapMTblLastVisibleCell").removeClass("sapMTblLastVisibleCell");
		$DomRef.find(".sapMTblFirstVisibleCell").removeClass("sapMTblFirstVisibleCell");
		for (var oFirst = oDomRef.firstChild; oFirst && !oFirst.clientWidth; oFirst = oFirst.nextSibling) {/* empty */}
		for (var oLast = oDomRef.lastChild.classList.contains("sapMListTblDummyCell") ? oDomRef.lastChild.previousSibling : oDomRef.lastChild; oLast && !oLast.clientWidth; oLast = oLast.previousSibling) {/* empty */}
		jQuery(oFirst).addClass("sapMTblFirstVisibleCell");
		jQuery(oLast).addClass("sapMTblLastVisibleCell");
		var $Next = $DomRef.next();
		if ($Next.attr("id") == $DomRef.attr("id") + "-sub") {
			this._setFirstLastVisibleCells($Next[0], true);
		}
	};

	Table.prototype.getAriaRole = function() {
		return "grid";
	};

	Table.prototype._updateAriaRowCount = function() {
		var oNavigationRoot = this.getNavigationRoot();
		if (!oNavigationRoot) {
			return;
		}

		var iAriaRowCount = this.getAccessbilityPosition().setsize;
		oNavigationRoot.setAttribute("aria-rowcount", iAriaRowCount);
	};

	/**
	 * Checks whether the given value is of the proper type for the given aggregation name.
	 * Logs an error if the given type does not belong to ListItemBase
	 *
	 * @param {string} sAggregationName the name of the aggregation
	 * @param {sap.ui.base.ManagedObject|any} oObject the aggregated object or a primitive value
	 * @param {boolean} bMultiple whether the caller assumes the aggregation to have cardinality 0..n
	 * @return {sap.ui.base.ManagedObject|any} the passed object
	 *
	 */
	Table.prototype.validateAggregation = function(sAggregationName, oObject, bMultiple) {
		var oResult = ListBase.prototype.validateAggregation.apply(this, arguments);

		if (sAggregationName === "items" && !BaseObject.isObjectA(oObject, "sap.m.ITableItem")) { // UI5 2.0
			throw Error(oObject + " is not a valid items aggregation of " + this + ". Items aggregation in ResponsiveTable control only supports ITableItem.");
		}

		return oResult;
	};

	// items and groupHeader mapping is not required for the table control
	Table.prototype.setLastGroupHeader = function() {};

	return Table;

});

/*!
 * ${copyright}
 */

// Provides control sap.m.Table.
sap.ui.define([
	"sap/ui/core/Core",
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
	// jQuery custom selectors ":sapTabbable"
	"sap/ui/dom/jquery/Selectors"
],
	function(Core, library, ListBase, ListItemBase, CheckBox, TableRenderer, BaseObject, ResizeHandler, PasteHelper, jQuery, ListBaseRenderer, Icon, Util) {
	"use strict";


	// shortcut for sap.m.ListKeyboardMode
	var ListKeyboardMode = library.ListKeyboardMode;

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
	 * The <code>sap.m.Table</code> control provides a set of sophisticated and convenience functions for responsive table design.
	 *
	 * To render the <code>sap.m.Table</code> control properly, the order of the <code>columns</code> aggregation should match with the order of the <code>cells</code> aggregation (<code>sap.m.ColumnListItem</code>).
	 *
	 * The <code>sap.m.Table</code> control requires at least one visible <code>sap.m.Column</code> in the <code>columns</code> aggregation, therefore applications must avoid configuring all columns to be shown in the pop-in.
	 * If such a conflict is detected, then the table prevents one column from moving to the pop-in.
	 *
	 * For mobile devices, the recommended limit of table rows is 100 (based on 4 columns) to assure proper performance. To improve initial rendering of large tables, use the <code>growing</code> feature.
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Table = ListBase.extend("sap.m.Table", /** @lends sap.m.Table.prototype */ { metadata : {

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
	}});

	// class name for the navigation items
	Table.prototype.sNavItemClass = "sapMListTblRow";

	Table.prototype.init = function() {
		this._iItemNeedsColumn = 0;
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

		this._bHasDynamicWidthCol = this._hasDynamicWidthColumn();

		if (this.getAutoPopinMode()) {
			this._configureAutoPopin();
		}

		// for initial contextualWidth setting
		this._applyContextualWidth(this._sContextualWidth);

		this._ensureColumnsMedia();
		this._notifyColumns("ItemsRemoved");
	};

	/*
	 * Returns whether a visible column has dynamic width or not
	 * @protected
	 */
	Table.prototype._hasDynamicWidthColumn = function(oColumn, sColumnWidth) {
		if (this.getFixedLayout() != "Strict") {
			return true;
		}

		return this.getColumns().some(function(oCurrentColumn) {
			if (oCurrentColumn.getVisible() && !oCurrentColumn.isPopin()) {
				var sWidth = oColumn && oColumn == oCurrentColumn ? sColumnWidth : oCurrentColumn.getWidth();
				return !sWidth || sWidth == "auto";
			}
		});
	};

	Table.prototype._ensureColumnsMedia = function() {
		this.getColumns().forEach(function (oColumn) {
			if (oColumn._bShouldAddMedia) {
				oColumn._addMedia();
			}
		});
	};

	Table.prototype.onAfterRendering = function() {
		ListBase.prototype.onAfterRendering.call(this);
		this.updateSelectAllCheckbox();
		this._renderOverlay();

		if (this._bFirePopinChanged) {
			this._firePopinChangedEvent();
			this._bFirePopinChanged = false;
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

		if (this._bCheckLastColumnWidth && Core.isThemeApplied()) {
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

	Table.prototype._renderOverlay = function() {
		var $this = this.$(),
			$overlay = $this.find(".sapMTableOverlay"),
			bShowOverlay = this.getShowOverlay();
		if (bShowOverlay && $overlay.length === 0) {
			$overlay = jQuery("<div>").addClass("sapUiOverlay sapMTableOverlay").css("z-index", "1");
			$this.append($overlay);
		} else if (!bShowOverlay) {
			$overlay.remove();
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
			$this.find(".sapMListTblCell:visible").eq(0).addClass("sapMTableLastColumn").width("");
		}

		this._bCheckLastColumnWidth = false;
	};

	Table.prototype.setShowOverlay = function(bShow) {
		this.setProperty("showOverlay", bShow, true);
		this._renderOverlay();
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

	Table.prototype.removeAllItems = function() {
		this._notifyColumns("ItemsRemoved");
		return ListBase.prototype.removeAllItems.apply(this, arguments);
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
	 * @param {boolean} [bSort] set true to get the columns in an order that respects personalization settings
	 * @returns {sap.m.Column[]} columns of the Table
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
	 * This hook method is called if growing feature is enabled and after new page loaded
	 * @override
	 */
	Table.prototype.onBeforePageLoaded = function() {
		if (this.getAlternateRowColors()) {
			this._sAlternateRowColorsClass = this._getAlternateRowColorsClass();
		}

		ListBase.prototype.onBeforePageLoaded.apply(this, arguments);
	};

	/*
	 * This hook method is called if growing feature is enabled and after new page loaded
	 * @override
	 */
	Table.prototype.onAfterPageLoaded = function() {
		this.updateSelectAllCheckbox();
		if (this.getAlternateRowColors() && this._sAlternateRowColorsClass != this._getAlternateRowColorsClass()) {
			var $tblBody = this.$("tblBody").removeClass(this._sAlternateRowColorsClass);
			$tblBody.addClass(this._getAlternateRowColorsClass());
		}

		ListBase.prototype.onAfterPageLoaded.apply(this, arguments);
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
		this._iItemNeedsColumn += (bNeedsTypeColumn ? 1 : -1);

		// update type column visibility
		if (this._iItemNeedsColumn == 1 && bNeedsTypeColumn) {
			this._setTypeColumnVisibility(true);
		} else if (this._iItemNeedsColumn == 0) {
			this._setTypeColumnVisibility(false);
		}
	};

	// this gets called when selected property of the item is changed
	Table.prototype.onItemSelectedChange = function(oItem, bSelect) {
		ListBase.prototype.onItemSelectedChange.apply(this, arguments);
		setTimeout(function() {
			this.updateSelectAllCheckbox();
		}.bind(this), 0);
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

	/*
	 * Sets DOM References for keyboard navigation
	 * @override
	 */
	Table.prototype.setNavigationItems = function(oItemNavigation) {
		var $Header = this.$("tblHeader");
		var $Footer = this.$("tblFooter");
		var $Rows = this.$("tblBody").children(".sapMLIB");

		var aItemDomRefs = $Header.add($Rows).add($Footer).get();
		oItemNavigation.setItemDomRefs(aItemDomRefs);

		// header and footer are in the item navigation but
		// initial focus should be at the first item row
		if (oItemNavigation.getFocusedIndex() == -1) {
			if (this.getGrowing() && this.getGrowingDirection() == ListGrowingDirection.Upwards) {
				oItemNavigation.setFocusedIndex(aItemDomRefs.length - 1);
			} else {
				oItemNavigation.setFocusedIndex($Header[0] ? 1 : 0);
			}
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
		var oMenu = oColumn.getColumnHeaderMenu();
		oMenu && oMenu.openBy(oColumn);
		(this.bActiveHeaders || oMenu) && this.fireEvent("columnPress", {
			column: oColumn
		});
	};

	/*
	 * This method is called asynchronously if resize event comes from column
	 * @protected
	 */
	Table.prototype.onColumnResize = function(oColumn) {
		// if list did not have pop-in and will not have pop-in
		// then we do not need re-render, we can just change display of column
		if (!this.hasPopin() && !this._mutex) {
			var hasPopin = this.getColumns().some(function(col) {
				return col.isPopin();
			});

			if (!hasPopin) {
				oColumn.setDisplay(this.getTableDomRef(), !oColumn.isHidden());
				this._firePopinChangedEvent();
				this._oGrowingDelegate && this._oGrowingDelegate.adaptTriggerButtonWidth(this);
				return;
			}
		}

		this._dirty = this._getMediaContainerWidth() || window.innerWidth;
		if (!this._mutex) {
			var clean = this._getMediaContainerWidth() || window.innerWidth;
			this._mutex = true;
			this._bFirePopinChanged = true;
			this.rerender();

			// do not re-render if resize event comes so frequently
			setTimeout(function() {
				// but check if any event come during the wait-time
				if (this._dirty != clean) {
					this._dirty = 0;
					this._bFirePopinChanged = true;
					this.rerender();
				}
				this._mutex = false;
			}.bind(this), 200);
		}
	};

	/*
	 * This method is called from Column control when column visibility is changed via CSS media query
	 *
	 * @param {boolean} bColVisible whether column is now visible or not
	 * @protected
	 */
	Table.prototype.setTableHeaderVisibility = function(bColVisible) {
		if (!this.getDomRef()) {
			return;
		}

		if (!this.shouldRenderItems()) {
			return this.invalidate();
		}

		// find first visible column
		var $headRow = this.$("tblHeader"),
			bHeaderVisible = !$headRow.hasClass("sapMListTblHeaderNone"),
			aVisibleColumns = $headRow.find(".sapMListTblCell:visible"),
			$firstVisibleCol = aVisibleColumns.eq(0);

		// check if only one column is visible
		if (aVisibleColumns.length == 1) {
			if (this.getFixedLayout() == "Strict") {
				this._checkLastColumnWidth();
			} else {
				$firstVisibleCol.width("");	// cover the space
			}
		} else {
			$firstVisibleCol.removeClass("sapMTableLastColumn");
			// set original width of columns
			aVisibleColumns.each(function() {
				this.style.width = this.getAttribute("data-sap-width") || "";
			});
		}

		// update the visible column count and colspan
		// highlight, navigation and navigated indicator columns are getting rendered always
		this._colCount = aVisibleColumns.length + 3 + !!ListBaseRenderer.ModeOrder[this.getMode()];
		this.$("tblBody").find(".sapMGHLICell").attr("colspan", this.getColSpan());
		this.$("nodata-text").attr("colspan", this.getColCount());

		if (this.hasPopin()) {
			this.$("tblBody").find(".sapMListTblSubRowCell").attr("colspan", this.getColSpan());
		}

		// remove or show column header row(thead) according to column visibility value
		if (!bColVisible && bHeaderVisible) {
			$headRow[0].className = "sapMListTblRow sapMLIBFocusable sapMListTblHeader";
			this._headerHidden = false;
		} else if (bColVisible && !bHeaderVisible && !aVisibleColumns.length) {
			$headRow[0].className = "sapMListTblHeaderNone";
			this._headerHidden = true;
		}
	};

	// updates the type column visibility and sets the aria flag
	Table.prototype._setTypeColumnVisibility = function(bVisible) {
		jQuery(this.getTableDomRef()).toggleClass("sapMListTblHasNav", bVisible);
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
				tooltip: Core.getLibraryResourceBundle("sap.m").getText("TABLE_CLEARBUTTON_TOOLTIP"),
				decorative: false,
				press: this.removeSelections.bind(this, false, true, false)
			}).setParent(this, null, true).addEventDelegate({
				onAfterRendering: function() {
					this._clearAllButton.getDomRef().setAttribute("tabindex", -1);
				}
			}, this);
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
				activeHandling: false
			}).addStyleClass("sapMLIBSelectM").setParent(this, null, true).attachSelect(function () {
				if (this._selectAllCheckBox.getSelected()) {
					this.selectAll(true);
				} else {
					this.removeSelections(false, true);
				}
			}, this).setTabIndex(-1);
		}

		// prevent disabling of internal controls by the sap.ui.core.EnabledPropagator
		this._selectAllCheckBox.useEnabledPropagator(false);

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
		if (this._selectAllCheckBox && this.getMultiSelectMode() == "Default") {
			var aItems = this.getItems(),
				iSelectedItemCount = this.getSelectedItems().length,
				iSelectableItemCount = aItems.filter(function(oItem) {
					return oItem.isSelectable();
				}).length;

			// set state of the checkbox by comparing item length and selected item length
			this._selectAllCheckBox.setSelected(aItems.length > 0 && iSelectedItemCount == iSelectableItemCount);
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
			mAriaProps.label = Core.getLibraryResourceBundle("sap.m").getText("TABLE_ICON_DESELECT_ALL");
		} else if (oElement == this._selectAllCheckBox) {
			mAriaProps.label = Core.getLibraryResourceBundle("sap.m").getText("TABLE_CHECKBOX_SELECT_ALL");
		}
	};

	/*
	 * Returns colspan for all columns except navigation and navigation indicator
	 * Because we render these columns always even it is empty
	 * @protected
	 */
	Table.prototype.getColSpan = function() {
		var iInternalTDs = this.shouldRenderDummyColumn() ? 3 : 2;
		return (this._colCount || 1 ) - iInternalTDs;
	};

	/*
	 * Returns the number of total columns
	 * @protected
	 */
	Table.prototype.getColCount = function() {
		return (this._colCount || 0);
	};

	/*
	 * Returns whether the dummy column should be rendered.
	 * @protected
	 */
	Table.prototype.shouldRenderDummyColumn = function() {
		return !this._bHasDynamicWidthCol && this.shouldRenderItems();
	};

	/*
	 * Returns whether or not the table is in pop-in mode
	 * @protected
	 */
	Table.prototype.hasPopin = function() {
		return !!this._hasPopin;
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
		return Core.getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_TABLE");
	};

	Table.prototype._setHeaderAnnouncement = function() {
		var oBundle = Core.getLibraryResourceBundle("sap.m"),
			sAnnouncement = oBundle.getText("ACC_CTR_TYPE_HEADER_ROW") + " ";

		if (this.isAllSelectableSelected()) {
			sAnnouncement += oBundle.getText("LIST_ALL_SELECTED");
		}

		var aHiddenInPopin = this._getHiddenInPopin();
		this.getColumns(true).forEach(function(oColumn, i) {
			// only set the header announcement for visible columns
			if (!oColumn.getVisible() || aHiddenInPopin.indexOf(oColumn) > -1) {
				return;
			}

			var oHeader = oColumn.getHeader();
			if (oHeader && oHeader.getVisible()) {
				sAnnouncement += ListItemBase.getAccessibilityText(oHeader) + " . ";
			}
		});

		this.updateInvisibleText(sAnnouncement);
	};

	Table.prototype._setFooterAnnouncement = function() {
		var sAnnouncement = Core.getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_FOOTER_ROW") + " ";
		this.getColumns(true).forEach(function(oColumn, i) {
			// only set the footer announcement for visible columns
			if (!oColumn.getVisible()) {
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
			if (oNoData && typeof oNoData !== "string" && oNoData.isA("sap.m.IllustratedMessage")) {
				var sDescription = ListItemBase.getAccessibilityText(this.getAggregation("_noColumnsMessage"));
				this.updateInvisibleText(sDescription, oTarget);
			}
		}
	};

	// keyboard handling
	Table.prototype.onsapspace = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}

		if (oEvent.target.id == this.getId("tblHeader")) {
			// prevent from scrolling
			oEvent.preventDefault();
			var sMultiSelectMode = this.getMultiSelectMode();

			// toggle select all header checkbox and fire its event
			if (this._selectAllCheckBox && sMultiSelectMode == "Default") {
				this._selectAllCheckBox.setSelected(!this._selectAllCheckBox.getSelected()).fireSelect();
				oEvent.setMarked();
			} else if (this._clearAllButton && sMultiSelectMode == "ClearAll" && !this._clearAllButton.hasStyleClass("sapMTableDisableClearAll")) {
				this._clearAllButton.firePress();
				oEvent.setMarked();
			}
		}
	};

	// Handle tab key
	Table.prototype.onsaptabnext = function(oEvent) {
		if (oEvent.isMarked() || this.getKeyboardMode() == ListKeyboardMode.Edit) {
			return;
		}

		var $Row = jQuery();
		if (oEvent.target.id == this.getId("nodata")) {
			$Row = this.$("nodata");
		} else if (this.isHeaderRowEvent(oEvent)) {
			$Row = this.$("tblHeader");
		} else if (this.isFooterRowEvent(oEvent)) {
			$Row = this.$("tblFooter");
		}

		var oLastTabbableDomRef = $Row.find(":sapTabbable").get(-1) || $Row[0];
		if (oEvent.target === oLastTabbableDomRef) {
			this.forwardTab(true);
			oEvent.setMarked();
		}
	};

	// Handle shift-tab key
	Table.prototype.onsaptabprevious = function(oEvent) {
		if (oEvent.isMarked() || this.getKeyboardMode() == ListKeyboardMode.Edit) {
			return;
		}

		var sTargetId = oEvent.target.id;
		if (sTargetId == this.getId("nodata") ||
			sTargetId == this.getId("tblHeader") ||
			sTargetId == this.getId("tblFooter")) {
			this.forwardTab(false);
		} else if (sTargetId == this.getId("trigger")) {
			this.focusPrevious();
			oEvent.preventDefault();
		}
	};

	/**
	 * Sets the focus on the stored focus DOM reference.
	 *
	 * If {@param oFocusInfo.targetInfo} is of type {@type sap.ui.core.message.Message},
	 * the focus will be set as accurately as possible according to the information provided by {@type sap.ui.core.message.Message}.
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
		var bHasMessage = this._oFocusInfo && this._oFocusInfo.targetInfo && BaseObject.isA(this._oFocusInfo.targetInfo, "sap.ui.core.message.Message");

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
			if (!this.hasPopin() && this.shouldRenderDummyColumn()) {
				oTarget.classList.add("sapMTableRowCustomFocus");
			}
			this._setHeaderAnnouncement();
			this._setFirstLastVisibleCells(oTarget);
		} else if (oTarget.id == this.getId("tblFooter")) {
			this._setFooterAnnouncement();
			this._setFirstLastVisibleCells(oTarget);
		} else if (oTarget.id == this.getId("nodata")) {
			this._setFirstLastVisibleCells(oTarget);
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

	// returns the class that should be added to tbody element
	Table.prototype._getAlternateRowColorsClass = function() {
		if (this.isGrouped()) {
			return "sapMListTblAlternateRowColorsGrouped";
		}

		if (this.hasPopin()) {
			return "sapMListTblAlternateRowColorsPopin";
		}

		return "sapMListTblAlternateRowColors";
	};

	/**
	 * Handles paste event and fires Paste event of the Table, so that it can be used in the application
	 * @private
	 * @param oEvent - browser paste event that occurs when a user pastes the data from the clipboard into the table
	 */
	Table.prototype.onpaste = function(oEvent) {

		// Check whether the paste event is already handled by input enabled control and avoid pasting into this input-enabled control when focus is in there.
		if (oEvent.isMarked() || (/^(input|textarea)$/i.test(oEvent.target.tagName))) {
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
		// prevent recalculation when rerendering is caused when column is moved to the popin-area
		if (this._mutex) {
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

		// Inset + HighlightCol + NavigatedIndicatorCol + borders = ~0.65rem
		return iInset + iSelectionWidth + iActionWidth + 0.65;
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
				fAccumulatedWidth += parseFloat((parseFloat(sWidth).toFixed(2) / sBaseFontSize).toFixed(2));
			} else if (sUnit === "em" || sUnit === "rem") {
				// column has a fixed width -> convert to float in any case to get only the column width value
				fAccumulatedWidth += parseFloat(sWidth);
			} else {
				// column has a flexible width, such as % or auto, so we use autoPopinWidth property for the calculation
				fAccumulatedWidth += oColumn.getAutoPopinWidth();
			}

			oColumn.setDemandPopin(oColumn !== oMostImportantColumn);
			oColumn.setMinScreenWidth(oColumn !== oMostImportantColumn ? fAccumulatedWidth + "rem" : "");
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
		var aVisiblePopinColumns =  this.getColumns().filter(function(oColumn) {
			return oColumn.getVisible() && oColumn.getDemandPopin();
		});

		return aVisiblePopinColumns.filter(function(oVisibleColumn) {
			return oVisibleColumn._media && !oVisibleColumn._media.matches;
		});
	};

	Table.prototype._firePopinChangedEvent = function() {
		this.fireEvent("popinChanged", {
			hasPopin: this.hasPopin(),
			visibleInPopin: this._getVisiblePopin(),
			hiddenInPopin: this._getHiddenInPopin()
		});
	};

	Table.prototype._fireUpdateFinished = function(oInfo) {
		ListBase.prototype._fireUpdateFinished.apply(this, arguments);

		// fire popinChanged when visible items length become 0 from greater than 0 as a result of binding changes
		// fire popinChanged when visible items length become greater than 0 from 0 as a result of binding changes
		var iVisibleItemsLength = this.getVisibleItems().length;
		if (!this._iVisibleItemsLength && iVisibleItemsLength > 0) {
			this._iVisibleItemsLength = iVisibleItemsLength;
			this._firePopinChangedEvent();
		} else if (this._iVisibleItemsLength > 0 && !iVisibleItemsLength) {
			this._iVisibleItemsLength = iVisibleItemsLength;
			this._firePopinChangedEvent();
		}
	};

	// this gets called when the focus is on the item or its content
	Table.prototype.onItemFocusIn = function(oItem, oFocusedControl) {
		ListBase.prototype.onItemFocusIn.apply(this, arguments);

		if (oItem != oFocusedControl || !Core.getConfiguration().getAccessibility()) {
			return;
		}

		this._setFirstLastVisibleCells(oItem.getDomRef());
	};

	Table.prototype._setFirstLastVisibleCells = function(oDomRef) {
		var $DomRef = jQuery(oDomRef);
		if (!$DomRef.hasClass("sapMTableRowCustomFocus")) {
			return;
		}

		$DomRef.find(".sapMTblLastVisibleCell").removeClass("sapMTblLastVisibleCell");
		$DomRef.find(".sapMTblFirstVisibleCell").removeClass("sapMTblFirstVisibleCell");
		for (var oFirst = oDomRef.firstChild; oFirst && !oFirst.clientWidth; oFirst = oFirst.nextSibling) {/* empty */}
		for (var oLast = oDomRef.lastChild.previousSibling; oLast && !oLast.clientWidth; oLast = oLast.previousSibling) {/* empty */}
		jQuery(oFirst).addClass("sapMTblFirstVisibleCell");
		jQuery(oLast).addClass("sapMTblLastVisibleCell");
	};

	Table.prototype.getAriaRole = function() {
		return "";
	};

	// items and groupHeader mapping is not required for the table control
	Table.prototype.setLastGroupHeader = function() {};

	return Table;

});

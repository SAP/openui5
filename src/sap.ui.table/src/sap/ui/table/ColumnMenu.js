/*!
 * ${copyright}
 */

// Provides control sap.ui.table.ColumnMenu.
sap.ui.define([
	'./library',
	'sap/ui/unified/Menu',
	'sap/ui/unified/MenuItem',
	'sap/ui/unified/MenuTextFieldItem',
	"sap/ui/unified/MenuRenderer",
	'./utils/TableUtils',
	"sap/base/assert",
	"sap/ui/thirdparty/jquery"
],
	function(library, Menu, MenuItem, MenuTextFieldItem, MenuRenderer, TableUtils, assert, jQuery) {
	"use strict";

	/**
	 * Map from column to visibility submenu item.
	 *
	 * @type {WeakMapConstructor}
	 */
	var ColumnToVisibilitySubmenuItemMap = new window.WeakMap();

	/**
	 * Constructor for a new ColumnMenu.
	 *
	 * <b>Note:</b> Applications must not use or change the default <code>sap.ui.table.ColumnMenu</code> of
	 * a column in any way or create own instances of <code>sap.ui.table.ColumnMenu</code>.
	 * To add a custom menu to a column, use the aggregation <code>menu</code> with a new instance of
	 * <code>sap.ui.unified.Menu</code>.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The column menu provides all common actions that can be performed on a column.
	 * @extends sap.ui.unified.Menu
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.table.ColumnMenu
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) design time metamodel
	 */
	var ColumnMenu = Menu.extend("sap.ui.table.ColumnMenu", /** @lends sap.ui.table.ColumnMenu.prototype */ {
		metadata : {
			library : "sap.ui.table"
		},
		renderer: MenuRenderer
	});


	/**
	 * Initialization of the ColumnMenu control
	 * @private
	 */
	ColumnMenu.prototype.init = function() {
		if (Menu.prototype.init) {
			Menu.prototype.init.apply(this, arguments);
		}
		this.addStyleClass("sapUiTableColumnMenu");
		this._bInvalidated = true;
		this._iPopupClosedTimeoutId = null;
		this._oColumn = null;
		this._oTable = null;
	};


	/**
	 * Termination of the ColumnMenu control
	 * @private
	 */
	ColumnMenu.prototype.exit = function() {
		if (Menu.prototype.exit) {
			Menu.prototype.exit.apply(this, arguments);
		}
		window.clearTimeout(this._iPopupClosedTimeoutId);
		ColumnMenu._destroyColumnVisibilityMenuItem(this._oTable);
		this._oColumn = this._oTable = null;
	};


	/**
	 * Event handler. Called when the theme is changed.
	 * @private
	 */
	ColumnMenu.prototype.onThemeChanged = function() {
		if (this.getDomRef()) {
			this._invalidate();
		}
	};


	/**
	 * Defines this object's new parent. If no new parent is given, the parent is
	 * just unset and we assume that the old parent has removed this child from its
	 * aggregation. But if a new parent is given, this child is first removed from
	 * its old parent.
	 *
	 * @param {sap.ui.base.ManagedObject} oParent the object that becomes this object's new parent
	 * @returns {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @see {sap.ui.base.ManagedObject}
	 * @private
	 */
	ColumnMenu.prototype.setParent = function(oParent) {
		this._invalidate();
		this._updateReferences(oParent);
		return Menu.prototype.setParent.apply(this, arguments);
	};

	ColumnMenu.prototype._updateReferences = function(oParent) {
		this._oColumn = oParent;
		if (this._oColumn) {
			assert(TableUtils.isA(this._oColumn, "sap.ui.table.Column"), "ColumnMenu.setParent: parent must be a subclass of sap.ui.table.Column");

			this._oTable = this._oColumn.getParent();
			if (this._oTable) {
				assert(TableUtils.isA(this._oTable, "sap.ui.table.Table"),
					"ColumnMenu.setParent: parent of parent must be subclass of sap.ui.table.Table");
			}
		}
	};

	ColumnMenu._destroyColumnVisibilityMenuItem = function(oTable) {
		if (!oTable || !oTable._oColumnVisibilityMenuItem) {
			return;
		}
		oTable._oColumnVisibilityMenuItem.destroy();
		oTable._oColumnVisibilityMenuItem = null;
	};

	ColumnMenu.prototype._removeColumnVisibilityFromAggregation = function() {
		if (!this._oTable || !this._oTable._oColumnVisibilityMenuItem) {
			return;
		}
		this.removeAggregation("items", this._oTable._oColumnVisibilityMenuItem, true);
	};

	/**
	 * Invalidates the column menu control items. Forces recreation of the menu items when the menu is opened.
	 * @private
	 */
	ColumnMenu.prototype._invalidate = function() {
		this._removeColumnVisibilityFromAggregation();
		this.destroyItems();
		this._bInvalidated = true;
	};

	/**
	 * Override {@link sap.ui.unified.Menu#open} method.
	 * @see sap.ui.unified.Menu#open
	 * @private
	 */
	ColumnMenu.prototype.open = function() {
		if (this._bInvalidated) {
			this._bInvalidated = false;
			this._addMenuItems();
		} else if (this._oColumn) {
			this._addColumnVisibilityMenuItem();
		}

		TableUtils.Hook.call(this._oTable, TableUtils.Hook.Keys.Table.OpenMenu, TableUtils.getCellInfo(arguments[4]), this);

		if (this.getItems().length > 0) {
			this._lastFocusedDomRef = arguments[4];
			Menu.prototype.open.apply(this, arguments);
		}
	};

	/**
	 * Adds the menu items to the menu.
	 * @private
	 */
	ColumnMenu.prototype._addMenuItems = function() {
		// when you add or remove menu items here, remember to update the Column.prototype._menuHasItems function
		if (this._oColumn) {
			// items can only be created if the menus parent is a column
			// since column properties must be evaluated in order to create the items.
			this._addSortMenuItem(false);
			this._addSortMenuItem(true);
			this._addFilterMenuItem();
			this._addGroupMenuItem();
			this._addFreezeMenuItem();
			this._addColumnVisibilityMenuItem();
		}
	};

	/**
	 * Adds the sort menu item to the menu.
	 * @param {boolean} bDesc the sort direction. <code>true</code> for descending.
	 * @private
	 */
	ColumnMenu.prototype._addSortMenuItem = function(bDesc) {
		var oColumn = this._oColumn;

		if (oColumn.isSortableByMenu()) {
			var sDir = bDesc ? "desc" : "asc";
			var sIcon = bDesc ? "sort-descending" : "sort-ascending";

			this.addItem(this._createMenuItem(
				sDir,
					"TBL_SORT_" + sDir.toUpperCase(),
				sIcon,
				function(oEvent) {
					oColumn.sort(bDesc, oEvent.getParameter("ctrlKey") === true);
				}
			));
		}
	};


	/**
	 * Adds the filter menu item to the menu.
	 * @private
	 */
	ColumnMenu.prototype._addFilterMenuItem = function() {
		var oColumn = this._oColumn;

		if (oColumn.isFilterableByMenu()) {
			var oTable = oColumn.getParent();
			var bCustomFilterEnabled = oTable && oTable.getEnableCustomFilter();

			if (bCustomFilterEnabled) {
				this.addItem(this._createMenuItem(
					"filter",
					"TBL_FILTER_ITEM",
					"filter",
					function() {
						oTable.fireCustomFilter({
							column: oColumn
						});
					}
				));
			} else {
				this.addItem(this._createMenuTextFieldItem(
					"filter",
					"TBL_FILTER",
					"filter",
					oColumn.getFilterValue(),
					function() {
						oColumn.filter(this.getValue());
					}
				));
			}
		}
	};


	/**
	 * Adds the group menu item to the menu.
	 * @private
	 */
	ColumnMenu.prototype._addGroupMenuItem = function() {
		var oColumn = this._oColumn;

		if (oColumn.isGroupableByMenu()) {
			var oTable = this._oTable;

			this.addItem(this._createMenuItem(
				"group",
				"TBL_GROUP",
				null,
				function() {
					oTable.setGroupBy(oColumn);
				}
			));
		}
	};


	/**
	 * Adds the freeze menu item to the menu.
	 * @private
	 */
	ColumnMenu.prototype._addFreezeMenuItem = function() {
		var oColumn = this._oColumn;
		var oTable = this._oTable;
		var bColumnFreezeEnabled = oTable && oTable.getEnableColumnFreeze();

		if (bColumnFreezeEnabled) {
			var iColumnIndex = oColumn.getIndex();
			var bIsFixedColumn = iColumnIndex + TableUtils.Column.getHeaderSpan(oColumn) == oTable.getComputedFixedColumnCount();

			this.addItem(this._createMenuItem(
				"freeze",
				bIsFixedColumn ? "TBL_UNFREEZE" : "TBL_FREEZE",
				null,
				function() {
					// forward the event
					var bExecuteDefault = oTable.fireColumnFreeze({
						column: oColumn
					});

					// execute the column freezing
					if (bExecuteDefault) {
						if (bIsFixedColumn) {
							oTable.setFixedColumnCount(0);
						} else {
							oTable.setFixedColumnCount(iColumnIndex + 1);
						}
					}
				}
			));
		}
	};


	/**
	 * Adds the column visibility menu item to the menu.
	 * @private
	 */
	ColumnMenu.prototype._addColumnVisibilityMenuItem = function() {
		var oTable = this._oTable;

		if (oTable && oTable.getShowColumnVisibilityMenu()) {
			if (!oTable._oColumnVisibilityMenuItem || oTable._oColumnVisibilityMenuItem.bIsDestroyed) {
				oTable._oColumnVisibilityMenuItem = this._createMenuItem("column-visibilty", "TBL_COLUMNS");

				var oColumnVisibiltyMenu = new Menu(oTable._oColumnVisibilityMenuItem.getId() + "-menu");
				oTable._oColumnVisibilityMenuItem.setSubmenu(oColumnVisibiltyMenu);
			}

			this.addItem(oTable._oColumnVisibilityMenuItem);
			this._updateColumnVisibilityMenuItem();
		}
	};


	/**
	 * Factory method for the column visibility menu item.
	 * @param {sap.ui.table.Column} oColumn the associated column to the menu item.
	 * @returns {sap.ui.unified.MenuItem} the created menu item.
	 * @private
	 */
	ColumnMenu.prototype._createColumnVisibilityMenuItem = function(oColumn) {
		var oTable = this._oTable;
		var sText = TableUtils.Column.getHeaderText(oTable, oColumn.getIndex());

		return new MenuItem({
			text: sText,
			icon: oColumn.getVisible() ? "sap-icon://accept" : null,
			ariaLabelledBy: [oTable.getId() + (oColumn.getVisible() ? "-ariahidecolmenu" : "-ariashowcolmenu")],
			select: jQuery.proxy(function(oEvent) {
				var bVisible = !oColumn.getVisible();
				if (bVisible || TableUtils.getVisibleColumnCount(this._oTable) > 1) {
					var oTable = oColumn.getParent();
					var bExecuteDefault = true;
					if (TableUtils.isA(oTable, "sap.ui.table.Table")) {
						bExecuteDefault = oTable.fireColumnVisibility({
							column: oColumn,
							newVisible: bVisible
						});
					}
					if (bExecuteDefault) {
						oColumn.setVisible(bVisible);
					}
				}
			}, this)
		});
	};


	/**
	 * Factory method for a menu item.
	 * @param {string} sId the id of the menu item.
	 * @param {string} sTextI18nKey the i18n key that should be used for the menu item text.
	 * @param {string} sIcon the icon name
	 * @param {function} fHandler the handler function to call when the item gets selected.
	 * @returns {sap.ui.unified.MenuItem} the created menu item.
	 * @private
	 */
	ColumnMenu.prototype._createMenuItem = function(sId, sTextI18nKey, sIcon, fHandler) {
		return new MenuItem(this.getId() + "-" + sId, {
			text: TableUtils.getResourceText(sTextI18nKey),
			icon: sIcon ? "sap-icon://" + sIcon : null,
			select: fHandler || function() {}
		});
	};


	/**
	 * Factory method for a menu text field item.
	 * @param {string} sId the id of the menu item.
	 * @param {string} sTextI18nKey the i18n key that should be used for the menu item text.
	 * @param {string} sIcon the icon name
	 * @param {string} sValue the default value of the text field
	 * @param {function} fHandler the handler function to call when the item gets selected.
	 * @returns {sap.ui.unified.MenuTextFieldItem} the created menu text field item.
	 * @private
	 */
	ColumnMenu.prototype._createMenuTextFieldItem = function(sId, sTextI18nKey, sIcon, sValue, fHandler) {
		fHandler = fHandler || function() {};
		return new MenuTextFieldItem(this.getId() + "-" + sId, {
			label: TableUtils.getResourceText(sTextI18nKey),
			icon: sIcon ? "sap-icon://" + sIcon : null,
			value: sValue,
			select: fHandler || function() {}
		});
	};


	/**
	 * Sets a new filter value into the filter field
	 * @param {string} sValue value of the filter input field to be set
	 * @returns {this} this reference for chaining
	 * @private
	 */
	ColumnMenu.prototype._setFilterValue = function(sValue) {
		var oColumn = this.getParent();
		var oTable = (oColumn ? oColumn.getParent() : undefined);

		var oFilterField = sap.ui.getCore().byId(this.getId() + "-filter");
		if (oFilterField && oFilterField.setValue && (oTable && !oTable.getEnableCustomFilter())) {
			oFilterField.setValue(sValue);
		}
		return this;
	};

	/**
	 * Sets the value state of the filter field
	 * @param {sap.ui.core.ValueState} sFilterState value state for filter text field item
	 * @returns {this} this reference for chaining
	 * @private
	 */
	ColumnMenu.prototype._setFilterState = function(sFilterState) {
		var oColumn = this.getParent();
		var oTable = (oColumn ? oColumn.getParent() : undefined);

		var oFilterField = sap.ui.getCore().byId(this.getId() + "-filter");
		if (oFilterField && oFilterField.setValueState && (oTable && !oTable.getEnableCustomFilter())) {
			oFilterField.setValueState(sFilterState);
		}
		return this;
	};

	function getSortedColumns(oTable) {
		var aColumns = oTable.getColumns();

		if (oTable.getColumnVisibilityMenuSorter && typeof oTable.getColumnVisibilityMenuSorter === "function") {
			var oSorter = oTable.getColumnVisibilityMenuSorter();
			if (typeof oSorter === "function") {
				aColumns = aColumns.sort(oSorter);
			}
		}
		return aColumns;
	}

	// is column set to invisible by analytical metadata
	function isAnalyticalColumnInvisible(oBinding, oColumn) {
		if (oColumn.isA("sap.ui.table.AnalyticalColumn")) {
			var oQueryResult = oBinding.getAnalyticalQueryResult();
			var oEntityType = oQueryResult.getEntityType();
			var oMetadata = oBinding.getModel().getProperty("/#" + oEntityType.getTypeDescription().name + "/" + oColumn.getLeadingProperty() + "/sap:visible");

			if (oMetadata && (oMetadata.value === "false" || oMetadata.value === false)) {
				return true;
			}
		}
		return false;
	}

	ColumnMenu.prototype._updateColumnVisibilityMenuItem = function() {
		var oTable = this._oTable;
		if (!oTable || !oTable._oColumnVisibilityMenuItem) {
			return;
		}

		var oSubmenu = oTable._oColumnVisibilityMenuItem.getSubmenu();
		if (!oSubmenu){
			return;
		}

		var aColumns = getSortedColumns(oTable);
		var aSubmenuItems = oSubmenu.getItems();
		var aVisibleColumns = oTable._getVisibleColumns();
		var oBinding = oTable.getBinding();
		var bAnalyticalBinding = TableUtils.isA(oBinding, "sap.ui.model.analytics.AnalyticalBinding");

		for (var i = 0; i < aColumns.length; i++) {
			var oColumn = aColumns[i];

			if (bAnalyticalBinding) {
				if (isAnalyticalColumnInvisible(oBinding, oColumn)) {
					continue;
				}
			}

			var oItem = ColumnToVisibilitySubmenuItemMap.get(oColumn);

			if (!oItem || oItem.bIsDestroyed) {
				var oItem = this._createColumnVisibilityMenuItem(oColumn);
				oSubmenu.insertItem(oItem, i);
				ColumnToVisibilitySubmenuItemMap.set(oColumn, oItem);
			} else {
				var iIndex = aSubmenuItems.indexOf(oItem);
				if (i !== iIndex) {
					oSubmenu.removeItem(oItem);
					oSubmenu.insertItem(oItem, i);
				}
			}

			var bVisible = aVisibleColumns.indexOf(oColumn) > -1;
			var sIcon = bVisible ? "sap-icon://accept" : "";
			aSubmenuItems = oSubmenu.getItems();
			aSubmenuItems[i].setProperty("icon", sIcon);
			aSubmenuItems[i].setEnabled(!bVisible || aVisibleColumns.length > 1);
			aSubmenuItems[i].removeAllAriaLabelledBy();
			aSubmenuItems[i].addAriaLabelledBy(oTable.getId() + (bVisible ? "-ariahidecolmenu" : "-ariashowcolmenu"));
		}

		for (var i = aSubmenuItems.length; i > aColumns.length; i--) {
			aSubmenuItems[i - 1].destroy();
		}
	};

	return ColumnMenu;

});
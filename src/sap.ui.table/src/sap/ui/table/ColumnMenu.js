/*!
 * ${copyright}
 */

// Provides control sap.ui.table.ColumnMenu.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/RenderManager', './library', 'sap/ui/unified/Menu', 'sap/ui/unified/MenuItem', 'sap/ui/unified/MenuTextFieldItem', 'sap/ui/Device', './TableUtils'],
	function(jQuery, RenderManager, library, Menu, MenuItem, MenuTextFieldItem, Device, TableUtils) {
	"use strict";

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
		renderer: "sap.ui.unified.MenuRenderer"
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
		this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.table");
		this._bInvalidated = true;
		this._iPopupClosedTimeoutId = null;
		this._oColumn = null;
		this._oTable = null;
		this._attachPopupClosed();
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
		this._detachEvents();
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
	 * @see {sap.ui.base.ManagedObject}
	 *
	 * @return {sap.ui.base.ManagedObject}
	 *            Returns <code>this</code> to allow method chaining
	 * @private
	 */
	ColumnMenu.prototype.setParent = function(oParent) {
		this._detachEvents();
		this._invalidate();
		this._updateReferences(oParent);
		this._attachEvents();
		return Menu.prototype.setParent.apply(this, arguments);
	};

	ColumnMenu.prototype._updateReferences = function(oParent) {
		this._oColumn = oParent;
		if (oParent) {
			jQuery.sap.assert(TableUtils.isInstanceOf(oParent, "sap/ui/table/Column"), "ColumnMenu.setParent: parent must be a subclass of sap.ui.table.Column");

			this._oTable = this._oColumn.getParent();
			if (this._oTable) {
				jQuery.sap.assert(TableUtils.isInstanceOf(this._oTable, "sap/ui/table/Table"), "ColumnMenu.setParent: parent of parent must be subclass of sap.ui.table.Table");
			}
		}
	};


	/**
	 * Attaches the required event handlers.
	 * @private
	 */
	ColumnMenu.prototype._attachEvents = function() {
		if (this._oTable) {
			this._oTable.attachColumnVisibility(this._invalidate, this);
			this._oTable.attachColumnMove(this._invalidate, this);
		}
	};


	/**
	 * Detaches the required event handlers.
	 * @private
	 */
	ColumnMenu.prototype._detachEvents = function() {
		if (this._oTable) {
			this._oTable.detachColumnVisibility(this._invalidate, this);
			this._oTable.detachColumnMove(this._invalidate, this);
		}
	};

	/**
	 * Invalidates the column menu control items. Forces recreation of the menu items when the menu is opened.
	 * @private
	 */
	ColumnMenu.prototype._invalidate = function() {
		this._bInvalidated = true;
	};

	/**
	 * Invalidates the column menu control items and refreshes the loaded language bundle.
	 * @private
	 */
	ColumnMenu.prototype._updateResourceBundle = function() {
		this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.table");
		this._invalidate();
	};

	/**
	 * Special handling for IE < 9 when the popup is closed.
	 * The associated column of the menu is focused when the menu is closed.
	 * @private
	 */
	ColumnMenu.prototype._attachPopupClosed = function() {
		// put the focus back into the column header after the
		// popup is being closed.
		var that = this;

		if (!Device.support.touch) {
			this.getPopup().attachClosed(function() {
				that._iPopupClosedTimeoutId = window.setTimeout(function() {
					if (that._oColumn) {
						if (that._lastFocusedDomRef) {
							that._lastFocusedDomRef.focus();
						} else {
							that._oColumn.focus();
						}
					}
				}, 0);
			});
		}
	};


	/**
	 * Override {@link sap.ui.unified.Menu#open} method.
	 * @see sap.ui.unified.Menu#open
	 * @private
	 */
	ColumnMenu.prototype.open = function() {
		if (this._bInvalidated) {
			this._bInvalidated = false;
			this.destroyItems();
			this._addMenuItems();
		}

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
				function (oEvent) {
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
			var bIsFixedColumn = iColumnIndex + TableUtils.Column.getHeaderSpan(oColumn) == oTable.getFixedColumnCount();

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
			var oColumnVisibiltyMenuItem = this._createMenuItem("column-visibilty", "TBL_COLUMNS");
			this.addItem(oColumnVisibiltyMenuItem);

			var oColumnVisibiltyMenu = new Menu(oColumnVisibiltyMenuItem.getId() + "-menu");
			oColumnVisibiltyMenuItem.setSubmenu(oColumnVisibiltyMenu);

			var aColumns = oTable.getColumns();

			if (oTable.getColumnVisibilityMenuSorter && typeof oTable.getColumnVisibilityMenuSorter === "function") {
				var oSorter = oTable.getColumnVisibilityMenuSorter();
				if (typeof oSorter === "function") {
					aColumns = aColumns.sort(oSorter);
				}
			}

			var oBinding = oTable.getBinding();
			var bAnalyticalBinding = TableUtils.isInstanceOf(oBinding, "sap/ui/model/analytics/AnalyticalBinding");

			for (var i = 0, l = aColumns.length; i < l; i++) {
				var oColumn = aColumns[i];
				// skip columns which are set to invisible by analytical metadata
				if (bAnalyticalBinding && TableUtils.isInstanceOf(oColumn, "sap/ui/table/AnalyticalColumn")) {

					var oQueryResult = oBinding.getAnalyticalQueryResult();
					var oEntityType = oQueryResult.getEntityType();
					var oMetadata = oBinding.getModel().getProperty("/#" + oEntityType.getTypeDescription().name + "/" + oColumn.getLeadingProperty() + "/sap:visible");

					if (oMetadata && (oMetadata.value === "false" || oMetadata.value === false)) {
						continue;
					}
				}
				var oMenuItem = this._createColumnVisibilityMenuItem(oColumnVisibiltyMenu.getId() + "-item-" + i, oColumn);
				oColumnVisibiltyMenu.addItem(oMenuItem);
			}
		}
	};


	/**
	 * Factory method for the column visibility menu item.
	 * @param {string} sId the id of the menu item.
	 * @param {sap.ui.table.Column} oColumn the associated column to the menu item.
	 * @return {sap.ui.unified.MenuItem} the created menu item.
	 * @private
	 */
	ColumnMenu.prototype._createColumnVisibilityMenuItem = function(sId, oColumn) {

		function getLabelText(oLabel) {
			return oLabel && oLabel.getText && oLabel.getText();
		}
		var sText = oColumn.getName() || getLabelText(oColumn.getLabel());

		if (!sText) { // try the multiple labels case
			oColumn.getMultiLabels().forEach( function(oLabel, index) {
				if (TableUtils.Column.getHeaderSpan(oColumn, index) === 1) {
					sText = getLabelText(oLabel) || sText;
				}
			});
		}

		return new MenuItem(sId, {
			text: sText,
			icon: oColumn.getVisible() ? "sap-icon://accept" : null,
			select: jQuery.proxy(function(oEvent) {
				var oMenuItem = oEvent.getSource();
				var bVisible = !oColumn.getVisible();
				if (bVisible || TableUtils.getVisibleColumnCount(this._oTable) > 1) {
					var oTable = oColumn.getParent();
					var bExecuteDefault = true;
					if (oTable && TableUtils.isInstanceOf(oTable, "sap/ui/table/Table")) {
						bExecuteDefault = oTable.fireColumnVisibility({
							column: oColumn,
							newVisible: bVisible
						});
					}
					if (bExecuteDefault) {
						oColumn.setVisible(bVisible);
					}
					oMenuItem.setIcon(bVisible ? "sap-icon://accept" : null);
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
	 * @return {sap.ui.unified.MenuItem} the created menu item.
	 * @private
	 */
	ColumnMenu.prototype._createMenuItem = function(sId, sTextI18nKey, sIcon, fHandler) {
		return new MenuItem(this.getId() + "-" + sId, {
			text: this._oResBundle.getText(sTextI18nKey),
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
	 * @return {sap.ui.unified.MenuTextFieldItem} the created menu text field item.
	 * @private
	 */
	ColumnMenu.prototype._createMenuTextFieldItem = function(sId, sTextI18nKey, sIcon, sValue, fHandler) {
		fHandler = fHandler || function() {};
		return new MenuTextFieldItem(this.getId() + "-" + sId, {
			label: this._oResBundle.getText(sTextI18nKey),
			icon: sIcon ? "sap-icon://" + sIcon : null,
			value: sValue,
			select: fHandler || function() {}
		});
	};


	/**
	 * sets a new filter value into the filter field
	 * @param {String} sValue value of the filter input field to be set
	 * @return {sap.ui.table.ColumnMenu} this reference for chaining
	 * @private
	 */
	ColumnMenu.prototype._setFilterValue = function(sValue) {
		var oColumn = this.getParent();
		var oTable = (oColumn ? oColumn.getParent() : undefined);

		var oFilterField = sap.ui.getCore().byId(this.getId() + "-filter");
		if (oFilterField && (oTable && !oTable.getEnableCustomFilter())) {
			oFilterField.setValue(sValue);
		}
		return this;
	};

	/**
	 * sets a new filter value into the filter field
	 * @param {sap.ui.core.ValueState} sFilterState value state for filter text field item
	 * @return {sap.ui.table.ColumnMenu} this reference for chaining
	 * @private
	 */
	ColumnMenu.prototype._setFilterState = function(sFilterState) {
		var oColumn = this.getParent();
		var oTable = (oColumn ? oColumn.getParent() : undefined);

		var oFilterField = sap.ui.getCore().byId(this.getId() + "-filter");
		if (oFilterField && (oTable && !oTable.getEnableCustomFilter())) {
			oFilterField.setValueState(sFilterState);
		}
		return this;
	};

	return ColumnMenu;

});

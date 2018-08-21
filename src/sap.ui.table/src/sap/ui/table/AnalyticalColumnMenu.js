/*!
 * ${copyright}
 */

// Provides control sap.ui.table.AnalyticalColumnMenu.
sap.ui.define(['./ColumnMenu', './library', "sap/ui/thirdparty/jquery"],
	function(ColumnMenu, library, jQuery) {
	"use strict";

	// shortcut
	var GroupEventType = library.GroupEventType;

	/**
	 * Constructor for a new AnalyticalColumnMenu.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A column menu which is used by the analytical column
	 * @extends sap.ui.table.ColumnMenu
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @experimental Since version 1.21.
	 * The AnalyticalColumnMenu will be productized soon.
	 * @alias sap.ui.table.AnalyticalColumnMenu
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AnalyticalColumnMenu = ColumnMenu.extend("sap.ui.table.AnalyticalColumnMenu", /** @lends sap.ui.table.AnalyticalColumnMenu.prototype */ {
		metadata : {
			library : "sap.ui.table"
		},
		renderer: "sap.ui.table.ColumnMenuRenderer"
	});

	/**
	 * Adds the menu items to the menu.
	 * @private
	 */
	AnalyticalColumnMenu.prototype._addMenuItems = function() {
		// when you add or remove menu items here, remember to update the hasItems function
		ColumnMenu.prototype._addMenuItems.apply(this);
		if (this._oColumn) {
			this._addSumMenuItem();
		}
	};

	/**
	 * Adds the group menu item to the menu.
	 * @private
	 */
	AnalyticalColumnMenu.prototype._addGroupMenuItem = function() {
		var oColumn = this._oColumn,
			oTable = this._oTable;

		if (oColumn.isGroupable()) {
			this._oGroupIcon = this._createMenuItem(
				"group",
				"TBL_GROUP",
				oColumn.getGrouped() ? "accept" : null,
				function(oEvent) {
					var oMenuItem = oEvent.getSource();
					var bGrouped = oColumn.getGrouped();
					var sGroupEventType = bGrouped ? GroupEventType.group : GroupEventType.ungroup;

					oColumn.setGrouped(!bGrouped);
					oTable.fireGroup({column: oColumn, groupedColumns: oTable._aGroupedColumns, type: sGroupEventType});
					oMenuItem.setIcon(!bGrouped ? "sap-icon://accept" : null);
				}
			);
			this.addItem(this._oGroupIcon);
		}
	};

	/**
	 * Adds the group menu item to the menu.
	 * @private
	 */
	AnalyticalColumnMenu.prototype._addSumMenuItem = function() {
		var oColumn = this._oColumn,
			oTable = this._oTable,
			oBinding = oTable.getBinding("rows"),
			oResultSet = oBinding && oBinding.getAnalyticalQueryResult();

		if (oTable && oResultSet && oResultSet.findMeasureByPropertyName(oColumn.getLeadingProperty())) {
			this._oSumItem = this._createMenuItem(
				"total",
				"TBL_TOTAL",
				oColumn.getSummed() ? "accept" : null,
				jQuery.proxy(function(oEvent) {
					var oMenuItem = oEvent.getSource(),
						bSummed = oColumn.getSummed();

					oColumn.setSummed(!bSummed);
					oMenuItem.setIcon(!bSummed ? "sap-icon://accept" : null);
				}, this)
			);
			this.addItem(this._oSumItem);
		}
	};


	AnalyticalColumnMenu.prototype.open = function() {
		ColumnMenu.prototype.open.apply(this, arguments);

		var oColumn = this._oColumn;
		this._oSumItem && this._oSumItem.setIcon(oColumn.getSummed() ? "sap-icon://accept" : null);
		this._oGroupIcon && this._oGroupIcon.setIcon(oColumn.getGrouped() ? "sap-icon://accept" : null);
	};

	return AnalyticalColumnMenu;

});
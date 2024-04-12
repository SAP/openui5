/*!
 * ${copyright}
 */

// Provides control sap.ui.table.AnalyticalColumnMenu.
sap.ui.define(['./ColumnMenu', "sap/ui/unified/MenuRenderer", './utils/TableUtils', './library', "sap/ui/thirdparty/jquery"],
	function(ColumnMenu, MenuRenderer, TableUtils, library, jQuery) {
	"use strict";

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
	 * @alias sap.ui.table.AnalyticalColumnMenu
	 *
	 * @deprecated As of version 1.117, replaced by the <code>headerMenu</code> association of <code>sap.ui.table.Column</code>.
	 */
	const AnalyticalColumnMenu = ColumnMenu.extend("sap.ui.table.AnalyticalColumnMenu", /** @lends sap.ui.table.AnalyticalColumnMenu.prototype */ {
		metadata: {
			library: "sap.ui.table"
		},
		renderer: MenuRenderer
	});

	/**
	 * Adds the menu items to the menu.
	 * @private
	 */
	AnalyticalColumnMenu.prototype._addMenuItems = function() {
		// when you add or remove menu items here, remember to update the hasItems function
		ColumnMenu.prototype._addMenuItems.apply(this);
		if (this._getColumn()) {
			this._addSumMenuItem();
		}
	};

	/**
	 * Adds the group menu item to the menu.
	 * @private
	 */
	AnalyticalColumnMenu.prototype._addGroupMenuItem = function() {
		const oColumn = this._getColumn();
		const oTable = this._getTable();

		if (oColumn.isGroupableByMenu()) {
			this._oGroupIcon = this._createMenuItem(
				"group",
				"TBL_GROUP",
				oColumn.getGrouped() ? "accept" : null,
				function(oEvent) {
					const oMenuItem = oEvent.getSource();
					const bGrouped = !oColumn.getGrouped();

					if (bGrouped && !oColumn.getShowIfGrouped()) {
						let oDomRef;

						if (TableUtils.isNoDataVisible(oTable)) {
							oDomRef = oTable.getDomRef("noDataCnt");
						} else {
							oDomRef = oTable.getDomRef("rowsel0");
						}

						if (oDomRef) {
							oDomRef.focus();
						}
					}

					oColumn._setGrouped(bGrouped);
					oMenuItem.setIcon(bGrouped ? "sap-icon://accept" : null);
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
		const oColumn = this._getColumn();

		if (oColumn._isAggregatableByMenu()) {
			this._oSumItem = this._createMenuItem(
				"total",
				"TBL_TOTAL",
				oColumn.getSummed() ? "accept" : null,
				jQuery.proxy(function(oEvent) {
					const oMenuItem = oEvent.getSource();
					const bSummed = oColumn.getSummed();

					oColumn.setSummed(!bSummed);
					oMenuItem.setIcon(!bSummed ? "sap-icon://accept" : null);
				}, this)
			);
			this.addItem(this._oSumItem);
		}
	};

	AnalyticalColumnMenu.prototype.open = function() {
		ColumnMenu.prototype.open.apply(this, arguments);

		const oColumn = this._getColumn();
		this._oSumItem && this._oSumItem.setIcon(oColumn.getSummed() ? "sap-icon://accept" : null);
		this._oGroupIcon && this._oGroupIcon.setIcon(oColumn.getGrouped() ? "sap-icon://accept" : null);
	};

	return AnalyticalColumnMenu;

});
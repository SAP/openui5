/*!
 * ${copyright}
 */

sap.ui.define([
	"../utils/TableUtils",
	"sap/ui/base/Object",
	"sap/ui/base/EventProvider",
	"sap/ui/base/ManagedObjectObserver"
], function(
	TableUtils,
	BaseObject,
	EventProvider,
	ManagedObjectObserver
) {
	"use strict";

	var oAdapterRegistry = new window.Map();
	var mAdapterMapping = {
		"sap.m.table.columnmenu.Menu": "MobileColumnHeaderMenuAdapter"
	};

	/**
	 * Constructor for a new ColumnHeaderMenuAdapter.
	 *
	 * @class
	 * Base class that provides methods to map and reuse the column menu instance between multiple columns.
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @alias sap.ui.table.menus.ColumnHeaderMenuAdapter
	 */
	var ColumnHeaderMenuAdapter = BaseObject.extend("sap.ui.table.menus.ColumnHeaderMenuAdapter", /** @lends sap.ui.table.menus.ColumnHeaderMenuAdapter.prototype */ {
		constructor: function() {
			BaseObject.apply(this, arguments);

			this._bMenuItemsInjected = false;

			// The menu is just associated with the column. There is no automatic notification about the destruction of the menu.
			this._oColumnHeaderMenuObserver = new ManagedObjectObserver(function(oChange) {
				this.onAfterMenuDestroyed(oChange.object);
			}.bind(this));
		}
	});

	/**
	 * Maps the column menu instance to the specified column and modifies its entries based on the column configuration.
	 *
	 * @param {sap.ui.table.Column} oColumn The column to which the column menu instance should be mapped
	 * @returns {Promise} A promise that resolves once the column menu instance is mapped and its entries are modified
	 */
	ColumnHeaderMenuAdapter.activateFor = function(oColumn) {
		var oColumnHeaderMenu = oColumn.getHeaderMenuInstance();
		var sAdapterName = getAdapterName(oColumnHeaderMenu);
		var mRegistryData;

		if (!sAdapterName || !oColumn._getTable()) {
			return Promise.resolve();
		}

		// Unlink column from other adapters. Can be necessary if the column is associated with a different menu of another type.
		oAdapterRegistry.forEach(function(_mRegistryData, _sAdapterName) {
			if (_sAdapterName !== sAdapterName) {
				unlink(oColumn, _sAdapterName);
			}
		});

		if (!oAdapterRegistry.has(sAdapterName)) {
			mRegistryData = {
				adapter: requireAdapter(sAdapterName).then(function(Adapter) {
					mRegistryData = oAdapterRegistry.get(sAdapterName);
					mRegistryData.adapter = new Adapter();
					mRegistryData.adapter._injectMenuItems(mRegistryData.activeFor.getHeaderMenuInstance(), mRegistryData.activeFor);
				}),
				columns: [oColumn],
				activeFor: oColumn
			};
			oAdapterRegistry.set(sAdapterName, mRegistryData);
		} else {
			mRegistryData = oAdapterRegistry.get(sAdapterName);
			mRegistryData.activeFor = oColumn;

			if (!mRegistryData.columns.includes(oColumn)) {
				mRegistryData.columns.push(oColumn);
			}
		}

		if (mRegistryData.adapter instanceof Promise) {
			return mRegistryData.adapter;
		}

		mRegistryData.adapter._injectMenuItems(oColumnHeaderMenu, oColumn);

		return Promise.resolve();
	};

	/**
	 * Removes the mapping between the column menu instance and the given column.
	 *
	 * @param {sap.ui.table.Column} oColumn The column for the mapping to be removed
	 */
	ColumnHeaderMenuAdapter.unlink = function(oColumn) {
		unlink(oColumn, getAdapterName(oColumn.getHeaderMenuInstance()));
	};

	ColumnHeaderMenuAdapter.prototype._injectMenuItems = function(oColumnHeaderMenu, oColumn) {
		if (this._bMenuItemsInjected) {
			return;
		}

		oColumnHeaderMenu.attachBeforeClose({columnHeaderMenu: oColumnHeaderMenu, column: oColumn}, onMenuBeforeClose, this);
		this._oColumnHeaderMenuObserver.observe(oColumnHeaderMenu, {destroy: true});
		this.injectMenuItems(oColumnHeaderMenu, oColumn);
		this._bMenuItemsInjected = true;
	};

	ColumnHeaderMenuAdapter.prototype._removeMenuItems = function(oColumnHeaderMenu) {
		if (!this._bMenuItemsInjected) {
			return;
		}

		oColumnHeaderMenu.detachBeforeClose(onMenuBeforeClose, this);
		this.removeMenuItems(oColumnHeaderMenu);
		this._bMenuItemsInjected = false;
	};

	/**
	 * Injects entries to the column menu. Should be overwritten in child-classes.
	 *
	 * @param {sap.ui.core.IColumnHeaderMenu} oColumnHeaderMenu Instance of the column menu
	 * @param {sap.ui.table.Column} oColumn Instance of the column
	 */
	ColumnHeaderMenuAdapter.prototype.injectMenuItems = function(oColumnHeaderMenu, oColumn) {};

	/**
	 * Removes entries from the column menu. Should be overwritten in child-classes.
	 *
	 * @param {sap.ui.core.IColumnHeaderMenu} oColumnHeaderMenu
	 */
	ColumnHeaderMenuAdapter.prototype.removeMenuItems = function(oColumnHeaderMenu) {};

	/**
	 * Executed after the column menu is destroyed. Should be overwritten in child-classes.
	 * @param {sap.ui.core.IColumnHeaderMenu} oColumnHeaderMenu
	 */
	ColumnHeaderMenuAdapter.prototype.onAfterMenuDestroyed = function(oColumnHeaderMenu) {};

	/**
	 * Destroys the instance of the <code>ColumnHeaderMenuAdapter</code> and the change observer
	 */
	ColumnHeaderMenuAdapter.prototype.destroy = function() {
		BaseObject.prototype.destroy.apply(this, arguments);
		this._removeMenuItems(this._oMenu);
		this._oColumnHeaderMenuObserver.disconnect();
		delete this._oColumnHeaderMenuObserver;
	};

	function requireAdapter(sAdapterName) {
		return new Promise(function(resolve, reject) {
			sap.ui.require(["sap/ui/table/menus/" + sAdapterName], function(Module) {
				resolve(Module);
			}, function(oError) {
				reject(oError);
			});
		});
	}

	function getAdapterName(oColumnHeaderMenu) {
		for (var sMenuType in mAdapterMapping) {
			if (TableUtils.isA(oColumnHeaderMenu, sMenuType)) {
				return mAdapterMapping[sMenuType];
			}
		}

		return "";
	}

	function unlink(oColumn, sAdapterName) {
		var mRegistryData = oAdapterRegistry.get(sAdapterName);

		if (!mRegistryData) {
			return;
		}

		if (mRegistryData.adapter instanceof Promise) {
			mRegistryData.adapter.then(function() {
				unlink(oColumn, sAdapterName);
			});
		} else {
			if (mRegistryData.columns.includes(oColumn)) {
				mRegistryData.columns.splice(mRegistryData.columns.indexOf(oColumn), 1);
			}

			if (mRegistryData.columns.length === 0) {
				mRegistryData.adapter.destroy();
				oAdapterRegistry.delete(sAdapterName);
			}
		}
	}

	function onMenuBeforeClose(oEvent, oData) {
		this._removeMenuItems(oData.columnHeaderMenu);
	}

	return ColumnHeaderMenuAdapter;
});
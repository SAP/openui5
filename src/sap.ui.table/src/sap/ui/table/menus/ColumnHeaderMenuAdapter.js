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

	const oAdapterRegistry = new window.Map();
	const mAdapterMapping = {
		"sap.m.table.columnmenu.Menu": "MobileColumnHeaderMenuAdapter",

		// needed for qunit tests
		"sap.ui.table.test.Menu": "test/TestAdapter"
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
	const ColumnHeaderMenuAdapter = BaseObject.extend("sap.ui.table.menus.ColumnHeaderMenuAdapter", /** @lends sap.ui.table.menus.ColumnHeaderMenuAdapter.prototype */ {
		constructor: function() {
			BaseObject.apply(this, arguments);

			this._mInjectionTarget = null;

			// The menu is just associated with the column. There is no automatic notification about the destruction of the menu.
			this._oColumnHeaderMenuObserver = new ManagedObjectObserver(function(oChange) {
				this.onAfterMenuDestroyed(oChange.object);
			}.bind(this));
		}
	});

	/**
	 * Activates an adapter for the column and links them, if there is an adapter for the menu type the column is associated with. The adapter adds
	 * items to the menu based on the column configuration. Should be called before the menu is opened. The menu should then be opened after the
	 * returned <code>Promise</code> resolves, to make sure it already contains all items.
	 * Activation is required again before opening the menu, if the column is associated with a menu of a different type, or the column
	 * configuration that affects the added menu items is changed. In other cases, a repeated activation is not required, but possible. However,
	 * depending on the concrete adapter implementation this might cause unnecessary overhead.
	 *
	 * @see sap.ui.table.menus.ColumnHeaderMenuAdapter.unlink
	 * @param {sap.ui.table.Column} oColumn The column for which to activate an adapter
	 * @returns {Promise} A promise that resolves once the adapter is activated and the menu items are modified
	 */
	ColumnHeaderMenuAdapter.activateFor = function(oColumn) {
		const oColumnHeaderMenu = oColumn.getHeaderMenuInstance();
		const sAdapterName = getAdapterName(oColumnHeaderMenu);
		let mRegistryData;

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
	 * Unlinks the column from the adapter. If a column does no longer need an adapter, for example because it is destroyed, it needs to be unlinked
	 * for proper cleanup.
	 *
	 * @param {sap.ui.table.Column} oColumn The column for the mapping to be removed
	 */
	ColumnHeaderMenuAdapter.unlink = function(oColumn) {
		unlink(oColumn);
	};

	ColumnHeaderMenuAdapter.prototype._injectMenuItems = function(oColumnHeaderMenu, oColumn) {
		this._removeMenuItems();
		this._oColumnHeaderMenuObserver.observe(oColumnHeaderMenu, {destroy: true});
		this.injectMenuItems(oColumnHeaderMenu, oColumn);
		this._mInjectionTarget = {
			column: oColumn,
			menu: oColumnHeaderMenu
		};
	};

	ColumnHeaderMenuAdapter.prototype._removeMenuItems = function() {
		if (!this._mInjectionTarget) {
			return;
		}

		this.removeMenuItems(this._mInjectionTarget.menu);
		this._mInjectionTarget = null;
	};

	/**
	 * This hook is called when menu items should be added to the column menu.
	 *
	 * @param {sap.ui.core.IColumnHeaderMenu} oColumnHeaderMenu Instance of the column menu
	 * @param {sap.ui.table.Column} oColumn Instance of the column
	 */
	ColumnHeaderMenuAdapter.prototype.injectMenuItems = function(oColumnHeaderMenu, oColumn) {};

	/**
	 * This hook is called when menu items should be removed from the column menu.
	 *
	 * @param {sap.ui.core.IColumnHeaderMenu} oColumnHeaderMenu
	 */
	ColumnHeaderMenuAdapter.prototype.removeMenuItems = function(oColumnHeaderMenu) {};

	/**
	 * This hook is called after the column menu and injected menu items are destroyed.
	 *
	 * @param {sap.ui.core.IColumnHeaderMenu} oColumnHeaderMenu
	 */
	ColumnHeaderMenuAdapter.prototype.onAfterMenuDestroyed = function(oColumnHeaderMenu) {};

	/**
	 * Destroys the instance of the <code>ColumnHeaderMenuAdapter</code> and the change observer
	 */
	ColumnHeaderMenuAdapter.prototype.destroy = function() {
		BaseObject.prototype.destroy.apply(this, arguments);
		this._removeMenuItems();
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
		for (const sMenuType in mAdapterMapping) {
			if (TableUtils.isA(oColumnHeaderMenu, sMenuType)) {
				return mAdapterMapping[sMenuType];
			}
		}

		return mAdapterMapping.default;
	}

	function unlink(oColumn, sAdapterName) {
		let mRegistryData;

		if (sAdapterName) {
			mRegistryData = oAdapterRegistry.get(sAdapterName);
		} else {
			oAdapterRegistry.forEach(function(_mRegistryData, _sAdapterName) {
				if (_mRegistryData.columns.includes(oColumn)) {
					mRegistryData = _mRegistryData;
					sAdapterName = _sAdapterName;
				}
			});
		}

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

	return ColumnHeaderMenuAdapter;
});
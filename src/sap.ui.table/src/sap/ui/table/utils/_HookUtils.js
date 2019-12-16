/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.utils._HookUtils.
sap.ui.define([], function() {
	"use strict";

	var Hooks = new window.WeakMap();
	var MASTER_HOOK_KEY = {}; // Symbol could be used here, but IE does not support it.

	var mHookKeys = Object.freeze({
		Table: Object.freeze({
			BindRows: "Table.BindRows",
			UnbindRows: "Table.UnbindRows",
			RefreshRows: "Table.RefreshRows",
			UpdateRows: "Table.UpdateRows",
			UpdateSizes: "Table.UpdateSizes",
			OpenMenu: "Table.OpenMenu"
		}),
		Row: Object.freeze({
			UpdateState: "Row.UpdateState"
		}),
		Column: Object.freeze({
			MenuItemNotification: "Column.MenuItemNotification"
		})
	});

	var aHookKeys = (function() {
		function getKeys(mMap) {
			var aKeys = [];

			Object.keys(mMap).forEach(function(sKey) {
				if (typeof mMap[sKey] === "string") {
					aKeys.push(mMap[sKey]);
				} else {
					aKeys = aKeys.concat(getKeys(mMap[sKey]));
				}
			});

			return aKeys;
		}

		return getKeys(mHookKeys);
	})();

	function isValidHookKey(sHookKey) {
		return aHookKeys.indexOf(sHookKey) >= 0;
	}

	/**
	 * Static collection of utility functions providing a table internal hook system.
	 *
	 * <b>Note:</b>
	 * - Do not access the function of this helper directly but via <code>sap.ui.table.TableUtils.Hook...</code>
	 * - There is no concept for public or protected hooks. Never expose a hook directly, only indirectly as can be seen in the examples.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @alias sap.ui.table.utils._HookUtils
	 * @example
	 * MyClass.prototype.init = function() {
	 *     TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.MyHook, this.myPrivateMethod, this);
	 * };
	 * MyClass.prototype.exit = function() {
	 *     TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.MyHook, this.myPrivateMethod, this);
	 * };
	 * MyClass.prototype.myPrivateMethod = function() {...};
	 * @example
	 * // Note that you need a reference to the handler to be able to deregister it!
	 * MyClass.prototype.myMethod = function() {
	 *     var fnHookHandler = function() {
	 *         if (condition) {
	 *             this.myProtectedMethod();
	 *             TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.MyOtherHook, fnHookHandler);
	 *         }
	 *     }.bind(this);
	 *     TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.MyOtherHook, fnHookHandler);
	 *     this.doSomethingThatTriggersHook();
	 * };
	 * MyClass.prototype.myProtectedMethod = function() {...};
	 * @example
	 * MyClass.prototype.init = function() {
	 *     TableUtils.Hook.install(oTable, this);
	 * }
	 * MyClass.prototype.hooks = {
	 *     MyHook: function() {this.myMethod();}
	 * };
	 * MyClass.prototype.hooks[TableUtils.Hook.Keys.MyOtherHook] = function() {...};
	 * MyClass.prototype.exit = function() {
	 *     TableUtils.Hook.uninstall(oTable, this);
	 * }
	 * // Be careful with inheritance!
	 * MyClassSubclass.prototype.hooks[TableUtils.Hook.Keys.YetAnotherHook] = function() {...};
	 * oInstanceOfMyClass.hooks.YetAnotherHook === oInstanceOfMyClassSubclass.hooks.YetAnotherHook // equals true
	 * @example
	 * var oMyHookInstallation = {hooks: {}};
	 * oMyHookInstallation.myMethod = function() {...};
	 * oMyHookInstallation.hooks[TableUtils.Hook.Keys.MyHook] = function() {this.myMethod();};
	 * TableUtils.Hook.install(oTable, oMyHookInstallation);
	 * oMyHookInstallation.hooks[TableUtils.Hook.Keys.MyOtherHook] = function() {...};
	 * TableUtils.Hook.uninstall(oTable, oMyHookInstallation);
	 * @private
	 */
	var HookUtils = {
		TableUtils: null, // Avoid cyclic dependency. Will be filled by TableUtils.

		/**
		 * A map of hook keys.
		 */
		Keys: mHookKeys,

		/**
		 * Calls a hook of a table.
		 *
		 * @param {sap.ui.table.Table} oScope The table whose hook is called.
		 * @param {string} sHookKey The hook to call.
		 */
		call: function(oScope, sHookKey) {
			var aHooks = Hooks.get(oScope);
			var aArguments;

			if (!HookUtils.TableUtils.isA(oScope, "sap.ui.table.Table") || aHooks == null || !isValidHookKey(sHookKey)) {
				return;
			}

			aArguments = Array.prototype.slice.call(arguments, 2);

			aHooks.forEach(function(oHook) {
				if (oHook.key === MASTER_HOOK_KEY) {
					var oCall = {};
					oCall[sHookKey] = aArguments;
					HookUtils.TableUtils.dynamicCall(oHook.target.hooks, oCall, oHook.target);
				} else if (oHook.key === sHookKey) {
					oHook.handler.apply(oHook.handlerContext, aArguments);
				}
			});
		},

		/**
		 * Installs the hooks of a table in an object.
		 * Installation of hooks is a short way of registering to all hooks. The target object needs to have a <code>hooks</code> map object with hook
		 * keys as the keys, and functions as the values. For example: <code>oTarget.hooks.My_Hook = function() {...}</code> will be called, if the
		 * "My_Hook" hook is called.
		 * There can only be one installation in the target object.
		 *
		 * @param {sap.ui.table.Table} oScope The table whose hooks are installed.
		 * @param {Object} oTarget The object the hooks are installed in.
		 */
		install: function(oScope, oTarget) {
			if (!HookUtils.TableUtils.isA(oScope, "sap.ui.table.Table") || !oTarget) {
				return;
			}

			var aHooks = Hooks.get(oScope);

			if (aHooks == null) {
				aHooks = [];
			}

			var bMasterHookInstalled = aHooks.some(function(oHook) {
				return oHook.key === MASTER_HOOK_KEY && oHook.target === oTarget;
			});

			if (bMasterHookInstalled) {
				return;
			}

			aHooks.push({
				key: MASTER_HOOK_KEY,
				target: oTarget
			});

			Hooks.set(oScope, aHooks);
		},

		/**
		 * Uninstalls hooks of a table from the target object.
		 *
		 * @param {sap.ui.table.Table} oScope The table whose hooks are uninstalled.
		 * @param {Object} oTarget The object the hooks are uninstalled from.
		 */
		uninstall: function(oScope, oTarget) {
			if (!HookUtils.TableUtils.isA(oScope, "sap.ui.table.Table") || !oTarget) {
				return;
			}

			var aHooks = Hooks.get(oScope);

			for (var i = 0; i < aHooks.length; i++) {
				var oHook = aHooks[i];

				if (oHook.key === MASTER_HOOK_KEY && oHook.target === oTarget) {
					aHooks.splice(i, 1);
					break;
				}
			}

			if (aHooks.length === 0) {
				Hooks.delete(oScope);
			} else {
				Hooks.set(oScope, aHooks);
			}
		},

		/**
		 * Registers to a hook of a table.
		 * Multiple registrations with the same handler and handler context are possible.
		 *
		 * @param {sap.ui.table.Table} oScope The table to whose hook to register.
		 * @param {string} sHookKey The hook to register to.
		 * @param {Function} fnHandler The handler of the hook.
		 * @param {Object} oThis The context of hook handler calls.
		 */
		register: function(oScope, sHookKey, fnHandler, oThis) {
			if (!HookUtils.TableUtils.isA(oScope, "sap.ui.table.Table") || !isValidHookKey(sHookKey)) {
				return;
			}

			var aHooks = Hooks.get(oScope);

			if (aHooks == null) {
				aHooks = [];
			}

			aHooks.push({
				key: sHookKey,
				handler: fnHandler,
				handlerContext: oThis
			});

			Hooks.set(oScope, aHooks);
		},

		/**
		 * Deregisters from a hook of a table.
		 * If there are multiple registrations with the same handler and handler context, one deregistration per registration is required.
		 *
		 * @param {sap.ui.table.Table} oScope The table to whose hook to deregister from.
		 * @param {string} sHookKey The hook to deregister from.
		 * @param {Function} fnHandler The handler of the hook.
		 * @param {Object} oThis The context of hook handler calls.
		 */
		deregister: function(oScope, sHookKey, fnHandler, oThis) {
			var aHooks = Hooks.get(oScope);

			if (!HookUtils.TableUtils.isA(oScope, "sap.ui.table.Table") || aHooks == null || !isValidHookKey(sHookKey)) {
				return;
			}

			for (var i = 0; i < aHooks.length; i++) {
				var oHook = aHooks[i];

				if (oHook.key === sHookKey && oHook.handler === fnHandler && oHook.handlerContext === oThis) {
					aHooks.splice(i, 1);
					break;
				}
			}

			if (aHooks.length === 0) {
				Hooks.delete(oScope);
			} else {
				Hooks.set(oScope, aHooks);
			}
		}
	};

	return HookUtils;
}, /* bExport= */ true);
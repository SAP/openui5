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
			/* Called when Table#bindRows or Table#bindAggregation("rows", ...) is called, before Control#bindAggregation.
			 * Arguments: BindingInfo */
			BindRows: "Table.BindRows",
			/* Called when a binding object is created for the rows aggregation.
			 * Arguments: sap.ui.model.Binding */
			RowsBound: "Table.RowsBound",
			/* Called when Table#unbindRows or Table#unbindAggregation("rows", ...) is called, before Control#unbindAggregation.
			 * Arguments: sap.ui.model.Binding */
			UnbindRows: "Table.UnbindRows",
			/* Called after the Table.UnbindRows hook, if the unbind is not caused by rebind or destroy.
			 * Arguments: none */
			RowsUnbound: "Table.RowsUnbound",
			/* Called when Table#refreshRows is called.
			 * Arguments: none */
			RefreshRows: "Table.RefreshRows",
			/* Called when Table#updateRows is called.
			 * Arguments: none */
			UpdateRows: "Table.UpdateRows",
			/* Called when Table#_updateTableSizes is called.
			 * Arguments: none */
			UpdateSizes: "Table.UpdateSizes",
			/* Called when a menu is opened.
			 * Arguments: sap.ui.unified.Menu */
			OpenMenu: "Table.OpenMenu"
		}),
		Row: Object.freeze({
			/* Called when the state of a row is updated.
			 * Arguments: sap.ui.table.Row.State */
			UpdateState: "Row.UpdateState"
		}),
		Column: Object.freeze({
			/* Called when the table needs to know whether menu items will be added on the Table.OpenMenu hook.
			 * Arguments: function():boolean */
			MenuItemNotification: "Column.MenuItemNotification"
		}),

		// Only for tests!
		// These hooks can be used to determine when certain processes are completed. Each hook that indicates that a process has started has a
		// counterpart. For example, 2 hooks that indicate that a process has started require 2 hooks that indicate that this process has ended.
		// Only then can the process be considered complete.
		Test: Object.freeze({
			StartAsyncTableUpdate: "Test.StartAsyncTableUpdate",
			EndAsyncTableUpdate: "Test.EndAsyncTableUpdate",
			StartAsyncFocusHandling: "Test.StartAsyncFocusHandling",
			EndAsyncFocusHandling: "Test.EndAsyncFocusHandling"
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
					var oHandlerContext = oHook.handlerContext == null ? oHook.target : oHook.handlerContext;

					oCall[sHookKey] = aArguments;
					HookUtils.TableUtils.dynamicCall(oHook.target.hooks, oCall, oHandlerContext);

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
		 * There can only be one installation in the target object for each context.
		 *
		 * @param {sap.ui.table.Table} oScope The table whose hooks are installed.
		 * @param {Object} oTarget The object the hooks are installed in.
		 * @param {Object} [oThis] The context of hook handler calls.
		 */
		install: function(oScope, oTarget, oThis) {
			if (!HookUtils.TableUtils.isA(oScope, "sap.ui.table.Table") || !oTarget) {
				return;
			}

			var aHooks = Hooks.get(oScope);

			if (aHooks == null) {
				aHooks = [];
			}

			var bMasterHookInstalled = aHooks.some(function(oHook) {
				return oHook.key === MASTER_HOOK_KEY && oHook.target === oTarget && oHook.handlerContext === oThis;
			});

			if (bMasterHookInstalled) {
				return;
			}

			aHooks.push({
				key: MASTER_HOOK_KEY,
				target: oTarget,
				handlerContext: oThis
			});

			Hooks.set(oScope, aHooks);
		},

		/**
		 * Uninstalls hooks of a table from the target object.
		 *
		 * @param {sap.ui.table.Table} oScope The table whose hooks are uninstalled.
		 * @param {Object} oTarget The object the hooks are uninstalled from.
		 * @param {Object} [oThis] The context of hook handler calls.
		 */
		uninstall: function(oScope, oTarget, oThis) {
			if (!HookUtils.TableUtils.isA(oScope, "sap.ui.table.Table") || !oTarget) {
				return;
			}

			var aHooks = Hooks.get(oScope);

			for (var i = 0; i < aHooks.length; i++) {
				var oHook = aHooks[i];

				if (oHook.key === MASTER_HOOK_KEY && oHook.target === oTarget && oHook.handlerContext === oThis) {
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
		 * Multiple registrations with the same <code>fnHandler</code> and <code>oThis</code> are possible.
		 *
		 * @param {sap.ui.table.Table} oScope The table to whose hook to register.
		 * @param {string} sHookKey The hook to register to.
		 * @param {Function} fnHandler The handler of the hook.
		 * @param {Object} [oThis] The context of hook handler calls.
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
		 * If there are multiple registrations with the same <code>fnHandler</code> and <code>oThis</code>, one deregistration per
		 * registration is required. The last registration is removed first.
		 *
		 * @param {sap.ui.table.Table} oScope The table to whose hook to deregister from.
		 * @param {string} sHookKey The hook to deregister from.
		 * @param {Function} fnHandler The handler of the hook.
		 * @param {Object} [oThis] The context of hook handler calls.
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
/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.utils._HookUtils.
sap.ui.define(["sap/ui/base/DataType", "sap/ui/model/ChangeReason"], function(DataType, ChangeReason) {
	"use strict";

	const Hooks = new window.WeakMap();
	const MASTER_HOOK_KEY = {};
	const mKeyMapForExternalUsage = {};
	const mHookMetadataByKey = {};
	const aForbiddenTypes = ["function"];

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
	 *
	 * @example
	 * MyClass.prototype.init = function() {
	 *     TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.MyHook, this.myPrivateMethod, this);
	 * };
	 * MyClass.prototype.exit = function() {
	 *     TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.MyHook, this.myPrivateMethod, this);
	 * };
	 * MyClass.prototype.myPrivateMethod = function() {...};
	 *
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
	 *
	 * @example
	 * MyClass.prototype.init = function() {
	 *     TableUtils.Hook.install(oTable, MyClass.prototype.hooks, this);
	 * };
	 * MyClass.prototype.myMethod = function() {...};
	 * MyClass.prototype.hooks = {
	 *     MyHook: function() {this.myMethod();}
	 * };
	 * MyClass.prototype.hooks[TableUtils.Hook.Keys.MyOtherHook] = function() {...};
	 * MyClass.prototype.exit = function() {
	 *     TableUtils.Hook.uninstall(oTable, MyClass.prototype.hooks, this);
	 * };
	 * // Be careful with inheritance!
	 * MyClassSubclass.prototype.hooks[TableUtils.Hook.Keys.YetAnotherHook] = function() {...};
	 * oInstanceOfMyClass.hooks.YetAnotherHook === oInstanceOfMyClassSubclass.hooks.YetAnotherHook // equals true
	 *
	 * @example
	 * var oMyHookInstallation = {};
	 * oMyHookInstallation.myMethod = function() {...};
	 * oMyHookInstallation[TableUtils.Hook.Keys.MyHook] = function() {this.myMethod();};
	 * TableUtils.Hook.install(oTable, oMyHookInstallation);
	 * oMyHookInstallation[TableUtils.Hook.Keys.MyOtherHook] = function() {this.myMethod();};
	 * TableUtils.Hook.uninstall(oTable, oMyHookInstallation);
	 *
	 * @private
	 */
	const HookUtils = {};

	/*
	 * This table internal hooks system is intended to simplify the communication between table modules. Such modules might need to be decoupled from
	 * each other, or do not even have a direct relationship.
	 * From maintainability perspective, hooks need to be consumable without the need for checks and validation. Therefore, a contract must be
	 * enforced.
	 *
	 * Every hook must be defined before it can be used. There can be no dynamic hooks. Calling or registering to an undefined hook has no effect.
	 *
	 * Hook metadata:
	 * - "arguments" (required) - List arguments that have to be provided to a call. If a hook has no arguments, this has to be specified with an
	 *   empty array.
	 *
	 *   Definition:
	 *   {
	 *     type: string | function():boolean,
	 *     [optional=false]: boolean
	 *   }
	 *
	 *   Examples of valid types:
	 *   "any", "string", "int[]", "object", "class:sap.ui.table.Table", function(vValue) {return typeof vValue === "boolean"}
	 *
	 *   Calls with invalid arguments are ignored. This includes the number of arguments as well as their types.
	 *   Almost any type that can be used for a property, for example, can also be used here. Classes have to be prefixed with "class:", so the
	 *   correct method is used to validate arguments.
	 *
	 *   Type function():boolean -> Custom validation
	 *   For example for internal types like sap.ui.table.Row.State. It is also possible to use sap.ui.base.DataType#createType to create
	 *   a type that can be used here. But this is not done to avoid polluting the type registry just for this util.
	 *
	 * Forbidden types: "function"
	 */

	const mHookMetadata = {
		Table: {
			// Called when Table#bindRows or Table#bindAggregation("rows", ...) is called, before Control#bindAggregation.
			BindRows: {
				arguments: [
					{type: "object" /* BindingInfo */}
				]
			},

			// Called when a binding object is created for the rows aggregation.
			RowsBound: {
				arguments: [
					{type: "class:sap.ui.model.Binding"}
				]
			},

			// Called when Table#unbindRows or Table#unbindAggregation("rows", ...) is called, before Control#unbindAggregation.
			UnbindRows: {
				arguments: [
					{type: "object" /* BindingInfo */}
				]
			},

			// Called after the Table.UnbindRows hook, if the unbind is not caused by rebind or destroy.
			RowsUnbound: {
				arguments: []
			},

			// Called when Table#refreshRows is called.
			RefreshRows: {
				arguments: [
					{type: validateRowsUpdateReason}
				]
			},

			// Called when Table#updateRows is called.
			UpdateRows: {
				arguments: [
					{type: validateRowsUpdateReason}
				]
			},

			// Called when Table#_updateTableSizes is called.
			UpdateSizes: {
				arguments: [
					{type: validateRowsUpdateReason}
				]
			},

			OpenContextMenu: {
				arguments: [
					{type: validateCellInfo},
					{type: "class:sap.ui.unified.Menu"}
				]
			},

			TotalRowCountChanged: {
				arguments: []
			}
		},
		TableRenderer: {
			RenderTableStyles: {
				arguments: [
					{type: "object" /* RenderManager */}
				]
			},
			RenderInTableBottomArea: {
				arguments: [
					{type: "object" /* RenderManager */}
				]
			},
			RenderRowContainerStyles: {
				arguments: [
					{type: "object" /* RenderManager */}
				]
			},
			RenderRowStyles: {
				arguments: [
					{type: "object" /* RenderManager */}
				]
			},
			RenderCellContentStyles: {
				arguments: [
					{type: "object" /* RenderManager */}
				]
			}
		},
		Row: {
			UpdateState: {
				arguments: [
					{type: validateRowState}
				]
			},
			Expand: {
				arguments: [
					{type: "class:sap.ui.table.Row"}
				]
			},
			Collapse: {
				arguments: [
					{type: "class:sap.ui.table.Row"}
				]
			}
		},
		Column: {},
		// Can be used to send any signal.
		Signal: {
			arguments: [
				{type: "string"}
			]
		}
	};

	HookUtils.TableUtils = null; // Avoid cyclic dependency. Will be filled by TableUtils.

	/**
	 * A map of keys.
	 */
	HookUtils.Keys = mKeyMapForExternalUsage;

	/**
	 * Calls a hook of a table.
	 *
	 * For arguments that are passed by reference, it is the responsibility of the caller to ensure that either immutable objects or copies are
	 * passed, or that mutating the object cannot cause any issues in the caller.
	 *
	 * If the hook allows to return values, an array of valid values is returned. Invalid values that have an incorrect type are discarded.
	 *
	 * @param {sap.ui.table.Table} oScope The table whose hook is called.
	 * @param {string} sKey The hook to call.
	 */
	HookUtils.call = function(oScope, sKey) {
		const aHooks = Hooks.get(oScope);

		if (!isValidScope(oScope) || !isValidKey(sKey)) {
			return;
		}

		const mHookMetadata = getHookMetadataByKey(sKey);

		if (aHooks == null) {
			return;
		}

		const aArguments = sanitizeArguments(Array.prototype.slice.call(arguments, 2));
		const bArgumentsValid = validateArguments(mHookMetadata, aArguments);

		if (!bArgumentsValid) {
			throw new Error("Hook with key " + sKey + " was not called. Invalid arguments passed\n" + oScope);
		}

		aHooks.map((oHook) => {
			if (oHook.key === MASTER_HOOK_KEY) {
				const oCall = {};
				const oHandlerContext = oHook.handlerContext == null ? oHook.target : oHook.handlerContext;

				oCall[sKey] = aArguments;
				HookUtils.TableUtils.dynamicCall(oHook.target, oCall, oHandlerContext);
			} else if (oHook.key === sKey) {
				oHook.handler.apply(oHook.handlerContext, aArguments);
			}
		});
	};

	/**
	 * Installs the hooks of a table in an object.
	 * Installation of hooks is a short way of registering to all hooks. The target object needs to have hook keys as the keys,
	 * and functions as the values. For example: <code>oTarget.MyHook = function() {...}</code> will be called, if the
	 * "MyHook" hook is called.
	 * There can only be one installation in the target object for every context.
	 *
	 * @param {sap.ui.table.Table} oScope The table whose hooks are installed.
	 * @param {Object} oTarget The object the hooks are installed in.
	 * @param {Object} [oThis] The context of hook handler calls.
	 */
	HookUtils.install = function(oScope, oTarget, oThis) {
		if (!oTarget || !isValidScope(oScope)) {
			return;
		}

		let aHooks = Hooks.get(oScope);

		if (aHooks == null) {
			aHooks = [];
		}

		const bMasterHookInstalled = aHooks.some(function(oHook) {
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
	};

	/**
	 * Uninstalls hooks of a table from the target object.
	 *
	 * @param {sap.ui.table.Table} oScope The table whose hooks are uninstalled.
	 * @param {Object} oTarget The object the hooks are uninstalled from.
	 * @param {Object} [oThis] The context of hook handler calls.
	 */
	HookUtils.uninstall = function(oScope, oTarget, oThis) {
		const aHooks = Hooks.get(oScope);

		if (aHooks == null || !oTarget) {
			return;
		}

		for (let i = 0; i < aHooks.length; i++) {
			const oHook = aHooks[i];

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
	};

	/**
	 * Registers to a hook of a table.
	 * Multiple registrations with the same <code>fnHandler</code> and <code>oThis</code> are possible.
	 *
	 * @param {sap.ui.table.Table} oScope The table to whose hook to register.
	 * @param {string} sKey The hook to register to.
	 * @param {Function} fnHandler The handler of the hook.
	 * @param {Object} [oThis] The context of hook handler calls.
	 */
	HookUtils.register = function(oScope, sKey, fnHandler, oThis) {
		if (typeof fnHandler !== "function" || !isValidScope(oScope) || !isValidKey(sKey)) {
			return;
		}

		let aHooks = Hooks.get(oScope);

		if (aHooks == null) {
			aHooks = [];
		}

		aHooks.push({
			key: sKey,
			handler: fnHandler,
			handlerContext: oThis
		});

		Hooks.set(oScope, aHooks);
	};

	/**
	 * Deregisters from a hook of a table.
	 * If there are multiple registrations with the same <code>fnHandler</code> and <code>oThis</code>, one deregistration per
	 * registration is required. The last registration is removed first.
	 *
	 * @param {sap.ui.table.Table} oScope The table from whose hook to deregister from.
	 * @param {string} sKey The hook to deregister from.
	 * @param {Function} fnHandler The handler of the hook.
	 * @param {Object} [oThis] The context of hook handler calls.
	 */
	HookUtils.deregister = function(oScope, sKey, fnHandler, oThis) {
		const aHooks = Hooks.get(oScope);

		if (aHooks == null) {
			return;
		}

		for (let i = 0; i < aHooks.length; i++) {
			const oHook = aHooks[i];

			if (oHook.key === sKey && oHook.handler === fnHandler && oHook.handlerContext === oThis) {
				aHooks.splice(i, 1);
				break;
			}
		}

		if (aHooks.length === 0) {
			Hooks.delete(oScope);
		} else {
			Hooks.set(oScope, aHooks);
		}
	};

	function extractKeys(mKeys, mCurrent, sCurrentKey) {
		Object.keys(mCurrent).forEach(function(sProperty) {
			const sKey = sCurrentKey ? sCurrentKey + "." + sProperty : sProperty;

			if ("arguments" in mCurrent[sProperty]) {
				aForbiddenTypes.forEach(function(sForbiddenType) {
					if (mCurrent[sProperty].arguments.includes(sForbiddenType)) {
						throw new Error("Forbidden type found in metadata of hook " + sCurrentKey + ": " + sForbiddenType);
					}
				});

				mKeys[sProperty] = sKey;
				mHookMetadataByKey[sKey] = mCurrent[sProperty];
			} else {
				mKeys[sProperty] = {};
				extractKeys(mKeys[sProperty], mCurrent[sProperty], sKey);
			}
		});

		return mKeys;
	}
	extractKeys(mKeyMapForExternalUsage, mHookMetadata);

	function isValidKey(sKey) {
		return sKey in mHookMetadataByKey;
	}

	function isValidScope(oScope) {
		return HookUtils.TableUtils.isA(oScope, "sap.ui.table.Table") && !oScope.bIsDestroyed && !oScope._bIsBeingDestroyed;
	}

	function getHookMetadataByKey(sKey) {
		return mHookMetadataByKey[sKey];
	}

	function sanitizeArguments(aArguments) {
		while (aArguments.length > 0) {
			const vArgument = aArguments.pop();
			if (vArgument != null) {
				aArguments.push(vArgument);
				break;
			}
		}

		return aArguments;
	}

	function validateArguments(mHookMetadata, aArguments) {
		return mHookMetadata.arguments.length >= aArguments.length && aArguments.every(function(vValue, iIndex) {
			const mArgument = mHookMetadata.arguments[iIndex];
			if (typeof mArgument.type === "function") {
				return mArgument.type(vValue);
			}
			if (mArgument.type.startsWith("class:")) {
				return HookUtils.TableUtils.isA(vValue, mArgument.type.substring(6));
			}
			return mArgument.optional === true && vValue == null || DataType.getType(mArgument.type).isValid(vValue);
		});
	}

	function validateChangeReason(sReason) {
		return typeof sReason === "string" && Object.values(ChangeReason).includes(sReason);
	}

	function validateRowsUpdateReason(sReason) { // sap.ui.table.utils.TableUtils.RowsUpdateReason
		return sReason in HookUtils.TableUtils.RowsUpdateReason || validateChangeReason(sReason);
	}

	function validateCellInfo(oCellInfo) { // sap.ui.table.utils.TableUtils.CellInfo
		return oCellInfo ? typeof oCellInfo.isOfType === "function" : false;
	}

	function validateRowState(oRowState) { // sap.ui.table.Row.State
		// instanceof check not possible due to missing reference, just check for some properties
		return oRowState != null
			   && oRowState.hasOwnProperty("context")
			   && oRowState.hasOwnProperty("Type")
			   && oRowState.hasOwnProperty("type")
			   && oRowState.type in oRowState.Type;
	}

	return HookUtils;
});
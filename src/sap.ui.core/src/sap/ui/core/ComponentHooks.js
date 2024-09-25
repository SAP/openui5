/*
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	class Hook {
		#allowMultiple;
		#callbacks;

		/**
		 * @constructor
		 * @param {boolean} bAllowMultiple Set to 'true' if the hook should allow multiple callbacks, 'false' otherwise.
		 */
		constructor(bAllowMultiple) {
			this.#allowMultiple = bAllowMultiple;
			this.#callbacks = bAllowMultiple ? [] : null;
		}

		/**
		 * Registers a callback function for this hook.
		 * @param {Function} fnCallback The callback to register.
		 * @throws {Error} Throws an error if the callback is not a function.
		 * @throws {Error} Throws an error if the callback is already registered for this hook.
		 */
		register(fnCallback) {
			if (typeof fnCallback !== "function") {
				throw new Error('Registered callback must be a function.');
			}
			if (this.#allowMultiple) {
				this.#callbacks.push(fnCallback);
			} else {
				if (this.#callbacks) {
					throw new Error(`Callback is already registered. The hooks are restricted to the 'sap.ui.fl' library only.`);
				}

				this.#callbacks = fnCallback;
			}
		}

		/**
		 * Checks if callback function is registered for this hook.
		 * @returns {boolean} Returns 'true' if registered, else 'false'.
		 */
		isRegistered() {
			return this.#allowMultiple ? this.#callbacks.length > 0 : !!this.#callbacks;
		}

		/**
		 * Deregisters the callback(s) from this hook.
		 */
		deregister() {
			this.#callbacks = this.#allowMultiple ? [] : null;
		}

		/**
		 * Executes the registered callback for this hook.
		 *
		 * @param {any} args Arguments to pass to the callback function(s).
		 * @returns {any|any[]} Returns the result of the callback(s). If multiple callbacks
		 * 						are registered, returns an array of results will be returned.
		 * 						If a single callback is registered, it will return the result directly.
		 * 						If no callback is registered, the function returns 'undefined'.
		 */
		execute(...args) {
			return this.#allowMultiple ?
				this.#callbacks.map((callback) => callback(...args)) :
				this.#callbacks?.(...args);
		}
	}

	/**
	 * A registry of all <code>sap.ui.core.Component</code> hooks that can be used to register, deregister, and execute callback functions.
	 *
	 * @alias module:sap/ui/core/ComponentHooks
	 * @namespace
	 * @private
	 * @ui5-restricted sap.ui.fl,sap.ui.integration
	 *
	 */
	const ComponentHooks = {
		/**
		 * Callback handler that executes when a manifest model (ODataModel v2 and v4) is created.
		 * The model instance, the manifest model ID, and the configuration object will be passed into the registered function.
		 *
		 * Example usage:
		 * <pre>
		 * sap.ui.require(['sap/ui/core/ComponentHooks'], function(ComponentHooks) {
		 *   ComponentHooks.onModelCreated.register(function(oModel, sModelID, oConfig) {
		 *     // do some logic
		 *   });
		 * });
		 * </pre>
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 * @since 1.130
		 */
		onModelCreated: new Hook(false),

		/**
		 * Callback handler which will be executed once a component instance has
		 * been created by {#link sap.ui.component}. The component instance and the
		 * configuration object will be passed into the registered function.
		 * For async scenarios (<code>vConfig.async = true</code>) a Promise can be provided as
		 * return value from the callback handler to delay resolving the Promise
		 * returned by {@link sap.ui.component}.
		 * In synchronous scenarios the return value will be ignored.
		 *
		 * Example usage:
		 * <pre>
		 * sap.ui.require(['sap/ui/core/ComponentHooks'], function(ComponentHooks) {
		 *   ComponentHooks.onInstanceCreated.register(function(oComponent, oConfig) {
		 *     // do some logic with the config
		 *
		 *     // optionally return a Promise
		 *     return doAsyncStuff();
		 *   });
		 * });
		 * </pre>
		 * <b>ATTENTION:</b> This hook must only be used by UI flexibility (sap.ui.fl)
		 * or the sap.ui.integration library.
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl,sap.ui.integration
		 * @since 1.43.0
		 */
		onInstanceCreated: new Hook(true),

		/**
		 * Callback handler which will be executed once the manifest.json was
		 * loaded for a component, but before the manifest is interpreted.
		 * The loaded manifest will be passed into the registered function.
		 *
		 * The callback may modify the parsed manifest object and must return a Promise which
		 * resolves with the manifest object. If the Promise is rejected, the component creation
		 * fails with the rejection reason.
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 * @since 1.70.0
		 */
		onPreprocessManifest: new Hook(false),

		/**
		 * Callback handler which will be executed once the component is loaded. A copy of the
		 * configuration object together with a copy of the manifest object will be passed into
		 * the registered function.
		 * Also a return value is not expected from the callback handler.
		 * It will only be called for asynchronous manifest first scenarios.
		 * <p>
		 * Example usage:
		 * <pre>
		 * sap.ui.require(['sap/ui/core/ComponentHooks'], function(ComponentHooks) {
		 *   ComponentHooks.onComponentLoaded.register(function(oConfig, oManifest) {
		 *     // do some logic with the config
		 *   });
		 * });
		 * </pre>
		 * <p>
		 * <b>ATTENTION:</b> This hook must only be used by UI flexibility (library:
		 * sap.ui.fl) and will be replaced with a more generic solution!
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 * @since 1.37.0
		 */
		onComponentLoaded: new Hook(false)
	};

	return ComponentHooks;
});

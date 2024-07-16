/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/mdc/util/loadModules", "sap/base/Log", "sap/ui/mdc/BaseDelegate"], (loadModules, Log, BaseDelegate) => {
	"use strict";

	const _validateDelegateConfig = function(oConfig) {
		if (!oConfig || !oConfig.name) {
			throw new Error("Delegate configuration '" + (oConfig && JSON.stringify(oConfig)) + "' invalid");
		}
	};

	const _fnInitDelegate = function(oResult) {
		if (!this.bIsDestroyed) {
			if (oResult instanceof Error) {
				this.fnRejectDelegate(oResult);
			} else {
				this._oDelegate = oResult[0];
				this.fnResolveDelegate(this._oDelegate);
				this.bDelegateInitialized = true;
			}
		}
		this.bDelegateLoading = false;
		delete this.fnResolveDelegate;
		delete this.fnRejectDelegate;
	};

	/**
	 * Enhances a given control prototype with consolidated asynchronous handling for delegate modules and their initialization.
	 *
	 * The following methods are available:
	 *
	 * <ul>
	 * <li><code>awaitControlDelegate</code> - Provides access to the delegate initialization <code>Promise</code>.</li>
	 * <li><code>getControlDelegate</code> - Returns the delegate instance, if available.</li>
	 * <li><code>isControlDelegateInitialized</code> - Checks whether the control delegate is available.</li>
	 * <li><code>getPayload</code> - Returns the payload object set for the delegate property.</li>
	 * <li><code>getTypeMap</code> - Returns the <code>TypeMap</code> made available by the delegate module</li>
	 * <li><code>initControlDelegate</code> - Loads and initializes the delegate module related to the enhanced control.</li>
	 * </ul>
	 *
	 * Additionally, the following methods are wrapped:
	 *
	 * <ul>
	 * <li><code>applySettings</code></li>
	 * <li><code>exit</code></li>
	 * <li><code>init</code></li>
	 * <li><code>setDelegate</code></li>
	 * </ul>
	 *
	 * The <code>prototype.init</code> wrapper creates the following instance fields:
	 *
	 * <ul>
	 * <li><code>bDelegateInitialized</code> - Indicator for the availability of delegates</li>
	 * <li><code>bDelegateLoading</code> - Indicates whether the initialization of delegate modules is triggered but not yet completed (loading necessary)</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.mdc.mixin.DelegateMixin
	 * @namespace
	 * @since 1.76.0
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	const DelegateMixin = {};

	DelegateMixin.init = function(fnInit) {
		return function() {

			this.bDelegateInitialized = false; // Indicator for the availability of delegates
			this.bDelegateLoading = false; //  Indicates whether the initialization of delegate modules is triggered but not yet completed (loading necessary)

			this._oDelegateInitialized = new Promise((resolve, reject) => { // Promise resolving delegate module after initControlDelegate was executed.
				this.fnResolveDelegate = resolve;
				this.fnRejectDelegate = reject;
			});

			if (fnInit) {
				fnInit.apply(this, arguments);
			}
		};
	};

	DelegateMixin.applySettings = function(fnApplySettings) {
		return function(mSettings) {
			fnApplySettings.apply(this, arguments);
			this._bDelegateLocked = true;
			return this;
		};
	};

	DelegateMixin.setDelegate = function(fnSetDelegate) {
		return function(oConf) {
			if (this._bDelegateLocked) {
				throw new Error("Runtime delegate configuration is not permitted.");
			}
			_validateDelegateConfig(oConf);
			fnSetDelegate.call(this, oConf);
			this._oPayload = oConf && oConf.payload;
			return this;
		};
	};

	/**
	 * Loads and initializes the delegate module related to the enhanced control.
	 *
	 * @protected
	 * @param {module:sap/ui/mdc/BaseDelegate} [oPreloadedModule] Preloaded delegate module
	 * @returns {Promise<module:sap/ui/mdc/BaseDelegate>} Returns a <code>Promise</code> that resolves the delegate module, if available
	 */
	DelegateMixin.initControlDelegate = function(oPreloadedModule) {

		if (this.bIsDestroyed) {
			Log.warning("Delegate module initialization omitted as control is being destroyed.");
		} else if (!this._oDelegate && !this.bDelegateLoading) {
			if (oPreloadedModule) {
				_fnInitDelegate.call(this, [oPreloadedModule]);
			} else {
				const oDelegate = this.getDelegate();
				_validateDelegateConfig(oDelegate);
				this.bDelegateLoading = true;
				loadModules(oDelegate.name).then(_fnInitDelegate.bind(this)).catch(_fnInitDelegate.bind(this));
			}
		}

		return this._oDelegateInitialized;
	};

	/**
	 * Checks whether the delegate module related to the enhanced control is loaded.
	 *
	 * @returns {boolean} Whether the delegate module is loaded
	 * @public
	 */
	DelegateMixin.isControlDelegateInitialized = function() {
		return this.bDelegateInitialized;
	};

	/**
	 * Returns the payload object set for the delegate property.
	 *
	 * @returns {object} Payload set for delegate property
	 * @public
	 */
	DelegateMixin.getPayload = function() {
		if (!this._oPayload) {
			const oDelegateConfig = this.getDelegate();
			this._oPayload = oDelegateConfig && oDelegateConfig.payload;
		}

		return this._oPayload;
	};

	/**
	 * Returns the <code>TypeMap</code> made available by a delegate module.
	 *
	 * @returns {module:sap/ui/mdc/util/TypeMap} <code>TypeMap</code> object
	 * @throws Throws an error if the delegate module is not available
	 * @public
	 */
	DelegateMixin.getTypeMap = function() {
		if (!this._oTypeMap) {
			if (!this._oDelegate) {
				throw new Error("A delegate instance providing a TypeMap is not (yet) available.");
			}
			this._oTypeMap = this._oDelegate.getTypeMap(this);
		}

		return this._oTypeMap;
	};

	/**
	 * Returns the delegate instance, if available.
	 *
	 * @returns {module:sap/ui/mdc/BaseDelegate} <code>typeUtil</code> made available by a delegate module
	 * @throws Throws an error if the delegate module is not available
	 * @public
	 */
	DelegateMixin.getControlDelegate = function() {
		if (!this._oDelegate) {
			if (this.isDestroyed()) {
				throw new Error("A delegate instance is not available. The object instance is destroyed.");
			} else {
				throw new Error("A delegate instance is not (yet) available. You must call initControlDelegate before calling getControlDelegate.");
			}
		}
		return this._oDelegate;
	};

	/**
	 * Provides access to the delegate initialization <code>Promise</code>.
	 * <b>Note:</b> <code>initControlDelegate</code> must be called to start the delegate initialization
	 *
	 * @protected
	 * @returns {Promise<module:sap/ui/mdc/BaseDelegate>} Returns a <code>Promise</code> reflecting the delegate initialization
	 * @throws Throws an error if the delegate module is not available
	 */
	DelegateMixin.awaitControlDelegate = function() {
		return this._oDelegateInitialized;
	};

	DelegateMixin.exit = function(fnExit) {
		return function() {
			this.fnResolveDelegate = null;
			this.fnRejectDelegate = null;

			this.bDelegateInitialized = false;
			this.bDelegateLoading = false;

			this._oDelegateInitialized = null;
			this._oDelegate = null;
			this._oPayload = null;
			this._oTypeMap = null;

			if (fnExit) {
				fnExit.apply(this, arguments);
			}
		};
	};

	return function() {
		// wrappers
		this.applySettings = DelegateMixin.applySettings(this.applySettings);
		this.exit = DelegateMixin.exit(this.exit);
		this.init = DelegateMixin.init(this.init);
		this.setDelegate = DelegateMixin.setDelegate(this.setDelegate);

		// additional methods
		this.awaitControlDelegate = DelegateMixin.awaitControlDelegate;
		this.isControlDelegateInitialized = DelegateMixin.isControlDelegateInitialized;
		this.getControlDelegate = DelegateMixin.getControlDelegate;
		this.getPayload = DelegateMixin.getPayload;
		this.getTypeUtil = undefined;
		this.getTypeMap = DelegateMixin.getTypeMap;
		this.initControlDelegate = DelegateMixin.initControlDelegate;
	};
});
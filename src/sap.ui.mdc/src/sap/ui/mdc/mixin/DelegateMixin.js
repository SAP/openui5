/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/mdc/util/loadModules", "sap/base/Log"], function (loadModules, Log) {
	"use strict";

	var _validateDelegateConfig = function (oConfig) {
		if (!oConfig || !oConfig.name) {
			throw new Error("Delegate configuration '" + (oConfig && JSON.stringify(oConfig)) +  "' invalid");
		}
	};

	var _fnInitDelegate = function (oResult) {
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
	 * @namespace
	 * @name sap.ui.mdc.mixin
	 * @private
	 * @experimental As of version 1.82.0
	 * @ui5-restricted sap.ui.mdc
	 */

	/**
	 * Enhances a given control prototype with consolidated asynchronous handling for delegate modules and their initialization.
	 *
	 * The following methods are available:
	 *
	 * <ul>
	 * <li><code>awaitControlDelegate</code> - Provides access to the delegate initialization <code>Promise</code>.</li>
	 * <li><code>getControlDelegate</code> - Returns the delegate instance, if available.</li>
	 * <li><code>getPayload</code> - Returns the payload object set for the delegate property.</li>
	 * <li><code>getTypeUtil</code> - Returns the <code>typeUtil</code> made available by the delegate module</li>
	 * <li><code>initControlDelegate</code> - Loads and initializes the delegate module related to the enhanced control.</li>
	 * <li><code>initPropertyHelper</code> - Loads and initializes the property helper related to the enhanced control.</li>
	 * <li><code>awaitPropertyHelper</code> - Provides access to the property helper initialization <code>Promise</code>.</li>
	 * <li><code>getPropertyHelper</code> - Returns the property helper instance, if available.</li>
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
	 * @experimental
	 * @ui5-restricted sap.ui.mdc
	*/
	var DelegateMixin = {};

	DelegateMixin.init = function (fnInit) {
		return function () {

			this.bDelegateInitialized = false; // Indicator for the availability of delegates
			this.bDelegateLoading = false; //  Indicates whether the initialization of delegate modules is triggered but not yet completed (loading necessary)

			this._oDelegateInitialized = new Promise(function (resolve, reject) { // Promise resolving delegate module after initControlDelegate was executed.
				this.fnResolveDelegate = resolve;
				this.fnRejectDelegate = reject;
			}.bind(this));

			this._oPropertyHelper = null;
			this._bPropertyHelperIsBeingInitialized = false;
			this._pInitPropertyHelper = new Promise(function(resolve, reject) {
				this._fnResolveInitPropertyHelper = resolve;
				this._fnRejectInitPropertyHelper = reject;
			}.bind(this));

			if (fnInit) {
				fnInit.apply(this, arguments);
			}
		};
	};

	DelegateMixin.applySettings = function (fnApplySettings) {
		return function (mSettings) {
			fnApplySettings.apply(this, arguments);
			this._bDelegateLocked = true;
			return this;
		};
	};

	DelegateMixin.setDelegate = function (fnSetDelegate) {
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
	 * @param {object} [oPreloadedModule] Preloaded delegate module
	 * @returns {Promise<sap.ui.mdc.BaseDelegate>} Returns a <code>Promise</code> that resolves the delegate module, if available
	 */
	DelegateMixin.initControlDelegate = function (oPreloadedModule) {

		if (this.bIsDestroyed) {
			Log.warning("Delegate module initialization omitted as control is being destroyed.");
		} else if (!this._oDelegate && !this.bDelegateLoading) {
			if (oPreloadedModule) {
				_fnInitDelegate.call(this, [oPreloadedModule]);
			} else {
				var oDelegate = this.getDelegate();
				_validateDelegateConfig(oDelegate);
				this.bDelegateLoading = true;
				loadModules(oDelegate.name).then(_fnInitDelegate.bind(this)).catch(_fnInitDelegate.bind(this));
			}
		}

		return this._oDelegateInitialized;
	};

	/**
	 * Returns the payload object set for the delegate property.
	 *
	 * @protected
	 * @returns {object} Payload set for delegate property
	 */
	DelegateMixin.getPayload = function () {
		if (!this._oPayload) {
			var oDelegateConfig = this.getDelegate();
			this._oPayload = oDelegateConfig && oDelegateConfig.payload;
		}

		return this._oPayload;
	};

	/**
	 * Returns the <code>typeUtil</code> made available by a delegate module.
	 *
	 * @protected
	 * @returns {sap.ui.mdc.util.TypeUtil} <code>typeUtil</code> made available by the delegate module
	 * @throws Throws an error if the delegate module is not available
	 */
	DelegateMixin.getTypeUtil = function () {
		if (!this._oTypeUtil) {
			if (!this._oDelegate) {
				throw new Error("A delegate instance providing typeUtil is not (yet) available.");
			}
			this._oTypeUtil = this._oDelegate.getTypeUtil && this._oDelegate.getTypeUtil(this._oPayload);
		}

		return this._oTypeUtil;
	};

	/**
	 * Returns the delegate instance, if available.
	 *
	 * @protected
	 * @returns {sap.ui.mdc.BaseDelegate} <code>typeUtil</code> made available by a delegate module
	 * @throws Throws an error if the delegate module is not available
	 */
	DelegateMixin.getControlDelegate = function () {
		if (!this._oDelegate) {
			throw new Error("A delegate instance is not (yet) available. You must call initControlDelegate before calling getControlDelegate.");
		}

		return this._oDelegate;
	};

	/**
	 * Provides access to the delegate initialization <code>Promise</code>.
	 * <b>Note:</b> <code>initControlDelegate</code> must be called to start the delegate initialization
	 *
	 * @protected
	 * @returns {Promise} Returns a <code>Promise</code> reflecting the delegate initialization
	 * @throws Throws an error if the delegate module is not available
	 */
	DelegateMixin.awaitControlDelegate = function () {
		return this._oDelegateInitialized;
	};

	/**
	 * Loads and initializes the property helper related to the enhanced control.
	 *
	 * @protected
	 * @param {sap.ui.mdc.util.PropertyHelper} [CustomPropertyHelper] Custom property helper class
	 * @returns {Promise<sap.ui.mdc.util.PropertyHelper>} Returns a <code>Promise</code> that resolves with the property helper
	 */
	DelegateMixin.initPropertyHelper = function(CustomPropertyHelper) {
		if (CustomPropertyHelper && (!CustomPropertyHelper.getMetadata || !CustomPropertyHelper.getMetadata().isA("sap.ui.mdc.util.PropertyHelper"))) {
			throw new Error("The custom property helper class must be sap.ui.mdc.util.PropertyHelper or a subclass of it.");
		}

		if (!this.bIsDestroyed && !this._oPropertyHelper && !this._bPropertyHelperIsBeingInitialized) {
			this._bPropertyHelperIsBeingInitialized = true;
			this.awaitControlDelegate().then(function(oDelegate) {
				if (this.bIsDestroyed) {
					return null;
				}
				return initPropertyHelper(this, oDelegate, CustomPropertyHelper);
			}.bind(this)).catch(function(oError) {
				this._fnRejectInitPropertyHelper(oError);
			}.bind(this));
		}

		return this._pInitPropertyHelper;
	};

	function initPropertyHelper(oControl, oDelegate, CustomPropertyHelper) {
		return Promise.all([
			oDelegate.fetchProperties(oControl)
		]).then(function(aResult) {
			if (oControl.bIsDestroyed) {
				return [];
			}

			if (typeof oDelegate.fetchPropertyExtensions === "function") {
				return oDelegate.fetchPropertyExtensions(oControl, aResult[0]).then(function(mExtensions) {
					return aResult.concat(mExtensions);
				});
			}

			return aResult.concat(undefined);
		}).then(function(aResult) {
			if (oControl.bIsDestroyed) {
				return [];
			}

			return fetchPropertyHelper(oControl, oDelegate, CustomPropertyHelper, aResult[0], aResult[1]).then(function(PropertyHelper) {
				return aResult.concat(PropertyHelper);
			});
		}).then(function(aResult) {
			if (oControl.bIsDestroyed) {
				return;
			}

			var aProperties = aResult[0];
			var mExtensions = aResult[1];
			var PropertyHelper = aResult[2];
			var bPropertyHelperIsInstance = !!PropertyHelper.isA;

			oControl._oPropertyHelper = bPropertyHelperIsInstance ? PropertyHelper : new PropertyHelper(aProperties, mExtensions, oControl);
			oControl._bPropertyHelperIsBeingInitialized = false;
			oControl._fnResolveInitPropertyHelper(oControl._oPropertyHelper);
		});
	}

	function fetchPropertyHelper(oControl, oDelegate, CustomPropertyHelper, aProperties, mExtensions) {
		if (typeof oDelegate.fetchPropertyHelper === "function") {
			return oDelegate.fetchPropertyHelper(oControl, aProperties, mExtensions).then(function(PropertyHelper) {
				var sBaseClass = CustomPropertyHelper ? CustomPropertyHelper.getMetadata().getName() : "sap.ui.mdc.util.PropertyHelper";

				if (!PropertyHelper || !PropertyHelper.getMetadata || !PropertyHelper.getMetadata().isA(sBaseClass)) {
					throw new Error("The property helper must be a class or instance of type " + sBaseClass + " or a subclass of it.");
				}

				return PropertyHelper;
			});
		}

		if (CustomPropertyHelper) {
			return Promise.resolve(CustomPropertyHelper);
		}

		return loadModules("sap/ui/mdc/util/PropertyHelper").then(function(aResult) {
			return aResult[0];
		});
	}

	/**
	 * Provides access to the property helper initialization <code>Promise</code>.
	 *
	 * @protected
	 * @returns {Promise<sap.ui.mdc.util.PropertyHelper>} Returns a <code>Promise</code> that resolves with the property helper
	 */
	DelegateMixin.awaitPropertyHelper = function() {
		return this._pInitPropertyHelper;
	};

	/**
	 * Returns the property helper instance, if available.
	 *
	 * @protected
	 * @returns {sap.ui.mdc.util.PropertyHelper} The property helper
	 * @throws Throws an error if the property helper is not available
	 */
	DelegateMixin.getPropertyHelper = function() {
		if (!this._oPropertyHelper) {
			throw new Error("A property helper is not (yet) available. You must first initialize the delegate and the property helper.");
		}

		return this._oPropertyHelper;
	};

	DelegateMixin.exit = function (fnExit) {
		return function () {
			this.fnResolveDelegate = null;
			this.fnRejectDelegate = null;

			this.bDelegateInitialized = false;
			this.bDelegateLoading = false;

			this._oDelegateInitialized = null;
			this._oDelegate = null;
			this._oPayload = null;
			this._oTypeUtil = null;

			if (this._oPropertyHelper) {
				this._oPropertyHelper.destroy();
			}
			this._oPropertyHelper = null;
			this._fnResolveInitPropertyHelper = null;
			this._fnRejectInitPropertyHelper = null;
			this._bPropertyHelperIsBeingInitialized = false;
			this._pInitPropertyHelper = null;

			if (fnExit) {
				fnExit.apply(this, arguments);
			}
		};
	};

	return function () {
		// wrappers
		this.applySettings = DelegateMixin.applySettings(this.applySettings);
		this.exit = DelegateMixin.exit(this.exit);
		this.init = DelegateMixin.init(this.init);
		this.setDelegate = DelegateMixin.setDelegate(this.setDelegate);

		// additional methods
		this.awaitControlDelegate = DelegateMixin.awaitControlDelegate;
		this.getControlDelegate = DelegateMixin.getControlDelegate;
		this.getPayload = DelegateMixin.getPayload;
		this.getTypeUtil = DelegateMixin.getTypeUtil;
		this.initControlDelegate = DelegateMixin.initControlDelegate;
		this.initPropertyHelper = DelegateMixin.initPropertyHelper;
		this.awaitPropertyHelper = DelegateMixin.awaitPropertyHelper;
		this.getPropertyHelper = DelegateMixin.getPropertyHelper;
	};

}, /* bExport= */ true);

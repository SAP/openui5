/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/util/Deferred", "sap/ui/mdc/util/loadModules", "sap/base/Log"], function (Deferred, loadModules, Log) {
	"use strict";

	/**
	 * Enhances a given control prototype with consolidated asynchronous handling for providing a PropertyHelper
	 *
	 * The following methods are available:
	 *
	 * <ul>
 	 * <li><code>initPropertyHelper</code> - Loads and initializes the property helper related to the enhanced control.</li>
	 * <li><code>awaitPropertyHelper</code> - Provides access to the property helper initialization <code>Promise</code>.</li>
	 * <li><code>finalizePropertyHelper</code> - Finalizes the propertyHelper fetching all available propertyInfo via a given control delegate.</li>
	 * <li><code>isPropertyHelperFinal</code> - Indicates if the propertyHelper for this control allready contains all available propertyInfo.</li>
	 * <li><code>getPropertyHelper</code> - Returns the property helper instance, if available.</li>
	 * </ul>
	 *
	 * Additionally, the following methods are wrapped:
	 *
	 * <ul>
	 * <li><code>applySettings</code></li>
	 * <li><code>exit</code></li>
	 * <li><code>init</code></li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.mdc.mixin.PropertyHelperMixin
	 * @namespace
	 * @since 1.100.0
	 * @private
	 * @experimental
	 * @ui5-restricted sap.ui.mdc
	*/
	var PropertyHelperMixin = {};

	PropertyHelperMixin.init = function (fnInit) {
		return function () {

			this._oPropertyHelper = null;
			this._oPropertyHelperDeferred = new Deferred();
			this._oApplySettingsDeferred = new Deferred();

			this._bPropertyHelperFinal = false;
			this._bPropertyHelperInitializing = false;
			this._sPropertyInfoStore = null;

			if (fnInit) {
				fnInit.apply(this, arguments);
			}

		};
	};

	PropertyHelperMixin.applySettings = function (fnApplySettings) {
		return function () {
			if (fnApplySettings) {
				fnApplySettings.apply(this, arguments);
			}

			// initialize propertyHelper also, when store is initially empty
			if (this._sPropertyInfoStore && (!arguments[0] || !arguments[0].hasOwnProperty(this._sPropertyInfoStore))) {
				_createOrUpdatePropertyHelper.call(this, [], false);
			}

			this._oApplySettingsDeferred.resolve(this);	// We want to make sure all other initial properties are set before initializing propertyHelper (e.g. delegate)
			return this;
		};
	};

	/**
	 * Loads and initializes the property helper related to the enhanced control.
	 *
	 * @protected
	 * @param {sap.ui.mdc.util.PropertyHelper} [PropertyHelperClass] Custom property helper class
	 * @param {object[]} [aProperties] optional set of initial properties
	 * @param {object[]} [bFinal] flag for mark the propertyHelper as final
	 * @returns {Promise<sap.ui.mdc.util.PropertyHelper>} Returns a <code>Promise</code> that resolves with the property helper
	 */
	PropertyHelperMixin.initPropertyHelper = function(PropertyHelperClass, aProperties, bFinal) {
		if (PropertyHelperClass) {
			this._setPropertyHelperClass(PropertyHelperClass);
		}

		return _createOrUpdatePropertyHelper.call(this, aProperties, bFinal);
	};

	/**
	 * Provide a new set of properties for the propertyHelper.
	 *
	 * @protected
	 * @param {object[]} [aProperties] optional set of initial properties
	 * @param {object[]} [bFinal] flag for mark the propertyHelper as final
	 * @returns {Promise<sap.ui.mdc.util.PropertyHelper>} Returns a <code>Promise</code> that resolves with the property helper
	 * @throws exception if propertyHelper is already marked as final
	 */
	PropertyHelperMixin.updatePropertyHelper = function(aProperties, bFinal) {
		return _createOrUpdatePropertyHelper.call(this, aProperties, bFinal);
	};

	/**
	 * Finalize the propertyHelper using the control's delegate.
	 *
	 * @protected
	 * @param {object[]} [aProperties] optional set of initial properties
	 * @param {object[]} [bFinal] flag for mark the propertyHelper as final
	 * @returns {Promise<sap.ui.mdc.util.PropertyHelper>} Returns a <code>Promise</code> that resolves with the property helper
	 */
	PropertyHelperMixin.finalizePropertyHelper = function() {
		this._pHelperFinalizationPromise = this._pHelperFinalizationPromise || _getDelegateProperties(this).then(function (aResult) {
			return _createOrUpdatePropertyHelper.call(this, aResult, true);
		}.bind(this));
		return this._pHelperFinalizationPromise;
	};

	/**
	 * Indicates if the control's propertyHelper already contains all available properties
	 *
	 * @protected
	 * @returns {boolean} Returns a <code>boolean</code> indicating the propertyHelper's final state
	 */
	 PropertyHelperMixin.isPropertyHelperFinal = function() {
		return this._bPropertyHelperFinal;
	};

	/**
	 * Provides access to the property helper initialization <code>Promise</code>.
	 *
	 * @protected
	 * @returns {Promise<sap.ui.mdc.util.PropertyHelper>} Returns a <code>Promise</code> that resolves with the property helper
	 */
	 PropertyHelperMixin.awaitPropertyHelper = function() {
		return this._oPropertyHelperDeferred.promise;
	};

	/**
	 * Returns the property helper instance, if available.
	 *
	 * @protected
	 * @returns {sap.ui.mdc.util.PropertyHelper} The property helper
	 */
	PropertyHelperMixin.getPropertyHelper = function() {
		return this._oPropertyHelper;
	};

	PropertyHelperMixin.exit = function (fnExit) {
		return function () {
			this._oPropertyHelper = null;
			this._oPropertyHelperDeferred = null;
			this._oApplySettingsDeferred = null;
			this._bPropertyHelperFinal = null;
			this._bPropertyHelperInitializing = null;
			this._pHelperFinalizationPromise = null;
			this._oPropertyHelperClass = null;
			this._sPropertyInfoStore = null;

			if (this._oPropertyInfoStoreMutatorOverride) {
				this[this._oPropertyInfoStoreMutatorOverride.key] = this._oPropertyInfoStoreMutatorOverride.mutator;
				this._oPropertyInfoStoreMutatorOverride = null;
			}

			if (fnExit) {
				fnExit.apply(this, arguments);
			}
		};
	};

	/**
	 * Controls may provide a property identifier representing a propertyInfo store for this control.
	 * This should be called as early as possible as the given property's mutator is overriden.
	 * @private
	 * @param {string} sPropertyName Name of the property containing propertyInfo for this control
	 *
	 */
	PropertyHelperMixin._setupPropertyInfoStore = function(sPropertyName) {
		var oProperties = this.getMetadata().getAllProperties();
		var oPropertyInfoProperty = oProperties && oProperties[sPropertyName];
		if (!oPropertyInfoProperty) {
			throw new Error("PropertyHelperMixin: Property '" + sPropertyName + "' not found.");
		}
		var oJSONKeys = this.getMetadata().getJSONKeys()[sPropertyName];
		this._oPropertyInfoStoreMutatorOverride = {key: oJSONKeys._sMutator, mutator: this[oJSONKeys._sMutator]};

		this[oJSONKeys._sMutator] = function () {
			this._oPropertyInfoStoreMutatorOverride.mutator.apply(this, arguments);
			if (!this._bPropertyHelperFinal) {
				_createOrUpdatePropertyHelper.call(this, this[oJSONKeys._sGetter](), false);
			}
			return this;
		};
		this._sPropertyInfoStore = sPropertyName;
	};

	// Should ideally be called already during init for controls featuring a propertyInfo property (auto-initalization of PH after applySettings).
	PropertyHelperMixin._setPropertyHelperClass = function (PropertyHelperClass) {
		if (this._oPropertyHelper || this._bPropertyHelperInitializing) {
			throw new Error("PropertyHelper already initializing/ed.");
		}

		if (PropertyHelperClass && (!PropertyHelperClass.getMetadata || !PropertyHelperClass.getMetadata().isA("sap.ui.mdc.util.PropertyHelper"))) {
			throw new Error("The custom property helper class must be sap.ui.mdc.util.PropertyHelper or a subclass of it.");
		}
		this._oPropertyHelperClass = PropertyHelperClass;
	};

	PropertyHelperMixin._getPropertyByName = function(sName) {
		return this._oPropertyHelper && this._oPropertyHelper.getProperty(sName);
	};

	PropertyHelperMixin._getPropertyByNameAsync = function(sName) {
		var oProperty = this._getPropertyByName(sName);

		if (!oProperty) {
			return this.finalizePropertyHelper().then(function (oPropertyHelper) {
				return this._getPropertyByName(sName);
			}.bind(this));
		}
		return Promise.resolve(oProperty);
	};

	function _createOrUpdatePropertyHelper(aProperties, bFinal) {
		if (!this.bIsDestroyed) {
			if (this._bPropertyHelperInitializing && typeof aProperties !== "undefined") {
				return this._oPropertyHelperDeferred.promise.then(function () {
					return _updatePropertyHelper.call(this, aProperties, bFinal);
				}.bind(this));
			}

			if (this._oPropertyHelper && typeof aProperties !== "undefined") {
				_updatePropertyHelper.call(this, aProperties, bFinal);
			}
			if (!this._oPropertyHelper) {
				_createPropertyHelper.call(this, aProperties, bFinal);
			}
		}
		return this._oPropertyHelperDeferred && this._oPropertyHelperDeferred.promise;
	}

	function _createPropertyHelper (aProperties, bFinal) {
		this._bPropertyHelperInitializing = true;

		if (bFinal || !aProperties) { // also fall back to delegate if no initial properties given
			bFinal = true;
			this._pHelperFinalizationPromise = this._oPropertyHelperDeferred.promise;
		}

		var oDelegate;

		// we need to initialize the delegate for extensions or ph overrides first
		return this._oApplySettingsDeferred.promise.then(function () {
			return this.initControlDelegate();
		}.bind(this)).then(function (oControlDelegate) {
			oDelegate = oControlDelegate;
			return bFinal ? _getDelegateProperties(this) : aProperties;
		}.bind(this)).then(function(aProperties) {
			if (this.bIsDestroyed) {
				return [];
			}
			var aResult = [aProperties];
			if (oDelegate && typeof oDelegate.fetchPropertyExtensions === "function") {
				return oDelegate.fetchPropertyExtensions(this, aProperties).then(function(mExtensions) {
					return aResult.concat(mExtensions);
				});
			}
			return aResult.concat(undefined);
		}.bind(this)).then(function(aResult) {
			if (this.bIsDestroyed) {
				return [];
			}
			return fetchPropertyHelperClass(this, oDelegate, aResult[0], aResult[1]).then(function(PropertyHelper) {
				return aResult.concat(PropertyHelper);
			});
		}.bind(this)).then(function(aResult) {
			if (this.bIsDestroyed) {
				return undefined;
			}

			var aProperties = aResult[0];
			var mExtensions = aResult[1];
			var PropertyHelper = aResult[2];
			this._oPropertyHelper = new PropertyHelper(aProperties, mExtensions, this, undefined, undefined);
			this._bPropertyHelperInitializing = false;
			if (bFinal) {
				this._bPropertyHelperFinal = true;
			}
			return this._oPropertyHelperDeferred.resolve(this._oPropertyHelper);
		}.bind(this)).catch(function (oError) {
			return this._oPropertyHelperDeferred && this._oPropertyHelperDeferred.reject(oError);
		}.bind(this));
	}

	function _updatePropertyHelper(aProperties, bFinal) {
		if (this._bPropertyHelperFinal) {
			throw new Error("This property helper is already final and cannot be updated further.");
		}
		this._oPropertyHelper.setProperties(aProperties);
		this._bPropertyHelperFinal = bFinal || this._bPropertyHelperFinal;
		return this._oPropertyHelper;
	}

	// use delegate for final properties
	function _getDelegateProperties (oControl) {
		return oControl.initControlDelegate().then(function () {
			return oControl.getControlDelegate(oControl).fetchProperties(oControl); // not using arg as some unit tests override "getControlDelegate"


		});
	}

	function fetchPropertyHelperClass(oControl, oDelegate, aProperties) {
		if (oDelegate && typeof oDelegate.getPropertyHelperClass === "function") {
			var oDelegatePropertyHelperClass = oDelegate.getPropertyHelperClass();
			var sBaseClass = oControl._oPropertyHelperClass ? oControl._oPropertyHelperClass.getMetadata().getName() : "sap.ui.mdc.util.PropertyHelper";

			if (!oDelegatePropertyHelperClass || !oDelegatePropertyHelperClass.getMetadata || !oDelegatePropertyHelperClass.getMetadata().isA(sBaseClass)) {
				throw new Error("The property helper class must be " + sBaseClass + " or a subclass of it.");
			}
			return Promise.resolve(oDelegatePropertyHelperClass);
		}

		if (oControl._oPropertyHelperClass) {
			return Promise.resolve(oControl._oPropertyHelperClass);
		}

		return loadModules("sap/ui/mdc/util/PropertyHelper").then(function(aResult) {
			return aResult[0];
		});
	}

	return function () {
		this.init = PropertyHelperMixin.init(this.init);
		this.exit = PropertyHelperMixin.exit(this.exit);
		this.applySettings = PropertyHelperMixin.applySettings(this.applySettings);


		this.initPropertyHelper = PropertyHelperMixin.initPropertyHelper;
		this.awaitPropertyHelper = PropertyHelperMixin.awaitPropertyHelper;
		this.getPropertyHelper = PropertyHelperMixin.getPropertyHelper;

		this.finalizePropertyHelper = PropertyHelperMixin.finalizePropertyHelper;
		this.isPropertyHelperFinal = PropertyHelperMixin.isPropertyHelperFinal;

		this._getPropertyByName = PropertyHelperMixin._getPropertyByName;
		this._getPropertyByNameAsync = PropertyHelperMixin._getPropertyByNameAsync;
		this._setPropertyHelperClass = PropertyHelperMixin._setPropertyHelperClass;
		this._setupPropertyInfoStore = PropertyHelperMixin._setupPropertyInfoStore;

	};
});

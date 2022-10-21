/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_CancelablePromise"
], function (
	_CancelablePromise
) {
	"use strict";

	/**
	 * Registry for property editor validators.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.validator.ValidatorRegistry
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @static
	 * @since 1.81
	 * @private
	 * @experimental Since 1.81
	 * @ui5-restricted
	 */

	var ValidatorRegistry = {};

	var oValidators = {};

	var oLoadingValidators = {};

	/**
	* Registers the given validator types. If a validator type is already registered, it will be skipped and must first be deregistered using the <code>ValidatorRegistry.deregisterValidator</code> function.
	* @param {Object<string, string>} mNames - Validator types and paths to register
	* @public
	* @function
	* @name sap.ui.integration.designtime.baseEditor.validator.ValidatorRegistry.registerValidators
	*/
	ValidatorRegistry.registerValidators = function (mNames) {
		Object.keys(mNames).forEach(function (sName) {
			if (!this.hasValidator(sName)) {
				oLoadingValidators[sName] = new _CancelablePromise(function (resolve, reject, onCancel) {
					onCancel(function () {
						delete oLoadingValidators[sName];
					});

					onCancel.shouldReject = false;

					sap.ui.require(
						[mNames[sName]],
						resolve,
						reject
					);
				});

				oLoadingValidators[sName].then(function (oValidator) {
					oValidators[sName] = oValidator;
					delete oLoadingValidators[sName];
				});
			}
		}.bind(this));
	};

	/**
	* Ready check to make sure that all registered validators were loaded.
	* @returns {Promise} Promise which resolves when all validators are ready
	* @public
	* @function
	* @name sap.ui.integration.designtime.baseEditor.validator.ValidatorRegistry.ready
	*/
	ValidatorRegistry.ready = function () {
		return Promise.all(Object.values(oLoadingValidators));
	};

	/**
	* Deregisters the given validator type and cancels the loading.
	* @param {string} sName - Validator type to deregister
	* @public
	* @function
	* @name sap.ui.integration.designtime.baseEditor.validator.ValidatorRegistry.deregisterValidators
	*/
	ValidatorRegistry.deregisterValidator = function (sName) {
		if (oValidators[sName]) {
			delete oValidators[sName];
		}
		if (oLoadingValidators[sName]) {
			oLoadingValidators[sName].cancel();
		}
	};

	/**
	* Deregisters all validators.
	* @public
	* @function
	* @name sap.ui.integration.designtime.baseEditor.validator.ValidatorRegistry.deregisterAllValidators
	*/
	ValidatorRegistry.deregisterAllValidators = function () {
		Object.keys(oLoadingValidators).forEach(function (sName) {
			this.deregisterValidator(sName);
		}.bind(this));
		oValidators = {};
	};

	/**
	* Returns the validator for the given type if it was loaded.
	* @param {string} sName - Validator type
	* @returns {object} Validator
	* @public
	* @function
	* @name sap.ui.integration.designtime.baseEditor.validator.ValidatorRegistry.getValidator
	*/
	ValidatorRegistry.getValidator = function (sName) {
		var oValidator = oValidators[sName];
		if (!oValidator) {
			throw new Error("Validator " + sName + " was not registered.");
		}
		return oValidator;
	};

	/**
	* Checks whether the given validator type was already loaded.
	* @param {string} sName - Validator type
	* @returns {boolean} Whether the validator was loaded or not
	* @public
	* @function
	* @name sap.ui.integration.designtime.baseEditor.validators.ValidatorRegistry.hasValidator
	*/
	ValidatorRegistry.hasValidator = function (sName) {
		return Object.keys(oValidators).includes(sName);
	};

	/**
	* Checks whether the given validator type was registered but not loaded yet.
	* @param {string} sName - Validator type
	* @returns {boolean} Whether the validator was registered
	* @public
	* @function
	* @name sap.ui.integration.designtime.baseEditor.validator.ValidatorRegistry.isRegistered
	*/
	ValidatorRegistry.isRegistered = function (sName) {
		return Object.keys(oLoadingValidators).includes(sName);
	};

	return ValidatorRegistry;
});
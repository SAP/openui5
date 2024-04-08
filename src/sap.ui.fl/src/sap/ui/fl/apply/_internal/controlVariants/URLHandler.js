/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Component",
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/util/isEmptyObject",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/thirdparty/hasher",
	"sap/ui/fl/apply/_internal/controlVariants/Utils"
], function(
	Component,
	Log,
	deepEqual,
	merge,
	ObjectPath,
	isEmptyObject,
	ManagedObjectObserver,
	hasher,
	VariantUtil
) {
	"use strict";

	var _mVariantIdChangeHandlers = {};

	/**
	 * URL handler utility for <code>sap.ui.fl variants</code> (see {@link sap.ui.fl.variants.VariantManagement})
	 *
	 * @namespace
	 * @alias sap.ui.fl.apply._internal.controlVariants.URLHandler
	 * @since 1.72
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	 var URLHandler = {};

	/**
	 * Checks if the parsed shell hash contains outdated variant parameters.
	 *
	 * @param {array} aNewHashParameters - Variant URL Parameters
	 * @param {sap.ui.fl.variants.VariantModel} oModel - Variant model
	 *
	 * @returns {object} oIfUpdateIsRequiredWithCurrentVariants
	 * @returns {boolean} oIfUpdateIsRequiredWithCurrentVariants.updateRequired - If update is required
	 * @returns {object} oIfUpdateIsRequiredWithCurrentVariants.currentVariantReferences - Current variant references
	 */
	function _getUpdatedURLParameters(aNewHashParameters, oModel) {
		var aAddedVMReferences = [];
		return aNewHashParameters.reduce(function(oResultantParameters, sVariantReference) {
			var sVariantManagementReference = oModel.getVariantManagementReference(sVariantReference).variantManagementReference;

			if (sVariantManagementReference) {
				// check if a URL parameter for this variant management reference was already added
				if (aAddedVMReferences.includes(sVariantManagementReference)) {
					oResultantParameters.updateRequired = true;
					return oResultantParameters;
				}
				aAddedVMReferences.push(sVariantManagementReference);
			}
			// if there exists a variant management reference AND current variant has changed
			if (sVariantManagementReference && oModel.oData[sVariantManagementReference].currentVariant !== sVariantReference) {
				oResultantParameters.updateRequired = true;
				if (oModel.oData[sVariantManagementReference].currentVariant !== oModel.oData[sVariantManagementReference].defaultVariant) {
					// the current variant is not equal to default variant
					// add the updated variant
					oResultantParameters.parameters.push(oModel.oData[sVariantManagementReference].currentVariant);
				}
			} else {
				// when the variant management reference is unknown OR the current variant hasn't changed
				oResultantParameters.parameters.push(sVariantReference);
			}

			return oResultantParameters;
		}, {updateRequired: false, parameters: []});
	}

	function _checkAndUpdateURLParameters(oParsedHash, oModel) {
		var vRelevantParameters = ObjectPath.get(["params", VariantUtil.VARIANT_TECHNICAL_PARAMETER], oParsedHash);
		if (vRelevantParameters) {
			var oUpdatedParameters = _getUpdatedURLParameters(vRelevantParameters, oModel);
			if (oUpdatedParameters.updateRequired) {
				URLHandler.update({
					updateURL: !oModel._bDesignTimeMode, // not required in UI Adaptation mode
					parameters: oUpdatedParameters.parameters,
					updateHashEntry: true,
					model: oModel
				});
			}
		}
	}

	/**
	 * Navigation filter attached to the ushell ShellNavigationInternal service.
	 * Each time a shell navigation occurs this function is called.
	 *
	 * @param {sap.ui.fl.variants.VariantModel} oModel - Variant Model
	 * @param {string} sNewHash - New hash
	 *
	 * @returns {string} Value that signifies "Continue" navigation in the "ShellNavigationInternal" service of ushell
	 * (see {@link sap.ushell.services.ShellNavigationInternal})
	 *
	 * @private
	 */
	function _handleVariantIdChangeInURL(oModel, sNewHash) {
		try {
			const oURLParsingService = oModel.getUShellService("URLParsing");
			if (oURLParsingService) {
				const oNewParsedHash = oURLParsingService.parseShellHash(sNewHash);
				_checkAndUpdateURLParameters(oNewParsedHash, oModel);
			}
		} catch (oError) {
			Log.error(oError.message);
		}
		const oShellNavigationInternalService = oModel.getUShellService("ShellNavigationInternal");
		return oShellNavigationInternalService && oShellNavigationInternalService.NavigationFilterStatus.Continue;
	}

	/**
	 * Registers navigation filter function for the ushell ShellNavigationInternal service.
	 *
	 * @param {sap.ui.fl.variants.VariantModel} oModel - Variant Model
	 *
	 * @private
	 */
	function _registerNavigationFilter(oModel) {
		const oShellNavigationInternalService = oModel.getUShellService("ShellNavigationInternal");
		if (!_mVariantIdChangeHandlers[oModel.sFlexReference]) {
			_mVariantIdChangeHandlers[oModel.sFlexReference] = _handleVariantIdChangeInURL.bind(null, oModel);
			if (oShellNavigationInternalService) {
				oShellNavigationInternalService.registerNavigationFilter(_mVariantIdChangeHandlers[oModel.sFlexReference]);
			}
		}
	}

	/**
	 * De-registers navigation filter function for the ushell ShellNavigationInternal service.
	 *
	 * @param {sap.ui.fl.variants.VariantModel} oModel - Variant Model
	 *
	 * @private
	 */
	function _deRegisterNavigationFilter(oModel) {
		const oShellNavigationInternalService = oModel.getUShellService("ShellNavigationInternal");
		if (oShellNavigationInternalService) {
			oShellNavigationInternalService.unregisterNavigationFilter(_mVariantIdChangeHandlers[oModel.sFlexReference]);
			delete _mVariantIdChangeHandlers[oModel.sFlexReference];
		}
	}

	/**
	 * Sets the values for url hash and technical parameters for the component data.
	 * Deactivates hash based navigation while performing the operations, which is then re-activated upon completion.
	 * If the passed doesn't exist in the url hash or technical parameters, then a new object is added respectively.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string[]} mPropertyBag.parameters - Array of values for the technical parameter
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
	 * @param {boolean} [mPropertyBag.silent] - <code>true</code> if the technical parameter should be set without triggering event listeners
	 *
	 * @private
	 */
	function setTechnicalURLParameterValues(mPropertyBag) {
		const oModel = mPropertyBag.model;
		const oURLParsingService = oModel.getUShellService("URLParsing");
		const oNavigationService = oModel.getUShellService("Navigation");
		const oParsedHash = oURLParsingService && oURLParsingService.parseShellHash(hasher.getHash());

		if (oParsedHash && oParsedHash.params) {
			const mOldHashParams = Object.assign({}, oParsedHash.params);
			const mTechnicalParameters = oModel.oAppComponent?.getComponentData?.()?.technicalParameters;
			// if mTechnicalParameters are not available we write a warning and continue updating the hash
			if (!mTechnicalParameters) {
				Log.warning(
					"Component instance not provided, so technical parameters in component data and browser history remain unchanged"
				);
			}
			if (mPropertyBag.parameters.length === 0) {
				delete oParsedHash.params[VariantUtil.VARIANT_TECHNICAL_PARAMETER];
				// Case when ControlVariantsAPI.clearVariantParameterInURL is called with a parameter
				if (mTechnicalParameters) {
					delete mTechnicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER];
				}
			} else {
				oParsedHash.params[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = mPropertyBag.parameters;
				// Technical parameters need to be in sync with the URL hash
				if (mTechnicalParameters) {
					mTechnicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = mPropertyBag.parameters;
				}
			}

			if (mPropertyBag.silent) {
				hasher.changed.active = false; // disable changed signal
				hasher.replaceHash(oURLParsingService.constructShellHash(oParsedHash));
				hasher.changed.active = true; // re-enable changed signal
			} else if (!deepEqual(mOldHashParams, oParsedHash.params)) {
				oNavigationService.navigate({
					target: {
						semanticObject: oParsedHash.semanticObject,
						action: oParsedHash.action,
						context: oParsedHash.contextRaw
					},
					params: oParsedHash.params,
					appSpecificRoute: oParsedHash.appSpecificRoute,
					writeHistory: false
				});
			}
		}
	}

	/**
	 * Returns the index at which the passed variant management reference is present.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant management model
	 *
	 * @returns {object} oParametersWithIndex - Return object
	 * @returns {int} oParametersWithIndex.index - The index in the array of variant URL parameters
	 * @returns {undefined | string[]} [oParametersWithIndex.parameters] - array of variant URL parameters or undefined when no shell is present
	 *
	 * @private
	 */
	function getVariantIndexInURL(mPropertyBag) {
		var mReturnObject = {index: -1};
		var oModel = mPropertyBag.model;

		// if ushell container is not present an empty object is returned
		var oURLParsingService = oModel.getUShellService("URLParsing");
		var mURLParameters = oURLParsingService && oURLParsingService.parseShellHash(hasher.getHash()).params;

		if (mURLParameters) {
			mReturnObject.parameters = [];
			// in UI Adaptation the URL parameters are empty
			// the current URL parameters are retrieved from the stored hash data
			if (oModel._bDesignTimeMode) {
				mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = URLHandler.getStoredHashParams(mPropertyBag);
			}

			if (Array.isArray(mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER])) {
				mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] =
					mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER].map(decodeURIComponent);
				mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER].some(function(sParamDecoded, iIndex) {
					if (!isEmptyObject(oModel.getVariant(sParamDecoded, mPropertyBag.vmReference))) {
						mReturnObject.index = iIndex;
						return true;
					}
					return false;
				});
			}
		}
		return merge(
			mReturnObject,
			mURLParameters
			&& mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER]
			&& {parameters: mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER]}
		);
	}

	function isVariantParameterPresent(oModel) {
		var oURLParsingService = oModel.getUShellService("URLParsing");
		var oParsedHash = oURLParsingService && oURLParsingService.parseShellHash(hasher.getHash());
		return oParsedHash && oParsedHash.params && oParsedHash.params[VariantUtil.VARIANT_TECHNICAL_PARAMETER];
	}

	URLHandler.variantTechnicalParameterName = "sap-ui-fl-control-variant-id";

	/**
	 * Initializes hash data for the passed variant model
	 * (see {@link sap.ui.fl.variants.VariantModel}).
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	 URLHandler.initialize = function(mPropertyBag) {
		var oModel = mPropertyBag.model;
		var oURLParsingService = oModel.getUShellService("URLParsing");

		var oParsedHash = oURLParsingService && oURLParsingService.parseShellHash(hasher.getHash());
		var aParams = oParsedHash && oParsedHash.params && oParsedHash.params[VariantUtil.VARIANT_TECHNICAL_PARAMETER];

		// register navigation filters and component creation / destroy observers
		URLHandler.attachHandlers(mPropertyBag);

		// trigger update to initialize
		URLHandler.update({
			model: oModel,
			parameters: aParams,
			updateHashEntry: Array.isArray(aParams) && aParams.length > 0
		});

		// to trigger checks on parameters
		_checkAndUpdateURLParameters(oParsedHash, oModel);
	};

	/**
	 * Updates the variant reference in URL at the correct index.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.newVReference - Variant reference to be set
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	 URLHandler.updateVariantInURL = function(mPropertyBag) {
		// remove parameter for variant management if available
		var mUpdatedParameters = URLHandler.removeURLParameterForVariantManagement(mPropertyBag);

		// standalone mode
		if (!mUpdatedParameters.parameters) {
			return;
		}

		var aParameters = mUpdatedParameters.parameters || [];
		var iIndex = mUpdatedParameters.index;
		var bIsDefaultVariant = mPropertyBag.newVReference === mPropertyBag.model.oData[mPropertyBag.vmReference].defaultVariant;

		// default variant should not be added as parameter to the URL (no parameter => default)
		if (!bIsDefaultVariant) {
			if (iIndex === -1) {
				aParameters = aParameters.concat([mPropertyBag.newVReference]);
			} else {
				// insert variant reference at index, without mutating original parameters
				aParameters = aParameters.slice(0, iIndex).concat([mPropertyBag.newVReference], aParameters.slice(iIndex));
			}
		}
		// update required only when the passed variant is:
		// not a default variant OR default variant where a parameter was removed
		if (!bIsDefaultVariant || iIndex > -1) {
			URLHandler.update({
				parameters: aParameters,
				updateURL: !mPropertyBag.model._bDesignTimeMode,
				updateHashEntry: true,
				model: mPropertyBag.model
			});
		}
	};

	/**
	 * Removes the variant URL parameter for the passed variant management
	 * and returns the index at which the passed variant management is present.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant management model
	 *
	 * @returns {object} Object with two properties: the index of the URL parameter as 'index' and an array of variant URL parameters after the removal as 'parameters'
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	 URLHandler.removeURLParameterForVariantManagement = function(mPropertyBag) {
		var mVariantParametersInURL = getVariantIndexInURL(mPropertyBag);
		if (mVariantParametersInURL.index > -1) {
			mVariantParametersInURL.parameters.splice(mVariantParametersInURL.index, 1);
		}
		return mVariantParametersInURL;
	};

	/**
	 * Attaches initial handlers for component lifecycle and persists the loaded variant management.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} [mPropertyBag.vmReference] - Variant management reference
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
	 * @param {boolean} [mPropertyBag.updateURL] - Indicating if <code>updateVariantInURL</code> property is enabled for the passed variant management reference
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	 URLHandler.attachHandlers = function(mPropertyBag) {
		function observerHandler() {
			// variant switch promise needs to be checked, since there might be a pending on-going variants switch
			// which might result in unnecessary data being stored
			return mPropertyBag.model._oVariantSwitchPromise.then(function() {
				mPropertyBag.model._oHashData.controlPropertyObservers.forEach(function(oObserver) {
					oObserver.destroy();
				});
				// deregister navigation filter if ushell is available
				_deRegisterNavigationFilter(mPropertyBag.model);

				// this promise is not returned since the component is getting destroyed,
				// which will also destroy the variant model anyway,
				// but this is just to ensure the model is in sync with the variants state (which is persisted)
				mPropertyBag.model.destroy();
				mPropertyBag.model.oComponentDestroyObserver.unobserve(mPropertyBag.model.oAppComponent, {destroy: true});
				mPropertyBag.model.oComponentDestroyObserver.destroy();
			});
		}

		// register navigation filter for custom navigation
		_registerNavigationFilter(mPropertyBag.model);

		if (!mPropertyBag.model.oComponentDestroyObserver && mPropertyBag.model.oAppComponent instanceof Component) {
			mPropertyBag.model.oComponentDestroyObserver = new ManagedObjectObserver(observerHandler.bind(null));
			mPropertyBag.model.oComponentDestroyObserver.observe(mPropertyBag.model.oAppComponent, {destroy: true});
		}
	};

	/**
	 * Registers a variant management control for URL handling
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
	 * @param {boolean} mPropertyBag.updateURL - Indicating if <code>updateVariantInURL</code> property is enabled for the passed variant management reference
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	 URLHandler.registerControl = function(mPropertyBag) {
		if (mPropertyBag.updateURL) {
			mPropertyBag.model._oHashData.variantControlIds.push(mPropertyBag.vmReference);
		}
	};

	/**
	 * Optionally updates the hash data with hash parameters and / or updates the variant URL parameter.
	 *
	 * @param {object} mPropertyBag - Properties for hash update
	 * @param {string[]} mPropertyBag.parameters - Array of variant URL parameter values
	 * @param {boolean} [mPropertyBag.updateURL] - Indicates if URL needs to be updated
	 * @param {boolean} [mPropertyBag.updateHashEntry] - Indicates if hash data should be updated
	 * @param {boolean} [mPropertyBag.silent] - <code>true</code> if the technical parameter should be set without triggering event listeners
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	 URLHandler.update = function(mPropertyBag) {
		mPropertyBag.model._oHashData ||= {
			hashParams: [],
			controlPropertyObservers: [],
			variantControlIds: []
		};
		if (!mPropertyBag || !Array.isArray(mPropertyBag.parameters)) {
			Log.info("Variant URL parameters could not be updated since invalid parameters were received");
			return;
		}
		if (mPropertyBag.updateURL) {
			setTechnicalURLParameterValues(mPropertyBag);
		}
		if (mPropertyBag.updateHashEntry && !isEmptyObject(mPropertyBag.model)) {
			mPropertyBag.model._oHashData.hashParams = mPropertyBag.parameters;
		}
	};

	/**
	 * Returns the current hash parameters from the variant model's hash data
	 * (see {@link sap.ui.fl.variants.VariantModel}).
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
	 *
	 * @returns {array} Array of variant parameter values in the URL
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	 URLHandler.getStoredHashParams = function(mPropertyBag) {
		return Array.prototype.slice.call(mPropertyBag.model._oHashData.hashParams);
	};

	/**
	 * Handles model context change by resetting the respective variant management reference to default.
	 * Also, listens to change in <code>resetOnContextChange</code> property, for attaching and detaching handlers.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.variants.VariantManagement} mPropertyBag.vmControl - Variant management control
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	 URLHandler.handleModelContextChange = function(mPropertyBag) {
		var sContextChangeEvent = "modelContextChange";

		function handleContextChange(oEvent, oParams) {
			var sVariantManagementReference = oParams.model.getVariantManagementReferenceForControl(oEvent.getSource());
			var aVariantManagements = oParams.model._oHashData.variantControlIds;
			// variant management will only exist in the hash data if 'updateInVariantURL' property is set (see attachHandlers())
			var iIndex = aVariantManagements.indexOf(sVariantManagementReference);
			if (iIndex > -1) {
				// all controls which were later initialized need to be reset to default variant
				aVariantManagements.slice(iIndex).forEach(
					function(sVariantManagementToBeReset) {
						if (getVariantIndexInURL({
							vmReference: sVariantManagementToBeReset,
							model: mPropertyBag.model
						}).index === -1) {
							oParams.model.switchToDefaultForVariantManagement(sVariantManagementToBeReset);
						}
					}
				);
			}
		}

		var oControlPropertyObserver = new ManagedObjectObserver(function(oEvent) {
			if (oEvent.current === true && oEvent.old === false) {
				oEvent.object.attachEvent(sContextChangeEvent, {model: mPropertyBag.model}, handleContextChange);
			} else if (oEvent.current === false && oEvent.old === true) {
				oEvent.object.detachEvent(sContextChangeEvent, handleContextChange);
			}
		});

		oControlPropertyObserver.observe(mPropertyBag.vmControl, {properties: ["resetOnContextChange"]});

		mPropertyBag.model._oHashData.controlPropertyObservers.push(oControlPropertyObserver);

		if (mPropertyBag.vmControl.getResetOnContextChange() !== false) {
			mPropertyBag.vmControl.attachEvent(sContextChangeEvent, {model: mPropertyBag.model}, handleContextChange);
		}
	};

	/**
	 * Clears all variant URL parameters for the passed variant model.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	 URLHandler.clearAllVariantURLParameters = function(mPropertyBag) {
		if (isVariantParameterPresent(mPropertyBag.model)) {
			URLHandler.update({
				updateURL: true,
				parameters: [],
				updateHashEntry: false,
				model: mPropertyBag.model
			});
		}
	};

	return URLHandler;
});
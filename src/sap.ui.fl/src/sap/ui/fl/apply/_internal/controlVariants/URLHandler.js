/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/fl/Utils",
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/util/isEmptyObject",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/thirdparty/hasher",
	"sap/base/util/includes"
], function(
	Component,
	Utils,
	Log,
	merge,
	ObjectPath,
	isEmptyObject,
	ManagedObjectObserver,
	hasher,
	includes
) {
	"use strict";

	var _mVariantIdChangeHandlers = {};
	/**
	 * Checks if the parsed shell hash contains outdated variant parameters.
	 *
	 * @param {sap.ui.fl.Model} oModel - Variant model
	 * @param {object} oNewParsedHash - Parsed shell hash that is being set
	 *
	 * @returns {object} oIfUpdateIsRequiredWithCurrentVariants
	 * @returns {boolean} oIfUpdateIsRequiredWithCurrentVariants.updateRequired - If update is required
	 * @returns {object} oIfUpdateIsRequiredWithCurrentVariants.currentVariantReferences - Current variant references
	 */
	function _getUpdatedURLParameters(oNewParsedHash, oModel) {
		var aNewHashParameters = oNewParsedHash.params[URLHandler.variantTechnicalParameterName];
		var aAddedVMReferences = [];
		return aNewHashParameters.reduce(function (aResultantParameters, sVariantReference) {
			var sVariantManagementReference = oModel.getVariantManagementReference(sVariantReference).variantManagementReference;

			if (sVariantManagementReference) {
				// check if a URL parameter for this variant management reference was already added
				if (includes(aAddedVMReferences, sVariantManagementReference)) {
					return aResultantParameters;
				}
				aAddedVMReferences.push(sVariantManagementReference);
			}
			// if there exists a variant management reference AND current variant has changed
			if (sVariantManagementReference && oModel.oData[sVariantManagementReference].currentVariant !== sVariantReference) {
				if (oModel.oData[sVariantManagementReference].currentVariant !== oModel.oData[sVariantManagementReference].defaultVariant) {
					// the current variant is not equal to default variant
					// add the updated variant
					aResultantParameters.push(oModel.oData[sVariantManagementReference].currentVariant);
				}
			} else {
				// when the variant management reference is unknown OR the current variant hasn't changed
				aResultantParameters.push(sVariantReference);
			}

			return aResultantParameters;
		}, []);
	}

	function _checkAndUpdateURLParameters(oParsedHash, oModel) {
		var bRelevantParameters = ObjectPath.get(["params", URLHandler.variantTechnicalParameterName], oParsedHash);
		var aUpdatedParameters = bRelevantParameters ? _getUpdatedURLParameters(oParsedHash, oModel) : [];

		URLHandler.update({
			updateURL: !oModel._bDesignTimeMode, // not required in UI Adaptation mode
			parameters: aUpdatedParameters,
			updateHashEntry: true,
			model: oModel
		});

		if (oModel._bDesignTimeMode) {
			URLHandler.clearAllVariantURLParameters({model: oModel});
		}
	}

	/**
	 * Navigation filter attached to the ushell ShellNavigation service.
	 * Each time a shell navigation occurs this function is called.
	 *
	 * @param {sap.ui.fl.variants.VariantModel} oModel - Variant Model
	 * @param {string} sNewHash - New hash
	 *
	 * @returns {string} Value that signifies "Continue" navigation in the "ShellNavigation" service of ushell
	 * {@see sap.ushell.services.ShellNavigation}
	 *
	 * @private
	 */
	function _handleVariantIdChangeInURL(oModel, sNewHash) {
		var oUshellContainer = Utils.getUshellContainer();
		var oShellNavigation = oUshellContainer.getService("ShellNavigation");
		try {
			var oURLParsing = oUshellContainer.getService("URLParsing");
			var oNewParsedHash = oURLParsing.parseShellHash(sNewHash);
			_checkAndUpdateURLParameters(oNewParsedHash, oModel);
		} catch (oError) {
			Log.error(oError.message);
		}
		return oShellNavigation.NavigationFilterStatus.Continue;
	}

	/**
	 * Registers navigation filter function for the ushell ShellNavigation service.
	 *
	 * @param {sap.ui.fl.variants.VariantModel} oModel - Variant Model
	 *
	 * @private
	 */
	function _registerNavigationFilter(oModel) {
		var sReference = Utils.getComponentClassName(oModel.oAppComponent);
		var oUshellContainer = Utils.getUshellContainer();
		if (!_mVariantIdChangeHandlers[sReference] && oUshellContainer) {
			_mVariantIdChangeHandlers[sReference] = _handleVariantIdChangeInURL.bind(null, oModel);
			oUshellContainer.getService("ShellNavigation").registerNavigationFilter(_mVariantIdChangeHandlers[sReference]);
		}
	}

	/**
	 * De-registers navigation filter function for the ushell ShellNavigation service.
	 *
	 * @param {sap.ui.fl.variants.VariantModel} oModel - Variant Model
	 *
	 * @private
	 */
	function _deRegisterNavigationFilter(oModel) {
		var sReference = Utils.getComponentClassName(oModel.oAppComponent);
		var oUshellContainer = Utils.getUshellContainer();
		if (_mVariantIdChangeHandlers[sReference] && oUshellContainer) {
			oUshellContainer.getService("ShellNavigation").unregisterNavigationFilter(_mVariantIdChangeHandlers[sReference]);
			delete _mVariantIdChangeHandlers[sReference];
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
		var oParsedHash = Utils.getParsedURLHash(URLHandler.variantTechnicalParameterName);

		if (oParsedHash.params) {
			var mTechnicalParameters = Utils.getTechnicalParametersForComponent(mPropertyBag.model.oAppComponent);
			// if mTechnicalParameters are not available we write a warning and continue updating the hash
			if (!mTechnicalParameters) {
				Log.warning("Component instance not provided, so technical parameters in component data and browser history remain unchanged");
			}
			if (mPropertyBag.parameters.length === 0) {
				delete oParsedHash.params[URLHandler.variantTechnicalParameterName];
				mTechnicalParameters && delete mTechnicalParameters[URLHandler.variantTechnicalParameterName]; // Case when ControlVariantsAPI.clearVariantParameterInURL is called with a parameter
			} else {
				oParsedHash.params[URLHandler.variantTechnicalParameterName] = mPropertyBag.parameters;
				mTechnicalParameters && (mTechnicalParameters[URLHandler.variantTechnicalParameterName] = mPropertyBag.parameters); // Technical parameters need to be in sync with the URL hash
			}

			if (mPropertyBag.silent) {
				hasher.changed.active = false; // disable changed signal
				hasher.replaceHash(Utils.getUshellContainer().getService("URLParsing").constructShellHash(oParsedHash));
				hasher.changed.active = true;  // re-enable changed signal
			} else {
				var oCrossAppNav = Utils.getUshellContainer().getService("CrossApplicationNavigation");
				oCrossAppNav.toExternal({
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
	 * @returns {integer} oParametersWithIndex.index - The index in the array of variant URL parameters
	 * @returns {undefined | string[]} [oParametersWithIndex.parameters] - array of variant URL parameters or undefined when no shell is present
	 *
	 * @private
	 */
	function getVariantIndexInURL(mPropertyBag) {
		var mReturnObject = {index: -1};

		// if ushell container is not present an empty object is returned
		var mURLParameters = Utils.getParsedURLHash().params;

		if (mURLParameters) {
			mReturnObject.parameters = [];
			// in UI Adaptation the URL parameters are empty
			// the current URL parameters are retrieved from the stored hash data
			if (mPropertyBag.model._bDesignTimeMode) {
				mURLParameters[URLHandler.variantTechnicalParameterName] = URLHandler.getStoredHashParams(mPropertyBag);
			}

			if (Array.isArray(mURLParameters[URLHandler.variantTechnicalParameterName])) {
				mURLParameters[URLHandler.variantTechnicalParameterName] = mURLParameters[URLHandler.variantTechnicalParameterName].map(decodeURIComponent);
				mURLParameters[URLHandler.variantTechnicalParameterName].some(function (sParamDecoded, iIndex) {
					// if parameter index has not been found and a variant exists for the combination of variant reference and variant parameter
					if (mPropertyBag.model.oVariantController.getVariant(mPropertyBag.vmReference, sParamDecoded)) {
						mReturnObject.index = iIndex;
						return true;
					}
				});
			}
		}
		return merge(
			mReturnObject,
			mURLParameters && mURLParameters[URLHandler.variantTechnicalParameterName] && {parameters: mURLParameters[URLHandler.variantTechnicalParameterName]}
			);
	}

	/**
	 * URL handler utility for <code>sap.ui.fl variants</code> (@see sap.ui.fl.variants.VariantManagement}
	 *
	 * @namespace sap.ui.fl.apply._internal.variants.URLHandler
	 * @since 1.72
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	var URLHandler = {
		variantTechnicalParameterName: "sap-ui-fl-control-variant-id",

		/**
		 * Initialize hash data for the passed variant model.
		 * {@see sap.ui.fl.variants.VariantModel}
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.variants.VariantModel
		 */
		initialize: function (mPropertyBag) {
			var oParsedHash = Utils.getParsedURLHash();
			_checkAndUpdateURLParameters(oParsedHash, mPropertyBag.model);
			URLHandler.attachHandlers(mPropertyBag);
		},

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
		updateVariantInURL: function (mPropertyBag) {
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
		},

		/**
		 * Removes the variant URL parameter for the passed variant management and returns the index at which the passed variant management is present.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.vmReference - Variant management reference
		 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant management model
		 *
		 * @returns {object} oParametersWithIndex - Return object
		 * @returns {integer} oParametersWithIndex.index - The index at which the URL parameter is present
		 * @returns {undefined | string[]} [oParametersWithIndex.parameters] - array of variant URL parameters after removing the desired parameter
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.variants.VariantModel, sap.ui.fl.ControlPersonalizationAPI
		 */
		removeURLParameterForVariantManagement: function (mPropertyBag) {
			var mVariantParametersInURL = getVariantIndexInURL(mPropertyBag);
			if (mVariantParametersInURL.index > -1) {
				mVariantParametersInURL.parameters.splice(mVariantParametersInURL.index, 1);
			}
			return mVariantParametersInURL;
		},

		/**
		 * Attach initial handlers for component lifecycle and persist the loaded variant management.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} [mPropertyBag.vmReference] - Variant Management reference
		 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
		 * @param {boolean} [mPropertyBag.updateURL] - Indicating if 'updateVariantInURL' property is enabled for the passed variant management reference
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.variants.VariantModel
		 */
		attachHandlers: function (mPropertyBag) {
			function observerHandler() {
				// variant switch promise needs to be checked, since there might be a pending on-going variants switch
				// which might result in unnecessary data being stored
				return mPropertyBag.model._oVariantSwitchPromise.then(function () {
					mPropertyBag.model._oHashData.controlPropertyObservers.forEach(function (oObserver) {
						oObserver.destroy();
					});
					// deregister navigation filter if ushell is available
					_deRegisterNavigationFilter(mPropertyBag.model);
					mPropertyBag.model.oChangePersistence.resetVariantMap();
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

			if (mPropertyBag.updateURL) {
				mPropertyBag.model._oHashData.variantControlIds.push(mPropertyBag.vmReference);
			}
		},

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
		update: function(mPropertyBag) {
			if (!mPropertyBag.model._oHashData) {
				mPropertyBag.model._oHashData = {
					hashParams: [],
					controlPropertyObservers: [],
					variantControlIds: []
				};
			}
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
		},

		/**
		 * Returns the current hash parameters from the variant model's hash data.
		 * {@see sap.ui.fl.variants.VariantModel}
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
		 *
		 * @returns {array} Array of variant parameter values in the URL
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.variants.VariantModel
		 */
		getStoredHashParams: function (mPropertyBag) {
			return Array.prototype.slice.call(mPropertyBag.model._oHashData.hashParams);
		},

		/**
		 * Handles model context change by resetting the respective variant management reference to default.
		 * Also, listens to change in "resetOnContextChange" property, for attaching and detaching handlers.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.fl.variants.VariantManagement} mPropertyBag.vmControl - Variant management control
		 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.variants.VariantModel
		 */
		handleModelContextChange: function(mPropertyBag) {
			var sContextChangeEvent = "modelContextChange";

			function handleContextChange(oEvent, oParams) {
				var sVariantManagementReference = oParams.model.getVariantManagementReferenceForControl(oEvent.getSource());
				var aVariantManagements = oParams.model._oHashData.variantControlIds;
				// variant management will only exist in the hash data if 'updateInVariantURL' property is set (see attachHandlers())
				var iIndex = aVariantManagements.indexOf(sVariantManagementReference);
				if (iIndex > -1) {
					// all controls which were later initialized need to be reset to default variant
					aVariantManagements.slice(iIndex).forEach(
						function (sVariantManagementToBeReset) {
							if (getVariantIndexInURL({vmReference: sVariantManagementToBeReset, model: mPropertyBag.model}).index === -1) {
								oParams.model.switchToDefaultForVariantManagement(sVariantManagementToBeReset);
							}
						}
					);
				}
			}

			var oControlPropertyObserver = new ManagedObjectObserver(function (oEvent) {
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
		},

		/**
		 * Clears all variant URL parameters for the passed variant model.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.variants.VariantModel
		 */
		clearAllVariantURLParameters: function(mPropertyBag) {
			URLHandler.update({
				updateURL: true,
				parameters: [],
				updateHashEntry: false,
				model: mPropertyBag.model
			});
		}
	};
	return URLHandler;
}, true);
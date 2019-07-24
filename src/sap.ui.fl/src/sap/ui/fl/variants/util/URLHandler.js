/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Component",
	"sap/ui/fl/Utils",
	"sap/ui/core/routing/History",
	"sap/ui/core/routing/HashChanger",
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/thirdparty/hasher"
], function(
	jQuery,
	Component,
	flUtils,
	History,
	HashChanger,
	Log,
	deepEqual,
	ManagedObjectObserver,
	hasher
) {
	"use strict";

	/**
	 * Provides utility functions for <code>sap.ui.fl.variants.VariantModel</code>.
	 * The functions should be called with an instance of <code>sap.ui.fl.variants.VariantModel</code>.
	 *
	 * @namespace
	 * @alias sap.ui.fl.variants.util.URLHandler
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.56.0
	 */

	var URLHandler = {
		/**
		 * Initialize URLHandler register.
		 *
		 * This function should be called on a <code>sap.ui.fl.variants.VariantModel</code> instance.
		 * {@link sap.ui.fl.variants.VariantModel}
		 *
		 * @restricted sap.ui.fl.variants.VariantModel
		 */
		initialize: function () {
			var mURLParameters = flUtils.getParsedURLHash().params;
			this._oHashRegister = {
				hashParams: (mURLParameters && mURLParameters[this.sVariantTechnicalParameterName]) || [], // current url hash parameters
				observers: [], // control property observers
				variantControlIds: [] // control ids
			};

			// register navigation filter for custom navigation
			URLHandler._setOrUnsetCustomNavigationForParameter.call(this, true);
		},

		/**
		 * Attach initial handlers for component lifecycle and persist the loaded variant management.
		 *
		 * @param {string} sVariantManagementReference - Variant Management reference
		 * @param {boolean} [bUpdateURL] - Indicating if 'updateVariantInURL' property is enabled for the passed variant management reference
		 *
		 * This function should be called on a <code>sap.ui.fl.variants.VariantModel</code> instance.
		 * {@link sap.ui.fl.variants.VariantModel}
		 *
		 * @restricted sap.ui.fl.variants.VariantModel
		 */
		attachHandlers: function (sVariantManagementReference, bUpdateURL) {
			// de-register method to process hash changes
			function observerHandler() {
				// variant switch promise needs to be checked, since there might be a pending on-going variants switch
				// which might result in unnecessary data being stored
				return this._oVariantSwitchPromise.then(function () {
					// destroy all control observers
					this._oHashRegister.observers.forEach(function (oObserver) {
						oObserver.destroy();
					});
					// deregister navigation filter if ushell is available
					URLHandler._setOrUnsetCustomNavigationForParameter.call(this, false);
					// clear variant controller map
					this.oChangePersistence.resetVariantMap();
					// destroy VariantModel
					this.destroy();
					// destroy oAppComponent.destroy() observer
					this.oComponentDestroyObserver.unobserve(this.oAppComponent, {destroy: true});
					this.oComponentDestroyObserver.destroy();
				}.bind(this));
			}

			if (!this.oComponentDestroyObserver && this.oAppComponent instanceof Component) {
				// observer for oAppComponent.destroy()
				this.oComponentDestroyObserver = new ManagedObjectObserver(observerHandler.bind(this));
				this.oComponentDestroyObserver.observe(this.oAppComponent, {destroy: true});
			}

			if (bUpdateURL) {
				this._oHashRegister.variantControlIds.push(sVariantManagementReference);
			}
		},

		/**
		 * Optionally updates the hash register with hash parameters and / or updates the variant URL parameter.
		 *
		 * @param {object} mPropertyBag - Properties for the register and variant URL parameter update
		 * @param {string[]} mPropertyBag.parameters - Array of variant URL parameter values
		 * @param {boolean} [mPropertyBag.updateURL] - Indicates if URL needs to be updated
		 * @param {boolean} [mPropertyBag.updateHashEntry] - Indicates if hash register updates should be updated
		 *
		 * This function should be called on a <code>sap.ui.fl.variants.VariantModel</code> instance.
		 * {@link sap.ui.fl.variants.VariantModel}
		 *
		 * @restricted sap.ui.fl.variants.VariantModel
		 */
		update: function(mPropertyBag) {
			if (!mPropertyBag || !Array.isArray(mPropertyBag.parameters)) {
				Log.info("Variant URL parameters could not be updated since invalid parameters were received");
				return;
			}
			if (mPropertyBag.updateURL) {
				URLHandler._setTechnicalURLParameterValues.call(this,
					mPropertyBag.component || this.oAppComponent,
					mPropertyBag.parameters
				);
			}
			if (mPropertyBag.updateHashEntry) {
				this._oHashRegister.hashParams = mPropertyBag.parameters;
			}
		},

		/**
		 * Sets or un-sets the navigation filter function for the ushell ShellNavigation service.
		 *
		 * @param {boolean} bSet - Indicates if the filter function needs to be set
		 *
		 * @private
		 */
		_setOrUnsetCustomNavigationForParameter: function(bSet) {
			var sMethodName = bSet ? "registerNavigationFilter" : "unregisterNavigationFilter";
			var oUshellContainer = flUtils.getUshellContainer();
			if (oUshellContainer) {
				oUshellContainer.getService("ShellNavigation")[sMethodName](URLHandler._navigationFilter.bind(this));
			}
		},

		/**
		 * Navigation filter attached to the ushell ShellNavigation service.
		 * Each time a shell navigation occurs this function is called.
		 *
		 * @param {string} sNewHash - New hash
		 *
		 * @private
		 */
		_navigationFilter: function(sNewHash) {
			var oUshellContainer = flUtils.getUshellContainer();
			var oShellNavigation = oUshellContainer.getService("ShellNavigation");
			try {
				var oURLParsing = oUshellContainer.getService("URLParsing");
				var oNewParsed = oURLParsing.parseShellHash(sNewHash);

				var bRelevantParameters = oNewParsed && oNewParsed.params.hasOwnProperty(this.sVariantTechnicalParameterName);

				if (bRelevantParameters) {
					var aNewHashParameters = oNewParsed.params[this.sVariantTechnicalParameterName];

					// check if new hash still contains outdated variant parameters
					var mUpdatedReferences = aNewHashParameters.reduce(function (mResult, sVariantReference) {
						var sVariantManagementReference = this.getVariantManagementReference(sVariantReference).variantManagementReference;
						if (
							// there exists a variant management reference AND current variant has changed
							sVariantManagementReference
							&& this.oData[sVariantManagementReference].currentVariant !== sVariantReference
						) {
							mResult.updateRequired = true;
							if (this.oData[sVariantManagementReference].currentVariant !== this.oData[sVariantManagementReference].defaultVariant) {
								// the current variant is not equal to default variant
								// add the updated variant
								mResult.currentVariantReferences.push(this.oData[sVariantManagementReference].currentVariant);
							}
						} else {
							// when the variant management reference is unknown OR the current variant hasn't changed
							mResult.currentVariantReferences.push(sVariantReference);
						}

						return mResult;
					}.bind(this), {updateRequired: false, currentVariantReferences: []});

					// UI Adaptation Mode
					if (this._bDesignTimeMode) {
						// save new variant parameters in register
						this.updateEntry({
							updateURL: false, // not required in UI Adaptation mode
							parameters: mUpdatedReferences.currentVariantReferences,
							updateHashEntry: mUpdatedReferences.updateRequired
						});

						// remove parameters from URL when in UI Adaptation mode
						this.updateEntry({
							updateURL: true,
							parameters: [],
							updateHashEntry: false
						});
					} else if (mUpdatedReferences.updateRequired) {
						this.updateEntry({
							updateURL: true,
							parameters: mUpdatedReferences.currentVariantReferences,
							updateHashEntry: true
						});
					}
				}
			} catch (oError) {
				Log.error(oError.message);
			}
			return oShellNavigation.NavigationFilterStatus.Continue;
		},

		/**
		 * Returns the current hash parameters from the register.
		 * This function should be called on a <code>sap.ui.fl.variants.VariantModel</code> instance.
		 * {@link sap.ui.fl.variants.VariantModel}
		 *
		 * @restricted sap.ui.fl.variants.VariantModel
		 */
		getCurrentHashParamsFromRegister: function () {
			// return clone
			return Array.prototype.slice.call(this._oHashRegister.hashParams);
		},

		/**
		 * Sets the values for url hash and technical parameters for the component data.
		 * Deactivates hash based navigation while performing the operations, which is then re-activated upon completion.
		 * If the passed doesn't exist in the url hash or technical parameters, then a new object is added respectively.
		 *
		 * @param {sap.ui.core.Component} oComponent - Component instance used to get the technical parameters
		 * @param {string[]} aValues - Array of values for the technical parameter
		 * @param {boolean} [bSilent] - <code>true</code> if the technical parameter should be set without triggering event listeners
		 * @private
		 */
		_setTechnicalURLParameterValues: function (oComponent, aValues, bSilent) {
			var oParsedHash = flUtils.getParsedURLHash(this.sVariantTechnicalParameterName);

			if (oParsedHash.params) {
				var mTechnicalParameters = flUtils.getTechnicalParametersForComponent(oComponent);
				// if mTechnicalParameters are not available we write a warning and continue updating the hash
				if (!mTechnicalParameters) {
					Log.warning("Component instance not provided, so technical parameters in component data and browser history remain unchanged");
				}
				if (aValues.length === 0) {
					delete oParsedHash.params[this.sVariantTechnicalParameterName];
					mTechnicalParameters && delete mTechnicalParameters[this.sVariantTechnicalParameterName]; // Case when ControlVariantsAPI.clearVariantParameterInURL is called with a parameter
				} else {
					oParsedHash.params[this.sVariantTechnicalParameterName] = aValues;
					mTechnicalParameters && (mTechnicalParameters[this.sVariantTechnicalParameterName] = aValues); // Technical parameters need to be in sync with the URL hash
				}

				if (bSilent) {
					hasher.changed.active = false; // disable changed signal
					hasher.replaceHash(flUtils.getUshellContainer().getService("URLParsing").constructShellHash(oParsedHash));
					hasher.changed.active = true;  // re-enable changed signal
				} else {
					var oCrossAppNav = flUtils.getUshellContainer().getService("CrossApplicationNavigation");
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
		},

		/**
		 * Handles model context change by resetting the respective variant management reference to default.
		 * Also, listens to change in "resetOnContextChange" property, for attaching and detaching handlers.
		 * This function should be called on a <code>sap.ui.fl.variants.VariantModel</code> instance.
		 * {@link sap.ui.fl.variants.VariantModel}
		 *
		 * @param {sap.ui.fl.variants.VariantManagement} oVariantManagementControl - Variant management control
		 * @restricted sap.ui.fl.variants.VariantModel
		 */
		handleModelContextChange: function(oVariantManagementControl) {
			var sContextChangeEvent = "modelContextChange";

			function handleContextChange(oEvent) {
				var sVariantManagementReference = this.getVariantManagementReferenceForControl(oEvent.getSource());
				var aVariantManagements = this._oHashRegister.variantControlIds;
				// variant management will only exist in the hash register if updateInVariantURL property is set (see attachHandlers())
				var iIndex = aVariantManagements.indexOf(sVariantManagementReference);
				if (iIndex > -1) {
					// all controls which were later initialized need to be reset to default variant
					aVariantManagements.slice(iIndex).forEach(
						function (sVariantManagementToBeReset) {
							// check if there exists a variant parameter in the URL for this variant management reference
							if (this.getVariantIndexInURL(sVariantManagementToBeReset).index === -1) {
								this.switchToDefaultForVariantManagement(sVariantManagementToBeReset);
							}
						}.bind(this)
					);
				}
			}

			// "resetOnContextChange" property
			var oControlPropertyObserver = new ManagedObjectObserver(function(oEvent) {
				if (oEvent.current === true && oEvent.old === false) {
					oEvent.object.attachEvent(sContextChangeEvent, handleContextChange, this);
				} else if (oEvent.current === false && oEvent.old === true) {
					oEvent.object.detachEvent(sContextChangeEvent, handleContextChange, this);
				}
			}.bind(this));

			oControlPropertyObserver.observe(oVariantManagementControl, { properties: ["resetOnContextChange"] });

			this._oHashRegister.observers.push(oControlPropertyObserver);

			if (oVariantManagementControl.getResetOnContextChange() !== false) {
				oVariantManagementControl.attachEvent(sContextChangeEvent, handleContextChange, this);
			}
		}
	};
	return URLHandler;
}, true);
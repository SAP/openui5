/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/base/util/isPlainObject",
	"sap/base/util/uid",
	"sap/base/util/UriParameters",
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/util/reflection/BaseTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/Scenario",
	"sap/ui/thirdparty/hasher",
	"sap/ui/core/mvc/View",
	"sap/ui/core/Configuration"
], function(
	ObjectPath,
	isPlainObject,
	uid,
	UriParameters,
	Log,
	SyncPromise,
	ManagedObject,
	BaseTreeModifier,
	Component,
	Scenario,
	hasher,
	View,
	Configuration
) {
	"use strict";

	/**
	 * Returns the type of "sap.app" from the manifest object passed.
	 * @param {sap.ui.core.Manifest} oManifest - Manifest object
	 * @returns {string|undefined} Manifest object's <code>type</code> property for <code>sap.app</code> entry
	 */
	function getComponentType(oManifest) {
		// manifest instance
		if (oManifest && oManifest.getEntry) {
			return oManifest.getEntry("sap.app") && oManifest.getEntry("sap.app").type;
		}

		// raw manifest
		return oManifest && oManifest["sap.app"] && oManifest["sap.app"].type;
	}

	function getStartUpParameter(oComponentData, sParameterName) {
		if (oComponentData && oComponentData.startupParameters && sParameterName) {
			if (Array.isArray(oComponentData.startupParameters[sParameterName])) {
				return oComponentData.startupParameters[sParameterName][0];
			}
		}
	}

	/**
	 * Provides utility functions for the SAPUI5 flexibility library
	 *
	 * @namespace
	 * @alias sap.ui.fl.Utils
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	var Utils = {
		isVariantByStartupParameter(oControl) {
			// determine UI5 component out of given control
			if (oControl) {
				var oAppComponent = this.getAppComponentForControl(oControl);
				if (oAppComponent && oAppComponent.getComponentData) {
					return !!getStartUpParameter(oAppComponent.getComponentData(), "sap-app-id");
				}
			}

			return false;
		},

		/**
		 * Returns the appDescriptor of the component for the given control
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {object} that represent the appDescriptor
		 * @function
		 * @name sap.ui.fl.Utils.getAppDescriptor
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta
		 */
		getAppDescriptor(oControl) {
			// determine UI5 component out of given control
			if (oControl) {
				var oComponent = this.getAppComponentForControl(oControl);

				// determine manifest out of found component
				if (oComponent && oComponent.getMetadata) {
					var oComponentMetaData = oComponent.getMetadata();
					if (oComponentMetaData && oComponentMetaData.getManifestObject) {
						return oComponentMetaData.getManifestObject().getJson();
					}
				}
			}
		},

		/**
		 * Indicates if the property value represents a binding
		 *
		 * @param {object} vPropertyValue - Property value
		 * @returns {boolean} true if value represents a binding
		 * @function
		 * @name sap.ui.fl.Utils.isBinding
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		isBinding(vPropertyValue) {
			return (
				(
					typeof vPropertyValue === "string"
					&& !!ManagedObject.bindingParser(vPropertyValue)
				)
				|| (
					isPlainObject(vPropertyValue)
					&& (
						(
							vPropertyValue.hasOwnProperty("path")
							|| vPropertyValue.hasOwnProperty("parts")
						)
						&& !vPropertyValue.hasOwnProperty("ui5object")
					)
				)
			);
		},

		/**
		 * Returns the Component that belongs to given control. If the control has no component, it walks up the control tree in order to find a
		 * control having one.
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {sap.ui.core.Component} found component
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		getComponentForControl(oControl) {
			function getComponentIdForControl(oControl) {
				var sComponentId = Component.getOwnerIdFor(oControl);
				if (!sComponentId) {
					if (oControl && typeof oControl.getParent === "function") {
						var oParent = oControl.getParent();
						if (oParent) {
							return getComponentIdForControl(oParent);
						}
					}
				}
				return sComponentId || "";
			}

			// determine UI5 component out of given control
			if (oControl) {
				var sComponentId = getComponentIdForControl(oControl);
				if (sComponentId) {
					return Component.get(sComponentId);
				}
			}
		},

		/**
		 * Returns the component that belongs to the passed control whose type is "application".
		 * If the control has no component, it walks up the control tree in order to find a control having one.
		 *
		 * @param {sap.ui.base.ManagedObject} oControl - Managed object instance
		 * @returns {sap.ui.core.Component} Component instance if found or undefined
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		getAppComponentForControl(oControl) {
			var oComponent = oControl instanceof Component ? oControl : Utils.getComponentForControl(oControl);

			// special case for Fiori Elements to reach the real appComponent
			if (oComponent && oComponent.getAppComponent && oComponent.getAppComponent() instanceof Component) {
				return oComponent.getAppComponent();
			}

			// special case for OVP
			if (oComponent && oComponent.oComponentData && oComponent.oComponentData.appComponent) {
				return oComponent.oComponentData.appComponent;
			}

			if (oComponent && oComponent.getManifestEntry) {
				var oSapApp = oComponent.getManifestEntry("sap.app");

				if (oSapApp && oSapApp.type && oSapApp.type !== "application") {
					if (oComponent instanceof Component) {
						// we need to call this method only when the component is an instance of Component in order to walk up the tree
						// returns owner app component
						oComponent = Utils.getComponentForControl(oComponent);
					}
					return this.getAppComponentForControl(oComponent);
				}
			}

			return oComponent;
		},

		/**
		 * Returns the component that belongs to the passed selector whose type is "application".
		 * If the control has no component, it walks up the control tree in order to find a control having one.
		 * This does not work if called with a {@link sap.ui.fl.ComponentSelector}
		 *
		 * @param {sap.ui.fl.Selector} oSelector - Selector object
		 * @returns {sap.ui.core.Component} Component instance if found or undefined
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		getAppComponentForSelector(oSelector) {
			return oSelector.appComponent || Utils.getAppComponentForControl(oSelector);
		},

		/**
		 * Returns the parent view of the control. If there are nested views, only the one closest to the control will be returned. If no view can be
		 * found, undefiend will be returned.
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {sap.ui.core.mvc.View} The view
		 * @see sap.ui.core.Component.getOwnerIdFor
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		getViewForControl(oControl) {
			if (oControl instanceof View) {
				return oControl;
			}

			if (oControl && typeof oControl.getParent === "function") {
				oControl = oControl.getParent();
				return Utils.getViewForControl(oControl);
			}
		},

		/**
		 * Returns the tenant number for the communication with the ABAP back end.
		 *
		 * @function
		 * @returns {string} the current client
		 * @name sap.ui.fl.Utils.getClient
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.write._internal.transport.Transport
		 */
		getClient() {
			var oUriParams;
			var sClient;
			oUriParams = UriParameters.fromQuery(window.location.search);
			sClient = oUriParams.get("sap-client");
			return sClient || undefined;
		},

		getLrepUrl() {
			var aFlexibilityServices = Configuration.getFlexibilityServices();
			var oLrepConfiguration = aFlexibilityServices.find(function(oServiceConfig) {
				return oServiceConfig.connector === "LrepConnector";
			});

			return oLrepConfiguration ? oLrepConfiguration.url : "";
		},

		/**
		 * Returns the current language in ISO 639-1 format.
		 *
		 * @returns {string} Language in ISO 639-1. Empty string if language cannot be determined
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		getCurrentLanguage() {
			var sLanguage = Configuration.getLanguage();
			if (!sLanguage || typeof sLanguage !== "string") {
				return "";
			}

			var nIndex = sLanguage.indexOf("-");
			if ((nIndex < 0) && (sLanguage.length <= 2)) {
				return sLanguage.toUpperCase();
			}
			if (nIndex > 0 && nIndex <= 2) {
				return sLanguage.substring(0, nIndex).toUpperCase();
			}

			return "";
		},

		/**
		 * Retrieves the controlType of the control
		 *
		 * @param {sap.ui.core.Control} oControl Control instance
		 * @returns {string} control type of the control - undefined if controlType cannot be determined
		 * @private
		 */
		getControlType(oControl) {
			var oMetadata;
			if (oControl && typeof oControl.getMetadata === "function") {
				oMetadata = oControl.getMetadata();
				if (oMetadata && typeof oMetadata.getElementName === "function") {
					return oMetadata.getElementName();
				}
			}
		},

		/**
		 * See {@link sap.ui.core.BaseTreeModifier#checkControlId} method
		 */
		checkControlId(vControl, oAppComponent) {
			if (!oAppComponent) {
				vControl = vControl instanceof ManagedObject ? vControl : sap.ui.getCore().byId(vControl);
				oAppComponent = Utils.getAppComponentForControl(vControl);
			}
			return BaseTreeModifier.checkControlId(vControl, oAppComponent);
		},

		/**
		 * See {@link sap.ui.core.BaseTreeModifier#hasLocalIdSuffix} method
		 */
		hasLocalIdSuffix: BaseTreeModifier.hasLocalIdSuffix,

		/**
		 * Returns URL hash when ushell container is available synchronously.
		 *
		 * @param  {sap.ushell.services.URLParsing} oURLParsingService - The Unified Shell's internal URL parsing service
		 * @returns {object} Returns the parsed URL hash object or an empty object if ushell container is not available
		 */
		getParsedURLHash(oURLParsingService) {
			if (oURLParsingService) {
				return oURLParsingService.parseShellHash(hasher.getHash()) || {};
			}
			return {};
		},

		/**
		 * Returns the value of the specified url parameter of the current url
		 *
		 * @param {string} sParameterName - Name of the url parameter
		 * @returns {string} url parameter
		 * @private
		 */
		getUrlParameter(sParameterName) {
			return UriParameters.fromQuery(window.location.search).get(sParameterName);
		},

		/**
		 * Returns UShell container if available
		 *
		 * @returns {object|undefined} Returns UShell container object if available or undefined
		 */
		getUshellContainer() {
			// TODO wait until  FLP does offer anything
			return ObjectPath.get("sap.ushell.Container");
		},

		createDefaultFileName(sNameAddition) {
			var sFileName = uid().replace(/-/g, "_");
			if (sNameAddition) {
				sFileName += `_${sNameAddition}`;
			}
			return sFileName;
		},

		createNamespace(oPropertyBag, sFileType) {
			var sSubfolder = "changes";
			if (sFileType === "ctrl_variant") {
				sSubfolder = "variants";
			}
			var sReferenceName = oPropertyBag.reference.replace(".Component", "");
			var sNamespace = `apps/${sReferenceName}/${sSubfolder}/`;
			return sNamespace;
		},

		/**
		 * builds the root namespace with a given base ID and project ID for the following scenarios:
		 * App Variants, adaptation project, adapting new fiori elements app and UI adaptation
		 *
		 * @param {string} sBaseId base ID
		 * @param {string} sScenario current scenario
		 * @param {string} sProjectId project ID
		 * @returns {string} Returns the root LRep namespace
		 */
		buildLrepRootNamespace(sBaseId, sScenario, sProjectId) {
			var sRootNamespace = "apps/";
			var oError = new Error("Error in sap.ui.fl.Utils#buildLrepRootNamespace: ");
			if (!sBaseId) {
				oError.message += "for every scenario you need a base ID";
				throw oError;
			}

			switch (sScenario) {
				case Scenario.VersionedAppVariant:
					if (!sProjectId) {
						oError.message += "in a versioned app variant scenario you additionally need a project ID";
						throw oError;
					}
					sRootNamespace += `${sBaseId}/appVariants/${sProjectId}/`;
					break;
				case Scenario.AppVariant:
					if (!sProjectId) {
						oError.message += "in an app variant scenario you additionally need a project ID";
						throw oError;
					}
					sRootNamespace += `${sBaseId}/appVariants/${sProjectId}/`;
					break;
				case Scenario.AdaptationProject:
					if (!sProjectId) {
						oError.message += "in a adaptation project scenario you additionally need a project ID";
						throw oError;
					}
					sRootNamespace += `${sBaseId}/adapt/${sProjectId}/`;
					break;
				case Scenario.FioriElementsFromScratch:
				case Scenario.UiAdaptation:
				default:
					sRootNamespace += `${sBaseId}/`;
			}

			return sRootNamespace;
		},

		/** Returns <code>true</code> if the passed manifest object is of type "application".
		 * @param {sap.ui.core.Manifest} oManifest - Manifest object
		 * @returns {boolean} <code>true</code> if the passed manifest object is of type "application"
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		isApplication(oManifest) {
			var sComponentType = getComponentType(oManifest);
			return sComponentType === "application";
		},

		/** Returns <code>true</code> if the passed component is an application component.
		 * @param {sap.ui.core.Component} oComponent - Component instance
		 * @returns {boolean} <code>true</code> if the passed component is of type "application"
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		isApplicationComponent(oComponent) {
			return oComponent instanceof Component && Utils.isApplication(oComponent.getManifestObject());
		},

		/** Returns <code>true</code> if the passed component is an embedded component.
		 * @param {sap.ui.core.Component} oComponent - Component instance
		 * @returns {boolean} <code>true</code> if the passed component is of type "component" and has a parent app component
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		isEmbeddedComponent(oComponent) {
			var oAppComponent = Utils.getAppComponentForControl(oComponent);
			return !!(
				oComponent instanceof Component
				&& getComponentType(oComponent.getManifestObject()) === "component"
				// Some embedded components might not have an app component
				// e.g. sap.ushell.plugins.rta, sap.ushell.plugins.rta-personalize
				&& oAppComponent
				&& Utils.isApplicationComponent(oAppComponent)
			);
		},

		/**
		 * Checks if an object is in an array or not and returns the index or -1
		 *
		 * @param {object[]} aArray Array of objects
		 * @param {object} oObject object that should be part of the array
		 * @returns {int} Returns the index of the object in the array, -1 if it is not in the array
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		indexOfObject(aArray, oObject) {
			var iObjectIndex = -1;
			aArray.some(function(oArrayObject, iIndex) {
				var aKeysArray;
				var aKeysObject;
				if (!oArrayObject) {
					aKeysArray = [];
				} else {
					aKeysArray = Object.keys(oArrayObject);
				}

				if (!oObject) {
					aKeysObject = [];
				} else {
					aKeysObject = Object.keys(oObject);
				}
				var bSameNumberOfAttributes = aKeysArray.length === aKeysObject.length;
				var bContains = bSameNumberOfAttributes && !aKeysArray.some(function(sKey) {
					return oArrayObject[sKey] !== oObject[sKey];
				});

				if (bContains) {
					iObjectIndex = iIndex;
				}

				return bContains;
			});
			return iObjectIndex;
		},

		/**
		 * Execute the passed asynchronous / synchronous (Utils.FakePromise) functions serialized - one after the other.
		 * By default errors do not break the sequential execution of the queue, but this can be changed with the parameter bThrowError.
		 * Error message will be written in any case.
		 *
		 * @param {array.<function>} aPromiseQueue - List of asynchronous functions that returns promises
		 * @param {boolean} bThrowError - true: errors will be rethrown and therefore break the execution
		 * @param {boolean} bAsync - true: asynchronous processing with Promise, false: synchronous processing with FakePromise
		 * @returns {Promise} Returns empty resolved Promise or FakePromise when all passed promises inside functions have been executed
		 */
		execPromiseQueueSequentially(aPromiseQueue, bThrowError, bAsync) {
			if (aPromiseQueue.length === 0) {
				if (bAsync) {
					return Promise.resolve();
				}
				return (Utils.FakePromise ? new Utils.FakePromise() : Promise.resolve());
			}
			var fnPromise = aPromiseQueue.shift();
			if (typeof fnPromise === "function") {
				var vResult;
				try {
					vResult = fnPromise();
				} catch (e) {
					vResult = Promise.reject(e);
				}

				return vResult.then(function() {
					if (!bAsync && vResult instanceof Promise) {
						bAsync = true;
					}
				})
				.catch(function(e) {
					var sErrorMessage = "Error during execPromiseQueueSequentially processing occurred";
					sErrorMessage += e ? `: ${e.message}` : "";
					Log.error(sErrorMessage, e);

					if (bThrowError) {
						throw new Error(sErrorMessage);
					}
				})
				.then(function() {
					return this.execPromiseQueueSequentially(aPromiseQueue, bThrowError, bAsync);
				}.bind(this));
			}

			Log.error("Changes could not be applied, promise not wrapped inside function.");
			return this.execPromiseQueueSequentially(aPromiseQueue, bThrowError, bAsync);
		},

		/**
		 * Class that behaves like a promise (es6), but is synchronous. Implements <code>then</code> and <code>catch</code> functions.
		 * After instantiating can be used similar to standard Promises but synchronously.
		 * As soon as one of the callback functions returns a Promise the asynchronous Promise replaces the FakePromise in
		 * further processing.
		 *
		 * @class sap.ui.fl.Utils.FakePromise
		 * @param {any} vInitialValue - value on resolve FakePromise
		 * @param {any} vError - value on reject FakePromise
		 * @param {string} sInitialPromiseIdentifier - value identifies previous promise in chain. If the identifier is passed to the function and don't match with the FakePromiseIdentifier then native Promise execution is used for further processing
		 * @returns {sap.ui.fl.Utils.FakePromise|Promise} Returns instantiated FakePromise only if no Promise is passed by value parameter
		 * @deprecated As of Version 1.114
		 * @private
		 * @ui5-restricted
		 */
		// eslint-disable-next-line object-shorthand
		FakePromise: function(vInitialValue, vError, sInitialPromiseIdentifier) {
			Utils.FakePromise.fakePromiseIdentifier = "sap.ui.fl.Utils.FakePromise";
			this.vValue = vInitialValue;
			this.vError = vError;
			this.bContinueWithFakePromise = arguments.length < 3 || (sInitialPromiseIdentifier === Utils.FakePromise.fakePromiseIdentifier);

			var fnResolveOrReject = function(vParam, fn) {
				try {
					var vResolve = fn(vParam, Utils.FakePromise.fakePromiseIdentifier);
					if (SyncPromise.isThenable(vResolve)) {
						return vResolve;
					}
					return new Utils.FakePromise(vResolve);
				} catch (oError) {
					var vReject = oError;
					return new Utils.FakePromise(undefined, vReject);
				}
			};

			/**
			 * <code>then</code> function as for promise (es6)
			 * @param {function} fnSuccess - Resolve handler
			 * @param {function} fnError - Reject handler
			 * @returns {sap.ui.fl.Utils.FakePromise|Promise} <code>FakePromise</code> if no promise is returned by the resolve handler
			 * @private
			 * @ui5-restricted sap.ui.fl, sap.ui.rta, ui5 internal tests
			 */
			Utils.FakePromise.prototype.then = function(fnSuccess, fnError) {
				if (!this.bContinueWithFakePromise) {
					return Promise.resolve(fnSuccess(this.vValue));
				}

				if (!this.vError) {
					return fnResolveOrReject(this.vValue, fnSuccess);
				} else if (fnError) {
					return fnResolveOrReject(this.vError, fnError);
				}
				return this;
			};

			/**
			 * <code>catch</code> function as for promise (es6)
			 * @param {function} fn - Rejection handler
			 * @returns {sap.ui.fl.Utils.FakePromise|Promise} <code>FakePromise</code> if no promise is returned by the rejection handler
			 *
			 * @private
			 * @ui5-restricted sap.ui.fl, sap.ui.rta
			 */
			Utils.FakePromise.prototype.catch = function(fn) {
				if (!this.bContinueWithFakePromise) {
					return Promise.reject(fn(this.vError));
				}

				if (this.vError) {
					return fnResolveOrReject(this.vError, fn);
				}
				return this;
			};

			if (this.vValue instanceof Promise ||
				this.vValue instanceof Utils.FakePromise) {
				return this.vValue;
			}
		},

		/**
		 * Function that gets a specific change from a map of changes.
		 *
		 * @param {map} mChanges Map of all changes
		 * @param {string} sChangeId Id of the change that should be retrieved
		 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject | undefined} Returns the change if it is in the map, otherwise undefined
		 */
		getChangeFromChangesMap(mChanges, sChangeId) {
			var oResult;
			Object.keys(mChanges).forEach(function(sControlId) {
				mChanges[sControlId].some(function(oChange) {
					if (oChange.getId() === sChangeId) {
						oResult = oChange;
						return true;
					}
				});
			});
			return oResult;
		},

		/**
		 * Standalone: Adds the given search parameter to the URL or removes it.
		 *
		 * @param  {string} sParameters - The URL parameters to be modified
		 * @param  {string} sParameterName - The parameter name that can be removed or added
		 * @param  {string} sParameterValue - The parameter value of the parameter name that can be removed or added
		 * @param  {sap.ushell.services.URLParsing} oURLParsingService - The Unified Shell's internal URL parsing service
		 * @returns {string} The modified URL
		 */
		handleUrlParameters(sParameters, sParameterName, sParameterValue, oURLParsingService) {
			if (this.hasParameterAndValue(sParameterName, sParameterValue, oURLParsingService)) {
				if (sParameters.startsWith("?")) {
					sParameters = sParameters.substr(1, sParameters.length);
				}
				var aFilterUrl = sParameters.split("&").filter(function(sParameter) {
					return sParameter !== `${sParameterName}=${sParameterValue}`;
				});
				sParameters = "";
				if (aFilterUrl.length > 0) {
					sParameters = `?${aFilterUrl.join("&")}`;
				}
			} else {
				sParameters += `${(sParameters.length > 0 ? "&" : "?") + sParameterName}=${sParameterValue}`;
			}
			return sParameters;
		},

		/**
		 * Checks if the passed parameter name with the parameter value is contained in the URL.
		 *
		 * @param  {string} sParameterName - The parameter name to be checked
		 * @param  {string} sParameterValue - The parameter value to be checked
		 * @param  {sap.ushell.services.URLParsing} oURLParsingService - The Unified Shell's internal URL parsing service
		 * @returns {boolean} <code>true</code> if the parameter and the given value are in the URL
		 */
		hasParameterAndValue(sParameterName, sParameterValue, oURLParsingService) {
			return this.getParameter(sParameterName, oURLParsingService) === sParameterValue;
		},

		/**
		 * Checks if the passed parameter name is contained in the URL and returns its value.
		 *
		 * @param  {string} sParameterName - The parameter name to be checked
		 * @param  {sap.ushell.services.URLParsing} oURLParsingService - The Unified Shell's internal URL parsing service
		 * @returns {string} The value of the given parameter or undefined
		 */
		getParameter(sParameterName, oURLParsingService) {
			if (oURLParsingService) {
				var mParsedHash = Utils.getParsedURLHash(oURLParsingService);
				return mParsedHash.params &&
					mParsedHash.params[sParameterName] &&
					mParsedHash.params[sParameterName][0];
			}
			return Utils.getUrlParameter(sParameterName);
		},

		/**
		 * Searches in the control metadata for the aggregation defintion
		 * @param {sap.ui.base.ManagedObject|Element} oControl - Control which has the aggregation
		 * @param {string} sAggregationName - Aggregation name
		 * @returns {object} Aggregation metadata
		 */
		findAggregation(oControl, sAggregationName) {
			if (oControl) {
				if (oControl.getMetadata) {
					var oMetadata = oControl.getMetadata();
					var oAggregations = oMetadata.getAllAggregations();
					if (oAggregations) {
						return oAggregations[sAggregationName];
					}
				}
			}
			return undefined;
		},

		/**
		 * Returns aggregation content for the given aggregation name.
		 * @param {sap.ui.base.ManagedObject|Element} oParent - Control which has the aggregation
		 * @param {string} sAggregationName - Aggregation name
		 * @returns {sap.ui.base.ManagedObject[]|Element[]} Aggregation content
		 */
		getAggregation(oParent, sAggregationName) {
			var oAggregation = Utils.findAggregation(oParent, sAggregationName);
			if (oAggregation) {
				return oParent[oAggregation._sGetter]();
			}
			return undefined;
		},

		/**
		 * Returns property value.
		 * @param {sap.ui.base.ManagedObject|Element} oControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @returns {any} Value of the property
		 */
		getProperty(oControl, sPropertyName) {
			var oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);
			if (oMetadata) {
				var sPropertyGetter = oMetadata._sGetter;
				return oControl[sPropertyGetter]();
			}
			return undefined;
		},

		/**
		 * Returns a Promise resolving with the requested Unified Shell service if available
		 *
		 * @param {string} sServiceName UShell service name (e.g. "URLParsing")
		 * @returns {Promise<object|undefined>} Returns UShell service if available or undefined
		 */
		 getUShellService(sServiceName) {
			if (sServiceName) {
				var oUShellContainer = this.getUshellContainer();
				if (oUShellContainer) {
					return oUShellContainer.getServiceAsync(sServiceName);
				}
			}
			return Promise.resolve();
		},

		/**
		 * Gets the requested UShell Services from Ushell container, if container is available.
		 * @param {array} aServiceNames - List of service names
		 * @returns {Promise<object>} Resolves to an object with the requested ushell services
		 */
		getUShellServices(aServiceNames) {
			var aServicePromises = aServiceNames.map(function(sServiceName) {
				return this.getUShellService(sServiceName);
			}.bind(this));
			return Promise.all(aServicePromises).then(function(aServices) {
				return aServiceNames.reduce(function(mServices, sService, iIndex) {
					mServices[sService] = aServices && aServices[iIndex];
					return mServices;
				}, {});
			});
		}

	};
	return Utils;
}, true);

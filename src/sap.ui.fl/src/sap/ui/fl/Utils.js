/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/util/isPlainObject",
	"sap/base/util/uid",
	"sap/base/util/restricted/_isEqual",
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/util/reflection/BaseTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/core/Element",
	"sap/ui/fl/initial/_internal/FlexConfiguration",
	"sap/ui/fl/Scenario",
	"sap/ui/thirdparty/hasher",
	"sap/ui/core/mvc/View"
], function(
	Localization,
	isPlainObject,
	uid,
	isEqual,
	Log,
	ManagedObject,
	BaseTreeModifier,
	Component,
	Element,
	FlexConfiguration,
	Scenario,
	hasher,
	View
) {
	"use strict";

	/**
	 * Returns the type of "sap.app" from the manifest object passed.
	 * @param {sap.ui.core.Manifest} oManifest - Manifest object
	 * @returns {string|undefined} Manifest object's <code>type</code> property for <code>sap.app</code> entry
	 */
	function getComponentType(oManifest) {
		// manifest instance
		if (oManifest?.getEntry) {
			return oManifest.getEntry?.("sap.app")?.type;
		}

		// raw manifest
		return oManifest?.["sap.app"]?.type;
	}

	function getStartUpParameter(oComponentData, sParameterName) {
		if (oComponentData?.startupParameters && sParameterName && Array.isArray(oComponentData.startupParameters[sParameterName])) {
			return oComponentData.startupParameters[sParameterName][0];
		}
		return undefined;
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
	const Utils = {
		isVariantByStartupParameter(oControl) {
			// determine UI5 component out of given control
			const oAppComponent = this.getAppComponentForControl(oControl);
			if (oAppComponent?.getComponentData) {
				return !!getStartUpParameter(oAppComponent.getComponentData(), "sap-app-id");
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
			return this.getAppComponentForControl(oControl)?.getMetadata?.()?.getManifestObject?.().getJson();
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
		 * Returns the Component that belongs to the passed control. If the control has no component,
		 * it walks up the control tree in order to find a control having one.
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {sap.ui.core.Component} found component
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		getComponentForControl(oControl) {
			function getComponentIdForControl(oControl) {
				const sComponentId = Component.getOwnerIdFor(oControl);
				if (!sComponentId) {
					if (typeof oControl?.getParent === "function") {
						const oParent = oControl.getParent();
						if (oParent) {
							return getComponentIdForControl(oParent);
						}
					}
				}
				return sComponentId || "";
			}

			// determine UI5 component out of given control
			if (oControl) {
				const sComponentId = getComponentIdForControl(oControl);
				if (sComponentId) {
					return Component.getComponentById(sComponentId);
				}
			}
			return undefined;
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
			let oComponent = oControl instanceof Component ? oControl : Utils.getComponentForControl(oControl);

			// special case for Fiori Elements to reach the real appComponent
			if (oComponent?.getAppComponent?.() instanceof Component) {
				return oComponent.getAppComponent();
			}

			// special case for OVP
			if (oComponent?.oComponentData?.appComponent) {
				return oComponent.oComponentData.appComponent;
			}

			if (oComponent?.getManifestEntry) {
				const oSapApp = oComponent.getManifestEntry("sap.app");

				if (oSapApp?.type && oSapApp.type !== "application") {
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
		 * Returns the parent view of the control. If there are nested views, only the one closest to the control will be returned.
		 * If no view can be found, undefined will be returned.
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

			if (typeof oControl?.getParent === "function") {
				oControl = oControl.getParent();
				return Utils.getViewForControl(oControl);
			}
			return undefined;
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
			return new URLSearchParams(window.location.search).get("sap-client");
		},

		getLrepUrl() {
			const aFlexibilityServices = FlexConfiguration.getFlexibilityServices();
			const oLrepConfiguration = aFlexibilityServices.find((oServiceConfig) => oServiceConfig.connector === "LrepConnector");
			return oLrepConfiguration?.url || "";
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
			const sLanguage = Localization.getLanguage();
			if (typeof sLanguage !== "string") {
				return "";
			}

			const nIndex = sLanguage.indexOf("-");
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
			return oControl?.getMetadata?.()?.getElementName?.();
		},

		/**
		 * Checks if the control ID is generated or maintained by the application.
		 *
		 * @param {sap.ui.core.Control|string} vControl - Control instance or ID
		 * @param {sap.ui.core.Component} oAppComponent - <code>oAppComponent</code> application component, needed only if vControl is a string (ID)
		 * @returns {boolean} <code>true</code> if the ID is maintained by the application
		 */
		checkControlId(vControl, oAppComponent) {
			if (!oAppComponent) {
				vControl = vControl instanceof ManagedObject ? vControl : Element.getElementById(vControl);
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
			return oURLParsingService?.parseShellHash(hasher.getHash()) || {};
		},

		/**
		 * Returns the value of the specified url parameter of the current url
		 *
		 * @param {string} sParameterName - Name of the url parameter
		 * @returns {string} url parameter
		 * @private
		 */
		getUrlParameter(sParameterName) {
			return new URLSearchParams(window.location.search).get(sParameterName);
		},

		/**
		 * Returns UShell container if available
		 *
		 * @returns {object|undefined} Returns UShell container object if available or undefined
		 */
		getUshellContainer() {
			const oContainer = sap.ui.require("sap/ushell/Container");
			return oContainer?.isInitialized() ? oContainer : undefined;
		},

		createDefaultFileName(sNameAddition) {
			const sFileName = uid().replace(/-/g, "_");
			return sNameAddition ? `${sFileName}_${sNameAddition}` : sFileName;
		},

		createNamespace(oPropertyBag, sFileType) {
			const sSubfolder = sFileType === "ctrl_variant" ? "variants" : "changes";
			const sReferenceName = oPropertyBag.reference.replace(".Component", "");
			return `apps/${sReferenceName}/${sSubfolder}/`;
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
			const sRootNamespace = "apps";
			const sBaseErrorMessage = "Error in sap.ui.fl.Utils#buildLrepRootNamespace:";

			if (!sBaseId) {
				throw new Error(`${sBaseErrorMessage} for every scenario you need a base ID`);
			}

			switch (sScenario) {
				case Scenario.VersionedAppVariant:
				case Scenario.AppVariant:
					if (!sProjectId) {
						throw new Error(`${sBaseErrorMessage} in the ${sScenario} scenario you additionally need a project ID`);
					}
					return `${sRootNamespace}/${sBaseId}/appVariants/${sProjectId}/`;
				case Scenario.AdaptationProject:
					if (!sProjectId) {
						throw new Error(`${sBaseErrorMessage} in the ${sScenario} scenario you additionally need a project ID`);
					}
					return `${sRootNamespace}/${sBaseId}/adapt/${sProjectId}/`;
				case Scenario.FioriElementsFromScratch:
				case Scenario.UiAdaptation:
				default:
					return `${sRootNamespace}/${sBaseId}/`;
			}
		},

		/** Returns <code>true</code> if the passed manifest object is of type "application".
		 * @param {sap.ui.core.Manifest} oManifest - Manifest object
		 * @returns {boolean} <code>true</code> if the passed manifest object is of type "application"
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		isApplication(oManifest) {
			return getComponentType(oManifest) === "application";
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
			const oAppComponent = Utils.getAppComponentForControl(oComponent);
			return !!(
				oComponent instanceof Component
				&& getComponentType(oComponent.getManifestObject()) === "component"
				// Some embedded components might not have an app component
				// e.g. sap.ushell.plugins.rta
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
			return aArray.findIndex((oArrayObject) => {
				return isEqual(oArrayObject, oObject);
			});
		},

		/**
		 * Execute the passed asynchronous / synchronous (Utils.FakePromise) functions serialized - one after the other.
		 * By default errors do not break the sequential execution of the queue, but this can be changed with the parameter bThrowError.
		 * Error message will be written in any case.
		 *
		 * @param {array.<function>} aPromiseQueue - List of asynchronous functions that returns promises
		 * @param {boolean} bThrowError - true: errors will be rethrown and therefore break the execution
		 * @param {boolean} bAsync - true: asynchronous processing with Promise, false: synchronous processing with FakePromise
		 * @param {boolean} bSupressAdditionalErrorMessage - true: additional error message will be suppressed
		 * @returns {Promise} Returns empty resolved Promise or FakePromise when all passed promises inside functions have been executed
		 */
		execPromiseQueueSequentially(aPromiseQueue, bThrowError, bAsync, bSupressAdditionalErrorMessage) {
			if (aPromiseQueue.length === 0) {
				if (bAsync) {
					return Promise.resolve();
				}
				return (Utils.FakePromise ? new Utils.FakePromise() : Promise.resolve());
			}
			const fnPromise = aPromiseQueue.shift();
			if (typeof fnPromise === "function") {
				let vResult;
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
					let sErrorMessage = "Error during execPromiseQueueSequentially processing occurred";
					sErrorMessage += e ? `: ${e.message}` : "";
					Log.error(sErrorMessage, e);

					if (bThrowError) {
						if (bSupressAdditionalErrorMessage) {
							throw new Error(e.message);
						} else {
							throw new Error(sErrorMessage);
						}
					}
				})
				.then(function() {
					return this.execPromiseQueueSequentially(aPromiseQueue, bThrowError, bAsync, bSupressAdditionalErrorMessage);
				}.bind(this));
			}

			Log.error("Changes could not be applied, promise not wrapped inside function.");
			return this.execPromiseQueueSequentially(aPromiseQueue, bThrowError, bAsync, bSupressAdditionalErrorMessage);
		},

		/**
		 * Function that gets a specific change from a map of changes.
		 *
		 * @param {map} mChanges Map of all changes
		 * @param {string} sChangeId Id of the change that should be retrieved
		 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject | undefined} Returns the change if it is in the map, otherwise undefined
		 */
		getChangeFromChangesMap(mChanges, sChangeId) {
			let oMatch;
			Object.values(mChanges).some((aControlChanges) => {
				oMatch = aControlChanges.find((oChange) => oChange.getId() === sChangeId);
				return oMatch;
			});

			return oMatch;
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
			if (Utils.hasParameterAndValue(sParameterName, sParameterValue, oURLParsingService)) {
				if (sParameters.startsWith("?")) {
					sParameters = sParameters.substr(1, sParameters.length);
				}
				const aFilterUrl = sParameters.split("&").filter((sParameter) => {
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
			return Utils.getParameter(sParameterName, oURLParsingService) === sParameterValue;
		},

		/**
		 * Checks if the passed parameter name is contained in the URL and returns its value.
		 *
		 * @param  {string} sParameterName - The parameter name to be checked
		 * @param  {sap.ushell.services.URLParsing} oURLParsingService - The Unified Shell's internal URL parsing service
		 * @returns {string} The value of the given parameter or undefined
		 */
		getParameter(sParameterName, oURLParsingService) {
			return Utils.getParsedURLHash(oURLParsingService)?.params?.[sParameterName]?.[0] || Utils.getUrlParameter(sParameterName);
		},

		/**
		 * Searches in the control metadata for the aggregation defintion
		 * @param {sap.ui.base.ManagedObject|Element} oControl - Control which has the aggregation
		 * @param {string} sAggregationName - Aggregation name
		 * @returns {object} Aggregation metadata
		 */
		findAggregation(oControl, sAggregationName) {
			return oControl?.getMetadata?.()?.getAllAggregations?.()?.[sAggregationName];
		},

		/**
		 * Returns aggregation content for the given aggregation name.
		 * @param {sap.ui.base.ManagedObject|Element} oParent - Control which has the aggregation
		 * @param {string} sAggregationName - Aggregation name
		 * @returns {sap.ui.base.ManagedObject[]|Element[]} Aggregation content
		 */
		getAggregation(oParent, sAggregationName) {
			const oAggregation = Utils.findAggregation(oParent, sAggregationName);
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
			const sPropertyGetter = oControl.getMetadata().getPropertyLikeSetting(sPropertyName)?._sGetter;
			return oControl[sPropertyGetter]();
		},

		/**
		 * Returns a Promise resolving with the requested Unified Shell service if available
		 *
		 * @param {string} sServiceName UShell service name (e.g. "URLParsing")
		 * @returns {Promise<object|undefined>} Returns UShell service if available or undefined
		 */
		getUShellService(sServiceName) {
		   if (sServiceName) {
			   const oUShellContainer = this.getUshellContainer();
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
		async getUShellServices(aServiceNames) {
			const mServices = {};
			for (const sServiceName of aServiceNames) {
				mServices[sServiceName] = await this.getUShellService(sServiceName);
			}
			return mServices;
		}
	};
	return Utils;
});

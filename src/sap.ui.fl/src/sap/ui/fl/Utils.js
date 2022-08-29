/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/strings/formatMessage",
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
	formatMessage,
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
		APP_ID_AT_DESIGN_TIME: "${pro" + "ject.art" + "ifactId}", //avoid replaced by content of ${project.artifactId} placeholder at build steps
		VARIANT_MODEL_NAME: "$FlexVariants",

		/**
		 * Formats the log message by replacing placeholders with values and logging the message.
		 *
		 * @param {string} sLogType - Logging type to be used. Possible values: info | warning | debug | error
		 * @param {array.<string>} aMessageComponents - Individual parts of the message text
		 * @param {array.<any>} aValuesToInsert - The values to be used instead of the placeholders in the message
		 * @param {string} [sCallStack] - Passes the callstack to the logging function
		 */
		formatAndLogMessage: function(sLogType, aMessageComponents, aValuesToInsert, sCallStack) {
			var sLogMessage = aMessageComponents.join(' ');
			sLogMessage = formatMessage(sLogMessage, aValuesToInsert);
			Log[sLogType](sLogMessage, sCallStack || "");
		},

		isVariantByStartupParameter: function(oControl) {
			// determine UI5 component out of given control
			if (oControl) {
				var oAppComponent = this.getAppComponentForControl(oControl);
				if (oAppComponent) {
					return !!this._getComponentStartUpParameter(oAppComponent, "sap-app-id");
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
		getAppDescriptor: function(oControl) {
			var oManifest = null;
			var oComponent = null;
			var oComponentMetaData = null;

			// determine UI5 component out of given control
			if (oControl) {
				oComponent = this.getAppComponentForControl(oControl);

				// determine manifest out of found component
				if (oComponent && oComponent.getMetadata) {
					oComponentMetaData = oComponent.getMetadata();
					if (oComponentMetaData && oComponentMetaData.getManifest) {
						oManifest = oComponentMetaData.getManifest();
					}
				}
			}

			return oManifest;
		},

		/**
		 * Returns the siteId of a component when you already have the component data.
		 *
		 * @param {object} oComponentData - Component data
		 * @returns {string} siteId - that represent the found siteId
		 * @function
		 * @name sap.ui.fl.Utils.getSiteIdByComponentData
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal.flexState.Loader
		 */
		getSiteIdByComponentData: function(oComponentData) {
			return this._getStartUpParameter(oComponentData, "hcpApplicationId");
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
		isBinding: function(vPropertyValue) {
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
		 * Determines if the passed change is related to control variants.
		 * @see sap.ui.fl.variants.VariantManagement
		 * @param {sap.ui.fl.Change} oChange Change object
		 * @returns {boolean} If the passed change is a variant management change
		 * @name sap.ui.fl.Utils.isChangeRelatedToVariants
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.ChangePersistence
		 */
		isChangeRelatedToVariants: function(oChange) {
			return oChange.getFileType() === "ctrl_variant_change"
				|| oChange.getFileType() === "ctrl_variant_management_change"
				|| oChange.getFileType() === "ctrl_variant"
				|| oChange.getVariantReference();
		},

		/**
		 * Determines the content for a given startUpParameter name
		 *
		 * @param {sap.ui.core.Component} oComponent - component instance
		 * @param {string} sParameterName - startUpParameterName that shall be determined
		 * @returns {string} content of found startUpParameter
		 * @private
		 */
		_getComponentStartUpParameter: function(oComponent, sParameterName) {
			var startUpParameterContent = null;

			if (sParameterName) {
				if (oComponent && oComponent.getComponentData) {
					startUpParameterContent = this._getStartUpParameter(oComponent.getComponentData(), sParameterName);
				}
			}

			return startUpParameterContent;
		},

		_getStartUpParameter: function(oComponentData, sParameterName) {
			if (oComponentData && oComponentData.startupParameters && sParameterName) {
				if (Array.isArray(oComponentData.startupParameters[sParameterName])) {
					return oComponentData.startupParameters[sParameterName][0];
				}
			}
		},

		/**
		 * Gets the component instance for a component ID.
		 *
		 * @param {string} sComponentId component ID
		 * @returns {sap.ui.core.Component} component for the component ID
		 * @private
		 */
		_getComponent: function(sComponentId) {
			var oComponent;
			if (sComponentId) {
				oComponent = Component.get(sComponentId);
			}
			return oComponent;
		},

		/**
		 * Returns ComponentId of the control. If the control has no component, it walks up the control tree in order to find a control having one
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {string} The component id or empty string if component id couldn't be found
		 * @see sap.ui.core.Component.getOwnerIdFor
		 * @private
		 */
		_getComponentIdForControl: function(oControl) {
			var sComponentId = Utils._getOwnerIdForControl(oControl);
			if (!sComponentId) {
				if (oControl && typeof oControl.getParent === "function") {
					var oParent = oControl.getParent();
					if (oParent) {
						return Utils._getComponentIdForControl(oParent);
					}
				}
			}
			return sComponentId || "";
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
		getComponentForControl: function(oControl) {
			return Utils._getComponentForControl(oControl);
		},

		/**
		 * Returns the component that belongs to the passed control whose type is "application".
		 * If the control has no component, it walks up the control tree in order to find a control having one.
		 *
		 * @param {sap.ui.base.ManagedObject} oControl - Managed object instance
		 * @returns {sap.ui.core.Component} component instance if found or null
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		getAppComponentForControl: function(oControl) {
			var oComponent = oControl instanceof Component ? oControl : this._getComponentForControl(oControl);
			return this._getAppComponentForComponent(oComponent);
		},

		/**
		 * Returns an object with 'name' and 'version' of the App Component where the App Descriptor changes are saved
		 *
		 * @param {sap.ui.base.ManagedObject} oControl control or app component for which the flex controller should be instantiated
		 * @returns {Promise} Returns Object with name and version of Component for App Descriptor changes
		 */
		getAppDescriptorComponentObjectForControl: function(oControl) {
			var oAppComponent = this.getAppComponentForControl(oControl);
			var oManifest = oAppComponent.getManifest();
			return {
				name: this.getAppIdFromManifest(oManifest)
			};
		},

		/**
		 * Returns the Component that belongs to given control. If the control has no component, it walks up the control tree in order to find a
		 * control having one.
		 *
		 * @param {sap.ui.base.ManagedObject} oControl - Managed object instance
		 * @returns {sap.ui.core.Component|null} found component
		 * @private
		 */
		_getComponentForControl: function(oControl) {
			var oComponent = null;
			var sComponentId = null;

			// determine UI5 component out of given control
			if (oControl) {
				sComponentId = Utils._getComponentIdForControl(oControl);
				if (sComponentId) {
					oComponent = Utils._getComponent(sComponentId);
				}
			}

			return oComponent;
		},

		/**
		 * Returns the Component that belongs to given component whose type is "application".
		 *
		 * @param {sap.ui.core.Component} oComponent - SAPUI5 component
		 * @returns {sap.ui.core.Component|null} component instance if found or null
		 * @private
		 */
		_getAppComponentForComponent: function(oComponent) {
			var oSapApp = null;
			// special case for Fiori Elements to reach the real appComponent
			if (oComponent && oComponent.getAppComponent && oComponent.getAppComponent() instanceof Component) {
				return oComponent.getAppComponent();
			}

			// special case for OVP
			if (oComponent && oComponent.oComponentData && oComponent.oComponentData.appComponent) {
				return oComponent.oComponentData.appComponent;
			}

			if (oComponent && oComponent.getManifestEntry) {
				oSapApp = oComponent.getManifestEntry("sap.app");
			} else {
				// if no manifest entry
				return oComponent;
			}

			if (oSapApp && oSapApp.type && oSapApp.type !== "application") {
				if (oComponent instanceof Component) {
					// we need to call this method only when the component is an instance of Component in order to walk up the tree
					// returns owner app component
					oComponent = this._getComponentForControl(oComponent);
				}
				return this.getAppComponentForControl(oComponent);
			}

			return oComponent;
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
		getViewForControl: function(oControl) {
			return Utils.getFirstAncestorOfControlWithControlType(oControl, View);
		},

		getFirstAncestorOfControlWithControlType: function(oControl, controlType) {
			if (oControl instanceof controlType) {
				return oControl;
			}

			if (oControl && typeof oControl.getParent === "function") {
				oControl = oControl.getParent();
				return Utils.getFirstAncestorOfControlWithControlType(oControl, controlType);
			}
		},

		/**
		 * Returns OwnerId of the control
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {string} The owner id
		 * @see sap.ui.core.Component.getOwnerIdFor
		 * @private
		 */
		_getOwnerIdForControl: function(oControl) {
			return Component.getOwnerIdFor(oControl);
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
		getClient: function() {
			var oUriParams;
			var sClient;
			oUriParams = this._getUriParameters();
			sClient = oUriParams.get("sap-client");
			return sClient || undefined;
		},

		_getUriParameters: function() {
			return UriParameters.fromQuery(window.location.search);
		},
		/**
		 * Returns whether the hot fix mode is active (url parameter hotfix=true)
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply.api.SmartVariantManagementApplyAPI
		 *
		 * @returns {boolean} is hotfix mode active, or not
		 */
		isHotfixMode: function() {
			var oUriParams;
			var sIsHotfixMode;
			oUriParams = this._getUriParameters();
			sIsHotfixMode = oUriParams.get("hotfix");
			return (sIsHotfixMode === "true");
		},

		getLrepUrl: function() {
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
		getCurrentLanguage: function() {
			var sLanguage = Configuration.getLanguage();
			return Utils.convertBrowserLanguageToISO639_1(sLanguage);
		},


		/**
		 * Converts the browser language into a 2-character ISO 639-1 language. If the browser language is in format RFC4646, the first part will be
		 * used: For example en-us will be converted to EN. If the browser language already is in ISO 639-1, it will be returned after an upper case
		 * conversion: For example de will be converted to DE.
		 *
		 * @function
		 * @name sap.ui.fl.Utils.convertBrowserLanguageToISO639_1
		 * @param {string} sBrowserLanguage - Language in RFC4646
		 * @returns {string} Language in ISO 639-1. Empty string if conversion was not successful
		 *
		 * @private
		 */
		convertBrowserLanguageToISO639_1: function(sBrowserLanguage) {
			if (!sBrowserLanguage || typeof sBrowserLanguage !== "string") {
				return "";
			}

			var nIndex = sBrowserLanguage.indexOf("-");
			if ((nIndex < 0) && (sBrowserLanguage.length <= 2)) {
				return sBrowserLanguage.toUpperCase();
			}
			if (nIndex > 0 && nIndex <= 2) {
				return sBrowserLanguage.substring(0, nIndex).toUpperCase();
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
		getControlType: function(oControl) {
			var oMetadata;
			if (oControl && typeof oControl.getMetadata === "function") {
				oMetadata = oControl.getMetadata();
				if (oMetadata && typeof oMetadata.getElementName === "function") {
					return oMetadata.getElementName();
				}
			}
		},

		/**
		 * Converts ASCII coding into a string. Required for restoring stored code extensions
		 *
		 * @param {string} ascii string containing ascii code valid numbers separated by ','
		 * @returns {string} parsedString parsed string
		 */
		asciiToString: function(ascii) {
			var asciiArray = ascii.split(",");
			var parsedString = "";
			for (var i = 0; i < asciiArray.length; i++) {
				parsedString += String.fromCharCode(asciiArray[i]);
			}
			return parsedString;
		},

		/**
		 * Converts a string into ASCII coding. Required for restoring stored code extensions
		 *
		 * @param {string} string string which has to be encoded
		 * @returns {string} ascii imput parsed to ascii numbers separated by ','
		 */
		stringToAscii: function(string) {
			var ascii = "";

			for (var i = 0; i < string.length; i++) {
				ascii += string.charCodeAt(i) + ",";
			}

			// remove last ","
			ascii = ascii.substring(0, ascii.length - 1);

			return ascii;
		},

		/**
		 * See {@link sap.ui.core.BaseTreeModifier#checkControlId} method
		 */
		checkControlId: function(vControl, oAppComponent) {
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
		 * Returns the a string containing all url parameters of the current window.location
		 *
		 * @returns {string} Substring of url containing the url query parameters
		 * @private
		 */
		_getAllUrlParameters: function() {
			return window.location.search.substring(1);
		},

		/**
		 * Returns URL hash when ushell container is available synchronously.
		 *
		 * @param  {sap.ushell.services.URLParsing} oURLParsingService - The Unified Shell's internal URL parsing service
		 * @returns {object} Returns the parsed URL hash object or an empty object if ushell container is not available
		 */
		getParsedURLHash: function(oURLParsingService) {
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
		getUrlParameter: function(sParameterName) {
			return UriParameters.fromQuery(window.location.search).get(sParameterName);
		},

		/**
		 * Returns UShell container if available
		 *
		 * @returns {object|undefined} Returns UShell container object if available or undefined
		 */
		getUshellContainer: function() {
			// TODO wait until  FLP does offer anything
			return ObjectPath.get("sap.ushell.Container");
		},

		createDefaultFileName: function(sNameAddition) {
			var sFileName = uid().replace(/-/g, "_");
			if (sNameAddition) {
				sFileName += '_' + sNameAddition;
			}
			return sFileName;
		},

		createNamespace: function(oPropertyBag, sFileType) {
			var sSubfolder = "changes";
			if (sFileType === "ctrl_variant") {
				sSubfolder = "variants";
			}
			var sReferenceName = oPropertyBag.reference.replace('.Component', '');
			var sNamespace = 'apps/' + sReferenceName + "/" + sSubfolder + "/";
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
		buildLrepRootNamespace: function(sBaseId, sScenario, sProjectId) {
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
					sRootNamespace += sBaseId + "/appVariants/" + sProjectId + "/";
					break;
				case Scenario.AppVariant:
					if (!sProjectId) {
						oError.message += "in an app variant scenario you additionally need a project ID";
						throw oError;
					}
					sRootNamespace += sBaseId + "/appVariants/" + sProjectId + "/";
					break;
				case Scenario.AdaptationProject:
					if (!sProjectId) {
						oError.message += "in a adaptation project scenario you additionally need a project ID";
						throw oError;
					}
					sRootNamespace += sBaseId + "/adapt/" + sProjectId + "/";
					break;
				case Scenario.FioriElementsFromScratch:
				case Scenario.UiAdaptation:
				default:
					sRootNamespace += sBaseId + "/";
			}

			return sRootNamespace;
		},

		/** Returns the type of "sap.app" from the manifest object passed.
		 * @param {sap.ui.core.Manifest} oManifest - Manifest object
		 * @returns {string|undefined} Manifest object's <code>type</code> property for <code>sap.app</code> entry
		 * @private
		 */
		_getComponentTypeFromManifest: function(oManifest) {
			return oManifest && oManifest.getEntry && oManifest.getEntry("sap.app") && oManifest.getEntry("sap.app").type;
		},

		/** Returns the type of "sap.app" from the manifest object passed.
		 * @param {sap.ui.core.Manifest} oManifest - Raw manifest object
		 * @returns {string|undefined} Manifest object's <code>type</code> property for <code>sap.app</code> entry
		 * @private
		 */
		_getComponentTypeFromRawManifest: function(oManifest) {
			return oManifest && oManifest["sap.app"] && oManifest["sap.app"].type;
		},

		/** Returns <code>true</code> if the passed manifest object is of type "application".
		 * @param {sap.ui.core.Manifest} oManifest - Manifest object
		 * @param {boolean} isRaw - is manifest raw object
		 * @returns {boolean} <code>true</code> if the passed manifest object is of type "application"
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		isApplication: function(oManifest, isRaw) {
			var sComponentType = isRaw ? Utils._getComponentTypeFromRawManifest(oManifest) : Utils._getComponentTypeFromManifest(oManifest);
			return sComponentType === "application";
		},

		/** Returns <code>true</code> if the passed component is an application component.
		 * @param {sap.ui.core.Component} oComponent - Component instance
		 * @returns {boolean} <code>true</code> if the passed component is of type "application"
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		isApplicationComponent: function(oComponent) {
			return oComponent instanceof Component && Utils.isApplication(oComponent.getManifestObject());
		},

		/** Returns <code>true</code> if the passed component is an embedded component.
		 * @param {sap.ui.core.Component} oComponent - Component instance
		 * @returns {boolean} <code>true</code> if the passed component is of type "component"
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		isEmbeddedComponent: function(oComponent) {
			return oComponent instanceof Component && Utils._getComponentTypeFromManifest(oComponent.getManifestObject()) === "component";
		},

		/**
		 * Returns the descriptor Id, which is always the reference for descriptor changes
		 *
		 * @param {object|sap.ui.core.Manifest} oManifest - Manifest of the component
		 * @returns {string} Version of application if it is available in the manifest, otherwise an empty string
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		getAppIdFromManifest: function(oManifest) {
			if (oManifest) {
				var oSapApp = (oManifest.getEntry) ? oManifest.getEntry("sap.app") : oManifest["sap.app"];
				var sAppId = oSapApp && oSapApp.id;
				if (sAppId === Utils.APP_ID_AT_DESIGN_TIME) {
					if (oManifest.getComponentName) {
						return oManifest.getComponentName();
					}
					if (oManifest.name) {
						return oManifest.name;
					}
				}
				return sAppId;
			}

			throw new Error("No Manifest received, descriptor changes are not possible");
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
		indexOfObject: function(aArray, oObject) {
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
		execPromiseQueueSequentially: function(aPromiseQueue, bThrowError, bAsync) {
			if (aPromiseQueue.length === 0) {
				if (bAsync) {
					return Promise.resolve();
				}
				return new Utils.FakePromise();
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
					sErrorMessage += e ? ": " + e.message : "";
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
		 * As soon as one of the callback functions returns a Promise the asynchronous Promise replaces the FakePromise in further processing.
		 *
		 * @class sap.ui.fl.Utils.FakePromise
		 * @param {any} vInitialValue - value on resolve FakePromise
		 * @param {any} vError - value on reject FakePromise
		 * @param {string} sInitialPromiseIdentifier - value identifies previous promise in chain. If the identifier is passed to the function and don't match with the FakePromiseIdentifier then native Promise execution is used for further processing
		 * @returns {sap.ui.fl.Utils.FakePromise|Promise} Returns instantiated FakePromise only if no Promise is passed by value parameter
		 * @private
		 * @ui5-restricted
		 */
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
		 * @returns {sap.ui.fl.Change | undefined} Returns the change if it is in the map, otherwise undefined
		 */
		getChangeFromChangesMap: function(mChanges, sChangeId) {
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
		 * Wraps the async sap.ui.require call into a Promise.
		 * @param {string} sModuleName Name of the required module
		 * @returns {Promise} Returns a promise.
		 */
		requireAsync: function(sModuleName) {
			//TODO: get rid of require async as soon as sap.ui.require has learned Promises as return value
			var oModule = sap.ui.require(sModuleName);
			// apply directly if class was already loaded
			if (oModule) {
				return Promise.resolve(oModule);
			}
			return new Promise(function(fnResolve, fnReject) {
				sap.ui.require([sModuleName], function(oModule) {
					fnResolve(oModule);
				}, function(oError) {
					fnReject(oError);
				});
			});
		},

		/**
		 * Normalize reference, delete .Component at the end of the incoming string.
		 * @param {string} sReference - Flex reference
		 * @returns {string} Returns reference without .Component
		 */
		normalizeReference: function(sReference) {
			return sReference.replace(/(.Component)$/g, "");
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
		handleUrlParameters: function(sParameters, sParameterName, sParameterValue, oURLParsingService) {
			if (this.hasParameterAndValue(sParameterName, sParameterValue, oURLParsingService)) {
				if (sParameters.startsWith("?")) {
					sParameters = sParameters.substr(1, sParameters.length);
				}
				var aFilterUrl = sParameters.split("&").filter(function(sParameter) {
					return sParameter !== sParameterName + "=" + sParameterValue;
				});
				sParameters = "";
				if (aFilterUrl.length > 0) {
					sParameters = "?" + aFilterUrl.toString();
				}
			} else {
				sParameters += (sParameters.length > 0 ? '&' : '?') + sParameterName + "=" + sParameterValue;
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
		hasParameterAndValue: function(sParameterName, sParameterValue, oURLParsingService) {
			return this.getParameter(sParameterName, oURLParsingService) === sParameterValue;
		},

		/**
		 * Checks if the passed parameter name is contained in the URL and returns its value.
		 *
		 * @param  {string} sParameterName - The parameter name to be checked
		 * @param  {sap.ushell.services.URLParsing} oURLParsingService - The Unified Shell's internal URL parsing service
		 * @returns {string} The value of the given parameter or undefined
		 */
		getParameter: function (sParameterName, oURLParsingService) {
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
		findAggregation: function(oControl, sAggregationName) {
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
		getAggregation: function (oParent, sAggregationName) {
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
		getProperty: function (oControl, sPropertyName) {
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
		 getUShellService: function(sServiceName) {
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
		getUShellServices: function (aServiceNames) {
			var aServicePromises = aServiceNames.map(function (sServiceName) {
				return this.getUShellService(sServiceName);
			}.bind(this));
			return Promise.all(aServicePromises).then(function (aServices) {
				return aServiceNames.reduce(function (mServices, sService, iIndex) {
					mServices[sService] = aServices && aServices[iIndex];
					return mServices;
				}, {});
			});
		}

	};
	return Utils;
}, true);

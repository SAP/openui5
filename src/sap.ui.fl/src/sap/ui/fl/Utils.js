/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Component",
	"sap/ui/core/util/reflection/BaseTreeModifier",
	"sap/ui/thirdparty/hasher",
	"sap/base/Log",
	"sap/base/util/UriParameters",
	"sap/base/util/uid",
	"sap/base/strings/formatMessage",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/mvc/View"
],
function(
	jQuery,
	Component,
	BaseTreeModifier,
	hasher,
	Log,
	UriParameters,
	uid,
	formatMessage,
	ManagedObject,
	View
) {
	"use strict";

	function appendComponentToString(sComponentName) {
		if (sComponentName.length > 0 && sComponentName.indexOf(".Component") < 0) {
			sComponentName += ".Component";
		}
		return sComponentName;
	}

	/**
	 * Provides utility functions for the SAPUI5 flexibility library
	 *
	 * @namespace
	 * @alias sap.ui.fl.Utils
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.25.0
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

		/**
		 * Tries to retrieve the xsrf token from the controls OData Model. Returns empty string if retrieval failed.
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {String} XSRF Token
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.getXSRFTokenFromControl
		 */
		getXSRFTokenFromControl: function(oControl) {
			var oModel;
			if (!oControl) {
				return "";
			}

			// Get Model
			if (oControl && typeof oControl.getModel === "function") {
				oModel = oControl.getModel();
				return Utils._getXSRFTokenFromModel(oModel);
			}
			return "";
		},

		/**
		 * Returns XSRF Token from the Odata Model. Returns empty string if retrieval failed
		 *
		 * @param {sap.ui.model.odata.ODataModel} oModel - OData Model
		 * @returns {String} XSRF Token
		 * @private
		 */
		_getXSRFTokenFromModel: function(oModel) {
			var mHeaders;
			if (!oModel) {
				return "";
			}
			if (typeof oModel.getHeaders === "function") {
				mHeaders = oModel.getHeaders();
				if (mHeaders) {
					return mHeaders["x-csrf-token"];
				}
			}
			return "";
		},

		/**
		 * Returns the class name of the component the given control belongs to.
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 *
		 * @returns {String} The component class name, ending with ".Component"
		 * @see sap.ui.core.Component.getOwnerIdFor
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.getComponentClassName
		 */
		getComponentClassName: function(oControl) {
			var oAppComponent;

			// determine UI5 component out of given control
			if (oControl) {
				// always return the app component
				oAppComponent = this.getAppComponentForControl(oControl);

				// check if the component is an application variant and assigned an application descriptor then use this as reference
				if (oAppComponent) {
					var sVariantId = this._getComponentStartUpParameter(oAppComponent, "sap-app-id");
					if (sVariantId) {
						return sVariantId;
					}

					if (oAppComponent.getManifestEntry("sap.ui5") && oAppComponent.getManifestEntry("sap.ui5").appVariantId) {
						return oAppComponent.getManifestEntry("sap.ui5").appVariantId;
					}
				}
			}

			return Utils.getComponentName(oAppComponent);
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
		 * Returns the class name of the application component owning the passed component or the component name itself if
		 * this is already an application component.
		 *
		 * @param {sap.ui.core.Component} oComponent - SAPUI5 component
		 * @returns {String} The component class name, ending with ".Component"
		 * @see sap.ui.core.Component.getOwnerIdFor
		 * @public
		 * @since 1.40
		 * @function
		 * @name getAppComponentClassNameForComponent
		 */
		getAppComponentClassNameForComponent: function(oComponent) {
			return Utils.getComponentClassName(oComponent);
		},

		/**
		 * Returns the appDescriptor of the component for the given control
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {object} that represent the appDescriptor
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.getAppDescriptor
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
		 * Returns the siteId of a component
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {string} siteId - that represent the found siteId
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.getSiteId
		 */
		getSiteId: function(oControl) {
			var sSiteId = null;
			var oAppComponent = null;

			// determine UI5 component out of given control
			if (oControl) {
				oAppComponent = this.getAppComponentForControl(oControl);

				// determine siteId from ComponentData
				if (oAppComponent) {
					//Workaround for back-end check: isApplicationPermitted
					//As long as FLP does not know about appDescriptorId we have to pass siteID and applicationID.
					//With startUpParameter hcpApplicationId we will get a concatenation of “siteId:applicationId”

					//sSiteId = this._getComponentStartUpParameter(oComponent, "scopeId");
					sSiteId = this._getComponentStartUpParameter(oAppComponent, "hcpApplicationId");
				}
			}

			return sSiteId;
		},

		/**
		 * Returns the siteId of a component when you already have the component data.
		 *
		 * @param {object} oComponentData - Component data
		 * @returns {string} siteId - that represent the found siteId
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.getSiteIdByComponentData
		 */
		getSiteIdByComponentData: function(oComponentData) {
			return this._getStartUpParameter(oComponentData, "hcpApplicationId");
		},

		/**
		 * Indicates if the property value represents a binding
		 *
		 * @param {object} sPropertyValue - Property value
		 * @returns {boolean} true if value represents a binding
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.isBinding
		 */
		isBinding: function(sPropertyValue) {
			var bIsBinding = false;
			if (sPropertyValue && typeof sPropertyValue === "string" && sPropertyValue.substring(0, 1) === "{" && sPropertyValue.slice(-1) === "}") {
				bIsBinding = true;
			}
			return bIsBinding;
		},

		/**
		 * Indicates if the current application is a variant of an existing one
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {boolean} true if it's an application variant
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.isApplicationVariant
		 */
		isApplicationVariant: function(oControl) {
			var sFlexReference = Utils.getComponentClassName(oControl);
			var oAppComponent = Utils.getAppComponentForControl(oControl);
			var sComponentName = Utils.getComponentName(oAppComponent);
			return sFlexReference !== sComponentName;
		},

		/**
		 * Determines if the passed change is related to control variants.
		 * @see sap.ui.fl.variants.VariantManagement
		 * @param {sap.ui.fl.Change} oChange Change object
		 * @returns {boolean} If the passed change is a variant management change
		 * @public
		 * @name sap.ui.fl.Utils.isChangeRelatedToVariants
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
		 * @param {String} sParameterName - startUpParameterName that shall be determined
		 * @returns {String} content of found startUpParameter
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
		 * Gets the component name for a component instance.
		 *
		 * @param {sap.ui.core.Component} oComponent component instance
		 * @returns {String} component name
		 * @public
		 */
		getComponentName: function(oComponent) {
			var sComponentName = "";
			if (oComponent) {
				sComponentName = oComponent.getMetadata().getName();
			}
			return appendComponentToString(sComponentName);
		},

		/**
		 * Gets the component instance for a component ID.
		 *
		 * @param {String} sComponentId component ID
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
		 * @returns {String} The component id or empty string if component id couldn't be found
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
		 * @public
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
		 * @public
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
		 * @public
		 */
		getViewForControl: function(oControl) {
			return Utils.getFirstAncestorOfControlWithControlType(oControl, sap.ui.core.mvc.View);
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

		hasControlAncestorWithId: function(sControlId, sAncestorControlId) {
			var oControl;

			if (sControlId === sAncestorControlId) {
				return true;
			}

			oControl = sap.ui.getCore().byId(sControlId);
			while (oControl) {
				if (oControl.getId() === sAncestorControlId) {
					return true;
				}

				if (typeof oControl.getParent === "function") {
					oControl = oControl.getParent();
				} else {
					return false;
				}
			}

			return false;
		},

		/**
		 * Checks whether the provided control is a view
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {Boolean} Flag
		 * @see sap.ui.core.Component.getOwnerIdFor
		 * @private
		 */
		_isView: function(oControl) {
			return oControl instanceof View;
		},

		/**
		 * Returns OwnerId of the control
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {String} The owner id
		 * @see sap.ui.core.Component.getOwnerIdFor
		 * @private
		 */
		_getOwnerIdForControl: function(oControl) {
			return Component.getOwnerIdFor(oControl);
		},

		/**
		 * Returns the tenant number for the communication with the ABAP back end.
		 *
		 * @public
		 * @function
		 * @returns {string} the current client
		 * @name sap.ui.fl.Utils.getClient
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
		 * @public
		 * @returns {boolean} is hotfix mode active, or not
		 */
		isHotfixMode: function() {
			var oUriParams;
			var sIsHotfixMode;
			oUriParams = this._getUriParameters();
			sIsHotfixMode = oUriParams.get("hotfix");
			return (sIsHotfixMode === "true");
		},

		/**
		 * Converts the browser language into a 2-character ISO 639-1 language. If the browser language is in format RFC4646, the first part will be
		 * used: For example en-us will be converted to EN. If the browser language already is in ISO 639-1, it will be returned after an upper case
		 * conversion: For example de will be converted to DE.
		 *
		 * @param {String} sBrowserLanguage - Language in RFC4646
		 * @returns {String} Language in ISO 639-1. Empty string if conversion was not successful
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.convertBrowserLanguageToISO639_1
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

		getLrepUrl: function() {
			var aFlexibilityServices = sap.ui.getCore().getConfiguration().getFlexibilityServices();
			var oLrepConfiguration = aFlexibilityServices.find(function(oServiceConfig) {
				return oServiceConfig.connector === "LrepConnector";
			});

			return oLrepConfiguration ? oLrepConfiguration.url : "";
		},

		/**
		 * Returns the current language in ISO 639-1 format.
		 *
		 * @returns {String} Language in ISO 639-1. Empty string if language cannot be determined
		 * @public
		 */
		getCurrentLanguage: function() {
			var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			return Utils.convertBrowserLanguageToISO639_1(sLanguage);
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
		 * @param {String} ascii string containing ascii code valid numbers separated by ','
		 * @returns {String} parsedString parsed string
		 */
		asciiToString: function(ascii) {
			var asciiArray = ascii.split(",");
			var parsedString = "";

			jQuery.each(asciiArray, function(index, asciiChar) {
				parsedString += String.fromCharCode(asciiChar);
			});

			return parsedString;
		},

		/**
		 * Converts a string into ASCII coding. Required for restoring stored code extensions
		 *
		 * @param {String} string string which has to be encoded
		 * @returns {String} ascii imput parsed to ascii numbers separated by ','
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
		 * Returns a map of technical parameters for the passed component.
		 *
		 * @param  {object} oComponent - Component instance used to get the technical parameters
		 * @returns {object|undefined} Returns the requested technical parameter object or undefined if unavailable
		 */
		getTechnicalParametersForComponent: function(oComponent) {
			return oComponent
				&& oComponent.getComponentData
				&& oComponent.getComponentData()
				&& oComponent.getComponentData().technicalParameters;
		},

		/**
		 * Returns URL hash when ushell container is available
		 *
		 * @returns {object} Returns the parsed URL hash object or an empty object if ushell container is not available
		 */
		getParsedURLHash: function() {
			return Utils.ifUShellContainerThen(function(aServices) {
				var oParsedHash = aServices[0].parseShellHash(hasher.getHash());
				return oParsedHash || {};
			}, ["URLParsing"]) || {};
		},

		/**
		 * Calls the passed function with the desired ushell services, if ushell container is available
		 *
		 * @param {function} fnCallBack - Callback function
		 * @param {string[]} aServiceNames - Array of ushell service names
		 * @returns {any|undefined} Returns the Value from the callback
		 */
		ifUShellContainerThen: function(fnCallBack, aServiceNames) {
			var oUShellContainer = Utils.getUshellContainer();
			if (oUShellContainer) {
				var aServices = aServiceNames.map(function(sServiceName) {
					return oUShellContainer.getService(sServiceName);
				});
				return fnCallBack(aServices);
			}
		},

		/**
		 * Checks the SAPUI5 debug settings to determine whether all or at least the <code>sap.ui.fl</code> library is debugged.
		 *
		 * @returns {boolean} Returns a flag if the flexibility library is debugged
		 * @public
		 */
		isDebugEnabled: function() {
			var oUriParams = this._getUriParameters();
			var sDebugParameters = oUriParams.get("sap-ui-debug") || "";

			// true if SAPUI5 is in complete debug mode
			if (sap.ui.getCore().getConfiguration().getDebug() || sDebugParameters === "true") {
				return true;
			}

			var aDebugParameters = sDebugParameters.split(",");
			return aDebugParameters.indexOf("sap/ui/fl") !== -1 || aDebugParameters.indexOf("sap/ui/fl/") !== -1;
		},

		/**
		 * Returns the value of the specified url parameter of the current url
		 *
		 * @param {String} sParameterName - Name of the url parameter
		 * @returns {string} url parameter
		 * @private
		 */
		getUrlParameter: function(sParameterName) {
			return UriParameters.fromQuery(window.location.search).get(sParameterName);
		},

		/**
		 * Returns ushell container if available
		 *
		 * @returns {object|undefined} Returns ushell container object if available or undefined
		 */
		getUshellContainer: function() {
			return sap.ushell && sap.ushell.Container;
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
				case sap.ui.fl.Scenario.VersionedAppVariant:
					if (!sProjectId) {
						oError.message += "in a versioned app variant scenario you additionally need a project ID";
						throw oError;
					}
					sRootNamespace += sBaseId + "/appVariants/" + sProjectId + "/";
					break;
				case sap.ui.fl.Scenario.AppVariant:
					if (!sProjectId) {
						oError.message += "in an app variant scenario you additionally need a project ID";
						throw oError;
					}
					sRootNamespace += sBaseId + "/appVariants/" + sProjectId + "/";
					break;
				case sap.ui.fl.Scenario.AdaptationProject:
					if (!sProjectId) {
						oError.message += "in a adaptation project scenario you additionally need a project ID";
						throw oError;
					}
					sRootNamespace += sBaseId + "/adapt/" + sProjectId + "/";
					break;
				case sap.ui.fl.Scenario.FioriElementsFromScratch:
				case sap.ui.fl.Scenario.UiAdaptation:
				default:
					sRootNamespace += sBaseId + "/";
			}

			return sRootNamespace;
		},

		/** Returns the type of "sap.app" from the manifest object passed.
		 * @param {sap.ui.core.Manifest} oManifest - Manifest object
		 * @returns {string | undefined} Manifest object's "type" property for "sap.app" entry
		 * @private
		 */
		_getComponentTypeFromManifest: function(oManifest) {
			return oManifest && oManifest.getEntry && oManifest.getEntry("sap.app") && oManifest.getEntry("sap.app").type;
		},

		/** Returns the type of "sap.app" from the manifest object passed.
		 * @param {sap.ui.core.Manifest} oRawManifest - raw manifest object
		 * @returns {string | undefined} Manifest object's "type" property for "sap.app" entry
		 * @private
		 */
		_getComponentTypeFromRawManifest: function(oManifest) {
			return oManifest && oManifest["sap.app"] && oManifest["sap.app"].type;
		},

		/** Returns <code>true</code> if the passed manifest object is of type "application".
		 * @param {sap.ui.core.Manifest} oManifest - Manifest object
		 * @param {boolean} isRaw - is manifest raw object
		 * @returns {boolean} <code>true</code> if the passed manifest object is of type "application"
		 * @public
		 */
		isApplication: function(oManifest, isRaw) {
			var sComponentType = isRaw ? Utils._getComponentTypeFromRawManifest(oManifest) : Utils._getComponentTypeFromManifest(oManifest);
			return sComponentType === "application";
		},

		/** Returns <code>true</code> if the passed component is an application component.
		 * @param {sap.ui.core.Component} oComponent - Component instance
		 * @returns {boolean} <code>true</code> if the passed component is of type "application"
		 * @public
		 */
		isApplicationComponent: function(oComponent) {
			return oComponent instanceof Component && Utils.isApplication(oComponent.getManifestObject());
		},

		/** Returns <code>true</code> if the passed component is an embedded component.
		 * @param {sap.ui.core.Component} oComponent - Component instance
		 * @returns {boolean} <code>true</code> if the passed component is of type "component"
		 * @public
		 */
		isEmbeddedComponent: function(oComponent) {
			return oComponent instanceof Component && Utils._getComponentTypeFromManifest(oComponent.getManifestObject()) === "component";
		},

		/**
		 * Returns the reference of a component, according to the following logic:
		 * First appVariantId, if not, componentName + ".Component", if not appId + ".Component" (unless they already have ".Component" at the end).
		 *
		 * @param {object} oManifest - Manifest of the component
		 * @returns {string} flex reference
		 * @public
		 */
		getFlexReference: function(oManifest) {
			if (oManifest) {
				if (oManifest.getEntry("sap.ui5")) {
					if (oManifest.getEntry("sap.ui5").appVariantId) {
						return oManifest.getEntry("sap.ui5").appVariantId;
					}
					if (oManifest.getEntry("sap.ui5").componentName) {
						return appendComponentToString(oManifest.getEntry("sap.ui5").componentName);
					}
				}
				if (oManifest.getEntry("sap.app") && oManifest.getEntry("sap.app").id) {
					return appendComponentToString(Utils.getAppIdFromManifest(oManifest));
				}
			}
			Log.warning("No Manifest received.");
			return "";
		},

		/**
		 * Returns the descriptor Id, which is always the reference for descriptor changes
		 *
		 * @param {object} oManifest - Manifest of the component
		 * @returns {string} Version of application if it is available in the manifest, otherwise an empty string
		 * @public
		 */
		getAppIdFromManifest: function(oManifest) {
			if (oManifest) {
				var oSapApp = (oManifest.getEntry) ? oManifest.getEntry("sap.app") : oManifest["sap.app"];
				var sAppId = oSapApp && oSapApp.id;
				if (sAppId === Utils.APP_ID_AT_DESIGN_TIME && oManifest.getComponentName) {
					sAppId = oManifest.getComponentName();
				}
				return sAppId;
			}

			throw new Error("No Manifest received, descriptor changes are not possible");
		},

		/**
		 * Returns the uri of the main service specified in the app manifest
		 *
		 * @param {object} oManifest - Manifest of the component
		 * @returns {string} Returns the uri if the manifest is available, otherwise an empty string
		 * @public
		 */
		getODataServiceUriFromManifest: function(oManifest) {
			var sUri = "";
			if (oManifest) {
				var oSapApp = (oManifest.getEntry) ? oManifest.getEntry("sap.app") : oManifest["sap.app"];
				if (oSapApp && oSapApp.dataSources && oSapApp.dataSources.mainService && oSapApp.dataSources.mainService.uri) {
					sUri = oSapApp.dataSources.mainService.uri;
				}
			} else {
				Log.warning("No Manifest received.");
			}
			return sUri;
		},

		/**
		 * Checks if an object is in an array or not and returns the index or -1
		 *
		 * @param {object[]} aArray Array of objects
		 * @param {object} oObject object that should be part of the array
		 * @returns {int} Returns the index of the object in the array, -1 if it is not in the array
		 * @public
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
				try {
					var vResult = fnPromise();
				} catch (e) {
					vResult = Promise.reject(e);
				}

				return vResult.then(function() {
					if (!bAsync && vResult instanceof Promise) {
						bAsync = true;
					}
				})
				.catch(function(e) {
					var sErrorMessage = "Error during execPromiseQueueSequentially processing occured";
					sErrorMessage += e ? ": " + e.message : "";
					Log.error(sErrorMessage);

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
					if (vResolve instanceof Promise ||
						vResolve instanceof Utils.FakePromise) {
						return vResolve;
					}
					return new Utils.FakePromise(vResolve);
				} catch (oError) {
					var vReject = oError;
					return new Utils.FakePromise(undefined, vReject);
				}
			};

			/**
			 * <code>then</code> function as for promise (es6), but without a rejection handler.
			 * @param {function} fn - Resolve handler
			 * @returns {sap.ui.fl.Utils.FakePromise|Promise} <code>FakePromise</code> if no promise is returned by the resolve handler
			 * @public
			 */
			Utils.FakePromise.prototype.then = function(fn) {
				if (!this.bContinueWithFakePromise) {
					return Promise.resolve(fn(this.vValue));
				}

				if (!this.vError) {
					return fnResolveOrReject(this.vValue, fn);
				}
				return this;
			};

			/**
			 * <code>catch</code> function as for promise (es6), but without a rejection handler.
			 * @param {function} fn - Rejection handler
			 * @returns {sap.ui.fl.Utils.FakePromise|Promise} <code>FakePromise</code> if no promise is returned by the rejection handler
			 * @public
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
		 * @param {string} reference
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
		 * @returns {string} The modified URL
		 */
		handleUrlParameters: function(sParameters, sParameterName, sParameterValue) {
			if (this.hasParameterAndValue(sParameterName, sParameterValue)) {
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
		 * @returns {boolean} <code>true</code> if the parameter and the given value are in the URL
		 */
		hasParameterAndValue: function(sParameterName, sParameterValue) {
			return this.getParameter(sParameterName) === sParameterValue;
		},

		/**
		 * Checks if the passed parameter name is contained in the URL and returns its value.
		 *
		 * @param  {string} sParameterName - The parameter name to be checked
		 * @returns {string} The value of the given parameter or undefined
		 */
		getParameter: function (sParameterName) {
			var oUshellContainer = this.getUshellContainer();
			if (oUshellContainer) {
				var mParsedHash = this.getParsedURLHash();
				return mParsedHash.params &&
					mParsedHash.params[sParameterName] &&
					mParsedHash.params[sParameterName][0];
			}
			var oUriParams = UriParameters.fromQuery(document.location.search);
			if (!oUriParams) {
				return false;
			}
			return oUriParams.get(sParameterName);
		}
	};
	return Utils;
}, true);

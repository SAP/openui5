/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/core/Component"
], function (jQuery, Component) {
	"use strict";
	//Stack of layers in the layered repository
	var aLayers = [
			"VENDOR",
			"PARTNER",
			"CUSTOMER_BASE",
			"CUSTOMER",
			"USER"
		];
	//Precalculates index of layers
	var mLayersIndex = {};
	aLayers.forEach(function(sLayer, iIndex){
		mLayersIndex[sLayer] = iIndex;
	});
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

		_aLayers : aLayers,
		_mLayersIndex : mLayersIndex,
		_sTopLayer : aLayers[aLayers.length - 1],
		_sMaxLayer : aLayers[aLayers.length - 1],
		DEFAULT_APP_VERSION : "DEFAULT_APP_VERSION",
		/**
		 * log object exposes available log functions
		 *
		 * @name sap.ui.fl.Utils.log
		 * @public
		 */
		log: {
			error: function (sMessage, sDetails, sComponent) {
				jQuery.sap.log.error(sMessage, sDetails, sComponent);
			},
			warning: function (sMessage, sDetails, sComponent) {
				jQuery.sap.log.warning(sMessage, sDetails, sComponent);
			},
			debug: function (sMessage, sDetails, sComponent) {
				jQuery.sap.log.debug(sMessage, sDetails, sComponent);
			}
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
		getXSRFTokenFromControl: function (oControl) {
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
		_getXSRFTokenFromModel: function (oModel) {
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
		 * @returns {String} The component class name, ending with ".Component"
		 * @see sap.ui.base.Component.getOwnerIdFor
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.getComponentClassName
		 */
		getComponentClassName: function (oControl) {
			var oAppComponent;

			// determine UI5 component out of given control
			if (oControl) {
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

		/**
		 * Returns the class name of the application component owning the passed component or the component name itself if
		 * this is already an application component.
		 *
		 * @param {sap.ui.base.Component} oComponent - SAPUI5 component
		 * @returns {String} The component class name, ending with ".Component"
		 * @see sap.ui.base.Component.getOwnerIdFor
		 * @public
		 * @since 1.40
		 * @function
		 * @name getAppComponentClassNameForComponent
		 */
		getAppComponentClassNameForComponent: function (oComponent) {
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
		getAppDescriptor: function (oControl) {
			var oManifest = null, oComponent = null, oComponentMetaData = null;

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
		getSiteId: function (oControl) {
			var sSiteId = null, oComponent = null;

			// determine UI5 component out of given control
			if (oControl) {
				oComponent = this.getAppComponentForControl(oControl);

				// determine siteId from ComponentData
				if (oComponent) {

					//Workaround for back-end check: isApplicationPermitted
					//As long as FLP does not know about appDescriptorId we have to pass siteID and applicationID.
					//With startUpParameter hcpApplicationId we will get a concatenation of “siteId:applicationId”

					//sSiteId = this._getComponentStartUpParameter(oComponent, "scopeId");
					sSiteId = this._getComponentStartUpParameter(oComponent, "hcpApplicationId");

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
		getSiteIdByComponentData: function (oComponentData) {
			var sSiteId = null;

			sSiteId = this._getStartUpParameter(oComponentData, "hcpApplicationId");

			return sSiteId;
		},

		/**
		 * Indicates if the current application is a variant of an existing one and the VENDOR layer is selected
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {boolean} true if application is a variant and the VENDOR layer selected
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.isAppVariantMode
		 */
		isAppVariantMode: function (oControl) {
			return (Utils.isVendorLayer() && Utils.isApplicationVariant(oControl));
		},

		/**
		 * Indicates if the property value represents a binding
		 *
		 * @param {object} oPropertyValue - property value
		 * @returns {boolean} true if value represents a binding
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.isBinding
		 */
		isBinding: function (oPropertyValue) {
			var bIsBinding = false;
			if (oPropertyValue && typeof oPropertyValue === "string" && oPropertyValue.substring(0, 1) === "{" && oPropertyValue.slice(-1) === "}") {
				bIsBinding = true;
			}
			return bIsBinding;
		},

		/**
		 * Indicates if the VENDOR is selected
		 *
		 * @returns {boolean} true if it's an application variant
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.isVendorLayer
		 */
		isVendorLayer: function () {
			// variant mode only supported for vendor other types are not allowed to change standard control variants
			if (Utils.getCurrentLayer(false) === "VENDOR") {
				return true;
			}

			return false;
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
		isApplicationVariant: function (oControl) {
			var sFlexReference = Utils.getComponentClassName(oControl);
			var oAppComponent = Utils.getAppComponentForControl(oControl);
			var sComponentName = Utils.getComponentName(oAppComponent);
			return sFlexReference !== sComponentName;
		},

		/**
		 * Sets the top layer that the changes are applied to; if max layer is not specified, the highest layer in the layer stack is used.
		 *
		 * @param {string} sMaxLayer (optional) - name of the max layer
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.setMaxLayerParameter
		 */
		setMaxLayerParameter: function(sMaxLayer) {
			this._sMaxLayer = sMaxLayer || this._sTopLayer;
		},

		/**
		 * Converts layer name into index
		 * @param {string} sLayer - layer name
		 * @returns {Integer} index of the layer
		 * @function
		 * @name sap.ui.fl.Utils.getLayerIndex
		 */
		getLayerIndex: function(sLayer) {
			return this._mLayersIndex[sLayer];
		},

		/**
		 * Determines whether a layer is higher than the max layer.
		 *
		 * @param {String} sLayer - Layer name to be evaluated
		 * @returns {boolean} <code>true<code> if input layer is higher than max layer, otherwise <code>false<code>
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.isOverMaxLayer
		 */
		isOverMaxLayer: function(sLayer) {
			return (this.getLayerIndex(sLayer) > this.getLayerIndex(this._sMaxLayer));
		},

		/**
		 * Determines if filtering of changes based on layer is required.
		 *
		 * @returns {boolean} <code>true<code> if the top layer is also the max layer, otherwise <code>false<code>
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.isLayerFilteringRequired
		 */
		isLayerFilteringRequired: function() {
			return !(this._sTopLayer === this._sMaxLayer);
		},

		/**
		 * Determines the content for a given startUpParameter name
		 *
		 * @param {sap.ui.core.Component} oComponent - component instance
		 * @param {String} sParameterName - startUpParameterName that shall be determined
		 * @returns {String} content of found startUpParameter
		 * @private
		 */
		_getComponentStartUpParameter: function (oComponent, sParameterName) {
			var startUpParameterContent = null;

			if (sParameterName) {
				if (oComponent && oComponent.getComponentData) {
					startUpParameterContent = this._getStartUpParameter(oComponent.getComponentData(), sParameterName);
				}
			}

			return startUpParameterContent;
		},

		_getStartUpParameter: function (oComponentData, sParameterName) {
			if (oComponentData && oComponentData.startupParameters && sParameterName) {
				if (jQuery.isArray(oComponentData.startupParameters[sParameterName])) {
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
		getComponentName: function (oComponent) {
			var sComponentName = "";
			if (oComponent) {
				sComponentName = oComponent.getMetadata().getName();
			}
			if (sComponentName.length > 0 && sComponentName.indexOf(".Component") < 0) {
				sComponentName += ".Component";
			}
			return sComponentName;
		},

		/**
		 * Gets the component instance for a component ID.
		 *
		 * @param {String} sComponentId component ID
		 * @returns {sap.ui.core.Component} component for the component ID
		 * @private
		 */
		_getComponent: function (sComponentId) {
			var oComponent;
			if (sComponentId) {
				oComponent = sap.ui.getCore().getComponent(sComponentId);
			}
			return oComponent;
		},

		/**
		 * Returns ComponentId of the control. If the control has no component, it walks up the control tree in order to find a control having one
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {String} The component id
		 * @see sap.ui.base.Component.getOwnerIdFor
		 * @private
		 */
		_getComponentIdForControl: function (oControl) {
			var sComponentId = "", i = 0;
			do {
				i++;
				sComponentId = Utils._getOwnerIdForControl(oControl);
				if (sComponentId) {
					return sComponentId;
				}
				if (oControl && typeof oControl.getParent === "function") { // Walk up control tree
					oControl = oControl.getParent();
				} else {
					return "";
				}
			} while (oControl && i < 100);
			return "";
		},

		/**
		 * Returns the Component that belongs to given control. If the control has no component, it walks up the control tree in order to find a
		 * control having one.
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {sap.ui.base.Component} found component
		 * @public
		 */
		getComponentForControl: function (oControl) {
			return Utils._getComponentForControl(oControl);
		},

		/**
		 * Returns the Component that belongs to given control whose type is "application". If the control has no component, it walks up the control tree in order to find a
		 * control having one.
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {sap.ui.base.Component} found component
		 * @public
		 */
		getAppComponentForControl: function (oControl) {
			var oComponent;

			if (oControl instanceof sap.ui.core.Component) {
				oComponent = oControl;
			} else {
				oComponent = this._getComponentForControl(oControl);
			}
			return this._getAppComponentForComponent(oComponent);
		},

		/**
		 * Returns the Component that belongs to given control. If the control has no component, it walks up the control tree in order to find a
		 * control having one.
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {sap.ui.base.Component} found component
		 * @private
		 */
		_getComponentForControl: function (oControl) {
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
		 * @param {sap.ui.base.Component} oComponent - SAPUI5 component
		 * @returns {sap.ui.base.Component} found component
		 * @private
		 */
		_getAppComponentForComponent: function (oComponent) {
			var oSapApp = null;

			// special case for Fiori Elements to reach the real appComponent
			if (oComponent && oComponent.getAppComponent) {
				return oComponent.getAppComponent();
			}

			// special case for OVP
			if (oComponent && oComponent.oComponentData && oComponent.oComponentData.appComponent) {
				return oComponent.oComponentData.appComponent;
			}

			if (oComponent && oComponent.getManifestEntry) {
				oSapApp = oComponent.getManifestEntry("sap.app");
			} else {
				return oComponent;
			}

			if (oSapApp && oSapApp.type && oSapApp.type !== "application") {
				//we need to call this method only when the component
				//an instance of Component is in order to walk up the tree.
				if (oComponent instanceof sap.ui.core.Component) {
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
		 * @see sap.ui.base.Component.getOwnerIdFor
		 * @public
		 */
		getViewForControl: function (oControl) {
			return Utils.getFirstAncestorOfControlWithControlType(oControl, sap.ui.core.mvc.View);

		},

		getFirstAncestorOfControlWithControlType: function (oControl, controlType) {
			if (oControl instanceof controlType) {
				return oControl;
			}

			if (oControl && typeof oControl.getParent === "function") {
				oControl = oControl.getParent();
				return Utils.getFirstAncestorOfControlWithControlType(oControl, controlType);
			}
		},

		hasControlAncestorWithId: function (sControlId, sAncestorControlId) {
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
		 * @see sap.ui.base.Component.getOwnerIdFor
		 * @private
		 */
		_isView: function (oControl) {
			return oControl instanceof sap.ui.core.mvc.View;
		},

		/**
		 * Returns OwnerId of the control
		 *
		 * @param {sap.ui.core.Control} oControl - SAPUI5 control
		 * @returns {String} The owner id
		 * @see sap.ui.base.Component.getOwnerIdFor
		 * @private
		 */
		_getOwnerIdForControl: function (oControl) {
			return Component.getOwnerIdFor(oControl);
		},

		/**
		 * Returns the current layer as defined by the url parameter. If the end user flag is set, it always returns "USER".
		 *
		 * @param {boolean} bIsEndUser - the end user flag
		 * @returns {string} the current layer
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.getCurrentLayer
		 */
		getCurrentLayer: function (bIsEndUser) {
			var oUriParams, layer;
			if (bIsEndUser) {
				return "USER";
			}

			oUriParams = this._getUriParameters();
			layer = oUriParams.mParams["sap-ui-layer"];
			if (layer && layer.length > 0) {
				return layer[0];
			}
			return "CUSTOMER";

		},

		/**
		 * Checks if a shared newly created variant requires an ABAP package; this is relevant for the VENDOR, PARTNER and CUSTOMER_BASE layers,
		 * whereas variants in the CUSTOMER layer are client-dependent content and can either be transported or stored as local objects ($TMP).
		 * A variant in the CUSTOMER layer that will be transported must not be assigned to a package.
		 *
		 * @returns {boolean} - Indicates whether a new variant needs an ABAP package
		 * @public
		 * @function
		 * @name sap.ui.fl.Utils.doesSharedVariantRequirePackage
		 */
		doesSharedVariantRequirePackage: function () {
			var sCurrentLayer;
			sCurrentLayer = Utils.getCurrentLayer(false);
			if ((sCurrentLayer === "VENDOR") || (sCurrentLayer === "PARTNER") || (sCurrentLayer === "CUSTOMER_BASE")) {
				return true;
			}

			return false;
		},

		/**
		 * Returns the tenant number for the communication with the ABAP back end.
		 *
		 * @public
		 * @function
		 * @returns {string} the current client
		 * @name sap.ui.fl.Utils.getClient
		 */
		getClient: function () {
			var oUriParams, client;
			oUriParams = this._getUriParameters();
			client = oUriParams.mParams["sap-client"];
			if (client && client.length > 0) {
				return client[0];
			}
			return undefined;
		},

		_getUriParameters: function () {
			return jQuery.sap.getUriParameters();
		},
		/**
		 * Returns whether the hot fix mode is active (url parameter hotfix=true)
		 *
		 * @public
		 * @returns {bool} is hotfix mode active, or not
		 */
		isHotfixMode: function () {
			var oUriParams, aIsHotfixMode, sIsHotfixMode;
			oUriParams = this._getUriParameters();
			aIsHotfixMode = oUriParams.mParams["hotfix"];
			if (aIsHotfixMode && aIsHotfixMode.length > 0) {
				sIsHotfixMode = aIsHotfixMode[0];
			}
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
		convertBrowserLanguageToISO639_1: function (sBrowserLanguage) {
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
		 * Returns the current language in ISO 639-1 format.
		 *
		 * @returns {String} Language in ISO 639-1. Empty string if language cannot be determined
		 * @public
		 */
		getCurrentLanguage: function () {
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
		getControlType: function (oControl) {
			var oMetadata;
			if (oControl && typeof oControl.getMetadata === "function") {
				oMetadata = oControl.getMetadata();
				if (oMetadata && typeof oMetadata.getElementName === "function") {
					return oMetadata.getElementName();
				}
			}
		},

		/**
		 * Converts ASCII coding into a string. Required for restoring stored code extinsions
		 *
		 * @param {String} ascii string containing ascii code valid numbers seperated by ','
		 * @returns {String} parsedString parsed string
		 */
		asciiToString: function (ascii) {
			var asciiArray = ascii.split(",");
			var parsedString = "";

			jQuery.each(asciiArray, function (index, asciiChar) {
				parsedString += String.fromCharCode(asciiChar);
			});

			return parsedString;

		},

		/**
		 * Converts ASCII coding into a string. Required for restoring stored code extinsions
		 *
		 * @param {String} string string which has to be encoded
		 * @returns {String} ascii imput parsed to ascii numbers seperated by ','
		 */
		stringToAscii: function (string) {
			var ascii = "";

			for (var i = 0; i < string.length; i++) {
				ascii += string.charCodeAt(i) + ",";
			}

			// remove last ","
			ascii = ascii.substring(0, ascii.length - 1);

			return ascii;
		},

		_fnCheckElementIsNoClone: function (oElement) {
			var bElementIsNoClone = true;

			if (oElement.getBindingContext && oElement.getBindingContext()) {
				var aBindingHierarchy = oElement.getBindingContext().getPath().split("/");
				var sLowestBindingHierarchy = aBindingHierarchy[aBindingHierarchy.length - 1];
				bElementIsNoClone = isNaN(sLowestBindingHierarchy);
			}

			return bElementIsNoClone;
		},

		/**
		 * Check if the control id is generated or maintained by the application
		 *
		 * @param {sap.ui.core.Control | string} vControl Control instance or id
		 * @param {sap.ui.core.Component} [oAppComponent] oAppComponent application component, needed only if vControl is string (id)
		 * @param {boolean} [bSuppressLogging] bSuppressLogging flag to suppress the warning in the console
		 * @returns {boolean} Returns true if the id is maintained by the application
		 */
		checkControlId: function (vControl, oAppComponent, bSuppressLogging) {

			var sControlId = vControl instanceof sap.ui.base.ManagedObject ? vControl.getId() : vControl;
			if (!oAppComponent) {
				vControl = vControl instanceof sap.ui.base.ManagedObject ? vControl : sap.ui.getCore().byId(sControlId);
				oAppComponent = Utils.getAppComponentForControl(vControl);
			}
			var bIsGenerated = sap.ui.base.ManagedObjectMetadata.isGeneratedId(sControlId);

			if (!bIsGenerated || this.hasLocalIdSuffix(vControl, oAppComponent)) {
				return true;
			} else {


				var sHasConcatenatedId = sControlId.indexOf("--") !== -1;
				if (!bSuppressLogging && !sHasConcatenatedId && this._fnCheckElementIsNoClone(vControl)) {
					this.log.warning("Generated id attribute found, to offer flexibility a stable control id is needed " +
						"to assign the changes to, but for this control the id was generated by SAPUI5", sControlId);
				}
				return false;
			}
		},

		/**
		 * Checks if a control id has a prefix matching the application component it.
		 * If this prefix exists the suffix after the component Id is called the local id.
		 *
		 * @param {sap.ui.core.Control | string} vControl ui5 control or id to be checked if it is wihtin the generic application
		 * @param {sap.ui.core.Component} oAppComponent application component, needed only if vControl is string (id)
		 * @returns {boolean} control has a local id
		 */
		hasLocalIdSuffix: function (vControl, oAppComponent) {
			var sControlId = (vControl instanceof sap.ui.base.ManagedObject) ? vControl.getId() : vControl;

			if (!oAppComponent) {
				this.log.error("determination of a local id suffix failed due to missing app component for " + sControlId);
				return false;
			}

			return !!oAppComponent.getLocalId(sControlId);
		},

		/**
		 * Returns the a string containing all url parameters of the current window.location
		 *
		 * @returns {string} Substring of url containing the url query parameters
		 * @private
		 */
		_getAllUrlParameters: function () {
			return window.location.search.substring(1);
		},

		/**
		 * Returns the value of the specified url parameter of the current url
		 *
		 * @param {String} sParameterName - Name of the url parameter
		 * @returns {string} url parameter
		 * @private
		 */
		getUrlParameter: function (sParameterName) {
			return jQuery.sap.getUriParameters().get(sParameterName);
		},

		createDefaultFileName: function (sNameAddition) {
			var sFileName = jQuery.sap.uid().replace(/-/g, "_");
			if (sNameAddition) {
				sFileName += '_' + sNameAddition;
			}
			return sFileName;
		},

		createNamespace: function (oPropertyBag, sSubfolder) {
			var sReferenceName = oPropertyBag.reference.replace('.Component', '');
			var sNamespace = 'apps/' + sReferenceName + "/" + sSubfolder + "/";
			return sNamespace;
		},

		isApplication: function (oManifest) {
			return (oManifest && oManifest.getEntry("sap.app") && oManifest.getEntry("sap.app").type === "application");
		},

		/**
		 * Returns the reference of a component, according to the following logic:
		 * First appVariantId, if not, componentName + ".Component", if not appId + ".Component".
		 *
		 * @param {object} oManifest - Manifest of the component
		 * @returns {string} flex reference
		 * @public
		 */
		getFlexReference: function (oManifest) {
			if (oManifest) {
				if (oManifest.getEntry("sap.ui5")) {
					if (oManifest.getEntry("sap.ui5").appVariantId) {
						return oManifest.getEntry("sap.ui5").appVariantId;
					}
					if (oManifest.getEntry("sap.ui5").componentName) {
						return oManifest.getEntry("sap.ui5").componentName + ".Component";
					}
				}
				if (oManifest.getEntry("sap.app") && oManifest.getEntry("sap.app").id) {
					return oManifest.getEntry("sap.app").id + ".Component";
				}
			}
			this.log.warning("No Manifest received.");
			return "";
		},

		/**
		 * Returns the semantic application version using format: "major.minor.patch".
		 *
		 * @param {object} oManifest - Manifest of the component
		 * @returns {string} Version of application if it is available in the manifest, otherwise an empty string
		 * @public
		 */
		getAppVersionFromManifest: function (oManifest) {
			var sVersion = "";
			if (oManifest){
				var oSapApp = (oManifest.getEntry) ? oManifest.getEntry("sap.app") : oManifest["sap.app"];
				if (oSapApp && oSapApp.applicationVersion && oSapApp.applicationVersion.version){
					sVersion = oSapApp.applicationVersion.version;
				}
			} else {
				this.log.warning("No Manifest received.");
			}
			return sVersion;
		},

		/**
		 * Returns whether provided layer is a customer dependent layer
		 *
		 * @returns {boolean} true if provided layer is customer dependent layer else false
		 * @public
		 */
		isCustomerDependentLayer : function(sLayerName) {
			return (["CUSTOMER", "CUSTOMER_BASE"].indexOf(sLayerName) > -1);
		}
	};
	return Utils;
}, true);

/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/core/Component", "sap/ui/fl/ChangePersistence", "sap/ui/fl/Utils"
], function(jQuery, Component, ChangePersistence, Utils) {
	"use strict";

	/**
	 * Factory to get or create a new instances of {sap.ui.fl.ChangePersistence}
	 * @constructor
	 * @alias sap.ui.fl.ChangePersistenceFactory
	 * @experimental Since 1.27.0
	 * @author SAP SE
	 * @version ${version}
	 */
	var ChangePersistenceFactory = {};

	ChangePersistenceFactory._instanceCache = {};

	/**
	 * Creates or returns an instance of the ChangePersistence
	 * @param {String} sComponentName - Name of the component
	 * @param {String} sAppVersion - Current running version of application
	 * @returns {sap.ui.fl.ChangePersistence} <code>ChangePersistence<code> instance
	 *
	 * @public
	 */
	ChangePersistenceFactory.getChangePersistenceForComponent = function(sComponentName, sAppVersion) {
		var oChangePersistence;
		sAppVersion = sAppVersion || Utils.DEFAULT_APP_VERSION;
		var oComponent = {
			name : sComponentName,
			appVersion : sAppVersion
		};

		if (!ChangePersistenceFactory._instanceCache[sComponentName]) {
			ChangePersistenceFactory._instanceCache[sComponentName] = {};
		}
		oChangePersistence = ChangePersistenceFactory._instanceCache[sComponentName][sAppVersion];
		if (!oChangePersistence) {
			oChangePersistence = new ChangePersistence(oComponent);
			ChangePersistenceFactory._instanceCache[sComponentName][sAppVersion] = oChangePersistence;
		}

		return oChangePersistence;
	};

	/**
	 * Creates or returns an instance of the ChangePersistence for the component of the specified control.
	 * The control needs to be embedded into a component.
	 * @param {sap.ui.core.Control} oControl The control for example a SmartField, SmartGroup or View
	 * @returns {sap.ui.fl.ChangePersistence} instance
	 *
	 * @public
	 */
	ChangePersistenceFactory.getChangePersistenceForControl = function(oControl) {
		var sComponentId;
		sComponentId = this._getComponentClassNameForControl(oControl);
		var sAppVersion = Utils.getAppVersionFromManifest(Utils.getAppComponentForControl(oControl).getManifest());
		return ChangePersistenceFactory.getChangePersistenceForComponent(sComponentId, sAppVersion);
	};

	/**
	 * Returns the name of the component of the control
	 * @param {sap.ui.core.Control} oControl Control
	 * @returns {String} The name of the component. Undefined if no component was found
	 *
	 * @private
	 */
	ChangePersistenceFactory._getComponentClassNameForControl = function(oControl) {
		return Utils.getComponentClassName(oControl);
	};

	/**
	 * Registers the ChangePersistenceFactory._onLoadComponent to the Component loading functionality
	 *
	 * @since 1.38
	 * @private
	 */
	ChangePersistenceFactory.registerLoadComponentEventHandler = function () {
		Component._fnLoadComponentCallback = this._onLoadComponent.bind(this);
	};

	/**
	 * Processing of the load component, shared by _onLoadComponent and _getChangesForComponentAfterInstantiation.
	 *
	 * @param {object} oConfig - copy of the configuration of loaded component
	 * @param {object} oConfig.asyncHints - async hints passed from the app index to the core Component processing
	 * @param {object} oManifest - Manifest of the component
	 * @returns {object} Wrapper for oChangePersistence and oRequestOptions
	 * @since 1.43
	 * @private
	 */
	ChangePersistenceFactory._doLoadComponent = function (oConfig, oManifest) {
		var oChangePersistenceWrapper = {oChangePersistence: {}, oRequestOptions: {}};
		var sComponentName = Utils.getFlexReference(oManifest);
		var sAppVersion = Utils.getAppVersionFromManifest(oManifest);
		var sMaxLayer, oStartupParameters, oTechnicalParameters;

		oStartupParameters = oConfig && oConfig.componentData && oConfig.componentData.startupParameters || {};
		oTechnicalParameters = oConfig && oConfig.componentData && oConfig.componentData.technicalParameters;

		if (oStartupParameters["sap-app-id"] && oStartupParameters["sap-app-id"].length === 1) {
			// deprecated app variant id support with no caching
			sComponentName = oStartupParameters["sap-app-id"][0];
		} else {
			if (oConfig) {
				var aAsyncHints = oConfig.asyncHints;
				if (aAsyncHints && aAsyncHints.requests && Array.isArray(aAsyncHints.requests)) {
					var oFlAsyncHint = this._findFlAsyncHint(aAsyncHints.requests);
					if (oFlAsyncHint && sComponentName === oFlAsyncHint.reference) {
						oChangePersistenceWrapper.oRequestOptions.cacheKey = oFlAsyncHint.cachebusterToken || "<NO CHANGES>";
					}
				}
			}
		}
		//Checks technicalParameters/startup (old) parameter for sap-ui-fl-max-layer value
		var oMaxLayerParameters = oTechnicalParameters || oStartupParameters;
		if (oMaxLayerParameters && oMaxLayerParameters["sap-ui-fl-max-layer"] && oMaxLayerParameters["sap-ui-fl-max-layer"].length === 1) {
			sMaxLayer = oMaxLayerParameters["sap-ui-fl-max-layer"][0];
		}
		Utils.setMaxLayerParameter(sMaxLayer);

		oChangePersistenceWrapper.oRequestOptions.siteId = Utils.getSiteIdByComponentData(oConfig.componentData);
		oChangePersistenceWrapper.oChangePersistence = this.getChangePersistenceForComponent(sComponentName, sAppVersion);

		return oChangePersistenceWrapper;
	};

	/**
	 * Callback which is called within the early state of Component processing.
	 * Already triggers the loading of the flexibility changes if the loaded manifest is an application variant.
	 *
	 * @param {object} oConfig - copy of the configuration of loaded component
	 * @param {object} oConfig.asyncHints - async hints passed from the app index to the core Component processing
	 * @param {object} oManifest - copy of the manifest of loaded component
	 * @param {object} oManifest."sap.app"
	 * @param {string} oManifest."sap.app".type - type of the component (i.e. "application").
	 * The processing is only done for components of the type "application"
	 * @since 1.38
	 * @private
	 */
	ChangePersistenceFactory._onLoadComponent = function (oConfig, oManifest) {

		// stop processing if the component is not of the type application
		if (!Utils.isApplication(oManifest)) {
			return;
		}

		var oChangePersistenceWrapper = this._doLoadComponent(oConfig, oManifest);

		oChangePersistenceWrapper.oChangePersistence.getChangesForComponent(oChangePersistenceWrapper.oRequestOptions);
	};

	/**
	 * Callback which is called within the early state of Component instantiation.
	 *
	 * @param {object} oConfig - copy of the configuration of loaded component
	 * @param {object} oConfig.asyncHints - async hints passed from the app index to the core Component processing
	 * @param {object} oManifest - copy of the manifest of loaded component
	 * @param {object} oManifest."sap.app"
	 * @param {string} oManifest."sap.app".type - type of the component (i.e. "application").
	 * @param {object} oComponent Component instance
	 * The processing is only done for components of the type "application"
	 * @returns {Promise} Promise resolving after the changes are loaded with a getter to retrieve the mapped changes.
	 * @since 1.43
	 * @private
	 */
	ChangePersistenceFactory._getChangesForComponentAfterInstantiation = function (oConfig, oManifest, oComponent) {

		// stop processing if the component is not of the type application
		if (!Utils.isApplication(oManifest)) {
			return Promise.resolve(function() {
				return {
					mChanges: {},
					mDependencies: {},
					mDependentChangesOnMe: {}
				};
			});
		}

		var oChangePersistenceWrapper = this._doLoadComponent(oConfig, oManifest);

		return oChangePersistenceWrapper.oChangePersistence.loadChangesMapForComponent(oComponent, oChangePersistenceWrapper.oRequestOptions);
	};

	ChangePersistenceFactory._findFlAsyncHint = function (oAsyncHintRequest) {
		var that = this;
		var oFlAsyncHint;

		jQuery.each(oAsyncHintRequest, function (nIndex, oAsyncHint) {
			if (that._flAsyncHintMatches(oAsyncHint)) {
				oFlAsyncHint = oAsyncHint;
				return false; // break forEach
			}
		});

		return oFlAsyncHint;
	};

	ChangePersistenceFactory._flAsyncHintMatches = function (oAsyncHintRequest) {
		return oAsyncHintRequest.name === "sap.ui.fl.changes";
	};

	return ChangePersistenceFactory;
}, true);

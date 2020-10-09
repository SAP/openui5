/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/Utils"
], function(
	Component,
	FlexState,
	ChangePersistence,
	Utils
) {
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
	 * @returns {sap.ui.fl.ChangePersistence} <code>ChangePersistence</code> instance
	 *
	 * @public
	 */
	ChangePersistenceFactory.getChangePersistenceForComponent = function(sComponentName) {
		var oChangePersistence = ChangePersistenceFactory._instanceCache[sComponentName];
		if (!oChangePersistence) {
			var oComponent = {
				name : sComponentName
			};
			oChangePersistence = new ChangePersistence(oComponent);
			ChangePersistenceFactory._instanceCache[sComponentName] = oChangePersistence;
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
		sComponentId = Utils.getComponentClassName(oControl);
		return ChangePersistenceFactory.getChangePersistenceForComponent(sComponentId);
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
	 * Callback which is called within the early state of Component processing.
	 * Already triggers the loading of the flexibility changes if the loaded manifest is an application variant.
	 * The processing is only done for components of the type "application"
	 *
	 * @param {object} oConfig - Copy of the configuration of loaded component
	 * @param {object} oConfig.asyncHints - Async hints passed from the app index to the core Component processing
	 * @param {object} oManifest - Copy of the manifest of loaded component
	 * @since 1.38
	 * @private
	 */
	ChangePersistenceFactory._onLoadComponent = function (oConfig, oManifest) {
		// stop processing if the component is not of the type application or component ID is missing
		if (!Utils.isApplication(oManifest) || !oConfig.id) {
			return;
		}

		FlexState.initialize({
			componentData: oConfig.componentData || (oConfig.settings && oConfig.settings.componentData),
			asyncHints: oConfig.asyncHints,
			manifest: oManifest,
			componentId: oConfig.id
		});
	};

	return ChangePersistenceFactory;
}, true);
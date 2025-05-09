/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/future", "sap/ui/core/Component"], function(future, Component) {
	"use strict";

	// contains all external ExtensionProvider instances, mapped by their class-name
	var mExtensionProvider = {};

	/**
	 * Static controller extensions provider.
	 * Reads the extension information from the Manifest of the owner-component.
	 * Additionally relays the resolution to an ExternalProvider.
	 *
	 * @since 1.88.0
	 * @alias sap.ui.core.mvc.ControllerExtensionProvider
	 * @static
	 * @namespace
	 * @private
	 * @ui5-restricted sap.ui.core.mvc.Controller
	 */
	var ControllerExtensionProvider = {};

	/**
	 * Global extension provider name which will be used to create the
	 * instance of the extension provider.
	 *
	 * @private
	 */
	ControllerExtensionProvider._sExtensionProvider = null;

	/**
	 * Registers a callback module, which provides code enhancements for the
	 * lifecycle and event handler functions of a specific controller. The code
	 * enhancements are returned either in sync or async mode.
	 *
	 * The extension provider module provides the <code>getControllerExtensions</code> function
	 * which returns either directly an array of objects or a Promise that returns an array
	 * of objects when it resolves. These objects are object literals defining the
	 * methods and properties of the controller in a similar way as for {@link sap.ui.core.mvc.Controller Controller} subclasses.
	 *
	 *
	 * <b>Example for a callback module definition (sync):</b>
	 * <pre>
	 * sap.ui.define("my/custom/sync/ExtensionProvider", [], function() {
	 *   var ExtensionProvider = function() {};
	 *   ExtensionProvider.prototype.getControllerExtensions = function(sControllerName, sComponentId, bAsync) {
	 *     if (!bAsync && sControllerName == "my.own.Controller") {
	 *       // IMPORTANT: only return extensions for a specific controller
	 *       return [{
	 *         onInit: function() {
	 *           // Do something here...
	 *         },
	 *         onAfterRendering: function() {
	 *           // Do something here...
	 *         },
	 *         onButtonClick: function(oEvent) {
	 *           // Handle the button click event
	 *         }
	 *       }
	 *     }];
	 *   };
	 *   return ExtensionProvider;
	 * });
	 * </pre>
	 *
	 *
	 * <b>Example for a callback module definition (async):</b>
	 * <pre>
	 * sap.ui.define("my/custom/async/ExtensionProvider", [], function() {
	 *   var ExtensionProvider = function() {};
	 *   ExtensionProvider.prototype.getControllerExtensions = function(sControllerName, sComponentId, bAsync) {
	 *     if (bAsync && sControllerName == "my.own.Controller") {
	 *       // IMPORTANT:
	 *       // only return a Promise for a specific controller since it
	 *       // requires the View/Controller and its parents to run in async
	 *       // mode!
	 *       return new Promise(function(fnResolve, fnReject) {
	 *         fnResolve([{
	 *           onInit: function() {
	 *             // Do something here...
	 *           },
	 *           onAfterRendering: function() {
	 *             // Do something here...
	 *           },
	 *           onButtonClick: function(oEvent) {
	 *             // Handle the button click event
	 *           }
	 *         }]);
	 *       }
	 *     };
	 *   };
	 *   return ExtensionProvider;
	 * });
	 * </pre>
	 *
	 *
	 * The lifecycle functions <code>onInit</code>, <code>onExit</code>,
	 * <code>onBeforeRendering</code> and <code>onAfterRendering</code>
	 * are added before or after the lifecycle functions of the original
	 * controller. The event handler functions, such as <code>onButtonClick</code>,
	 * are replacing the original controller's function.
	 *
	 * When using an async extension provider, you need to ensure that the
	 * view is loaded in async mode.
	 *
	 * In both cases, return <code>undefined</code> if no controller extension shall be applied.
	 *
	 * @param {string} sExtensionProvider the module name of the extension provider
	 *
	 * See {@link sap.ui.core.mvc.Controller} for an overview of the available functions for controllers.
	 *
	 * @alias sap.ui.core.mvc.ControllerExtensionProvider.registerExtensionProvider
	 * @static
	 * @private
	 * @ui5-restricted sap/ui/fl
	 */
	ControllerExtensionProvider.registerExtensionProvider = function(sExtensionProvider) {
		ControllerExtensionProvider._sExtensionProvider = sExtensionProvider;
	};

	/**
	 * Retrieves the controller extensions.
	 *
	 * @param {string} sControllerName the name of the controller which should be extended
	 * @param {string} sComponentId the ID of the controller's owner-component
	 * @param {string} sViewId the view-id which is used to distinguish instance-specific controller extensions
	 * @param {boolean} bAsync whether the provider should act asynchronously
	 * @returns {object} an object containing all controller-extensions
	 * split into two parts:
	 * 1. extensions from the customizing configuration in the manifest (<return>.customizingControllerNames)
	 * 2. extensions from the external provider (<return>.providerControllers)
	 *
	 * @private
	 * @ui5-restricted sap.ui.core.mvc.Controller
	 * @ui5-transform-hint replace-param bAsync true
	 */
	ControllerExtensionProvider.getControllerExtensions = function(sControllerName, sComponentId, sViewId, bAsync) {
		var mControllerExtensions = {
			customizingControllerNames: [],   // extensions defined in the manifest via customizing config
			providerControllers: []           // extensions loaded via external provider
		};

		var oComponent = Component.getComponentById(sComponentId);
		// the view ID used in the customizing definition in the manifest.json
		// must not contain a reference to the runtime ID of the component itself
		if (oComponent && oComponent.getLocalId) {
			// if view ID is not prefixed getLocalId returns null
			sViewId = oComponent.getLocalId(sViewId) || sViewId;
		}

		// 1. Read customizing config from manifest
		var aManifestExtensions = readManifestExtensionConfiguration(sControllerName, oComponent, sViewId);
		mControllerExtensions.customizingControllerNames = aManifestExtensions;

		if (bAsync) {
			// 2. Read extensions from externally defined ExtensionProvider (if registered)
			if (ControllerExtensionProvider._sExtensionProvider) {
				return loadExtensionProvider(bAsync).then(function (oExternalProvider) {
					return oExternalProvider.getControllerExtensions(sControllerName, sComponentId, bAsync, sViewId);
				}).then(function(aExternalExtensions) {
					// add provider-extensions
					mControllerExtensions.providerControllers = aExternalExtensions || [];
					return mControllerExtensions;
				});
			} else {
				return Promise.resolve(mControllerExtensions);
			}
		} else {
			// 2. Read extensions from externally defined ExtensionProvider (if registered)
			if (ControllerExtensionProvider._sExtensionProvider) {
				var oExternalProvider = loadExtensionProvider();
				if (oExternalProvider) {
					var aExternalExtensions = oExternalProvider.getControllerExtensions(sControllerName, sComponentId, bAsync, sViewId);

					if (aExternalExtensions && Array.isArray(aExternalExtensions)) {
						// add provider-extensions
						mControllerExtensions.providerControllers = aExternalExtensions;
					} else {
						future.errorThrows("Controller Extension Provider: Error in ExtensionProvider.getControllerExtensions: " + ControllerExtensionProvider._sExtensionProvider +
								" - no valid extensions returned. Return value must be an array of ControllerExtensions.");
					}
				}
			}

			return mControllerExtensions;
		}
	};

	function readManifestExtensionConfiguration(sControllerName, oComponent, sViewId) {

		var aControllerNames = [];


		// lookup config of "sap.ui.controllerExtensions" in Manifest
		var mInstanceSpecificConfig = Component.getCustomizing(oComponent, {
			type: "sap.ui.controllerExtensions",
			name: sControllerName + "#" + sViewId
		});

		// First check for instance-specific extension, if none exists look for base extension
		var aControllerExtConfigs = [];

		if (mInstanceSpecificConfig) {
			aControllerExtConfigs.push(mInstanceSpecificConfig);
		} else {
			var mDefaultConfig = Component.getCustomizing(oComponent, {
				type: "sap.ui.controllerExtensions",
				name: sControllerName
			});
			if (mDefaultConfig) {
				aControllerExtConfigs.push(mDefaultConfig);
			}
		}

		for (var i = 0; i < aControllerExtConfigs.length; i++) {
			var vControllerExtensions = aControllerExtConfigs[i];
			if (vControllerExtensions) {
				// Normalize the different legacy extension definitions, either:
				//  - a string -> "my.ctrl.name"
				//  - an object containing a controllerName:string property and/or a controllerNames:string[] property, e.g.
				//    { controllerName: "my.ctrl.name0", controllerNames: ["my.ctrl.name1", "my.ctrl.name2"] }
				var sExtControllerName = typeof vControllerExtensions === "string" ? vControllerExtensions : vControllerExtensions.controllerName;
				aControllerNames = aControllerNames.concat(vControllerExtensions.controllerNames || []);
				if (sExtControllerName) {
					aControllerNames.unshift(sExtControllerName);
				}
			}
		}

		return aControllerNames;
	}

	/**
	 * Load the registered ExtensionProvider.
	 *
	 * @param {boolean} bAsync Load async or not
	 * @return {ExtensionProvider|Promise|undefined} ExtensionProvider <code>Promise</code> in case of asynchronous loading
	 *           or the <code>ExtensionProvider</code> in case of synchronous loading or undefined in case no provider exists
	 * @ui5-transform-hint replace-param bAsync true
	 */
	function loadExtensionProvider(bAsync) {
		var sProviderName = ControllerExtensionProvider._sExtensionProvider.replace(/\./g, "/"),
			oProvider = mExtensionProvider[sProviderName];

		// provider already available
		if (oProvider) {
			return bAsync ? Promise.resolve(oProvider) : oProvider;
		}

		// provider must be loaded
		if (sProviderName) {
			if (bAsync) {
				return new Promise(function(resolve, reject) {
					sap.ui.require([sProviderName], function(ExtensionProvider) {
						oProvider = new ExtensionProvider();
						mExtensionProvider[sProviderName] = oProvider;
						resolve(oProvider);
					}, reject);
				});
			} else {
				var ExtensionProviderClass = sap.ui.requireSync(sProviderName); // legacy-relevant: Sync path
				oProvider = new ExtensionProviderClass();
				mExtensionProvider[sProviderName] = oProvider;
				return oProvider;
			}
		} else {
			// no provider registered
			return bAsync ? Promise.resolve() : undefined;
		}
	}

	return ControllerExtensionProvider;
});
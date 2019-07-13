/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'./Core',
	'./Component',
	'sap/base/Log',
	'sap/base/util/ObjectPath',
	"sap/base/util/isEmptyObject"
],
	function(jQuery, Core, Component, Log, ObjectPath, isEmptyObject) {
	"use strict";




		// keys for configuration sections
		var CONFIG_VIEW_REPLACEMENTS       = "sap.ui.viewReplacements",
			CONFIG_VIEW_EXTENSIONS         = "sap.ui.viewExtensions",
			CONFIG_VIEW_MODIFICATIONS      = "sap.ui.viewModifications",
			CONFIG_CONTROLLER_EXTENSIONS   = "sap.ui.controllerExtensions",
			CONFIG_CONTROLLER_REPLACEMENTS = "sap.ui.controllerReplacements";

		// map of component configurations
		var mComponentConfigs = {};

		/**
		 * Finds the config in the given type and use the check function to validate
		 * if the correct entry has been found!
		 * @param {string} sType Name of the config section
		 * @param {string|sap.ui.base.ManagedObject} vObject Component ID or ManagedObject
		 * @param {function} fnCheck Check function
		 */
		function findConfig(sType, vObject, fnCheck) {
			var sComponentId = vObject && typeof vObject === "string" ? vObject : (vObject && Component.getOwnerIdFor(vObject));
			if (sComponentId) {
				// if a component name is given only the component customizing
				// configuration is checked - the customizing configuration is
				// merged in case of extending components - so the configuration
				// should be available properly
				var oComponent = Component.get(sComponentId);
				var sComponentName = oComponent && oComponent.getMetadata().getComponentName();
				// starting with manifest first we need to check the instance
				// specific configuration first and fallback to the general
				// customizing configuration of the component
				var oConfig = mComponentConfigs[sComponentName + "::" + sComponentId];
				if (oConfig && oConfig[sType] && fnCheck(oConfig[sType])) {
					return false;
				} else {
					oConfig = mComponentConfigs[sComponentName];
					if (oConfig && oConfig[sType] && fnCheck(oConfig[sType])) {
						return false;
					}
				}
			} else {
				// TODO: checking order of components?
				jQuery.each(mComponentConfigs, function(sComponentName, oConfig) {
					if (oConfig && oConfig[sType] && fnCheck(oConfig[sType])) {
						return false;
					}
				});
			}
		}

		/**
		 * The static object <code>CustomizingConfiguration</code> contains configuration
		 * for view replacements, view extensions and custom properties. The configuration
		 * will be added from component metadata objects once the component gets activated.
		 * By deactivating the component the customizing configuration of the component
		 * gets removed again.
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @constructor
		 * @private
		 * @since 1.15.1
		 * @alias sap.ui.core.CustomizingConfiguration
		 */
		var CustomizingConfiguration = {

			/**
			 * logging of customizing configuration
			 * @private
			 */
			log: function() {
				if (window.console) {
					window.console.log(mComponentConfigs);
				}
			},

			/**
			 * Activates the Customizing of a component by registering the component
			 * configuration in the central customizing configuration.
			 * @param {string} sComponentName the name of the component
			 * @private
			 */
			activateForComponent: function(sComponentName) {
				Log.info("CustomizingConfiguration: activateForComponent('" + sComponentName + "')");
				var sFullComponentName = sComponentName + ".Component";
				sap.ui.requireSync(sFullComponentName.replace(/\./g, "/"));
				var oCustomizingConfig = ObjectPath.get(sFullComponentName).getMetadata().getCustomizing();
				mComponentConfigs[sComponentName] = oCustomizingConfig;

				Log.debug("CustomizingConfiguration: customizing configuration for component '" + sComponentName + "' loaded: " + JSON.stringify(oCustomizingConfig));
			},

			/**
			 * Deactivates the Customizing of a component by removing the component
			 * configuration in the central Customizing configuration.
			 * @param {string} sComponentName Name of the component
			 * @private
			 */
			deactivateForComponent: function(sComponentName) {
				if (mComponentConfigs[sComponentName]) {
					Log.info("CustomizingConfiguration: deactivateForComponent('" + sComponentName + "')");
					delete mComponentConfigs[sComponentName];
				}
			},

			/**
			 * Activates the Customizing of a component instance by registering the component
			 * configuration in the central Customizing configuration.
			 * @param {sap.ui.core.Component} oComponent the component instance
			 * @private
			 */
			activateForComponentInstance: function(oComponent) {
				Log.info("CustomizingConfiguration: activateForComponentInstance('" + oComponent.getId() + "')");
				var sComponentName = oComponent.getMetadata().getComponentName(),
					sKey = sComponentName + "::" + oComponent.getId(),
					oCustomizingConfig = oComponent.getManifest()["sap.ui5"] && oComponent.getManifest()["sap.ui5"]["extends"] && oComponent.getManifest()["sap.ui5"]["extends"]["extensions"];
				mComponentConfigs[sKey] = oCustomizingConfig;

				Log.debug("CustomizingConfiguration: customizing configuration for component '" + sKey + "' loaded: " + JSON.stringify(oCustomizingConfig));
			},

			/**
			 * Deactivates the Customizing of a component instance by removing the component
			 * configuration in the central Customizing configuration.
			 * @param {sap.ui.core.Component} oComponent the component instance
			 * @private
			 */
			deactivateForComponentInstance: function(oComponent) {
				var sComponentName = oComponent.getMetadata().getComponentName(),
				    sKey = sComponentName + "::" + oComponent.getId();
				if (mComponentConfigs[sKey]) {
					Log.info("CustomizingConfiguration: deactivateForComponent('" + sKey + "')");
					delete mComponentConfigs[sKey];
				}
			},

			/**
			 * returns the configuration of the replacement View or undefined
			 * @private
			 */
			getViewReplacement: function(sViewName, vObject) {
				var oResultConfig;
				// TODO: checking order of components?
				findConfig(CONFIG_VIEW_REPLACEMENTS, vObject, function(oConfig) {
					oResultConfig = oConfig[sViewName];
					return !!oResultConfig;
				});
				return oResultConfig;
			},

			/**
			 * returns the configuration of the given extension point or undefined
			 * @private
			 */
			getViewExtension: function(sViewName, sExtensionPointName, vObject) { // FIXME: currently ONE extension wins, but they should be somehow merged - but how to define the order?
				var oResultConfig;
				// TODO: checking order of components?
				findConfig(CONFIG_VIEW_EXTENSIONS, vObject, function(oConfig) {
					oResultConfig = oConfig[sViewName] && oConfig[sViewName][sExtensionPointName];
					return !!oResultConfig;
				});
				return oResultConfig;
			},

			/**
			 * returns the configuration of the controller extensions for the given
			 * controller name
			 * @private
			 */
			getControllerExtension: function(sControllerName, vObject) {
				var oResultConfig;
				findConfig(CONFIG_CONTROLLER_EXTENSIONS, vObject, function(oConfig) {
					oResultConfig = oConfig[sControllerName];
					return !!oResultConfig;
				});
				return oResultConfig;
			},

			/**
			 * returns the configuration of the controller replacement for the given
			 * controller name
			 * @private
			 */
			getControllerReplacement: function(sControllerName, vObject) {
				var oResultConfig;
				findConfig(CONFIG_CONTROLLER_REPLACEMENTS, vObject, function(oConfig) {
					oResultConfig = oConfig[sControllerName];
					return !!oResultConfig;
				});
				return oResultConfig;
			},

			/**
			 * currently returns an object (or undefined) because we assume there is
			 * only one property modified and only once
			 * @private
			 */
			getCustomProperties: function(sViewName, sControlId, vObject) { // TODO: Fragments and Views are mixed here
				var mSettings;
				// TODO: checking order of components?
				findConfig(CONFIG_VIEW_MODIFICATIONS, vObject, function(oConfig) {
					var oSettings = oConfig[sViewName] && oConfig[sViewName][sControlId];
					var oUsedSettings = {};
					var bValidConfigFound = false;
					if (oSettings) {
						jQuery.each(oSettings, function(sName, vValue) {
							if (sName === "visible") {
								bValidConfigFound = true;
								oUsedSettings[sName] = vValue;
								Log.info("Customizing: custom value for property '" + sName + "' of control '" + sControlId + "' in View '" + sViewName + "' applied: " + vValue);
							} else {
								Log.warning("Customizing: custom value for property '" + sName + "' of control '" + sControlId + "' in View '" + sViewName + "' ignored: only the 'visible' property can be customized.");
							}
						});
						if (bValidConfigFound) { // initialize only when there is actually something to add
							mSettings = mSettings || {}; // merge with any previous calls to findConfig in case of multiple definition sections
							jQuery.extend(mSettings, oUsedSettings); // FIXME: this currently overrides customizations from different components in random order
						}
					}
				});
				return mSettings;
			},

			hasCustomProperties: function(sViewName, vObject) {
				var mSettings = {};
				findConfig(CONFIG_VIEW_MODIFICATIONS, vObject, function(oConfig) {
					if (!!oConfig[sViewName]) {
						mSettings = oConfig[sViewName];
					}
				});
				return !isEmptyObject(mSettings);
			}

		};

		// when the customizing is disabled all the functions will be noop
		if (sap.ui.getCore().getConfiguration().getDisableCustomizing()) {
			Log.info("CustomizingConfiguration: disabling Customizing now");
			jQuery.each(CustomizingConfiguration, function(sName, vAny) {
				if (typeof vAny === "function") {
					CustomizingConfiguration[sName] = function() {};
				}
			});
		}




	return CustomizingConfiguration;

}, /* bExport= */ true);
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/RegistrationDelegator",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/core/library", // library dependency
	"sap/m/library" // library dependency
], function(
	RegistrationDelegator,
	Utils,
	Layer
) {
	"use strict";


	/**
	 * The <code>sap.ui.fl.initial</code> namespace should contain all code that is
	 * necessary to hook into the UI5 core and detect if SAPUI5 flexibility has
	 * changes or other flex objects that need processing. If there is nothing to
	 * process, any further flex processing is stopped to avoid runtime impact for end users.
	 *
	 * @version ${version}
	 * @namespace
	 * @name sap.ui.fl.initial
	 * @public
	 */

	/**
	 * The <code>sap.ui.fl.initial.api</code> namespace contains public APIs that can be used
	 * during app startup, e.g. to inherit classes to create their own logic for retrieving data for flexibility.
	 *
	 * @version ${version}
	 * @namespace
	 * @name sap.ui.fl.initial.api
	 * @public
	 */

	/**
	 * The <code>sap.ui.fl.apply</code> namespace should contain all code necessary to
	 * start a UI5 app for an end user with changes. Be aware that only the <code>api</code>
	 * sub-namespace contains public and stable APIs.
	 *
	 * @version ${version}
	 * @namespace
	 * @name sap.ui.fl.apply
	 * @public
	 */

	/**
	 * The <code>sap.ui.fl.apply.api</code> namespace contains public APIs that can be used
	 * during app startup, e.g. to wait for changes to be applied or to access the current variant.
	 *
	 * @version ${version}
	 * @namespace
	 * @name sap.ui.fl.apply.api
	 * @public
	 */

	/**
	 * The <code>sap.ui.fl.write</code> namespace should contain all code necessary to
	 * create, update, and reset changes or other flex objects. Additional common functionality needed
	 * by personalization dialogs or 'tools' like key user adaptation will be part of this namespace.
	 * Be aware that only the <code>api</code> sub-namespace contains public and stable APIs.
	 *
	 * @version ${version}
	 * @namespace
	 * @name sap.ui.fl.write
	 * @public
	 */

	/**
	 * The <code>sap.ui.fl.write.api</code> namespace contains public APIs to work with flex objects.
	 *
	 * @version ${version}
	 * @namespace
	 * @name sap.ui.fl.write.api
	 * @public
	 */

	/**
	 * The <code>sap.ui.fl.interfaces</code> namespace contains only interface jsdoc descriptions.
	 * It does not contain running code.
	 *
	 * @version ${version}
	 * @namespace
	 * @name sap.ui.fl.interfaces
	 * @public
	 */

	/**
	* Object containing information about a control if no instance is available.
	 *
	 * @typedef {object} sap.ui.fl.ElementSelector
	 * @property {string} elementId - Control ID
	 * @property {string} elementType - Control type
	 * @property {sap.ui.core.Component} appComponent - Instance of the app component in which the control is running
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Object containing information about a component if no instance is available.
	 *
	 * @typedef {object} sap.ui.fl.ComponentSelector
	 * @property {string} appId - Control object to be used as the selector for the change
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * The object a change is targeted at.
	 * This can be a {@link sap.ui.core.Element} or a {@link sap.ui.core.Component} instance or an object like {@link sap.ui.fl.ElementSelector} or {@link sap.ui.fl.ComponentSelector} containing information about the element or component.
	 *
	 * @typedef {sap.ui.core.Element | sap.ui.core.Component | sap.ui.fl.ElementSelector | sap.ui.fl.ComponentSelector} sap.ui.fl.Selector
	 * @since 1.69
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Object containing information about a version.
	 *
	 * @typedef {object} sap.ui.fl.Version
	 * @property {number} version - Number of the version. The highest version is the active while 0 is the draft
	 * @property {string} activatedBy - User ID who activated the version
	 * @property {string} activatedAt - Stringified time stamp of the activation
	 * @since 1.74
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * SAPUI5 Library for SAPUI5 Flexibility and Descriptor Changes, App Variants, Control Variants (Views) and Personalization.
	 * @namespace
	 * @name sap.ui.fl
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted UI5 controls, tools creating flexibility changes
	 */
	sap.ui.getCore().initLibrary({
		name: "sap.ui.fl",
		version: "${version}",
		controls: [
			"sap.ui.fl.variants.VariantManagement",
			"sap.ui.fl.util.IFrame"
		],
		dependencies: [
			"sap.ui.core", "sap.m"
		],
		designtime: "sap/ui/fl/designtime/library.designtime",
		extensions: {
			flChangeHandlers: {
				"sap.ui.fl.util.IFrame": "sap/ui/fl/util/IFrame"
			},
			"sap.ui.support": {
				diagnosticPlugins: [
					"sap/ui/fl/support/Flexibility"
				],
				//Configuration used for rule loading of Support Assistant
				publicRules: true
			}
		}
	});

	/**
	 * Available scenarios
	 *
	 * @enum {string}
	 */
	sap.ui.fl.Scenario = {
		AppVariant: "APP_VARIANT",
		VersionedAppVariant: "VERSIONED_APP_VARIANT",
		AdaptationProject: "ADAPTATION_PROJECT",
		FioriElementsFromScratch: "FE_FROM_SCRATCH",
		UiAdaptation: "UI_ADAPTATION"
	};

	/**
	 * Specific Versions of key user adaptations
	 *
	 * @enum {string}
	 */
	sap.ui.fl.Versions = {
		Original: -1,
		Draft: 0,
		UrlParameter: "sap-ui-fl-version"
	};

	/**
	 * Available classification types for the condenser
	 *
	 * @enum {string}
	 */
	sap.ui.fl.condenser = {
		Classification: {
			/**
			 * All changes but the last one will be removed.
			 * Example: rename
			 */
			LastOneWins: "lastOneWins",

			/**
			 * Two change types reverse each other like a toggle. Only one or no change will be left.
			 * Example: hide/unhide
			 */
			Reverse: "reverse",

			/**
			 * Moving a control inside a container. For a control there will only be one move change left.
			 */
			Move: "move",

			/**
			 * Creating a new control (not only changing the visibility) that was previously not in the container.
			 */
			Create: "create",

			/**
			 * Destroying a control or removing it from the container.
			 */
			Destroy: "destroy"
		}
	};

	RegistrationDelegator.registerAll();

	function _isTrialSystem() {
		var oUshellContainer = Utils.getUshellContainer();
		if (oUshellContainer) {
			return oUshellContainer.getLogonSystem().isTrial();
		}
		return false;
	}

	if (_isTrialSystem()) {
		sap.ui.getCore().getConfiguration().setFlexibilityServices([{
			connector: "LrepConnector",
			url: "/sap/bc/lrep",
			layers: []
		}, {
			connector: "LocalStorageConnector",
			layers: [Layer.CUSTOMER, Layer.PUBLIC, Layer.USER]
		}]);
	}

	return sap.ui.fl;
});

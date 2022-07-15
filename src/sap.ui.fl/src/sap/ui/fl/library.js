/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/preprocessors/RegistrationDelegator",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Scenario",
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/ui/core/library", // library dependency
	"sap/m/library" // library dependency
], function(
	RegistrationDelegator,
	Utils,
	Layer,
	Scenario,
	CondenserClassification
) {
	"use strict";


	/**
	 * The <code>sap.ui.fl.initial</code> namespace should contain all code that is
	 * necessary to hook into the UI5 core and detect if SAPUI5 flexibility has
	 * changes or other flex objects that need processing. If there is nothing to
	 * process, any further flex processing is stopped to avoid runtime impact for end users.
	 *
	 * @version ${version}
	 * @since 1.44
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
	 * The <code>sap.ui.fl.initial._internal</code> namespace contains internals that are used
	 * during app startup, e.g. to load the flex data and resolve or bootstrap the <code>sap.ui.fl.apply</code> for applying changes.
	 *
	 * @version ${version}
	 * @namespace
	 * @name sap.ui.fl.initial._internal
	 * @private
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
	 * This is the library for SAPUI5 flexibility.
	 * It includes the handling of changes made on applications, such as descriptor changes, app variants,
	 * UI changes, control variants (a.k.a. views), and personalization, as well as APIs for consumers.
	 * In addition, it provides the VariantManagement control, which enables applications to use control variants (views).
	 *
	 * @namespace
	 * @alias sap.ui.fl
	 * @author SAP SE
	 * @public
	 * @version ${version}
	 */
	var thisLib = sap.ui.getCore().initLibrary({
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
	 * Available classification types for the condenser
	 *
	 * @deprecated as of version 1.102. Use the {@link sap.ui.fl.changeHandler.condenser.Classification} instead.
	 * @enum {string}
	 */
	thisLib.condenser = {
		Classification: CondenserClassification
	};

	thisLib.Scenario = Scenario;

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

	return thisLib;
});

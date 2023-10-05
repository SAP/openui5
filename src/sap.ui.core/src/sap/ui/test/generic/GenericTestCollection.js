/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * @typedef sap.ui.test.generic.GenericTestCollection.ObjectCapabilities
	 *
	 * @param {string} moduleName
	 *    Name of the module that contains the class. If not given, it is assumed that a module
	 *    with the same name as the class (dots replaced by slashes) exports the class.
	 *    When given, the module is loaded and the class is retrieved via its global name
	 * @param {boolean|function} create
	 *    Explicit false if the control can't be instantiated via constructor or factory function
	 *    expecting the following parameters: Class, mSettings
	 * @param {boolean} rendererHasDependencies
	 *    Control renderer has dependencies to parent or child controls and can't be rendered standalone
	 * @param {Object<string, sap.ui.test.generic.GenericTestCollection.ExcludeReason|any>} properties
	 *    A map containing the property name as key and either an {@link sap.ui.test.generic.GenericTestCollection.ExcludeReason ExcludeReason}
	 *    or a "value to set" as value
	 * @param {Object<string, sap.ui.test.generic.GenericTestCollection.ExcludeReason|function>} aggregations
	 *    A map containing the aggregation name as key and either an {@link sap.ui.test.generic.GenericTestCollection.ExcludeReason ExcludeReason}
	 *    or the class which should be used as value
	 * @param {int} [apiVersion=2]
	 *    The API version of the control's renderer should be set in case the renderer does not support
	 *    semantic rendering
	 * @param {object} [knownIssues=undefined]
	 *    Exceptions for known but not fixed issues
	 * @param {boolean} knownIssues.Id
	 *    Exception for known duplicate ID issues
	 * @param {boolean} knownIssues.memoryLeaks
	 *    Exception for known memory leak issues
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * @namespace
	 * @alias sap.ui.test.generic.GenericTestCollection
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 * @since 1.100
	 */
	var GenericTestCollection = {
		/**
		 * Marker for exclude reasons.
		 *
		 * @enum {string}
		 * @private
		 * @ui5-restricted SAPUI5 Distribution Layer Libraries
		 */
		ExcludeReason: {
			/**
			 * The property or aggregation can only be changed using a binding. Using setter is not allowed.
			 * @private
			 * @ui5-restricted SAPUI5 Distribution Layer Libraries
			 */
			OnlyChangeableViaBinding: "OnlyChangeableViaBinding",

			/**
			 * The property or aggregation can only be set on initialisation. Using setter is not allowed.
			 * @private
			 * @ui5-restricted SAPUI5 Distribution Layer Libraries
			 */
			NotChangeableAfterInit: "NotChangeableAfterInit",

			/**
			 * The property or aggregation can't be filled generically. Property/aggregation specific settings are needed.
			 * @private
			 * @ui5-restricted SAPUI5 Distribution Layer Libraries
			 */
			SetterNeedsSpecificSettings: "SetterNeedsSpecificSettings",

			/**
			 * The default value retrieved from getter can't be used for setting the value using the corresponding setter.
			 * @private
			 * @ui5-restricted SAPUI5 Distribution Layer Libraries
			 */
			CantSetDefaultValue: "CantSetDefaultValue"
		},
		/**
		 * Marker for available generic Tests
		 *
		 * @enum {string}
		 * @private
		 * @ui5-restricted SAPUI5 Distribution Layer Libraries
		 */
		Test: {
			/**
			 * Test ControlMemoryLeaks
			 * @private
			 * @ui5-restricted SAPUI5 Distribution Layer Libraries
			 */
			ControlMemoryLeaks: "ControlMemoryLeaks",

			/**
			 * Test ControlRenderer
			 * @private
			 * @ui5-restricted SAPUI5 Distribution Layer Libraries
			 */
			ControlRenderer: "ControlRenderer",

			/**
			 * Test DuplicateIdCheck
			 * @private
			 * @ui5-restricted SAPUI5 Distribution Layer Libraries
			 */
			DuplicateIdCheck: "DuplicateIdCheck",

			/**
			 * Test EnforceSemanticRendering
			 * @private
			 * @ui5-restricted SAPUI5 Distribution Layer Libraries
			 */
			EnforceSemanticRendering: "EnforceSemanticRendering",

			/**
			 * Test SettersContextReturn
			 * @private
			 * @ui5-restricted SAPUI5 Distribution Layer Libraries
			 */
			SettersContextReturn: "SettersContextReturn"
		},

		/**
		 * Create the testsuite config.
		 *
		 * @param  {object} mConfig Map containing test parameters
		 * @param  {string} mConfig.library The library name
		 * @param  {object} mConfig.objectCapabilities The opt-out options per control
		 * @param  {sap.ui.test.generic.GenericTestCollection.ObjectCapabilities} mConfig.objectCapabilities.anyName The controls capability options
		 * @param  {sap.ui.test.generic.GenericTestCollection.Test[]} mConfig.skipTests List of tests which shouldn't be executed
		 * @returns {object} Returns the testsuite config object
		 *
		 * @private
		 * @ui5-restricted SAPUI5 Distribution Layer Libraries
		 * @since 1.100
		 */
		createTestsuiteConfig: function(mConfig) {
			var oSuiteConfig = {
				name: "Testsuite for Generic Control Tests for library: " + mConfig.library,
				defaults: {
					ui5: {
						libs: [mConfig.library]
					},
					qunit: {
						reorder: false,
						version: 2
					},
					testConfig: mConfig,
					module: "test-resources/sap/ui/core/qunit/generic/{name}.qunit"
				},
				tests: {
				 ControlMemoryLeaks: {
					 title: "QUnit Page for memory leak detection in UI5 controls"
				 },

				 DuplicateIdCheck: {
					 title: "QUnit Page for duplicate ID issues detection in UI5 controls"
				 },

				 SettersContextReturn: {
					 title: "All setters should return correct context (Reason: https://github.com/SAP/openui5/blob/master/docs/guidelines.md#creating-classes)"
				 },

				 EnforceSemanticRendering: {
					 title: "QUnit Page for Semantic Rendering Coverage"
				 }
				}
			};

			// Opt-out from single tests
			var aSkippedTests = mConfig.skipTests || [];
			aSkippedTests.forEach(function(sTest) {
				delete oSuiteConfig.tests[sTest];
			});

			return oSuiteConfig;
		}
	};

	return GenericTestCollection;
});

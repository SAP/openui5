/*!
 * ${copyright}
 */

/* global QUnit */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/test/generic/Utils",
	"sap/ui/dom/includeStylesheet",
	"sap/ui/core/Element",
	"require"
], function(BaseObject, Utils, includeStylesheet, Element, require) {
	"use strict";

	/**
	 * Handles test setup and execution.
	 * Single controls/elements are to be tested via the specific sub-classes by
	 * implementing shouldIgnoreControl() and testControl().
	 *
	 * @class Base class for generic tests.
	 *
	 * @extends sap.ui.base.Object
	 * @abstract
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.100
	 */
	return BaseObject.extend("sap.ui.test.generic.TestBase", {

		/**
		 * Checks whether the control with the given name should for some reason not be tested
		 *
		 * @private
		 * @param {sap.ui.test.generic.ClassInfo} oClassInfo Info object containing the <code>sap.ui.test.generic.ClassInfo</code> object
		 * @param {QUnit.assert} assert QUnit Assert class of which instances are passed as the argument to QUnit.test() callbacks
		 * @return {boolean} Returns 'true' if control should not be tested
		 *
		 */
		shouldIgnoreControl: function(oClassInfo, assert) {
			return false;
		},

		/**
		 * Called for each control/element in a library.
		 * Must be implemented by sub-classes.
		 *
		 * @param {sap.ui.test.generic.ClassInfo} oClassInfo Info object containing the <code>sap.ui.test.generic.ClassInfo</code> object
		 * @param {QUnit.assert} assert QUnit Assert class of which instances are passed as the argument to QUnit.test() callbacks
		 * @private
		 * @abstract
		 */
		testControl: function(oClassInfo, assert) {},

		/**
		 * Getter for the ObjectCapabilities
		 *
		 * @param {string} sClass Class name to get the ObjectCapabilities for a specific Class
		 * @return {sap.ui.test.generic.GenericTestCollection.ObjectCapabilities|Object<string,sap.ui.test.generic.GenericTestCollection.ObjectCapabilities>} Promise resolved after test run is finished
		 * @private
		 */
		getObjectCapabilities: function(sClass) {
			if (sClass) {
				return this._mObjectCapabilities[sClass];
			} else {
				return this._mObjectCapabilities;
			}
		},

		/**
		 * Executes the generic tests.
		 *
		 * @param {sap.ui.test.generic.ClassInfo[]} aClassInfo Array containing all loaded controls/elements which belong to the library
		 * @return {Promise} Promise resolved after test run is finished
		 * @private
		 */
		run: function(aClassInfo) {
			// Only necessary for test which render controls
			return includeStylesheet({
				url: require.toUrl("test-resources/sap/ui/core/qunit/generic/helper/_cleanupStyles.css")
			}).then(function () {
				return Promise.all(aClassInfo.map(function(oClassInfo) {
					var sClassName = oClassInfo.className;
					var sCaption = sClassName.startsWith(this._sLibName) ? sClassName.slice(this._sLibName.length) : sClassName;
					QUnit.test(sCaption, function (assert) {
						if (!this.shouldIgnoreControl(oClassInfo, assert)) {
							this._iFullyTestedControls++;
							return this.testControl.apply(this, [oClassInfo, assert]);
						} else {
							// nothing to do
							this._iIgnoredOrExcludedControls++;
							return Promise.resolve();
						}
					}.bind(this));
				}.bind(this))).then(function () {
					// display some numbers regarding test execution
					QUnit.test("Statistics", function(assert) {
						assert.ok(true, "Total number of found controls: " + this._iAllControls);
						assert.ok(true, "Total number of ignored or excluded controls: " + this._iIgnoredOrExcludedControls);
						assert.ok(true, "Number of fully tested controls: " + this._iFullyTestedControls);
					}.bind(this));

				}.bind(this));
			}.bind(this));
		},

		/**
		 * Performs the setup and execution of a generic test.
		 * Loads all controls/elements of the configured library and provides a QUnit.module.
		 *
		 * @param  {object} [mParams] Test specific parameters
		 * @param  {string} [mParams.includeElements] Include elements for test execution
		 * @returns {Promise<undefined>} setup promise, delays test start until all controls/elements are loaded
		 * @private
		 */
		setupAndStart: function(mParams) {
			// statistics values
			this._iAllControls = 0;
			this._iIgnoredOrExcludedControls = 0;
			this._iFullyTestedControls = 0;

			// retrieve test config
			this._oTestParameters = window["sap-ui-test-config"];
			this._mObjectCapabilities = this._oTestParameters.objectCapabilities || {};
			this._sLibName = this._oTestParameters.library;

			return Utils.loadAllControls(this._oTestParameters, {
				includeElements: mParams && mParams.includeElements
			}).then(function(aClassInfo) {
				QUnit.module(this.getMetadata().getName() + " Tests - " + this._sLibName, {
					afterEach: function() {
						Element.registry.forEach(function(oElement, sId) {
							oElement.destroy();
						});
					}
				});

				if (aClassInfo.length === 0) {
					QUnit.test("No classes to test for library '" + this._sLibName + "'.", function (assert) {
						// We could also skip this test but voter complains in case there is no test execution at all
						assert.ok(true, "Nothing to test.");
					});
				} else {
					this._iAllControls = aClassInfo.length;
					return this.run(aClassInfo);
				}
			}.bind(this));
		}
	});
});
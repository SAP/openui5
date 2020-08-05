/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/_OpaLogger",
	"sap/ui/base/ManagedObject"
], function (_OpaLogger, ManagedObject) {
	"use strict";

	/**
	 * @class Matchers for Opa5 - needs to implement an isMatching function that returns a boolean and will get a control instance as parameter
	 * @abstract
	 * @extends sap.ui.base.ManagedObject
	 * @public
	 * @name sap.ui.test.matchers.Matcher
	 * @author SAP SE
	 * @since 1.23
	 */
	var Matcher = ManagedObject.extend("sap.ui.test.matchers.Matcher", {

		metadata : {
			publicMethods : [ "isMatching" ]
		},

		constructor: function () {
			this._oLogger = _OpaLogger.getLogger(this.getMetadata().getName());
			return ManagedObject.prototype.constructor.apply(this, arguments);
		},

		/**
		 * Checks if the matcher is matching - will get an instance of sap.ui.core.Control as parameter.
		 *
		 * Should be overwritten by subclasses
		 *
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the Control is matching the condition of the matcher
		 * @protected
		 * @name sap.ui.test.matchers.Matcher#isMatching
		 * @function
		 */
		isMatching : function (oControl) {
			return true;
		},

		/**
		 * @return {object} window of the application under test, or the current window if OPA5 is not loaded
		 * Note: declared matchers are instanciated in the app context (by MatcherFactory)
		 * while users instanciate matchers in the test context (in a waitFor)
		 * @private
		 * @function
		 */
		_getApplicationWindow: function () {
			if (sap.ui.test && sap.ui.test.Opa5) {
				// matcher context === test context, because Opa5 is loadded
				return sap.ui.test.Opa5.getWindow();
			} else {
				// matcher context === app context
				return window;
			}
		}

	});

	return Matcher;
});
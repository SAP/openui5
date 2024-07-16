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
	 * @alias sap.ui.test.matchers.Matcher
	 * @author SAP SE
	 * @since 1.23
	 */
	var Matcher = ManagedObject.extend("sap.ui.test.matchers.Matcher", /** @lends sap.ui.test.matchers.Matcher.prototype */ {

		metadata : {},

		constructor: function () {
			ManagedObject.prototype.constructor.apply(this, arguments);
			this._oLogger = _OpaLogger.getLogger(this.getMetadata().getName());
		},

		/**
		 * Checks if the matcher is matching - will get an instance of sap.ui.core.Control as parameter.
		 *
		 * Should be overwritten by subclasses
		 *
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the Control is matching the condition of the matcher
		 * @protected
		 */
		isMatching : function (oControl) {
			return true;
		},

		/**
		 * @returns {Window} window of the application under test, or the current window if Opa5 is not loaded
		 * Note: declared matchers are instantiated in the app context (by MatcherFactory)
		 * while users instantiate matchers in the test context (in a waitFor)
		 * @private
		 */
		_getApplicationWindow: function () {
			var Opa5 = sap.ui.require("sap/ui/test/Opa5");
			if (Opa5) {
				// matcher context === test context, because Opa5 is loaded
				return Opa5.getWindow();
			} else {
				// matcher context === app context
				return window;
			}
		},

		_getApplicationWindowJQuery: function () {
			var Opa5 = sap.ui.require("sap/ui/test/Opa5");
			if (Opa5) {
				// matcher context === test context, because Opa5 is loaded
				return Opa5.getJQuery();
			} else {
				// matcher context === app context
				return sap.ui.require("sap/ui/thirdparty/jquery");
			}
		},

		_isInStaticArea: function(oDomElement) {
			var oAppWindow = this._getApplicationWindow(),
				oAppWindowJQuery = this._getApplicationWindowJQuery(),
				oStaticArea = oAppWindow.sap.ui.require("sap/ui/test/OpaPlugin")
					.getStaticAreaDomRef();

			return oAppWindowJQuery.contains(oStaticArea, oDomElement);
		}

	});

	return Matcher;
});
/*!
 * ${copyright}
 */

// private
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Visible",
	"sap/ui/test/matchers/_Enabled",
	"sap/ui/test/matchers/_Editable",
	"sap/ui/thirdparty/jquery",
	"sap/ui/test/_ValidationParameters",
	"sap/ui/test/matchers/matchers"
], function (UI5Object, Interactable, Visible, _Enabled, _Editable, jQueryDOM, _ValidationParameters) {
	"use strict";

	/**
	 * @class Creates matcher instances
	 * @private
	 */
	var MatcherFactory = UI5Object.extend("sap.ui.test.matchers.MatcherFactory", {

		/**
		 * Retrieve an array of matchers. Each matcher ensures a control is in a desired state.
		 * Valid states are: visible, interactable, enabled, editable
		 *
		 * @param {object} oOptions a plain object of waitFor-style options. fo a full list see {@link sap.ui.test.OpaPlugin#getMatchingControls}
		 * @return {array} an array of {@link sap.ui.test.matchers.Matcher} instances
		 */
		getStateMatchers: function (oOptions) {
			oOptions = oOptions || {};
			var aMatchers = [];

			// visible has priority over all other options
			if (oOptions.visible !== false) {
				// enabled has priority over interactable
				if (oOptions.enabled) {
					aMatchers.push(new _Enabled());
				}
				if (oOptions.editable) {
					aMatchers.push(new _Editable());
				}

				// Interactable uses Visible
				if (oOptions.interactable) {
					aMatchers.push(new Interactable());
				} else {
					aMatchers.push(new Visible());
				}
			}

			return aMatchers;
		},

		/**
		 * Retrieve an array of matchers. Each matcher ensures that a control has a desired set of property values
		 * If there are declarative matchers, and any of them is unsupported, an error will be thrown.
		 * @param {object} oOptions  a plain object of waitFor-style options. for a full list see {@link sap.ui.test.OpaPlugin#getMatchingControls}
		 * @return {array} an array of {@link sap.ui.test.matchers.Matcher} instances
		 */
		getFilteringMatchers: function (oOptions) {
			if (!oOptions) {
				return [];
			}

			// extract all matchers on the base level (oOptions = {matcher1: {}, matcher2: {}..}) (as seen in declarative-style options)
			var aMatchers = this._getPlainObjectMatchers(oOptions);

			// extract all matchers in the "matchers" property
			if (oOptions.matchers) {
				if (jQueryDOM.isPlainObject(oOptions.matchers)) {
					 // oOptions = {matchers: {matcher1: {}, matcher2: {}}..} (as seen in declarative-style options)
					aMatchers = aMatchers.concat(this._getPlainObjectMatchers(oOptions.matchers));
				} else if (Array.isArray(oOptions.matchers)) {

					oOptions.matchers.forEach(function (vMatcher) {
						if (jQueryDOM.isPlainObject(vMatcher)) {
							// oOptions = {matchers: [{matcher1: {}, matcher2: {}]..} (as seen in declarative-style options)
							aMatchers = aMatchers.concat(this._getPlainObjectMatchers(vMatcher));
						} else {
							// oOptions = {matchers: [<matcher1>, <matcher2>]..} (as seen in imperative-style options)
							aMatchers.push(vMatcher);
						}
					}.bind(this));
				} else {
					// oOptions = {matchers: <matcher1>..} (as seen in imperative-style options)
					aMatchers = aMatchers.concat(oOptions.matchers);
				}
			}

		  return aMatchers;
		},

		/**
		 * Given a multiset of matcher declarations, create instances of supported matchers
		 *
		 * @param {object} mMatchers an object representing either a single matcher or a multiset of matchers
		 * A matcher is defined by its class name and constructor parameters ({MyMatcher1: {param: "value"}, MyMatcher2: ["param1", "param2"]})
		 * If the matcher is not known, an error will be thrown. For a list of supported matchers see {@link sap.ui.test.matchers.matchers}
		 * @return {array} an array of {@link sap.ui.test.matchers.Matcher} instances; or an error if an unknown matcher is declared
		 */
		_getPlainObjectMatchers: function (mMatchers) {
			if (!mMatchers) {
				return [];
			}
			if (mMatchers["isMatching"]) {
				// mMatchers is a single matcher instance => return it in a new array
				return [mMatchers];
			}

			var aIgnoredProperties = Object.keys(_ValidationParameters.OPA5_WAITFOR_DECORATED);
			var aSupportedMatchers = this._getSupportedMatchers();

			return Object.keys(mMatchers).filter(function (sMatcher) {
				// filter out any properties that don't represent a matcher class
				return aIgnoredProperties.indexOf(sMatcher) === -1;
			}).map(function (sMatcher) {
				if (!aSupportedMatchers[sMatcher]) {
					throw new Error("Matcher is not supported! Matcher name: '" + sMatcher + "', arguments: '" + JSON.stringify(mMatchers[sMatcher]) + "'");
				}
				var MatcherConstructor = aSupportedMatchers[sMatcher];
				// if the matcher params are declared as an array, this means that
				// a new matcher should be instanciated for each element in this array
				var aMatcherParams = Array.isArray(mMatchers[sMatcher]) ? mMatchers[sMatcher] : [mMatchers[sMatcher]];

				return aMatcherParams.map(function (mSingleMatcherParams) {
					// there are two types of matcher contstructors depending on the expected arguments:
					// some expect an object (e.g. BindingPath) and others - an arguments list (e.g. Ancestor)
					if (Array.isArray(mSingleMatcherParams)) {
						return new function() {
							return MatcherConstructor.apply(this, mSingleMatcherParams);
						}();
					} else {
						return new MatcherConstructor(mSingleMatcherParams);
					}
				});
			}).reduce(function (aResult, aMatchers) {
				// flatten the list of matchers
				return aResult.concat(aMatchers);
			}, []);
		},

		/**
		 * Retrieve a list of the publicly supported matchers.
		 *
		 * @param {object} mMatchers all known matchers. defaults to sap.ui.test.matchers.
		 * It is expected that new matchers are manually added to the file sap/ui/test/matchers/matchers.js
		 * @return {array} an array of the names of all matchers that are supported out-of-the-box
		 */
		_getSupportedMatchers: function (mMatchers) {
			mMatchers = mMatchers || sap.ui.test.matchers;
			var mFilteredMatchers = {};
			Object.keys(mMatchers).forEach(function (sMatcher) {
				// filter out private matchers and helpers
				if (!sMatcher.match(/^(_|matcher)/i)) {
					var sFilteredMatcher = sMatcher.charAt(0).toLowerCase() + sMatcher.substr(1);
					mFilteredMatchers[sFilteredMatcher] = mMatchers[sMatcher];
				}
			});
			return mFilteredMatchers;
		}
	});

	return MatcherFactory;

});

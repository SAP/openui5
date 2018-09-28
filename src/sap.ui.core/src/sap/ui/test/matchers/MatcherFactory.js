/*!
 * ${copyright}
 */

// private
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Visible",
	"sap/base/strings/capitalize",
	"sap/ui/thirdparty/jquery",
	"sap/ui/test/matchers/matchers"
], function (UI5Object, Interactable, Visible, capitalize, jQueryDOM) {
	"use strict";

	var MatcherFactory = UI5Object.extend("sap.ui.test.matchers.MatcherFactory", {

		getInteractabilityMatchers: function (bInteractable) {
		  return [bInteractable ?  new Interactable() : new Visible()];
		},

		getFilteringMatchers: function (oOptions) {
			var aMatchers = _getPlainObjectMatchers(oOptions);

			if (oOptions.matchers) {
				if (jQueryDOM.isPlainObject(oOptions.matchers)) {
					aMatchers = aMatchers.concat(_getPlainObjectMatchers(oOptions.matchers));
				} else if (jQueryDOM.isArray(oOptions.matchers)) {

					oOptions.matchers.forEach(function (vMatcher) {
						if (jQueryDOM.isPlainObject(vMatcher)) {
							aMatchers = aMatchers.concat(_getPlainObjectMatchers(vMatcher));
						} else {
							aMatchers.push(vMatcher);
						}
					});
				} else {
					aMatchers = aMatchers.concat(oOptions.matchers);
				}
			}

		  return aMatchers;
		}
	});

	function _getPlainObjectMatchers(mMatchers) {
		if (mMatchers["isMatching"]) {
			return [mMatchers];
		}

		var aSupportedMatchers = ["aggregationContainsPropertyEqual", "aggregationEmpty", "aggregationFilled", "aggregationLengthEquals",
			"ancestor", "bindingPath", "I18NText", "labelFor", "properties", "propertyStrictEquals"];

		return Object.keys(mMatchers).filter(function (sMatcher) {
				return aSupportedMatchers.indexOf(sMatcher) > -1;
			}).map(function (sMatcher) {
				var sMatcherCapitalized = capitalize(sMatcher);
				var MatcherConstructor = sap.ui.test.matchers[sMatcherCapitalized];
				var aMatcherOptions = jQueryDOM.isArray(mMatchers[sMatcher]) ? mMatchers[sMatcher] : [mMatchers[sMatcher]];

				return aMatcherOptions.map(function (oOptions) {
					if (jQueryDOM.isArray(oOptions)) {
						return new function() {
							return MatcherConstructor.apply(this, oOptions);
						}();
					} else {
						return new MatcherConstructor(oOptions);
					}
				});
			}).reduce(function (aResult, aMatchers) {
				return aResult.concat(aMatchers);
			}, []);
	}

	return MatcherFactory;

});

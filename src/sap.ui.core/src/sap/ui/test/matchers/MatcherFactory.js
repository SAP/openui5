/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/Object",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Visible"
], function ($, UI5Object, Interactable, Visible) {
	"use strict";

	var MatcherFactory = {
		getInteractabilityMatchers: function (bInteractable) {
		  return [bInteractable ?  new Interactable() : new Visible()];
		},
		getFilteringMatchers: function (oOptions) {
			var aMatchers = _getPlainObjectMatchers(oOptions);

			if (oOptions.matchers) {
				if ($.isPlainObject(oOptions.matchers)) {
					aMatchers = aMatchers.concat(_getPlainObjectMatchers(oOptions.matchers));
				} else if ($.isArray(oOptions.matchers)) {

					oOptions.matchers.forEach(function (vMatcher) {
						if ($.isPlainObject(vMatcher)) {
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
	};

	function _getPlainObjectMatchers(mMatchers) {
		if (mMatchers["isMatching"]) {
			return [mMatchers];
		}

		var aSupportedMatchers = ["aggregationContainsPropertyEqual", "aggregationEmpty", "aggregationFilled", "aggregationLengthEquals",
			"ancestor", "bindingPath", "I18NText", "labelFor", "properties", "propertyStrictEquals"];

		return Object.keys(mMatchers).filter(function (sMatcher) {
				return aSupportedMatchers.indexOf(sMatcher) > -1;
			}).map(function (sMatcher) {
				var sMatcherCapitalized = $.sap.charToUpperCase(sMatcher);

				sap.ui.require(["sap/ui/test/matchers/" + sMatcherCapitalized]);

				var MatcherConstructor = sap.ui.test.matchers[sMatcherCapitalized];
				var aMatcherOptions = $.isArray(mMatchers[sMatcher]) ? mMatchers[sMatcher] : [mMatchers[sMatcher]];

				return aMatcherOptions.map(function (oOptions) {
					if ($.isArray(oOptions)) {
						return new function () {
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

	return UI5Object.extend("sap.ui.test.matchers.MatcherFactory", MatcherFactory);

});

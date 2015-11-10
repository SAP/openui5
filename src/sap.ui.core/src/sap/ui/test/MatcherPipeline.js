/*!
 * ${copyright}
 */

sap.ui.define([
		'jquery.sap.global',
		'sap/ui/base/Object',
		'./matchers/Matcher'
	],
	function($, UI5Object, Matcher) {
		"use strict";

		/*
		 * Internals
		 */

		/**
		 * Checks if a value matches all the matchers and returns result of matching
		 * @private
		 */
		function doesValueMatch (aMatchers, vValue) {
			var vOriginalValue = vValue;
			var bIsMatching = aMatchers.every(function (oMatcher) {
				var vMatch = oMatcher.isMatching(vValue);
				if (vMatch) {
					if (vMatch !== true) {
						vValue = vMatch;
					}
					return true;
				}
				return false;
			});

			if (bIsMatching) {
				return (vOriginalValue === vValue) ? true : vValue;
			}

			return false;
		}

		/**
		 * Validates the matchers and makes sure to return them in an array
		 * @private
		 */
		function checkMatchers (vMatchers) {
			var aMatchers = [];

			if ($.isArray(vMatchers)) {
				aMatchers = vMatchers;
			} else if (vMatchers) {
				aMatchers = [vMatchers];
			} else {
				jQuery.sap.log.error("Matchers where defined, but they where neither an array nor a single matcher: " + vMatchers);
			}

			aMatchers = aMatchers.map(function(vMatcher) {
				if (vMatcher instanceof Matcher) {
					return vMatcher;
				} else if (typeof vMatcher == "function") {
					return {
						isMatching : vMatcher
					};
				}
				jQuery.sap.log.error("A matcher was defined, but it is no function and has no isMatching function: " + vMatcher);
			}).filter(function(oMatcher) {
				return !!oMatcher;
			});

			return aMatchers;
		}

		/**
		 * Filters a set of controls or a single control by multiple conditions
		 *
		 * @class
		 * @public
		 * @alias sap.ui.test.matcherPipeline
		 * @author SAP SE
		 * @since 1.34
		 */
		return UI5Object.extend("sap.ui.test.matcherPipeline",{

			/**
			 * Matches a set or a single control agains matchers that check conditions.
			 * The matchers are a pipeline: the first matcher gets a control as an input parameter, each subsequent matcher gets the same input as the previous one, if the previous output is 'true'.
			 * If the previous output is a truthy value, the next matcher will receive this value as an input parameter.
			 * If any matcher does not match an input (i.e. returns a falsy value), then the input is filtered out. Check will not be called if the matchers filtered out all controls/values.
			 * Check/success will be called with all matching values as an input parameter. Matchers also can be define as an inline-functions.
			 * @param {object} oOptions An Object containing the input for processing matchers
			 * @param {function|sap.ui.test.matchers.Matcher|sap.ui.test.matchers.Matcher[]|function[]} oOptions.matchers A single matcher or an array of matchers {@link sap.ui.test.matchers}.
			 * @param {sap.ui.core.Element|sap.ui.core.Element[]} oOptions.control The name of a view.
			 * @protected
			 * @function
			 */
			process: function (oOptions) {
				var vResult,
					aControls,
					vControl = oOptions.control;

				var aMatchers = checkMatchers(oOptions.matchers);

				var iExpectedAmount;
				if (!aMatchers || !aMatchers.length) {
					return vControl;
				}

				if (!$.isArray(vControl)) {
					iExpectedAmount = 1;
					aControls = [vControl];
				} else {
					aControls = vControl;
				}

				var aMatchedValues = [];
				aControls.forEach(function (oControl) {
					var vMatchResult =  doesValueMatch(aMatchers, oControl);
					if (vMatchResult) {
						if (vMatchResult === true) {
							aMatchedValues.push(oControl);
						} else {
							// if matching result is a truthy value, then we pass this value as a result
							aMatchedValues.push(vMatchResult);
						}
					}
				}, this);

				if (!aMatchedValues.length) {
					$.sap.log.debug("all results were filtered out by the matchers - skipping the check", this);
					return false;
				}

				if (iExpectedAmount === 1) {
					vResult = aMatchedValues[0];
				} else {
					vResult = aMatchedValues;
				}

				return vResult;
			}
		});

	});

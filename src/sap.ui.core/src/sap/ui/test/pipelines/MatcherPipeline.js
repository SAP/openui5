/*!
 * ${copyright}
 */

sap.ui.define([
		'jquery.sap.global',
		'sap/ui/base/Object',
		'sap/ui/test/matchers/Matcher',
		'./PipelineFactory'
	],
	function($, UI5Object, Matcher, PipelineFactory) {
		"use strict";
		var oPipelineFactory = new PipelineFactory({
			name: "Matcher",
			functionName: "isMatching"
		});

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
						// Save truthy values, they will be the input for the next matcher
						vValue = vMatch;
					}
					return true;
				}
				return false;
			});

			if (bIsMatching) {
				// Return the new value if it changed from the original value after processing all the matchers.
				return (vOriginalValue === vValue) ? true : vValue;
			}

			return false;
		}

		/**
		 * Filters a set of controls or a single control by multiple conditions
		 *
		 * @class
		 * @private
		 * @alias sap.ui.test.matcherPipeline
		 * @author SAP SE
		 * @since 1.34
		 */
		return UI5Object.extend("sap.ui.test.pipelines.MatcherPipeline",{

			/**
			 * Matches a set or a single control agains matchers that check conditions.
			 * The matchers are a pipeline: the first matcher gets a control as an input parameter, each subsequent matcher gets the same input as the previous one, if the previous output is 'true'.
			 * If the previous output is a truthy value, the next matcher will receive this value as an input parameter.
			 * If any matcher does not match an input (i.e. returns a falsy value), then the input is filtered out. Check will not be called if the matchers filtered out all controls/values.
			 * Check/success will be called with all matching values as an input parameter. Matchers also can be define as an inline-functions.
			 * @param {object} options An Object containing the input for processing matchers
			 * @param {function|sap.ui.test.matchers.Matcher|sap.ui.test.matchers.Matcher[]|function[]} options.matchers A single matcher or an array of matchers {@link sap.ui.test.matchers}.
			 * @param {sap.ui.core.Element|sap.ui.core.Element[]} options.control The controls to filter.
			 * @returns {false|sap.ui.core.Element|sap.ui.core.Element[]} The filtered input of options.control. If no control matched, false is returned.
			 * @private
			 * @function
			 */
			process: function (options) {
				var vResult,
					aControls,
					vControl = options.control;

				var aMatchers = oPipelineFactory.create(options.matchers);

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

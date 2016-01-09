/*!
 * ${copyright}
 */

sap.ui.define([
		'jquery.sap.global',
		'./Matcher'
	], function (jQuery, fnMatcher) {
	"use strict";

	/**
	 * AggregationContainsPropertyEqual - checks if an aggregation contains at least one item that has a Property set to a certain value.
	 *
	 * @class AggregationContainsPropertyEqual - checks if an aggregation contains at least one item that has a Property set to a certain value
	 * @extends sap.ui.test.matchers.Matcher
	 * @param {object} [mSettings] optional map/JSON-object with initial settings for the new AggregationContainsPropertyEqualMatcher
	 * @public
	 * @name sap.ui.test.matchers.AggregationContainsPropertyEqual
	 * @author SAP SE
	 * @since 1.23
	 */
	return fnMatcher.extend("sap.ui.test.matchers.AggregationContainsPropertyEqual", /** @lends sap.ui.test.matchers.AggregationContainsPropertyEqual.prototype */ {

		metadata : {
			publicMethods : [ "isMatching" ],
			properties : {
				/**
				 * The Name of the aggregation that is used for matching.
				 */
				aggregationName : {
					type : "string"
				},
				/**
				 * The Name of the property that is used for matching.
				 */
				propertyName : {
					type : "string"
				},
				/**
				 * The value of the Property that is used for matching.
				 */
				propertyValue : {
					type : "any"
				}
			}
		},

		/**
		 * Checks if the control has a filled aggregation with at least one control that have a property equaling propertyName/Value.
		 *
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the Aggregation set in the property aggregationName is filled, false if it is not.
		 * @public
		 */
		isMatching : function (oControl) {
			var aAggregation,
				sAggregationName = this.getAggregationName(),
				sPropertyName = this.getPropertyName(),
				vPropertyValue = this.getPropertyValue(),
				fnAggregation = oControl["get" + jQuery.sap.charToUpperCase(sAggregationName, 0)];

			if (!fnAggregation) {
				jQuery.sap.log.error("Control " + oControl.sId + " does not have an aggregation called: " + sAggregationName);
				return false;
			}

			aAggregation = fnAggregation.call(oControl);

			return aAggregation.some(function (vAggregationItem) {
				var fnPropertyGetter = vAggregationItem["get" + jQuery.sap.charToUpperCase(sPropertyName, 0)];

				//aggregation item does not have such a property
				if (!fnPropertyGetter) {
					return false;
				}

				return fnPropertyGetter.call(vAggregationItem) === vPropertyValue;
			});
		}

	});

}, /* bExport= */ true);

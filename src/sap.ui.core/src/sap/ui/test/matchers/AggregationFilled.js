/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './Matcher'], function (jQuery, Matcher) {
	"use strict";

	/**
	 * AggregationFilled - checks if an aggregation contains at least one entry.
	 *
	 * @class AggregationFilled - checks if an aggregation contains at least one entry
	 * @param {object} [mSettings] optional map/JSON-object with initial settings for the new AggregationFilledMatcher
	 * @extends sap.ui.test.matchers.Matcher
	 * @public
	 * @name sap.ui.test.matchers.AggregationFilled
	 * @author SAP SE
	 * @since 1.23
	 */
	return Matcher.extend("sap.ui.test.matchers.AggregationFilled", /** @lends sap.ui.test.matchers.AggregationFilled.prototype */ {

		metadata : {
			publicMethods : [ "isMatching" ],
			properties : {
				/**
				 * The name of the aggregation that is used for matching.
				 */
				name : {
					type : "string"
				}
			}
		},

		/**
		 * Checks if the control has a filled aggregation.
		 *
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the Aggregation set in the property aggregationName is filled, false if it is not.
		 * @public
		 */
		isMatching : function (oControl) {
			var sAggregationName = this.getName(),
				fnAggregation = oControl["get" + jQuery.sap.charToUpperCase(sAggregationName, 0)];

			if (!fnAggregation) {
				jQuery.sap.log.error("Control " + oControl.sId + " does not have an aggregation called: " + sAggregationName, this._sLogPrefix);
				return false;
			}

			return !!fnAggregation.call(oControl).length;
		}

	});

}, /* bExport= */ true);
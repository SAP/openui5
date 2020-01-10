/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/matchers/Matcher",
	"sap/base/strings/capitalize",
	"sap/ui/thirdparty/jquery"
], function(Matcher, capitalize, jQueryDOM) {
	"use strict";

	/**
	 * @class
	 * Checks if an aggregation contains at least one entry.
	 *
	 * As of version 1.72, it is available as a declarative matcher with the following syntax:
	 * <code><pre>{
	 *     aggregationFilled: {
	 *         name: "string"
	 *     }
	 * }
	 * </code></pre>
	 *
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
				fnAggregation = oControl["get" + capitalize(sAggregationName, 0)];

			if (!fnAggregation) {
				this._oLogger.error("Control '" + oControl + "' does not have an aggregation called '" + sAggregationName + "'");
				return false;
			}

			var vAggregation = fnAggregation.call(oControl);
			var aAggregation = jQueryDOM.isArray(vAggregation) ? vAggregation : [vAggregation];
			var bFilled = !!aAggregation.length;
			if (!bFilled) {
				this._oLogger.debug("Control '" + oControl + "' aggregation '" + sAggregationName + "' is empty");
			}

			return bFilled;
		}

	});

});